import express from "express";
import { login, logout, getSessionInfo } from "../controllers/authController";
import { isLoggedIn } from "../middleware/rights";

const router = express.Router();

// POST /session
router.post("/", login);
// DELETE /session/current
router.delete("/current", logout);
// GET /session/current
router.get("/current", isLoggedIn, getSessionInfo);

export default router;