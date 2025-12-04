import { ReportCategory } from "./ReportTypes";

export interface CreateExternalCompanyData {
  name: string;
  categories: ReportCategory[];
  platformAccess: boolean;
}

export interface CreateExternalMaintainerData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  externalCompanyId: number;
}

export interface AssignReportToExternalResponse {
  message: string;
  report: any;
}