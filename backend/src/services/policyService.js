import { policySignals } from "../data/complianceRules.js";

function classifyRisk(score) {
  if (score >= 85) return "low";
  if (score >= 60) return "medium";
  return "high";
}

export function analyzePolicyText(policyText = "") {
  const text = String(policyText || "").trim();

  if (!text) {
    return {
      score: 0,
      riskLevel: "high",
      issues: [
        {
          key: "empty-policy",
          title: "No policy content provided",
          severity: "high",
          penalty: 100,
          detail: "A privacy policy text is required for analysis.",
          recommendation: "Paste or upload your policy draft and run analysis again.",
        },
      ],
      strengths: [],
    };
  }

  let score = 100;
  const issues = [];
  const strengths = [];

  policySignals.forEach((signal) => {
    const found = signal.patterns.some((pattern) => pattern.test(text));

    if (found) {
      strengths.push({
        key: signal.key,
        title: signal.label,
        detail: "Relevant policy language appears to be present.",
      });
      return;
    }

    score -= signal.penalty;
    issues.push({
      key: signal.key,
      title: `Missing or weak: ${signal.label}`,
      severity: signal.severity,
      penalty: signal.penalty,
      detail: `The policy does not clearly mention ${signal.label.toLowerCase()}.`,
      recommendation: `Add a dedicated section for ${signal.label.toLowerCase()} with concrete user-facing language.`,
    });
  });

  score = Math.max(0, score);

  return {
    score,
    riskLevel: classifyRisk(score),
    issues,
    strengths,
  };
}
