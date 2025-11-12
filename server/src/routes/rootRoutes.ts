import { Router } from "express";
import { getApiInfo } from "../controllers/rootController";

const router = Router();

router.get("/", getApiInfo);

export default router;
