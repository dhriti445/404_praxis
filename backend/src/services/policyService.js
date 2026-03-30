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

  // Guardrail: reject documents that do not look like a privacy policy.
  const policyContextPatterns = [
    /privacy\s+policy/i,
    /personal\s+data/i,
    /we\s+collect/i,
    /your\s+data/i,
    /data\s+subject/i,
    /data\s+controller/i,
  ];
  const policyContextHits = policyContextPatterns.reduce(
    (hits, pattern) => (pattern.test(text) ? hits + 1 : hits),
    0
  );

  let score = 100;
  const issues = [];
  const strengths = [];

  policySignals.forEach((signal) => {
    const signalMatches = signal.patterns.reduce(
      (hits, pattern) => (pattern.test(text) ? hits + 1 : hits),
      0
    );
    const minimumMatches = Math.min(2, signal.patterns.length);
    const found = signalMatches >= minimumMatches;

    if (found) {
      strengths.push({
        key: signal.key,
        title: signal.label,
        detail: "Relevant policy language appears to be present with multiple supporting clauses.",
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

  if (policyContextHits < 2) {
    issues.unshift({
      key: "not-privacy-policy",
      title: "Document does not appear to be a privacy policy",
      severity: "high",
      penalty: 60,
      detail:
        "The uploaded text lacks core privacy-policy context (for example: privacy policy, personal data, or clear data handling sections).",
      recommendation:
        "Upload the actual privacy policy document, or verify the PDF has extractable policy text.",
    });
    score = Math.min(score, 40);
  }

  score = Math.max(0, score);

  return {
    score,
    riskLevel: classifyRisk(score),
    issues,
    strengths,
  };
}
