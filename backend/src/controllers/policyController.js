import { analyzePolicyText } from "../services/policyService.js";
import {
  rewritePolicyWithAI,
  generateFixesWithAI,
  rewritePolicyToTargetScore,
  enforcePolicyIssueClosure,
} from "../services/aiService.js";
import { saveReport } from "../services/reportStore.js";

export async function analyzePolicy(req, res) {
  try {
    const policyText = req.body?.policyText || "";
    const fileName = req.body?.fileName || null;
    const fileType = req.body?.fileType || null;
    const fileSize = Number(req.body?.fileSize || 0) || null;
    const uploadedAt = req.body?.uploadedAt || null;

    const analysis = analyzePolicyText(policyText);
    const missingAreaLabels = analysis.issues.map((issue) => issue.title);
    const rewriteSuggestions = await rewritePolicyWithAI(policyText, missingAreaLabels);
    const fixes = await generateFixesWithAI(
      "Privacy policy quality and legal completeness",
      analysis.issues
    );

    let rewrittenPolicyText = await rewritePolicyToTargetScore(policyText, analysis.issues, 100);
    let rewrittenAnalysis = analyzePolicyText(rewrittenPolicyText);

    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (rewrittenAnalysis.score >= 100 || rewrittenAnalysis.issues.length === 0) {
        break;
      }

      rewrittenPolicyText = await rewritePolicyToTargetScore(
        rewrittenPolicyText,
        rewrittenAnalysis.issues,
        100
      );
      rewrittenPolicyText = enforcePolicyIssueClosure(
        rewrittenPolicyText,
        rewrittenAnalysis.issues
      );
      rewrittenAnalysis = analyzePolicyText(rewrittenPolicyText);
    }

    const result = {
      ...analysis,
      aiFixes: fixes,
      rewrittenClauses: rewriteSuggestions,
      rewrittenPolicyText,
      rewrittenScore: rewrittenAnalysis.score,
      rewrittenRiskLevel: rewrittenAnalysis.riskLevel,
      rewrittenIssues: rewrittenAnalysis.issues,
      targetScore: 100,
      targetAchieved: rewrittenAnalysis.score >= 100,
      generatedAt: new Date().toISOString(),
    };

    try {
      await saveReport(
        "policy",
        {
          policyText,
          uploadedReport: fileName
            ? {
                fileName,
                fileType,
                fileSize,
                uploadedAt,
              }
            : null,
        },
        result
      );
    } catch {
      // Storage can fail in restricted environments; response should still succeed.
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Policy analysis failed" });
  }
}
