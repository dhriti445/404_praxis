/**
 * Fake Policy Detector
 * Detects malicious, fake, or incomplete privacy policies
 */

export function detectFakePolicy(policyText) {
  const length = policyText.length;
  const wordCount = policyText.split(/\s+/).length;
  const lowerText = policyText.toLowerCase();
  
  const checks = [
    {
      check: "Minimum Length",
      description: "Policy is comprehensive enough (>500 words is typical)",
      passed: wordCount > 500,
      issue: `Policy is too short (${wordCount} words). Legitimate policies are typically 1000-3000 words.`,
      severity: "medium",
    },
    {
      check: "Copy-Paste Template",
      description: "Policy appears to be a generic template (contains [COMPANY_NAME], etc.)",
      passed: !/(\[COMPANY|\[YOUR|\[INSERT|\{\{.*?\}\}|XXXXX)/i.test(policyText),
      issue: "Policy contains template placeholders. It appears to be incomplete.",
      severity: "high",
    },
    {
      check: "Legitimate Sections",
      description: "Contains essential policy sections",
      passed: checkEssentialSections(lowerText),
      issue: "Missing essential sections like data collection, retention, user rights",
      severity: "critical",
    },
    {
      check: "No Copy-Paste Markers",
      description: "Policy is original (not obvious copy from competitors)",
      passed: !detectCopyPaste(lowerText),
      issue: "Policy text matches known template patterns. May be plagiarized.",
      severity: "high",
    },
    {
      check: "Legal Language",
      description: "Uses appropriate legal terminology",
      passed: detectLegalTerms(lowerText),
      issue: "Policy lacks legal terminology. May not be legally sound.",
      severity: "medium",
    },
    {
      check: "No Obvious Scam Indicators",
      description: "No indicators of malicious intent",
      passed: !detectScamPatterns(lowerText),
      issue: "Policy contains suspicious language suggesting malicious intent",
      severity: "critical",
    },
    {
      check: "Contact Information",
      description: "Includes verifiable contact information",
      passed: checkContactInfo(policyText),
      issue: "No contact information or email for privacy inquiries",
      severity: "high",
    },
  ];
  
  const passedCount = checks.filter((c) => c.passed).length;
  const failedCritical = checks.filter((c) => !c.passed && c.severity === "critical").length;
  
  let verdict = "legitimate";
  if (failedCritical > 0) {
    verdict = "suspicious";
  } else if (checks.filter((c) => !c.passed).length > 2) {
    verdict = "questionable";
  }
  
  return {
    verdict,
    score: Math.round((passedCount / checks.length) * 100),
    checks,
    issues: checks.filter((c) => !c.passed),
    recommendation:
      verdict === "legitimate"
        ? "✅ Policy appears legitimate and comprehensive"
        : `⚠️ Policy appears ${verdict}. Review highlighted issues.`,
  };
}

function checkEssentialSections(text) {
  const essentials = [
    "collect",
    "data",
    "consent",
    "right",
    "delete",
    "retention",
    "security",
  ];
  return essentials.filter((e) => text.includes(e)).length >= 5;
}

function detectCopyPaste(text) {
  const genericPatterns = [
    "cookie policy",
    "generated automatically",
    "this is a template",
    "fill in the blanks",
  ];
  return genericPatterns.some((p) => text.includes(p));
}

function detectLegalTerms(text) {
  const legalTerms = [
    "gdpr",
    "dpdp",
    "lawful basis",
    "data controller",
    "data processor",
    "legitimate interest",
    "consent",
    "data subject",
  ];
  return legalTerms.filter((t) => text.includes(t)).length >= 3;
}

function detectScamPatterns(text) {
  const scamKeywords = [
    "we sell your data",
    "we track everything",
    "no privacy",
    "we monitor all activity",
    "we have no security",
  ];
  return scamKeywords.some((k) => text.includes(k));
}

function checkContactInfo(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  return emailRegex.test(text);
}
