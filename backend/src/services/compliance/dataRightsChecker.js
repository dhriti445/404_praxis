/**
 * Data Rights Checker
 * Verifies that policy mentions all GDPR/DPDP required data subject rights
 */

export function checkDataRights(policyText) {
  const lowerText = policyText.toLowerCase();
  
  const rights = [
    {
      name: "Right to Access",
      gdprArticle: "Article 15",
      dpdpSection: "Section 8",
      keywords: ["right.*access", "access.*data", "export.*data", "data access", "retrieve.*data"],
      description: "User can request and receive a copy of their personal data",
      importance: "critical",
    },
    {
      name: "Right to Deletion",
      gdprArticle: "Article 17",
      dpdpSection: "Section 10",
      keywords: ["right.*delete", "delete.*data", "erasure", "right.*be.*forgotten"],
      description: "User can request deletion of their data",
      importance: "critical",
    },
    {
      name: "Right to Rectification",
      gdprArticle: "Article 16",
      dpdpSection: "Section 9",
      keywords: ["correct", "rectify", "update.*data", "modify.*data", "inaccurate"],
      description: "User can correct inaccurate personal data",
      importance: "critical",
    },
    {
      name: "Right to Data Portability",
      gdprArticle: "Article 20",
      dpdpSection: "Section 8(2)",
      keywords: ["portability", "export.*format", "machine.*readab", "transfer.*another.*provider"],
      description: "User can request data in portable format to transfer to another service",
      importance: "high",
    },
    {
      name: "Right to Object",
      gdprArticle: "Article 21",
      dpdpSection: "Section 11",
      keywords: ["object.*processing", "opt.*out", "unsubscribe", "marketing.*opt.*out"],
      description: "User can object to processing for marketing or profiling",
      importance: "high",
    },
    {
      name: "Right to Restrict Processing",
      gdprArticle: "Article 18",
      dpdpSection: "NA",
      keywords: ["restrict.*process", "suspend.*process", "pause.*data.*use"],
      description: "User can request processing be restricted in certain conditions",
      importance: "medium",
    },
    {
      name: "Right to Lodge Complaint",
      gdprArticle: "Article 77",
      dpdpSection: "Section 18",
      keywords: ["complaint", "supervisory.*authority", "dpa", "grievance"],
      description: "User can file complaint with data protection authority",
      importance: "critical",
    },
    {
      name: "Right to Human Review",
      gdprArticle: "Article 22",
      dpdpSection: "Section 2(h)",
      keywords: ["human", "review", "automated.*decision", "profiling"],
      description: "User can request human review of automated decisions",
      importance: "medium",
    },
  ];
  
  const checkedRights = rights.map((right) => {
    const found = right.keywords.some((kw) => new RegExp(kw, "i").test(lowerText));
    return {
      ...right,
      mentioned: found,
    };
  });
  
  const mentionedCount = checkedRights.filter((r) => r.mentioned).length;
  const criticalMentioned = checkedRights
    .filter((r) => r.importance === "critical" && r.mentioned).length;
  const criticalTotal = checkedRights.filter((r) => r.importance === "critical").length;
  
  return {
    totalRights: rights.length,
    mentionedRights: mentionedCount,
    notMentionedRights: checkedRights.filter((r) => !r.mentioned),
    rights: checkedRights,
    criticalRightsCoverage: `${criticalMentioned}/${criticalTotal}`,
    complianceScore: Math.round((mentionedCount / rights.length) * 100),
    recommendation:
      criticalMentioned === criticalTotal
        ? "✅ All critical data rights are mentioned"
        : `⚠️ Missing ${criticalTotal - criticalMentioned} critical right(s)`,
  };
}
