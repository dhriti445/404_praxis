/**
 * Industry-Specific Compliance Checker
 * Customized compliance checks for different industries
 */

const INDUSTRY_PROFILES = {
  healthcare: {
    name: "Healthcare & Medical Apps",
    description: "Telemedicine, health records, fitness tracking",
    specialRequirements: [
      "HIPAA/HITECH compliance (if US-based)",
      "Medical data as 'sensitive personal data' under GDPR/DPDP",
      "Extended security & encryption requirements",
      "Patient right to access medical records",
      "Breach notification within 72 hours",
      "Explicit consent for health data processing",
      "Data retention limits (typically 5-7 years post-visit)",
      "Third-party processor agreements mandatory",
    ],
    keyRisks: [
      "Processing health data without explicit consent",
      "Sharing medical data with unvetted third parties",
      "Insufficient encryption of sensitive patient data",
      "No clear breach notification procedure",
      "Missing data retention schedules",
    ],
    criticalClauses: [
      "Patient consent for medical data processing",
      "Security measures for health data",
      "Retention periods for patient records",
      "Breach notification procedure",
      "Access control and audit trails",
    ],
  },
  
  ecommerce: {
    name: "E-commerce & Marketplaces",
    description: "Online stores, payments, order processing",
    specialRequirements: [
      "PCI-DSS compliance for payment data",
      "Clear data usage for personalization/marketing",
      "Cookie consent for tracking (Google Analytics, etc.)",
      "Separate consent for marketing emails",
      "Clear opt-out mechanisms",
      "Payment processor data sharing disclosure",
      "Refund/dispute handling privacy",
      "User data deletion on account removal",
    ],
    keyRisks: [
      "Sharing customer data with unknown marketers",
      "Pre-checked marketing consent boxes",
      "Tracking pixels without clear disclosure",
      "No easy opt-out from marketing",
      "PCI-DSS violation (storing credit card data)",
    ],
    criticalClauses: [
      "Payment data handling (PCI compliance)",
      "Marketing consent opt-in",
      "Cookie and tracking disclosure",
      "Third-party vendor list",
      "Data retention for order history",
    ],
  },
  
  edtech: {
    name: "EdTech & Education Platforms",
    description: "Online learning, student records, assessment",
    specialRequirements: [
      "FERPA (if US) compliance for student records",
      "DPDP special provisions for minors (under 18)",
      "Explicitly verifiable parental consent (not just checkboxes)",
      "No behavioral tracking for children",
      "Limited data usage for non-academic purposes",
      "Transparency in algorithmic grading/recommendations",
      "Data deletion upon graduation/account closure",
      "Teacher/administrator data minimization",
    ],
    keyRisks: [
      "Collecting student behavioral data for profiling",
      "Processing minors' data without parental consent",
      "Selling student data to advertisers/third parties",
      "Using student data for purposes beyond education",
      "No data deletion after course completion",
    ],
    criticalClauses: [
      "Parental consent for minors",
      "Lawful purposes limited to education",
      "No behavioral profiling of students",
      "Data retention (typically deleted after course)",
      "Third-party not allowed (tutor data only)",
    ],
  },
  
  fintech: {
    name: "FinTech & Banking",
    description: "Payments, lending, investments, insurance",
    specialRequirements: [
      "Financial data as 'sensitive' under GDPR/DPDP",
      "KYC (Know Your Customer) compliance",
      "Aadhaar-based verification (if India)",
      "No indefinite retention of KYC data",
      "Secure storage of financial credentials",
      "Stringent third-party vetting",
      "Explicit consent for data sharing with partners",
      "Fraud prevention data handling clarity",
    ],
    keyRisks: [
      "Sharing KYC/financial data with unvetted partners",
      "Storing full KYC documents in accessible locations",
      "Indefinite retention of customer financial data",
      "Using financial data for non-financial purposes",
      "Lack of encryption for sensitive attributes",
    ],
    criticalClauses: [
      "KYC and identity verification process",
      "Financial data security measures",
      "Retention schedule for KYC records",
      "Third-party sharing restrictions",
      "Fraud detection and user notification",
    ],
  },
  
  saas: {
    name: "SaaS & B2B Software",
    description: "Enterprise software, cloud solutions, tools",
    specialRequirements: [
      "Data Processor Agreement (DPA) with customers",
      "Sub-processor disclosure",
      "Data location/residency clarity",
      "Breach notification SLA",
      "Data export/deletion SLA",
      "Regular security audits (SOC2)",
      "Customer control over data deletion",
      "Clear data retention policies",
    ],
    keyRisks: [
      "No Data Processor Agreement with enterprise customers",
      "Undisclosed sub-processors (especially for backups)",
      "No clear data deletion SLA",
      "Cross-border data transfers without safeguards",
      "Unclear backup and recovery data handling",
    ],
    criticalClauses: [
      "Data Processor Agreement",
      "Sub-processor list",
      "Data retention and deletion SLA",
      "Breach notification timeline",
      "Customer data access rights",
    ],
  },
};

export function getIndustryProfile(industry) {
  const profile = INDUSTRY_PROFILES[industry?.toLowerCase()];
  
  if (!profile) {
    return {
      error: "Industry not supported",
      supportedIndustries: Object.keys(INDUSTRY_PROFILES),
    };
  }
  
  return {
    industry,
    profile,
  };
}

export function analyzeIndustryCompliance(policyText, industry, analysis) {
  const profile = INDUSTRY_PROFILES[industry?.toLowerCase()];
  
  if (!profile) {
    return {
      error: "Industry not supported",
    };
  }
  
  const lowerText = policyText.toLowerCase();
  const checkedRequirements = profile.specialRequirements.map((req) => ({
    requirement: req,
    mentioned: req
      .toLowerCase()
      .split(/\s+/)
      .some((word) => word.length > 3 && lowerText.includes(word)),
  }));
  
  const mentionedCount = checkedRequirements.filter((r) => r.mentioned).length;
  const industryScore = Math.round((mentionedCount / checkedRequirements.length) * 100);
  
  const criticalMissing = checkedRequirements
    .filter((r) => !r.mentioned && profile.criticalClauses.some((c) => r.requirement.toLowerCase().includes(c.toLowerCase())))
    .map((r) => r.requirement);
  
  return {
    industry,
    profile,
    industryComplianceScore: industryScore,
    specialRequirementsCovered: mentionedCount,
    totalSpecialRequirements: checkedRequirements.length,
    checkedRequirements,
    criticalMissingClauses: criticalMissing,
    keyRisksToAddress: profile.keyRisks.slice(0, 3),
    overallScore: analysis.summary?.overallScore || 0,
    combinedScore: Math.round((industryScore * 0.4 + analysis.summary?.overallScore * 0.6) || 0),
    recommendation:
      industryScore >= 80
        ? `✅ Policy covers ${industry} industry requirements well`
        : `⚠️ Missing key ${industry}-specific compliance requirements`,
  };
}

export { INDUSTRY_PROFILES, getIndustryProfile, analyzeIndustryCompliance };
