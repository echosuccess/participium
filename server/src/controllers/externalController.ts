import { Request, Response } from "express";
import { BadRequestError } from "../utils/errors";
import {
  createExternalCompany,
  listExternalCompanies,
  createExternalMaintainer,
  getExternalCompaniesWithAccess,
  deleteExternalCompany,
  getAssignableExternals as getAssignableExternalsService,
  assignReportToExternal as assignReportToExternalService,
} from "../services/externalService";
import { AssignReportToExternalResponse } from "../../../shared/ExternalTypes";

// Create external company
export async function createExternalCompanyController(req: Request, res: Response): Promise<void> {
  const { name, categories, platformAccess } = req.body;

  const result = await createExternalCompany({
    name,
    categories,
    platformAccess,
  });

  res.status(201).json(result);
}

// List all external companies
export async function listExternalCompaniesController(req: Request, res: Response): Promise<void> {
  const companies = await listExternalCompanies();
  res.status(200).json(companies);
}

// Create external maintainer
export async function createExternalMaintainerController(req: Request, res: Response): Promise<void> {
  const { firstName, lastName, email, password, externalCompanyId } = req.body;

  const result = await createExternalMaintainer({
    firstName,
    lastName,
    email,
    password,
    externalCompanyId: parseInt(externalCompanyId),
  });

  res.status(201).json(result);
}

// Get external companies with platform access (for maintainer creation)
export async function getExternalCompaniesWithAccessController(req: Request, res: Response): Promise<void> {
  const companies = await getExternalCompaniesWithAccess();
  res.status(200).json(companies);
}

// Delete external company
export async function deleteExternalCompanyController(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const companyId = parseInt(id);

  if (isNaN(companyId)) {
    throw new BadRequestError("Invalid company ID parameter");
  }

  await deleteExternalCompany(companyId);
  res.status(204).send();
}

// List external companies and maintainers available for the report's category
export async function getAssignableExternals(req: Request, res: Response): Promise<void> {
  const reportId = parseInt(req.params.reportId);
  const user = req.user as { id: number };
  
  if (isNaN(reportId)) {
    throw new BadRequestError("Invalid report ID parameter");
  }
  
  const result = await getAssignableExternalsService(reportId, user.id);
  res.status(200).json(result);
}

// Assign a report to an external maintainer or company
export async function assignReportToExternal(req: Request, res: Response): Promise<void> {
  const reportId = parseInt(req.params.reportId);
  const user = req.user as { id: number };
  const { externalCompanyId, externalMaintainerId } = req.body || {};

  if (isNaN(reportId)) {
    throw new BadRequestError("Invalid report ID parameter");
  }
  if (!externalCompanyId || isNaN(parseInt(externalCompanyId))) {
    throw new BadRequestError("externalCompanyId is required and must be a valid integer");
  }

  const companyIdNum = parseInt(externalCompanyId);
  const maintainerIdNum = externalMaintainerId !== null && externalMaintainerId !== undefined
    ? parseInt(externalMaintainerId)
    : null;

  const updatedReport = await assignReportToExternalService(
    reportId,
    user.id,
    companyIdNum,
    maintainerIdNum
  );
  const response: AssignReportToExternalResponse = {
    message: maintainerIdNum ? "Report assigned to external maintainer successfully" : "Report assigned to external company successfully",
    report: updatedReport,
  };
  res.status(200).json(response);
}