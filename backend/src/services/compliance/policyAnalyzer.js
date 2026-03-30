/**
 * Smart Privacy Policy Analyzer
 * Analyzes privacy policies for DPDP Act 2023 and GDPR compliance
 */

const DPDP_REQUIRED_SECTIONS = [
  { key: "data_collection", label: "Data Collection Notice", weight: 15 },
  { key: "purposes", label: "Purpose Limitation", weight: 12 },
  { key: "consent", label: "Explicit Consent Mechanism", weight: 15 },
  { key: "storage", label: "Data Storage & Retention", weight: 10 },
  { key: "security", label: "Security Measures", weight: 12 },
  { key: "rights", label: "User Rights (Access/Deletion)", weight: 15 },
  { key: "grievance", label: "Grievance Redressal", weight: 10 },
  { key: "minors", label: "Minor Data Handling", weight: 8 },
  { key: "processing", label: "Lawful Processing Basis", weight: 3 },
];

const GDPR_REQUIRED_SECTIONS = [
  { key: "identity", label: "Controller Identity", weight: 10 },
  { key: "lawful_basis", label: "Lawful Basis for Processing", weight: 15 },
  { key: "purposes", label: "Processing Purposes", weight: 12 },
  { key: "recipients", label: "Data Recipients/Third Parties", weight: 12 },
  { key: "retention", label: "Retention Period", weight: 10 },
  { key: "rights", label: "Data Subject Rights", weight: 15 },
  { key: "complaint", label: "Complaint Mechanism", weight: 8 },
  { key: "dpia", label: "Privacy Impact Assessment", weight: 8 },
  { key: "safeguards", label: "International Transfers Safeguards", weight: 10 },
];

export function analyzePolicyText(text) {
  const lowerText = text.toLowerCase();
  
  // Analyze DPDP compliance
  const dpdpAnalysis = analyzeDPDPCompliance(lowerText);
  const gdprAnalysis = analyzeGDPRCompliance(lowerText);
  
  const avgScore = Math.round((dpdpAnalysis.score + gdprAnalysis.score) / 2);
  
  return {
    score: avgScore,
    riskLevel: getRiskLevel(avgScore),
    textLength: text.length,
    wordCount: text.split(/\s+/).length,
    dpdp: dpdpAnalysis,
    gdpr: gdprAnalysis,
    missingClauses: combineMissingClauses(dpdpAnalysis, gdprAnalysis),
    issues: combineMissingClauses(dpdpAnalysis, gdprAnalysis),
  };
}

function analyzeDPDPCompliance(lowerText) {
  const results = DPDP_REQUIRED_SECTIONS.map((section) => {
    const found = checksectionPresence(lowerText, section.key);
    return {
      key: section.key,
      label: section.label,
      weight: section.weight,
      found,
    };
  });
  
  const foundCount = results.filter((r) => r.found).length;
  const score = Math.round((foundCount / results.length) * 100);
  
  return {
    score,
    totalSections: results.length,
    foundSections: foundCount,
    missingItems: results.filter((r) => !r.found).map((r) => ({
      title: r.label,
      severity: "high",
      reference: "DPDP Act, 2023",
      issue: `Missing: ${r.label}`,
    })),
  };
}

function analyzeGDPRCompliance(lowerText) {
  const results = GDPR_REQUIRED_SECTIONS.map((section) => {
    const found = checksectionPresence(lowerText, section.key);
    return {
      key: section.key,
      label: section.label,
      weight: section.weight,
      found,
    };
  });
  
  const foundCount = results.filter((r) => r.found).length;
  const score = Math.round((foundCount / results.length) * 100);
  
  return {
    score,
    totalSections: results.length,
    foundSections: foundCount,
    missingItems: results.filter((r) => !r.found).map((r) => ({
      title: r.label,
      severity: "high",
      reference: "GDPR",
      issue: `Missing: ${r.label}`,
    })),
  };
}

function checksectionPresence(text, key) {
  const keywords = {
    data_collection: ["collect", "collection", "data we collect", "information we gather"],
    purposes: ["purpose", "purposes", "use of data", "data usage"],
    consent: ["consent", "agree", "permission", "opt-in", "explicit consent"],
    storage: ["store", "storage", "retain", "retention", "duration"],
    security: ["secure", "security", "encrypt", "protection", "safeguard"],
    rights: ["access", "deletion", "right to", "data portability", "rectification"],
    grievance: ["grievance", "complaint", "dispute", "contact us"],
    minors: ["child", "children", "minor", "parental", "under 18"],
    processing: ["process", "processing", "lawful"],
    identity: ["provider", "controller", "company", "responsible"],
    lawful_basis: ["consent", "contract", "legal obligation", "vital interest"],
    recipients: ["third party", "share", "recipient", "processor"],
    retention: ["retain", "delete", "period", "duration"],
    complaint: ["complaint", "supervisory authority", "dpa"],
    dpia: ["impact assessment", "dpia", "privacy impact"],
    safeguards: ["transfer", "standard contract", "adequacy", "binding"],
  };
  
  const sectionKeywords = keywords[key] || [];
  return sectionKeywords.some((kw) => text.includes(kw));
}

function combineMissingClauses(dpdpAnalysis, gdprAnalysis) {
  const dpdpMissing = dpdpAnalysis.missingItems || [];
  const gdprMissing = gdprAnalysis.missingItems || [];
  
  // Remove duplicates by title
  const combined = [...dpdpMissing, ...gdprMissing];
  const unique = Array.from(
    new Map(combined.map((item) => [item.title, item])).values()
  );
  
  return unique;
}

function getRiskLevel(score) {
  if (score >= 80) return "low";
  if (score >= 50) return "medium";
  return "high";
}

export { DPDP_REQUIRED_SECTIONS, GDPR_REQUIRED_SECTIONS };
