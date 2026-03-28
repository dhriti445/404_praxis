export const complianceRules = [
  {
    key: "consentCollection",
    label: "Explicit consent collection",
    penalty: 25,
    severity: "high",
    description:
      "Data is collected without an explicit and auditable consent mechanism.",
    fixHint:
      "Add explicit opt-in consent checkboxes with versioned consent logs and timestamps.",
  },
  {
    key: "dataEncryption",
    label: "Data encryption at rest and in transit",
    penalty: 20,
    severity: "high",
    description:
      "Sensitive data is not consistently encrypted in storage and network transport.",
    fixHint:
      "Use TLS for all transport and AES-256 encryption for stored personal data.",
  },
  {
    key: "dataDeletionWorkflow",
    label: "User data deletion workflow",
    penalty: 15,
    severity: "medium",
    description:
      "There is no clear or testable process to delete user data on request.",
    fixHint:
      "Implement a deletion workflow with SLA, audit logs, and user confirmation.",
  },
  {
    key: "retentionPolicy",
    label: "Documented retention policy",
    penalty: 12,
    severity: "medium",
    description:
      "Retention timelines are not communicated, enforced, or reviewed.",
    fixHint:
      "Define category-wise retention periods and auto-purge or archive procedures.",
  },
  {
    key: "userRightsAccess",
    label: "User rights handling (access/rectification/erasure)",
    penalty: 10,
    severity: "medium",
    description:
      "Users cannot easily exercise legal rights on their personal data.",
    fixHint:
      "Provide rights request channels and a verified response workflow.",
  },
  {
    key: "breachNotification",
    label: "Breach detection and notification process",
    penalty: 8,
    severity: "medium",
    description:
      "Incident response does not include a structured breach notification process.",
    fixHint:
      "Create an incident runbook with legal notification timelines and accountability.",
  },
  {
    key: "childDataSafeguards",
    label: "Child data safeguards",
    penalty: 5,
    severity: "low",
    description:
      "Child data controls and parental consent safeguards are not defined.",
    fixHint:
      "Apply age-gating and parental consent checks where child data may be collected.",
  },
  {
    key: "dpOfficerAssigned",
    label: "Data protection ownership",
    penalty: 5,
    severity: "low",
    description:
      "No responsible role is assigned for privacy governance and escalation.",
    fixHint:
      "Assign a privacy lead and define governance responsibilities.",
  },
];

export const policySignals = [
  {
    key: "consent",
    label: "Consent mechanism",
    penalty: 20,
    severity: "high",
    patterns: [/consent/i, /opt[-\s]?in/i, /permission/i],
  },
  {
    key: "purpose",
    label: "Purpose limitation",
    penalty: 15,
    severity: "high",
    patterns: [/purpose/i, /why we collect/i, /use of data/i],
  },
  {
    key: "retention",
    label: "Data retention",
    penalty: 15,
    severity: "medium",
    patterns: [/retention/i, /stored for/i, /delete.*after/i],
  },
  {
    key: "rights",
    label: "User rights",
    penalty: 15,
    severity: "medium",
    patterns: [/right to/i, /access/i, /erase/i, /rectif/i],
  },
  {
    key: "security",
    label: "Security safeguards",
    penalty: 15,
    severity: "medium",
    patterns: [/encryption/i, /security/i, /safeguard/i],
  },
  {
    key: "sharing",
    label: "Third-party sharing disclosure",
    penalty: 10,
    severity: "medium",
    patterns: [/third[-\s]?party/i, /share/i, /processor/i],
  },
  {
    key: "contact",
    label: "Grievance/contact details",
    penalty: 10,
    severity: "low",
    patterns: [/contact/i, /grievance/i, /data protection officer/i],
  },
];
