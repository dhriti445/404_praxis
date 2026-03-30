/**
 * Consent Flow Analyzer
 * Analyzes if consent mechanisms are GDPR/DPDP compliant
 */

export function analyzeConsentFlow(consentFlowDescription) {
  const checks = [
    {
      check: "Explicit Opt-In",
      description: "Consent requires affirmative action (not pre-checked boxes)",
      keywords: ["opt.?in", "explicit", "affirmative", "unambiguous"],
      passed: checkKeywords(consentFlowDescription, ["opt.?in", "explicit", "affirmative"]),
      importance: "critical",
      fix: "Ensure consent is given by clear affirmative action (button click, checkbox unchecked by default)",
    },
    {
      check: "Easy Opt-Out",
      description: "Users can withdraw consent with same ease as opting in",
      keywords: ["easy.*opt.*out", "withdraw", "one.?click", "preferences"],
      passed: checkKeywords(consentFlowDescription, ["easy", "opt.?out", "withdraw", "one.?click", "preferences"]),
      importance: "critical",
      fix: "Provide one-click opt-out option in Settings with 'Manage Preferences' link",
    },
    {
      check: "Clear Information",
      description: "Users understand what they're consenting to",
      keywords: ["clear", "explain", "understand", "transparent", "inform"],
      passed: checkKeywords(consentFlowDescription, ["clear", "explain", "transparent", "inform"]),
      importance: "critical",
      fix: "Use plain language: 'By clicking Accept, we will: Use your email for newsletters, Track your behavior'",
    },
    {
      check: "Separate Consents",
      description: "Different purposes have separate consent options (not bundled)",
      keywords: ["separate", "granular", "unbundled", "per.?purpose"],
      passed: checkKeywords(consentFlowDescription, ["separate", "granular", "unbundled"]),
      importance: "high",
      fix: "Create separate toggles: Analytics (off by default), Marketing (off by default), Essential (required)",
    },
    {
      check: "Linked to Purpose",
      description: "Consent is linked to specific purposes, not blanket consent",
      keywords: ["purpose", "specific", "limited", "scope"],
      passed: checkKeywords(consentFlowDescription, ["purpose", "specific", "limited"]),
      importance: "critical",
      fix: "Instead of 'Accept All', show: 'Marketing Emails' and 'Behavioral Analytics' as separate options",
    },
    {
      check: "Retention Transparency",
      description: "Policy states how long consent is valid",
      keywords: ["retain", "duration", "period", "year", "month"],
      passed: checkKeywords(consentFlowDescription, ["retain", "duration", "period"]),
      importance: "medium",
      fix: "Add: 'Your consent is valid for 12 months. We ask for re-consent after this period.'",
    },
    {
      check: "Minor Protection",
      description: "For users under 18, parental consent is obtained",
      keywords: ["parent", "minor", "under.?18", "child"],
      passed: checkKeywords(consentFlowDescription, ["parent", "minor", "under", "child"]),
      importance: "critical",
      fix: "Add age gate: 'If you're under 18, we require parental consent via email verification'",
    },
  ];
  
  const passedCount = checks.filter((c) => c.passed).length;
  const failedChecks = checks.filter((c) => !c.passed);
  
  let complianceLevel = "compliant";
  if (failedChecks.filter((c) => c.importance === "critical").length > 0) {
    complianceLevel = "non-compliant";
  } else if (failedChecks.length > 0) {
    complianceLevel = "partially-compliant";
  }
  
  return {
    totalChecks: checks.length,
    passedChecks: passedCount,
    failedChecks: failedChecks.length,
    checks,
    complianceLevel,
    score: Math.round((passedCount / checks.length) * 100),
    criticalIssues: failedChecks.filter((c) => c.importance === "critical"),
    recommendation:
      complianceLevel === "compliant"
        ? "✅ Consent flow appears GDPR/DPDP compliant"
        : `⚠️ Consent flow has issues: ${failedChecks.map((c) => c.check).join(", ")}`,
  };
}

function checkKeywords(text, keywords) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return keywords.some((kw) => new RegExp(kw, "i").test(lowerText));
}
