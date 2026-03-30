/**
 * Risk Alert System
 * Detects high-risk statements and dangerous clauses
 */

const HIGH_RISK_ALERTS = [
  {
    keywords: ["store.*data.*forever", "never.*delete", "permanent.*storage", "indefinite.*retention"],
    severity: "critical",
    title: "Indefinite Data Storage",
    description: "Policy allows indefinite data storage without retention limits",
    impact: "Violates GDPR/DPDP storage limitation principle",
    suggestion: "Define retention periods: 'Data is retained for 2 years after account deletion, then securely deleted.'",
  },
  {
    keywords: ["share.*without.*consent", "sell.*data", "share.*partners.*without.*notice"],
    severity: "critical",
    title: "Unauthorized Data Sharing",
    description: "Data sharing without explicit user consent",
    impact: "May violate GDPR Article 6 consent requirements",
    suggestion: "Add: 'We only share data with explicit user consent. Users can manage sharing preferences in Settings.'",
  },
  {
    keywords: ["monitor.*behavior", "track.*activity", "surveillance"],
    severity: "high",
    title: "Undisclosed Behavior Monitoring",
    description: "Behavior monitoring without clear user notification",
    impact: "Lacks transparency required by DPDP/GDPR",
    suggestion: "Be explicit: 'We monitor user behavior for security and personalization. Disable in Privacy Settings.'",
  },
  {
    keywords: ["right.*to.*modify.*terms", "change.*policy.*any.*time", "update.*without.*notice"],
    severity: "high",
    title: "Unilateral Policy Changes",
    description: "Policy can be changed without user notification",
    impact: "Users have no control over data handling changes",
    suggestion: "Add: 'We notify users of material changes via email 30 days before implementation.'",
  },
  {
    keywords: ["cannot.*delete.*data", "cannot.*access.*data", "no.*right.*to.*access"],
    severity: "critical",
    title: "Denied User Rights",
    description: "Policy denies fundamental GDPR/DPDP rights",
    impact: "Direct violation of data subject rights",
    suggestion: "Remove these clauses. Users have rights to access, deletion, and correction.",
  },
  {
    keywords: ["not.*responsible.*for", "not.*liable.*for", "disclaimer.*data.*security"],
    severity: "high",
    title: "Avoided Security Responsibility",
    description: "Company disclaims responsibility for data security",
    impact: "Shows negligence in security obligations",
    suggestion: "Add: 'We implement industry-standard security measures and notify users of breaches within 72 hours.'",
  },
  {
    keywords: ["children.*data", "minors.*data", "under.*18"],
    severity: "critical",
    title: "Unclear Minor Data Handling",
    description: "No clear policy for processing children's data",
    impact: "Violates DPDP special provisions for minors",
    suggestion: "Add DPDP-compliant minor handling: 'For users under 18, we obtain verifiable parental consent.'",
  },
];

export function detectRiskAlerts(policyText) {
  const lowerText = policyText.toLowerCase();
  const alerts = [];
  
  HIGH_RISK_ALERTS.forEach((alert) => {
    const pattern = new RegExp(alert.keywords.join("|"), "gi");
    if (pattern.test(lowerText)) {
      alerts.push({
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        impact: alert.impact,
        suggestion: alert.suggestion,
        detected: true,
      });
    }
  });
  
  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
  const highAlerts = alerts.filter((a) => a.severity === "high").length;
  
  return {
    totalAlerts: alerts.length,
    criticalAlerts,
    highAlerts,
    alerts,
    overallRisk: criticalAlerts > 0 ? "critical" : highAlerts > 0 ? "high" : "low",
    recommendation:
      alerts.length > 0
        ? `⚠️ Found ${alerts.length} risk alert(s). Address these before publishing.`
        : "✅ No critical risks detected.",
  };
}

export { HIGH_RISK_ALERTS };
