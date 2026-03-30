import { Router } from "express";
import { runComplianceCheck } from "../../../src/controllers/complianceController.js";
import { analyzeCompliancePolicy } from "../../../src/controllers/complianceCheckerV2.js";
import { checkWebsite } from "../../../src/controllers/websiteCheckerController.js";

const router = Router();

// POST /api/compliance/check - Legacy: Evaluate compliance posture (role-based)
router.post("/check", runComplianceCheck);

// POST /api/compliance/analyze-policy - Enhanced: Comprehensive policy analysis
router.post("/analyze-policy", analyzeCompliancePolicy);

// GET /api/compliance/guidelines - GDPR & DPDP guidelines
router.get("/guidelines", (req, res) => {
  res.json({
    dpdp: {
      name: "Digital Personal Data Protection Act, 2023",
      scope: "Protects personal data of all individuals in India",
      keyRequirements: [
        "Explicit consent for data collection",
        "Purpose limitation",
        "Storage limitation (retention periods)",
        "Security measures",
        "User rights (access, deletion, correction)",
        "Grievance redressal within 30 days",
        "Special protection for minors",
      ],
      penalties: "Up to ₹500 crore for violations",
    },
    gdpr: {
      name: "General Data Protection Regulation",
      scope: "Protects personal data of EU residents worldwide",
      keyRequirements: [
        "Lawful basis for processing",
        "Consent or legal obligation",
        "Data controller accountability",
        "Data Protection Impact Assessment (DPIA)",
        "Data processor agreements",
        "Individual rights (RTTI - Right to be Forgotten)",
        "Breach notification within 72 hours",
      ],
      penalties: "Up to €20 million or 4% of global revenue",
    },
  });
});

// POST /api/compliance/check-website - Analyze website for compliance
router.post("/check-website", checkWebsite);

export default router;
