import { Request, Response } from "express";
<<<<<<< HEAD
import {
  createReport as createReportService,
  getReports as getReportsService,
  approveReport as approveReportService,
  rejectReport as rejectReportService,
} from "../services/reportService";
import { UserDTO } from "../interfaces/UserDTO";
import { toReportDTO } from "../interfaces/ReportDTO";
import { 
  ReportCategory,
  ReportStatus,
  CreateReportRequest,
  RejectReportRequest
 } from "../../../shared/ReportTypes";
import { Role } from "../../prisma/generated/client";
=======
import multer from "multer";
import path from "path";
import { createReport as createReportService, getApprovedReports as getApprovedReportsService } from "../services/reportService";
import { ReportCategory } from "../../../shared/ReportTypes";
import { calculateAddress } from "../utils/addressFinder";
import minioClient, { BUCKET_NAME } from "../utils/minioClient";
import { BadRequestError, UnauthorizedError, ForbiddenError } from "../utils";
>>>>>>> story#5/dev

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

<<<<<<< HEAD
export const getReports = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    // Public endpoint - only show processed reports (excludes PENDING)
    const reports = await getReportsService(undefined, undefined);
    let reportDTOs = reports.map(toReportDTO);
    
    // Filter by category if provided
    if (category) {
      reportDTOs = reportDTOs.filter(report => report.category === category);
    }
    
    res.status(200).json(reportDTOs);
  } catch (error: any) {
    console.error("Error during report retrieval:", error);
    
    res.status(500).json({
      error: "InternalServerError",
      message: "Error during report retrieval",
    });
  }
};

// PT06: Get pending reports for PUBLIC_RELATIONS officers
export const getPendingReports = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserDTO;

    // Check user authentication
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Check user role
    if (user.role !== "PUBLIC_RELATIONS") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Public relations officer privileges required",
      });
    }

    // Get only PENDING reports
    const reports = await getReportsService("PENDING" as any, user.role as Role);
    const reportDTOs = reports.map(toReportDTO);
    
    res.status(200).json(reportDTOs);
  } catch (error: any) {
    console.error("Error retrieving pending reports:", error);
    
    res.status(500).json({
      error: "InternalServerError",
      message: "Failed to retrieve pending reports",
    });
  }
};

// PT06: Approve a report (PUBLIC_RELATIONS only)
export const approveReport = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const user = req.user as UserDTO & { id: number };

    // Validate reportId
    const reportIdNum = parseInt(reportId);
    if (isNaN(reportIdNum)) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Invalid report ID format",
      });
    }

    // Check user authentication
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Check user role
    if (user.role !== "PUBLIC_RELATIONS") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Public relations officer privileges required",
      });
    }

    const approvedReport = await approveReportService(reportIdNum, user.id);
    const reportDTO = toReportDTO(approvedReport);

    return res.status(200).json({
      message: "Report approved successfully",
      report: reportDTO,
    });
  } catch (error: any) {
    console.error("Error approving report:", error);

    if (error.message === "Report not found") {
      return res.status(404).json({
        error: "NotFound",
        message: "Report not found",
      });
    }

    if (error.message === "Report is not in SUSPENDED status") {
      return res.status(400).json({
        error: "BadRequest",
        message: "Report is not in SUSPENDED status",
      });
    }

    if (error.message.includes("already been processed")) {
      return res.status(409).json({
        error: "Conflict",
        message: "Report has already been processed",
      });
    }

    return res.status(500).json({
      error: "InternalServerError",
      message: "Failed to approve report",
    });
  }
};

// PT06: Reject a report with reason (PUBLIC_RELATIONS only)
export const rejectReport = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { reason } = req.body as RejectReportRequest;
    const user = req.user as UserDTO & { id: number };

    // Validate reportId
    const reportIdNum = parseInt(reportId);
    if (isNaN(reportIdNum)) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Invalid report ID format",
      });
    }

    // Check user authentication
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Check user role
    if (user.role !== "PUBLIC_RELATIONS") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Public relations officer privileges required",
      });
    }

    // Validate reason
    if (!reason) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Missing required field: reason",
      });
    }

    const rejectedReport = await rejectReportService(reportIdNum, user.id, reason);
    const reportDTO = toReportDTO(rejectedReport);

    return res.status(200).json({
      message: "Report rejected successfully",
      report: reportDTO,
    });
  } catch (error: any) {
    console.error("Error rejecting report:", error);

    if (error.message === "Report not found") {
      return res.status(404).json({
        error: "NotFound",
        message: "Report not found",
      });
    }

    if (error.message === "Report is not in SUSPENDED status") {
      return res.status(400).json({
        error: "BadRequest",
        message: "Report is not in SUSPENDED status",
      });
    }

    if (error.message === "Rejection reason is required") {
      return res.status(400).json({
        error: "BadRequest",
        message: "Missing required field: reason",
      });
    }

    if (error.message === "Rejection reason must be less than 500 characters") {
      return res.status(422).json({
        error: "UnprocessableEntity",
        message: "Rejection reason must be between 1 and 500 characters",
      });
    }

    if (error.message.includes("already been processed")) {
      return res.status(409).json({
        error: "Conflict",
        message: "Report has already been processed",
      });
    }

    return res.status(500).json({
      error: "InternalServerError",
      message: "Failed to reject report",
    });
  }
};
=======
export async function getReports(req: Request, res: Response): Promise<void> {
  const { category } = req.query;

  if (category && !Object.values(ReportCategory).includes(category as ReportCategory)) {
    throw new BadRequestError(`Invalid category. Allowed: ${Object.values(ReportCategory).join(", ")}`);
  }

  const reports = await getApprovedReportsService(category as ReportCategory | undefined);
  res.status(200).json(reports);
}
>>>>>>> story#5/dev
