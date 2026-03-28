import { complianceRules } from "../data/complianceRules.js";

function classifyRisk(score) {
  if (score >= 85) return "low";
  if (score >= 60) return "medium";
  return "high";
}

export function evaluateCompliance(answers = {}) {
  let score = 100;
  const violations = [];
  const risks = [];
  const goodPractices = [];

  complianceRules.forEach((rule) => {
    const value = Boolean(answers[rule.key]);

    if (value) {
      goodPractices.push({
        key: rule.key,
        title: rule.label,
        detail: "Control is in place and contributes positively to compliance readiness.",
      });
      return;
    }

    score -= rule.penalty;

    const finding = {
      key: rule.key,
      title: rule.label,
      severity: rule.severity,
      penalty: rule.penalty,
      detail: rule.description,
      recommendation: rule.fixHint,
    };

    if (rule.severity === "high") {
      violations.push(finding);
    } else {
      risks.push(finding);
    }
  });

  score = Math.max(0, score);

  return {
    score,
    riskLevel: classifyRisk(score),
    violations,
    risks,
    goodPractices,
  };
}
