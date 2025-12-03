import { ReportCategory } from "../../../shared/ReportTypes";

export type ExternalCompanyDTO = {
  id: number;
  name: string;
  categories: ReportCategory[];
  platformAccess: boolean;
};

export function toExternalCompanyDTO(c: any): ExternalCompanyDTO {
  return {
    id: c.id,
    name: c.name,
    categories: c.categories,
    platformAccess: c.platformAccess
  };
}