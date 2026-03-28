export const complianceQuestions = [
  {
    key: "consentCollection",
    title: "Do you collect explicit user consent before processing personal data?",
    help: "Use clear opt-in language and keep timestamped consent logs.",
  },
  {
    key: "dataEncryption",
    title: "Is personal data encrypted both in transit and at rest?",
    help: "TLS plus storage encryption are baseline controls.",
  },
  {
    key: "dataDeletionWorkflow",
    title: "Can users request deletion of their personal data?",
    help: "Deletion flows should be auditable and time-bound.",
  },
  {
    key: "retentionPolicy",
    title: "Do you have a defined retention policy with timelines?",
    help: "Explain what is kept, why, and for how long.",
  },
  {
    key: "userRightsAccess",
    title: "Can users access, correct, or erase their data?",
    help: "Support rights requests through a simple process.",
  },
  {
    key: "breachNotification",
    title: "Is there a breach response and notification process?",
    help: "Document who acts, what timelines apply, and escalation steps.",
  },
  {
    key: "childDataSafeguards",
    title: "Are safeguards in place for child data processing?",
    help: "Age checks and parental consent may be required.",
  },
  {
    key: "dpOfficerAssigned",
    title: "Is a person/team assigned to privacy governance?",
    help: "Ownership improves accountability and readiness.",
  },
];
