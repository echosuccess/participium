import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { 
  createReport as createReportService, 
  getApprovedReports as getApprovedReportsService,
  getPendingReports as getPendingReportsService,
  approveReport as approveReportService,
  rejectReport as rejectReportService
} from "../services/reportService";
import { ReportCategory } from "../../../shared/ReportTypes";
import { calculateAddress } from "../utils/addressFinder";
import minioClient, { BUCKET_NAME } from "../utils/minioClient";
import { BadRequestError, UnauthorizedError, ForbiddenError } from "../utils";
import { asyncHandler } from "../middlewares/errorMiddleware";

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

export const createReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    upload(req, res, async (err) => {
      try {
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
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
});

export const getReports = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { category } = req.query;

  if (category && !Object.values(ReportCategory).includes(category as ReportCategory)) {
    throw new BadRequestError(`Invalid category. Allowed: ${Object.values(ReportCategory).join(", ")}`);
  }

  const reports = await getApprovedReportsService(category as ReportCategory | undefined);
  res.status(200).json(reports);
});

// Get pending reports (PUBLIC_RELATIONS only)
export const getPendingReports = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const reports = await getPendingReportsService();
  res.status(200).json(reports);
});

// Approve a report (PUBLIC_RELATIONS only)
export const approveReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const reportId = parseInt(req.params.reportId);
  const user = req.user as { id: number };
  
  if (isNaN(reportId)) {
    throw new BadRequestError("Invalid report ID parameter");
  }

  const updatedReport = await approveReportService(reportId, user.id);
  res.status(200).json({
    message: "Report approved successfully",
    report: updatedReport
  });
});

// Reject a report (PUBLIC_RELATIONS only)
export const rejectReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const reportId = parseInt(req.params.reportId);
  const user = req.user as { id: number };
  const { reason } = req.body;
  
  if (isNaN(reportId)) {
    throw new BadRequestError("Invalid report ID parameter");
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    throw new BadRequestError("Missing rejection reason");
  }

  const updatedReport = await rejectReportService(reportId, user.id, reason);
  res.status(200).json({
    message: "Report rejected successfully",
    report: updatedReport
  });
});
