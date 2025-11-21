import { Router } from 'express';
import { asyncHandler } from '../middlewares/errorMiddleware';
import { requireCitizen } from '../middlewares/routeProtection';
import { createReport, getReports } from '../controllers/reportController';

const router = Router();

// POST /api/reports
router.post('/', requireCitizen, asyncHandler(createReport));

// GET /api/reports
router.get('/', asyncHandler(getReports));

export default router;