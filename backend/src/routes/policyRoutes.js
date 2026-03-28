import { Router } from "express";
import { analyzePolicy } from "../controllers/policyController.js";

const router = Router();

router.post("/analyze", analyzePolicy);

export default router;
