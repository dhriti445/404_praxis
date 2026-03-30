export const industryPlaybooks = [
  {
    id: "edtech",
    title: "Ed-tech",
    focus: "Children's data and parental consent under DPDP",
    keyObligations: [
      {
        law: "DPDP Act, 2023",
        obligation:
          "Obtain verifiable parental consent before processing personal data of children.",
      },
      {
        law: "DPDP Act, 2023",
        obligation:
          "Avoid tracking, behavioral monitoring, and targeted advertising directed at children.",
      },
      {
        law: "IT Act and SPDI Rules",
        obligation:
          "Implement reasonable security practices to protect student data and credentials.",
      },
      {
        law: "DPDP Act, 2023",
        obligation:
          "Provide clear notices for parents on what student data is collected and why.",
      },
    ],
    samplePolicySnippets: [
      "For users below the applicable age threshold, we collect and process personal data only after verified parental consent.",
      "We do not use children's personal data for behavioral advertising, profiling, or unnecessary tracking.",
      "Parents can request access, correction, or deletion of a child's data by contacting our grievance channel.",
    ],
    commonPitfalls: [
      "Using only a checkbox without meaningful parental verification.",
      "Keeping student data indefinitely without a documented retention schedule.",
      "Sharing classroom analytics with vendors without clear contracts and purpose limits.",
    ],
  },
  {
    id: "healthtech",
    title: "Health-tech",
    focus: "Medical and health data handling under DPDP and IT Act frameworks",
    keyObligations: [
      {
        law: "IT Act and SPDI Rules",
        obligation:
          "Treat medical records and health information as sensitive data and apply enhanced safeguards.",
      },
      {
        law: "DPDP Act, 2023",
        obligation:
          "Process only data necessary for care delivery, operations, and lawful healthcare use cases.",
      },
      {
        law: "DPDP Act, 2023",
        obligation:
          "Maintain transparent notice, consent workflow, and rights response mechanism.",
      },
      {
        law: "IT Act and SPDI Rules",
        obligation:
          "Implement strong access control, audit trails, and incident response for health systems.",
      },
    ],
    samplePolicySnippets: [
      "We collect health information only for treatment, care coordination, and legally permitted healthcare operations.",
      "Access to medical data is role-based, logged, and restricted to authorized personnel.",
      "We retain medical records only for defined legal and clinical periods and securely delete them thereafter.",
    ],
    commonPitfalls: [
      "Broad consent language that does not explain specific health-data purposes.",
      "Using production patient data in testing environments without de-identification.",
      "Missing breach notification workflow for healthcare partners and users.",
    ],
  },
  {
    id: "fintech",
    title: "Fin-tech",
    focus: "Aadhaar, KYC, and cross-border data controls",
    keyObligations: [
      {
        law: "DPDP Act, 2023",
        obligation:
          "Use purpose-limited processing for KYC and transaction compliance data.",
      },
      {
        law: "Aadhaar related compliance requirements",
        obligation:
          "Handle Aadhaar-related data with strict masking, storage limits, and authorized usage only.",
      },
      {
        law: "DPDP Act, 2023",
        obligation:
          "Implement rights handling for access, correction, and deletion where legally applicable.",
      },
      {
        law: "DPDP Act, 2023",
        obligation:
          "Assess and document cross-border transfers, including vendor safeguards and contractual controls.",
      },
    ],
    samplePolicySnippets: [
      "We collect KYC data strictly for onboarding, fraud prevention, and regulatory compliance.",
      "Aadhaar-related fields are masked where required and processed only through authorized channels.",
      "Cross-border processing is performed only with approved safeguards and contractual data protection obligations.",
    ],
    commonPitfalls: [
      "Storing full KYC artifacts in logs or analytics systems without masking.",
      "Reusing identity data for unrelated marketing or profiling.",
      "Sending financial personal data to external processors without transfer risk assessment.",
    ],
  },
];
