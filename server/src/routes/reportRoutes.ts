import { Router } from 'express';
import { createReport, getReports, getPendingReports, approveReport, rejectReport } from '../controllers/reportController';
import { isLoggedIn } from '../middleware/routeProtection';

const router = Router();

router.post('/', isLoggedIn, createReport);
router.get('/', getReports); // Public access for homepage, shows only processed reports
router.get('/pending', isLoggedIn, getPendingReports); // PUBLIC_RELATIONS only - get SUSPENDED reports

// PT06 - Report approval endpoints (PUBLIC_RELATIONS role checked in controller)
router.post('/:reportId/approve', isLoggedIn, approveReport);
router.post('/:reportId/reject', isLoggedIn, rejectReport);

export default router;