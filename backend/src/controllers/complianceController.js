import { evaluateCompliance } from "../services/scoringService.js";
import { generateFixesWithAI } from "../services/aiService.js";
import { saveReport } from "../services/reportStore.js";

export async function runComplianceCheck(req, res) {
  try {
    const answers = req.body?.answers || {};
    const evaluated = evaluateCompliance(answers);

    const findings = [...evaluated.violations, ...evaluated.risks];
    const fixes = await generateFixesWithAI(
      "Compliance checklist for DPDP/GDPR/IT Act readiness",
      findings
    );

    const result = {
      ...evaluated,
      aiFixes: fixes,
      generatedAt: new Date().toISOString(),
    };

    try {
      await saveReport("compliance", answers, result);
    } catch {
      // Storage can fail in restricted environments; response should still succeed.
    }

    return res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Compliance evaluation failed" });
  }
}
