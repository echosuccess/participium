import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { createReport as createReportService, getApprovedReports as getApprovedReportsService } from "../services/reportService";
import { ReportCategory } from "../../../shared/ReportTypes";
import { calculateAddress } from "../utils/addressFinder";
import minioClient, { BUCKET_NAME } from "../utils/minioClient";
import { BadRequestError, UnauthorizedError, ForbiddenError } from "../utils";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError("Only JPEG and PNG images are allowed"));
    }
  }
}).array("photos", 3);

export async function createReport(req: Request, res: Response): Promise<void> {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        throw new BadRequestError("File size exceeds 5MB limit");
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        throw new BadRequestError("Maximum 3 photos allowed");
      }
      throw new BadRequestError(err.message);
    }
    if (err) { 
      throw err;
    }

    const user = req.user as { id: number };
    const { title, description, category, latitude, longitude, isAnonymous } = req.body;
    const photos = req.files as Express.Multer.File[];
    
    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);

    const photoData = [];
    for (const photo of photos) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = uniqueSuffix + path.extname(photo.originalname);

      await minioClient.putObject(BUCKET_NAME, filename, photo.buffer, photo.size, {
        "Content-Type": photo.mimetype
      });

      const protocol = process.env.MINIO_USE_SSL === "true" ? "https" : "http";
      const host = process.env.MINIO_ENDPOINT || "localhost";
      const port = process.env.MINIO_PORT ? `:${process.env.MINIO_PORT}` : "";
      const url = `${protocol}://${host}${port}/${BUCKET_NAME}/${filename}`;

      photoData.push({ id: 0, filename, url });
    }

    const address = await calculateAddress(parsedLatitude, parsedLongitude);

    const newReport = await createReportService({
      title,
      description,
      category: category as ReportCategory,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      address,
      isAnonymous: isAnonymous === "true",
      photos: photoData,
      userId: user.id
    });

    res.status(201).json({
      message: "Report created successfully",
      id: newReport.id
    });
  });
}

export async function getReports(req: Request, res: Response): Promise<void> {
  const { category } = req.query;

  if (category && !Object.values(ReportCategory).includes(category as ReportCategory)) {
    throw new BadRequestError(`Invalid category. Allowed: ${Object.values(ReportCategory).join(", ")}`);
  }

  const reports = await getApprovedReportsService(category as ReportCategory | undefined);
  res.status(200).json(reports);
}