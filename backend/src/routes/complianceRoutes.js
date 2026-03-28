import { Router } from "express";
import { runComplianceCheck } from "../controllers/complianceController.js";

const router = Router();

router.post("/check", runComplianceCheck);

export default router;
