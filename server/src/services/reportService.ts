import { prisma } from "../utils/prismaClient";
import {
  ReportCategory as PrismaReportCategory,
  ReportStatus as PrismaReportStatus,
<<<<<<< HEAD
  Role as PrismaRole,
} from "../../prisma/generated/client";
=======
} from "@prisma/client";
>>>>>>> story#5/dev
import { ReportDTO } from "../interfaces/ReportDTO";
import { ReportPhoto, RejectReportRequest } from "../../../shared/ReportTypes";

//new type where we exclude fields that will not be provided by the user
type CreateReportData = Omit<
  ReportDTO,
  | "id"
  | "status"
  | "createdAt"
  | "updatedAt"
  | "messages"
  | "user"
  | "rejectedReason"
  | "address"
> & {
  userId: number; //add userId to link report to user
  photos: ReportPhoto[];
  address?: string;
};

export async function createReport(data: CreateReportData) {
  //here ther should be validation for the photos

  const newReport = await prisma.report.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category as PrismaReportCategory,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address || null,
      isAnonymous: data.isAnonymous,
      status: PrismaReportStatus.PENDING, //new reports are pending municipality approval
      userId: data.userId,
      photos: {
        create: data.photos.map((photo) => ({
          url: photo.url,
          filename: photo.filename,
        })),
      },
    },
    include: {
      user: true,
      photos: true,
    },
  });

  return newReport;
}

<<<<<<< HEAD
//get reports based on status filter (for public and PUBLIC_RELATIONS)
export async function getReports(statusFilter?: PrismaReportStatus, userRole?: PrismaRole) {
  // Only PUBLIC_RELATIONS can see PENDING
  if (statusFilter === PrismaReportStatus.PENDING && userRole !== PrismaRole.PUBLIC_RELATIONS) {
    throw new Error("Only public relations officers can view pending reports");
  }

  let whereClause: any = {};
  
  if (statusFilter) {
    whereClause.status = statusFilter;
  } else {
    // Default: exclude PENDING for public/non-PUBLIC_RELATIONS users
    if (!userRole || userRole !== PrismaRole.PUBLIC_RELATIONS) {
      whereClause.status = {
        not: PrismaReportStatus.PENDING,
      };
    }
  }

  return prisma.report.findMany({
    where: whereClause,
=======
export async function getApprovedReports(category?: PrismaReportCategory) {
  return prisma.report.findMany({
    where: {
      status: {
        in: [
          PrismaReportStatus.ASSIGNED,
          PrismaReportStatus.IN_PROGRESS,
          PrismaReportStatus.RESOLVED,
        ],
      },
      ...(category && { category }),
    },
>>>>>>> story#5/dev
    include: {
      user: true,
      assignedTo: true,
      photos: true,
      messages: {
        include: {
          user: true,
        },
      },
      photos: true,
    },
    orderBy: {
      createdAt: "desc",
<<<<<<< HEAD
    },
  });
}

// PT06: Approve a report (PUBLIC_RELATIONS only)
export async function approveReport(reportId: number, approverId: number) {
  // Check if report exists and is in PENDING status
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { user: true },
  });

  if (!report) {
    throw new Error("Report not found");
  }

  if (report.status !== PrismaReportStatus.PENDING) {
    throw new Error("Report is not in PENDING status");
  }

  // Update report status to APPROVED and add approval message
  const updatedReport = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: PrismaReportStatus.APPROVED,
      messages: {
        create: {
          content: "Report approved by public relations officer",
          senderId: approverId,
        },
      },
    },
    include: {
      user: true,
      assignedTo: true,
      photos: true,
      messages: {
        include: {
          user: true,
        },
      },
    },
  });

  return updatedReport;
}

// PT06: Reject a report with reason (PUBLIC_RELATIONS only)
export async function rejectReport(reportId: number, rejecterId: number, reason: string) {
  // Validate reason
  if (!reason || reason.trim().length === 0) {
    throw new Error("Rejection reason is required");
  }

  if (reason.length > 500) {
    throw new Error("Rejection reason must be less than 500 characters");
  }

  // Check if report exists and is in PENDING status
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { user: true },
  });

  if (!report) {
    throw new Error("Report not found");
  }

  if (report.status !== PrismaReportStatus.PENDING) {
    throw new Error("Report is not in PENDING status");
  }

  // Update report status to REJECTED with reason and add rejection message
  const updatedReport = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: PrismaReportStatus.REJECTED,
      rejectionReason: reason,
      messages: {
        create: {
          content: "Report rejected by public relations officer",
          senderId: rejecterId,
        },
      },
    },
    include: {
      user: true,
      assignedTo: true,
      photos: true,
      messages: {
        include: {
          user: true,
        },
      },
    },
  });

  return updatedReport;
}

// Helper function to get technical office users for assignment (for future use)
export async function getTechnicalOfficeUsers() {
  return prisma.user.findMany({
    where: {
      role: PrismaRole.TECHNICAL_OFFICE,
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
=======
>>>>>>> story#5/dev
    },
  });
}
