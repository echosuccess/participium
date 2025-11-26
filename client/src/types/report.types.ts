// Client-specific report types
import type {
  CreateReportRequest,
  ReportCategory,
  ReportPhoto,
  ReportStatus,
} from "../../../shared/ReportTypes";

// Extended Report interface with optional fields for client display
export interface Report {
  id: number;
  title: string;
  description: string;
  category: ReportCategory;
  status: string; // Can be ReportStatus or custom display strings like "In Progress"
  latitude: number;
  longitude: number;
  createdAt?: string;
  photos?: ReportPhoto[];
  isAnonymous?: boolean;
  userId?: number; // ID of the citizen who created the report
  assignedToId?: number; // ID of the technical officer assigned to the report
  citizenId?: number; // Alias for userId (backward compatibility)
  technicianId?: number; // Alias for assignedToId (backward compatibility)
}

// Re-export shared report types
export type { CreateReportRequest, ReportCategory, ReportPhoto, ReportStatus };
