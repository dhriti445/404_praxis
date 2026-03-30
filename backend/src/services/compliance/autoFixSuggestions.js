/**
 * Auto Fix Suggestions
 * Provides actionable fixes for compliance issues
 */

export function generateAutoFixes(missingClauses, darkPatterns, riskAlerts) {
  const fixes = [];
  
  // Generate fixes for missing clauses
  if (missingClauses && missingClauses.length > 0) {
    missingClauses.forEach((clause) => {
      fixes.push(generateClauseFix(clause));
    });
  }
  
  // Generate fixes for dark patterns
  if (darkPatterns && darkPatterns.patterns) {
    darkPatterns.patterns.forEach((pattern) => {
      fixes.push({
        issue: pattern.message,
        type: "dark_pattern",
        severity: pattern.risk,
        suggestion: pattern.fix,
        priority: pattern.risk === "critical" ? "urgent" : "normal",
      });
    });
  }
  
  // Generate fixes for risk alerts
  if (riskAlerts && riskAlerts.alerts) {
    riskAlerts.alerts.forEach((alert) => {
      fixes.push({
        issue: alert.title,
        type: "risk_alert",
        severity: alert.severity,
        suggestion: alert.suggestion,
        priority: alert.severity === "critical" ? "urgent" : "normal",
      });
    });
  }
  
  // Sort by priority
  fixes.sort((a, b) => {
    const priorityOrder = { urgent: 1, normal: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return {
    totalFixes: fixes.length,
    fixes,
    estimatedComplianceImprovement: calculateImprovement(fixes),
  };
}

function generateClauseFix(clause) {
  const clauseFixes = {
    "Data Collection Notice": `Add this clause:
"We collect personal data including your name, email, IP address, and usage patterns. 
We collect this data to provide and improve our services, comply with legal obligations, and prevent fraud."`,
    
    "Purpose Limitation": `Add this clause:
"We use your personal data only for the purposes stated in this policy. 
We do not use your data for any other purpose without obtaining your fresh consent."`,
    
    "Explicit Consent Mechanism": `Add this clause:
"Before collecting any personal data, we will ask for your explicit consent. 
You can withdraw consent at any time from your Account Settings. Withdrawal will not affect past processing."`,
    
    "Data Storage & Retention": `Add this clause:
"We retain your active account data for the duration of your account. 
After account deletion or 2 years of inactivity, we delete your data within 30 days. 
Legal records are retained for 7 years as required by tax laws."`,
    
    "Security Measures": `Add this clause:
"We employ encryption (TLS/SSL), secure authentication (2FA), and regular security audits. 
We restrict data access to authorized personnel. We conduct annual penetration testing."`,
    
    "User Rights (Access/Deletion)": `Add this clause:
"You have the right to: (1) Access your data - request a data export anytime, (2) Deletion - request we delete your data, 
(3) Correction - update incorrect information. Submit requests to privacy@company.com within 30 days."`,
    
    "Grievance Redressal": `Add this clause:
"If you have privacy concerns, contact privacy@company.com. We respond within 7 days. 
If unsatisfied, you can file a complaint with your local data protection authority."`,
    
    "Minor Data Handling": `Add this clause:
"For users under 18, we obtain verifiable parental consent before processing data. 
We do not use minors' data for behavioral advertising or direct marketing."`,
  };
  
  return {
    issue: `Missing: ${clause.title}`,
    type: "missing_clause",
    severity: "high",
    suggestion: clauseFixes[clause.title] || `Add comprehensive clause about: ${clause.title}`,
    priority: "normal",
  };
}

function calculateImprovement(fixes) {
  const criticalCount = fixes.filter((f) => f.severity === "critical" || f.priority === "urgent").length;
  const improvementPercentage = Math.min(criticalCount * 15 + fixes.length * 3, 40);
  return improvementPercentage;
}
