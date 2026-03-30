# Compliance Agent

Evaluates compliance posture across Developer, Startup, and Company modes.

## Endpoints

- `POST /api/compliance/check` - Evaluate compliance and return score, violations, and fixes

## Responsibilities

- Role-based compliance scoring (Developer/Startup/Companies)
- Policy recommendation generation for users without compliance forms
- Risk classification (low/medium/high/critical)
- System checks and gap analysis per role
- AI-powered fix suggestions

## Input

```json
{
  "role": "startup",
  "hasComplianceForm": true,
  "complianceForm": "Our privacy policy covers...",
  "answers": {
    "consentCollection": true,
    "privacyPolicyPage": false,
    "retentionPolicy": true
  }
}
```

## Output (With Form)

```json
{
  "mode": "compliance_check",
  "role": "startup",
  "score": 72,
  "riskLevel": "medium",
  "violations": [...],
  "risks": [...],
  "goodPractices": [...],
  "systemChecks": [...]
}
```

## Output (Without Form)

```json
{
  "mode": "policy_list",
  "role": "startup",
  "policyRecommendations": [
    "Proper Consent System (explicit + revocable)",
    "Full Privacy Policy Page",
    ...
  ],
  "systemChecks": [...]
}
```
