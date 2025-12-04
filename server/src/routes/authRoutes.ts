import { Router } from "express";
import { asyncHandler } from "../middlewares/errorMiddleware";
import { login, logout, getSessionInfo, verifyEmail } from "../controllers/authController";

const router = Router();

router.post("/verify", asyncHandler(verifyEmail));
router.post("/", asyncHandler(login));
router.delete("/current", asyncHandler(logout));
router.get("/current", asyncHandler(getSessionInfo));

export default router;