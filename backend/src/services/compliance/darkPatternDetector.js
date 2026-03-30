/**
 * Dark Pattern Detector
 * Identifies manipulative language and dark patterns in privacy policies
 */

const DARK_PATTERNS = [
  {
    pattern: /by continuing|by using|by accessing/gi,
    type: "hidden_consent",
    risk: "high",
    message: "Hidden consent detected: Policy uses 'by continuing' pattern instead of explicit opt-in",
    fix: "Replace with: 'We require your explicit consent before processing your data. You can opt-out at any time.'",
  },
  {
    pattern: /pre.?check|checked by default|default.?yes/gi,
    type: "pre_checked_consent",
    risk: "critical",
    message: "Pre-checked consent boxes detected: This violates GDPR/DPDP consent requirements",
    fix: "Remove all default-checked boxes. Consent must be given by affirmative action.",
  },
  {
    pattern: /we may|we might|we could/gi,
    type: "vague_consent",
    risk: "high",
    message: "Vague processing terms: Using 'may' or 'might' instead of clear data usage statements",
    fix: "Be specific: State exactly what you do with data (e.g., 'We use your email for authentication')",
  },
  {
    pattern: /we store.*forever|indefinitely|permanently/gi,
    type: "indefinite_storage",
    risk: "critical",
    message: "Indefinite data storage: Policy doesn't specify retention period",
    fix: "Define clear retention: 'We retain your data for 2 years after account deletion, then delete it.'",
  },
  {
    pattern: /share.*partners|share.*third parties|sell.*data/gi,
    type: "data_sharing",
    risk: "high",
    message: "Data sharing without transparency: Not clearly explaining who gets user data",
    fix: "List specific partners: 'We share data with [Stripe for payments], [AWS for hosting]'",
  },
  {
    pattern: /opt.?out|unsubscribe.*complex|difficult|convoluted/gi,
    type: "hard_optout",
    risk: "high",
    message: "Difficult opt-out mechanism: Users should be able to opt-out as easily as opting in",
    fix: "Provide one-click opt-out option with clear 'Manage Preferences' link",
  },
  {
    pattern: /update.*any time|change.*without notice|modify.*policy/gi,
    type: "unilateral_changes",
    risk: "medium",
    message: "Unilateral policy changes: Policy can be changed without user notification",
    fix: "Add: 'We will notify you of material changes via email before they take effect.'",
  },
  {
    pattern: /accept.*all.*big|reject.*small|accept.*prominent|reject.*hidden/gi,
    type: "asymmetric_buttons",
    risk: "high",
    message: "Asymmetric consent UI: Accept button is more prominent than reject",
    fix: "Make 'Accept' and 'Reject' buttons equal in size, color, and visibility",
  },
  {
    pattern: /required.*for.*service|cannot.*without.*consent|opt.?in.*required/gi,
    type: "forced_consent",
    risk: "critical",
    message: "Forced consent: Non-essential data collection is mandatory",
    fix: "Allow users to opt-out of non-essential processing",
  },
  {
    pattern: /roaming.*profiles|tracking.*behavioral|targeting.*based on.*behavior/gi,
    type: "behavioral_tracking",
    risk: "critical",
    message: "Behavioral tracking detected: Undisclosed user tracking across services",
    fix: "Add clear disclosure: 'We use cookies to track your behavior for personalization. You can disable this.'",
  },
];

export function detectDarkPatterns(policyText) {
  const detections = [];
  
  DARK_PATTERNS.forEach((pattern) => {
    const matches = policyText.match(pattern.pattern);
    if (matches) {
      detections.push({
        type: pattern.type,
        risk: pattern.risk,
        message: pattern.message,
        fix: pattern.fix,
        occurrences: matches.length,
        examples: matches.slice(0, 3),
      });
    }
  });
  
  // Calculate severity
  const criticalCount = detections.filter((d) => d.risk === "critical").length;
  const highCount = detections.filter((d) => d.risk === "high").length;
  
  let severityScore = 100;
  severityScore -= criticalCount * 20;
  severityScore -= highCount * 10;
  severityScore = Math.max(0, severityScore);
  
  return {
    darkPatternsFound: detections.length,
    patterns: detections,
    riskAssessment: {
      critical: criticalCount,
      high: highCount,
      total: detections.length,
    },
    severityScore,
    riskLevel: severityScore < 40 ? "critical" : severityScore < 70 ? "high" : "medium",
    recommendation:
      detections.length > 0
        ? `Found ${detections.length} dark pattern(s). This policy may not comply with GDPR/DPDP requirements.`
        : "No obvious dark patterns detected in this policy.",
  };
}

export { DARK_PATTERNS };
