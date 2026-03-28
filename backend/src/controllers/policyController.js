import { analyzePolicyText } from "../services/policyService.js";
import { rewritePolicyWithAI, generateFixesWithAI } from "../services/aiService.js";
import { saveReport } from "../services/reportStore.js";

export async function analyzePolicy(req, res) {
  try {
    const policyText = req.body?.policyText || "";

    const analysis = analyzePolicyText(policyText);
    const missingAreaLabels = analysis.issues.map((issue) => issue.title);
    const rewriteSuggestions = await rewritePolicyWithAI(policyText, missingAreaLabels);
    const fixes = await generateFixesWithAI(
      "Privacy policy quality and legal completeness",
      analysis.issues
    );

    const result = {
      ...analysis,
      aiFixes: fixes,
      rewrittenClauses: rewriteSuggestions,
      generatedAt: new Date().toISOString(),
    };

    try {
      await saveReport("policy", { policyText }, result);
    } catch {
      // Storage can fail in restricted environments; response should still succeed.
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Policy analysis failed" });
  }
}
