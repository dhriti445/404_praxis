export const roleModeMeta = {
  developer: {
    target: "Individual developers / small apps",
    philosophy: "Do minimum but do not violate law.",
    riskLogic: [
      "No consent -> HIGH",
      "Storing sensitive data -> HIGH",
      "No HTTPS/password safety -> MEDIUM",
    ],
  },
  startup: {
    target: "Growing apps / SaaS",
    philosophy: "Build trust and avoid legal risk.",
    riskLogic: [
      "No retention policy -> HIGH",
      "No delete option -> HIGH",
      "No privacy policy -> HIGH",
      "Weak security -> MEDIUM",
    ],
  },
  companies: {
    target: "Enterprises / large-scale systems",
    philosophy: "Legal compliance plus audit readiness.",
    riskLogic: [
      "No DPO -> HIGH",
      "No breach plan -> CRITICAL",
      "No audit logs -> HIGH",
      "No DPIA -> HIGH",
    ],
  },
};

export const roleComplianceQuestions = {
  developer: [
    {
      key: "consentCollection",
      title: "Is basic consent taken before collecting user data?",
      help: "Simple checkbox consent is acceptable for this mode.",
    },
    {
      key: "minimalDataCollection",
      title: "Do you collect only minimum data (name/email)?",
      help: "Avoid unnecessary fields that are not essential.",
    },
    {
      key: "avoidSensitiveDataStorage",
      title: "Do you avoid storing sensitive data (biometric/financial/health)?",
      help: "Developer mode expects no sensitive data storage.",
    },
    {
      key: "basicSecurityHttps",
      title: "Are HTTPS and safe password storage enabled?",
      help: "No plain text passwords and HTTPS are baseline controls.",
    },
  ],
  startup: [
    {
      key: "consentCollection",
      title: "Do you have explicit and revocable consent?",
      help: "Users should be able to withdraw consent.",
    },
    {
      key: "privacyPolicyPage",
      title: "Do you have a full privacy policy page?",
      help: "It should explain data usage, storage, and sharing.",
    },
    {
      key: "retentionPolicy",
      title: "Is retention policy defined (for example 90 days)?",
      help: "State retention duration per data category.",
    },
    {
      key: "dataDeletionWorkflow",
      title: "Can users delete account and request data actions?",
      help: "Include deletion and rights workflow.",
    },
    {
      key: "dataEncryption",
      title: "Are encryption and secure password/database controls in place?",
      help: "Hashed passwords and secure DB are expected.",
    },
    {
      key: "thirdPartyDisclosure",
      title: "Is third-party data sharing clearly disclosed?",
      help: "Users should know if processors receive data.",
    },
    {
      key: "basicLogging",
      title: "Do you track basic access and change logs?",
      help: "Maintain core logs for accountability.",
    },
  ],
  companies: [
    {
      key: "advancedConsentManagement",
      title: "Is granular consent management with consent logs implemented?",
      help: "Enterprise mode needs auditable consent trails.",
    },
    {
      key: "dpOfficerAssigned",
      title: "Is a DPO or equivalent privacy owner assigned?",
      help: "Large systems need formal ownership.",
    },
    {
      key: "dpiaConducted",
      title: "Are DPIAs conducted before high-risk processing?",
      help: "DPIA should be documented and repeatable.",
    },
    {
      key: "breachNotification72h",
      title: "Is a 72-hour breach notification plan defined and tested?",
      help: "Missing this is treated as critical risk.",
    },
    {
      key: "crossBorderCompliance",
      title: "Are cross-border transfer controls in place?",
      help: "Document transfer mechanisms and safeguards.",
    },
    {
      key: "auditLogsMaintained",
      title: "Are compliance audit logs maintained?",
      help: "Logs should support audit-readiness.",
    },
    {
      key: "childDataSafeguards",
      title: "Are child data and parental consent safeguards active?",
      help: "Enable age checks where applicable.",
    },
    {
      key: "advancedSecurity",
      title: "Are advanced security controls active (monitoring/access control)?",
      help: "Enterprise-grade controls are expected.",
    },
  ],
};

export function getRoleComplianceQuestions(role = "startup") {
  const normalizedRole = String(role || "startup").toLowerCase();
  return roleComplianceQuestions[normalizedRole] || roleComplianceQuestions.startup;
}

const uniqueQuestionMap = new Map();
Object.values(roleComplianceQuestions)
  .flat()
  .forEach((question) => {
    if (!uniqueQuestionMap.has(question.key)) {
      uniqueQuestionMap.set(question.key, question);
    }
  });

export const allComplianceQuestions = Array.from(uniqueQuestionMap.values());
