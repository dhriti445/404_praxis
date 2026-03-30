/**
 * Privacy Policy Generator
 * Generates GDPR/DPDP-compliant privacy policies from basic info
 */

export async function generatePrivacyPolicy(info, aiService) {
  const {
    companyName,
    companyUrl,
    dataTypes,
    purposes,
    storage,
    thirdParties,
    location,
    hasMinors,
    hasEU,
  } = info;
  
  const prompt = `Generate a comprehensive, legally-compliant privacy policy for:
Company: ${companyName}
Website: ${companyUrl}
Data Collected: ${dataTypes}
Purposes: ${purposes}
Data Retention: ${storage}
Third Parties: ${thirdParties}
Headquarters: ${location}
Serves Minors: ${hasMinors}
Serves EU Customers: ${hasEU}

Requirements:
- Compliant with DPDP Act 2023 (India)
- Compliant with GDPR (if applicable)
- Clear, professional tone
- Include all required sections:
  * Data Collection & Purposes
  * Legal Basis for Processing
  * Data Retention
  * User Rights
  * Security Measures
  * Third-Party Sharing
  * Cookies & Tracking
  * Contact Information
- Use simple English, no jargon`;
  
  try {
    const generatedPolicy = await aiService.generateChatResponse(prompt, []);
    return {
      policy: generatedPolicy,
      status: "generated",
      sections: extractSections(generatedPolicy),
      complianceGuidance: getComplianceGuidance(info),
    };
  } catch (error) {
    return {
      policy: null,
      status: "error",
      error: error.message,
    };
  }
}

function extractSections(policy) {
  const sections = [];
  const sectionPatterns = [
    { name: "Introduction", pattern: /introduction|^overview/im },
    { name: "Data Collection", pattern: /data.?collection|what.?data|information.?we.?collect/im },
    { name: "Legal Basis", pattern: /legal.?basis|lawful.?basis|why.?we.?collect/im },
    { name: "Data Retention", pattern: /retention|how.?long|storage.?period/im },
    { name: "User Rights", pattern: /rights|access|deletion|portability/im },
    { name: "Security", pattern: /security|protect|encrypt|safeguard/im },
    { name: "Third Parties", pattern: /third.?party|sharing|recipients/im },
    { name: "Contact", pattern: /contact|privacy.?officer|email/im },
  ];
  
  return sectionPatterns.map((sp) => ({
    name: sp.name,
    mentioned: sp.pattern.test(policy),
  }));
}

function getComplianceGuidance(info) {
  const guidance = [];
  
  if (info.hasMinors) {
    guidance.push({
      law: "DPDP Act 2023",
      requirement: "Parental Consent for Minors",
      action: "Add section: 'For users under 18, we obtain verifiable parental consent before processing data.'",
    });
  }
  
  if (info.hasEU) {
    guidance.push({
      law: "GDPR",
      requirement: "Data Transfer Safeguards",
      action: "Add section: 'International transfers comply with Standard Contractual Clauses and Data Transfer Impact Assessment.'",
    });
  }
  
  guidance.push({
    law: "DPDP Act 2023",
    requirement: "Grievance Mechanism",
    action: "Add: 'Users can lodge grievances with our Grievance Officer at privacy@company.com. Response within 7 days.'",
  });
  
  return guidance;
}
