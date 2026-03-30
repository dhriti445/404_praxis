# Policy Agent

Analyzes, scores, and rewrites privacy policies to improve compliance.

## Endpoints

- `POST /api/policy/analyze` - Upload and analyze a policy document

## Responsibilities

- Policy text analysis against DPDP/GDPR/IT Act frameworks
- Detection of missing legal sections
- Compliance scoring of existing policies
- AI-powered policy rewriting to target compliance scores
- Suggestion of improved policy clauses

## Input

```json
{
  "policyText": "Our privacy policy explains how we collect and use data..."
}
```

## Output

```json
{
  "mode": "policy_check",
  "score": 65,
  "riskLevel": "medium",
  "missingAreas": [
    "User rights (access/erasure/rectification)",
    "Retention timelines",
    "Breach notification process"
  ],
  "violations": [...],
  "risks": [...],
  "rewrittenPolicyText": "...complete rewritten policy...",
  "rewrittenScore": 95,
  "targetScore": 100,
  "targetAchieved": false
}
```
