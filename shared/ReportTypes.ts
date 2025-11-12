export type ReportCategory =
  | "WATER_SUPPLY_DRINKING_WATER"
  | "ARCHITECTURAL_BARRIERS"
  | "SEWER_SYSTEM"
  | "PUBLIC_LIGHTING"
  | "WASTE"
  | "ROAD_SIGNS_AND_TRAFFIC_LIGHTS"
  | "ROADS_AND_URBAN_FURNISHINGS"
  | "PUBLIC_GREEN_AREAS_AND_PLAYGROUNDS"
  | "OTHER"; 

export interface CreateReportRequest {
  title: string;
  description: string;
  category: ReportCategory;
  latitude: number;
  longitude: number;
  isAnonymous: boolean;
  photos: ReportPhoto[];
}

export interface ReportPhoto {
  id: number;
  url: string;
  filename: string;
};

export interface CreateReportResponse {
  id: number;
  message: string;
}

export type ReportStatus =
"PENDING_APPROVAL"
| "ASSIGNED"
| "IN_PROGRESS"
| "SUSPENDED"
| "REJECTED"
| "RESOLVED"

    
