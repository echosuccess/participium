import { Request, Response } from "express";
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

export const createReport = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      latitude,
      longitude,
      isAnonymous,
      photos,
    } = req.body as CreateReportRequest;
    const user = req.user as UserDTO & { id: number }; //need to get the userId

    //citizen must be logged in to create a report
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not logged in",
      });
    }

    //validate required fields maybe can move it to service
    if (
      !title ||
      !description ||
      !category ||
      latitude === undefined ||
      longitude === undefined ||
      !photos
    ) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Missing required fields",
      });
    }

    const reportData = {
      title,
      description,
      category: category as ReportCategory,
      latitude,
      longitude,
      isAnonymous,
      photos: photos,
      userId: user.id,
    };

    const newReport = await createReportService(reportData);

    return res.status(201).json({
      message: "Report created successfully",
      id: newReport.id,
    });
  } catch (err) {
    console.error("Error creating report", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Unable to create report",
    });
  }
};

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