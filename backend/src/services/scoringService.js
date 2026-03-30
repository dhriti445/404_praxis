import { getComplianceProfile } from "../data/complianceRules.js";

function classifyRisk(score) {
  if (score >= 85) return "low";
  if (score >= 60) return "medium";
  return "high";
}

export function evaluateCompliance(answers = {}, role = "startup") {
  const profile = getComplianceProfile(role);
  const rules = profile.rules || [];
  let score = 100;
  const violations = [];
  const risks = [];
  const goodPractices = [];
  const systemChecks = [];
  let hasCriticalGap = false;

  rules.forEach((rule) => {
    const value = Boolean(answers[rule.key]);

    systemChecks.push({
      key: rule.key,
      title: rule.label,
      passed: value,
      impactIfMissing: rule.severity,
    });

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
      reference: rule.reference,
    };

    if (rule.severity === "critical") {
      hasCriticalGap = true;
      violations.push(finding);
      return;
    }

    if (rule.severity === "high") {
      violations.push(finding);
    } else {
      risks.push(finding);
    }
  });

  score = Math.max(0, score);
  const riskLevel = hasCriticalGap ? "critical" : classifyRisk(score);

  return {
    mode: "compliance_check",
    role: profile.role,
    target: profile.target,
    philosophy: profile.philosophy,
    requiredPolicies: profile.requiredPolicies || [],
    systemChecks,
    score,
    riskLevel,
    violations,
    risks,
    goodPractices,
  };
}
