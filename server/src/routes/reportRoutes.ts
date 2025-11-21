import { Router } from 'express';
<<<<<<< HEAD
import { createReport, getReports, getPendingReports, approveReport, rejectReport } from '../controllers/reportController';
import { isLoggedIn } from '../middleware/routeProtection';

const router = Router();

router.post('/', isLoggedIn, createReport);
router.get('/', getReports); // Public access for homepage, shows only processed reports
router.get('/pending', isLoggedIn, getPendingReports); // PUBLIC_RELATIONS only - get SUSPENDED reports

// PT06 - Report approval endpoints (PUBLIC_RELATIONS role checked in controller)
router.post('/:reportId/approve', isLoggedIn, approveReport);
router.post('/:reportId/reject', isLoggedIn, rejectReport);
=======
import { asyncHandler } from '../middlewares/errorMiddleware';
import { requireCitizen } from '../middlewares/routeProtection';
import { validateTurinBoundaries } from '../middlewares/validateTurinBoundaries';
import { createReport, getReports } from '../controllers/reportController';

const router = Router();

// POST /api/reports
router.post('/', requireCitizen, validateTurinBoundaries, asyncHandler(createReport));

// GET /api/reports
router.get('/', asyncHandler(getReports));
>>>>>>> story#5/dev

export default router;