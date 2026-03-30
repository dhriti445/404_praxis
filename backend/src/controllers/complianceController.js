import { evaluateCompliance } from "../services/scoringService.js";
import { generateFixesWithAI } from "../services/aiService.js";
import { getComplianceProfile } from "../data/complianceRules.js";
import { saveReport } from "../services/reportStore.js";

export async function runComplianceCheck(req, res) {
  try {
    const role = String(req.body?.role || "startup").toLowerCase();
    const profile = getComplianceProfile(role);
    const hasComplianceForm = req.body?.hasComplianceForm !== false;
    const complianceForm = String(req.body?.complianceForm || "").trim();
    const answers = req.body?.answers || {};

    if (!hasComplianceForm || !complianceForm) {
      const policyRecommendations = (profile.requiredPolicies || []).map(
        (policy) => `${policy.title} (${policy.reference})`
      );
      const recommendationFixes = policyRecommendations.map((policyName) => ({
        issue: `${policyName}`,
        fix: "Create this policy first and align it with your data flow, consent model, and retention timelines.",
        whyItMatters:
          "This helps establish minimum compliance documentation and reduces immediate legal risk.",
      }));

      const recommendationResult = {
        mode: "policy_list",
        role: profile.role,
        target: profile.target,
        philosophy: profile.philosophy,
        hasComplianceForm: false,
        message:
          "No compliance form provided. Start with these role-based policy documents.",
        policyRecommendations,
        requiredPolicies: profile.requiredPolicies || [],
        systemChecks: (profile.rules || []).map((rule) => ({
          key: rule.key,
          title: rule.label,
          passed: false,
          impactIfMissing: rule.severity,
        })),
        score: 0,
        riskLevel: "high",
        violations: [],
        risks: [],
        goodPractices: [],
        aiFixes: recommendationFixes,
        generatedAt: new Date().toISOString(),
      };

      try {
        await saveReport(
          "compliance",
          { role: profile.role, hasComplianceForm: false, complianceForm },
          recommendationResult
        );
      } catch {
        // Storage can fail in restricted environments; response should still succeed.
      }

      return res.json(recommendationResult);
    }

    const evaluated = evaluateCompliance(answers, profile.role);

    const findings = [...evaluated.violations, ...evaluated.risks];
    const fixes = await generateFixesWithAI(
      `Compliance checklist for DPDP/GDPR/IT Act readiness. Role: ${role}. Compliance form excerpt: ${complianceForm.slice(
        0,
        1200
      )}`,
      findings
    );

    const result = {
      ...evaluated,
      role,
      hasComplianceForm: true,
      aiFixes: fixes,
      generatedAt: new Date().toISOString(),
    };

    try {
      await saveReport("compliance", { role, hasComplianceForm: true, complianceForm, answers }, result);
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
