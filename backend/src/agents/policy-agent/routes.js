import { Router } from "express";
import { analyzePolicy } from "../../../src/controllers/policyController.js";

const router = Router();

// POST /api/policy/analyze - Analyze and score a policy document
router.post("/analyze", analyzePolicy);

export default router;
