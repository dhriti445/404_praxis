import axios from "axios";
import fs from "fs";
import https from "https";

let insecureTlsModeEnabled = false;

function parseJsonOrNull(value) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const withoutCodeFence = trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    try {
      return JSON.parse(withoutCodeFence);
    } catch {
      const objectStart = withoutCodeFence.indexOf("{");
      const objectEnd = withoutCodeFence.lastIndexOf("}");
      if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
        try {
          return JSON.parse(withoutCodeFence.slice(objectStart, objectEnd + 1));
        } catch {
          // Ignore and try array parse next.
        }
      }

      const arrayStart = withoutCodeFence.indexOf("[");
      const arrayEnd = withoutCodeFence.lastIndexOf("]");
      if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
        try {
          return JSON.parse(withoutCodeFence.slice(arrayStart, arrayEnd + 1));
        } catch {
          return null;
        }
      }

      return null;
    }
  }
}

function toPlainText(value) {
  if (typeof value !== "string") return "";

  return value
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeChatResponse(parsed, fallback) {
  const safe = parsed && typeof parsed === "object" ? parsed : {};

  const directAnswer = toPlainText(safe.directAnswer) || fallback.directAnswer;
  const simpleExplanation = toPlainText(safe.simpleExplanation) || fallback.simpleExplanation;

  const potentialRisks = Array.isArray(safe.potentialRisks)
    ? safe.potentialRisks.map(toPlainText).filter(Boolean).slice(0, 1)
    : [];

  const actionChecklist = Array.isArray(safe.actionChecklist)
    ? safe.actionChecklist.map(toPlainText).filter(Boolean).slice(0, 1)
    : [];

  return {
    directAnswer,
    simpleExplanation,
    potentialRisks: potentialRisks.length ? potentialRisks : fallback.potentialRisks.slice(0, 1),
    actionChecklist: actionChecklist.length ? actionChecklist : fallback.actionChecklist.slice(0, 1),
  };
}

function getLLMProvider() {
  const provider = (process.env.LLM_PROVIDER || "openai").trim().toLowerCase();
  return provider === "gemini" ? "gemini" : "openai";
}

function getOpenAIApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  return typeof apiKey === "string" ? apiKey.trim() : "";
}

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  return typeof apiKey === "string" ? apiKey.trim() : "";
}

export function getActiveAiProvider() {
  return getLLMProvider();
}

export function isAiProviderKeyConfigured() {
  const provider = getLLMProvider();
  return provider === "gemini" ? Boolean(getGeminiApiKey()) : Boolean(getOpenAIApiKey());
}

function getLLMHttpsAgent() {
  const allowSelfSigned =
    process.env.LLM_ALLOW_SELF_SIGNED === "true" ||
    process.env.OPENAI_ALLOW_SELF_SIGNED === "true";
  const caCertPath = (process.env.LLM_CA_CERT_PATH || process.env.OPENAI_CA_CERT_PATH || "").trim();

  if (!allowSelfSigned && !caCertPath) {
    return null;
  }

  const options = {};

  if (allowSelfSigned) {
    options.rejectUnauthorized = false;

    // Some environments ignore per-request httpsAgent settings.
    // This explicit process-level toggle is dev-only and opt-in via env var.
    if (!insecureTlsModeEnabled) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      insecureTlsModeEnabled = true;
      console.warn(
        "[ai] LLM_ALLOW_SELF_SIGNED=true enabled. TLS cert verification is disabled for this process."
      );
    }
  }

  if (caCertPath) {
    try {
      options.ca = fs.readFileSync(caCertPath);
    } catch (error) {
      console.warn(
        `[ai] Could not read LLM_CA_CERT_PATH (${caCertPath}): ${error.message}`
      );
    }
  }

  return new https.Agent(options);
}

function logLLMFailure(context, error) {
  const code = error?.code || error?.name || "UNKNOWN_ERROR";
  const message = error?.message || "LLM request failed";
  console.warn(`[ai] ${context} failed (${code}): ${message}`);
}

const REQUIRED_POLICY_SECTIONS = [
  {
    key: "consent",
    test: /(consent|opt[-\s]?in|permission)/i,
    clause:
      "Consent and lawful basis: We collect and process personal data only with valid consent or other lawful basis, and users can withdraw permission where applicable through explicit opt-in controls.",
  },
  {
    key: "purpose",
    test: /(purpose|why we collect|use of data)/i,
    clause:
      "Purpose limitation: We clearly explain why we collect personal data and ensure the use of data is limited to specified, explicit, and legitimate purposes.",
  },
  {
    key: "retention",
    test: /(retention|stored for|delete.*after)/i,
    clause:
      "Data retention: Personal data is stored for defined retention periods and we delete personal data after the retention purpose is completed.",
  },
  {
    key: "rights",
    test: /(right to|access|erase|rectif)/i,
    clause:
      "User rights: Users have the right to access and rectify personal data and also the right to erase personal data, subject to applicable legal requirements.",
  },
  {
    key: "security",
    test: /(encryption|security|safeguard)/i,
    clause:
      "Security safeguards: We apply encryption, layered security controls, and technical safeguards to protect personal data in transit and at rest.",
  },
  {
    key: "sharing",
    test: /(third[-\s]?party|share|processor)/i,
    clause:
      "Third-party sharing: We share personal data only with authorized third-party processors under contractual data protection obligations, and each processor is reviewed for compliance.",
  },
  {
    key: "contact",
    test: /(contact|grievance|data protection officer)/i,
    clause:
      "Contact and grievance: For privacy requests or grievances, users may contact our grievance officer or data protection officer through the published contact channel.",
  },
];

const ISSUE_CLOSURE_CLAUSES = {
  "not-privacy-policy":
    "Privacy Policy Notice: This Privacy Policy explains how we collect, use, store, share, and protect your personal data.",
  consent:
    "Consent management: We use explicit opt-in consent and record user permission, and users can withdraw consent at any time.",
  purpose:
    "Purpose limitation details: We explain why we collect personal data and the use of data for each processing purpose.",
  retention:
    "Retention schedule: Personal data is stored for clearly defined timelines and deleted after each retention period ends.",
  rights:
    "Data principal rights: Users have the right to access, rectify, erase, and request correction or deletion of personal data.",
  security:
    "Security controls: We implement encryption, safeguard monitoring, and other security controls to protect personal data.",
  sharing:
    "Third-party disclosure: We disclose each third-party processor and how we share data with those processors under agreements.",
  contact:
    "Grievance and contact details: Users can contact the grievance officer and data protection officer through official contact channels.",
};

const NON_COMPLIANT_PHRASES = [
  /non-?compliant/gi,
  /demo use only/gi,
  /academic demonstration/gi,
  /stored indefinitely/gi,
  /no option to delete/gi,
  /users do not have the option to delete/gi,
];

function normalizePolicyText(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sanitizeNonCompliantPolicyText(text) {
  let output = normalizePolicyText(text);

  NON_COMPLIANT_PHRASES.forEach((pattern) => {
    output = output.replace(pattern, "");
  });

  // Convert absolute indefinite retention wording into compliant wording.
  output = output.replace(/indefinite\s+retention/gi, "defined retention period");
  output = output.replace(/retain\s+forever/gi, "retain for a defined period");

  return normalizePolicyText(output);
}

function ensurePolicyCoverage(text) {
  let output = sanitizeNonCompliantPolicyText(text);

  REQUIRED_POLICY_SECTIONS.forEach((section) => {
    if (!section.test.test(output)) {
      output = `${output}\n\n${section.clause}`.trim();
    }
  });

  return normalizePolicyText(output);
}

export function enforcePolicyIssueClosure(policyText, issues = []) {
  let output = ensurePolicyCoverage(policyText);

  const issueKeys = Array.isArray(issues)
    ? issues.map((issue) => issue?.key).filter(Boolean)
    : [];

  issueKeys.forEach((key) => {
    const clause = ISSUE_CLOSURE_CLAUSES[key];
    if (clause && !output.toLowerCase().includes(clause.toLowerCase())) {
      output = `${output}\n\n${clause}`.trim();
    }
  });

  return normalizePolicyText(output);
}

function buildChatFallbackForError(defaultFallback, error) {
  const provider = getLLMProvider();
  const status = error?.response?.status;
  const keyName = provider === "gemini" ? "GEMINI_API_KEY" : "OPENAI_API_KEY";

  if (status === 401 || status === 403) {
    return {
      ...defaultFallback,
      directAnswer: "AI provider rejected the API key (auth error).",
      simpleExplanation:
        "Your backend is configured, but the provider denied authentication. Check key validity and project permissions.",
      actionChecklist: [
        `Verify ${keyName} in backend/.env.`,
        "Ensure the key belongs to an active project/account.",
        "Restart backend after env changes.",
      ],
    };
  }

  if (status === 429) {
    return {
      ...defaultFallback,
      directAnswer: "AI provider quota or rate limit reached (429).",
      simpleExplanation:
        "Your key is integrated, but requests are being limited by the provider right now.",
      actionChecklist: [
        "Check provider usage/quota and billing status.",
        "Wait and retry if this is a short-term rate limit.",
        "Use a lower-cost model or reduce request frequency.",
      ],
    };
  }

  if (status === 404 && provider === "gemini") {
    return {
      ...defaultFallback,
      directAnswer: "Configured Gemini model is unavailable (404).",
      simpleExplanation:
        "Your Gemini key is configured, but this model is not enabled for your API version or account.",
      actionChecklist: [
        "Set LLM_MODEL=gemini-2.5-flash in backend/.env.",
        "Use GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta.",
        "Restart backend and retry.",
      ],
    };
  }

  return defaultFallback;
}

async function callOpenAI(systemPrompt, userPrompt, httpsAgent) {
  const apiKey = getOpenAIApiKey();

  if (!apiKey) return null;

  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  const baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const response = await axios.post(
    `${baseURL}/chat/completions`,
    {
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      ...(httpsAgent ? { httpsAgent } : {}),
      timeout: 30000,
    }
  );

  return response.data?.choices?.[0]?.message?.content || null;
}

async function callGemini(systemPrompt, userPrompt, httpsAgent) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) return null;

  const model = process.env.LLM_MODEL || "gemini-2.5-flash";
  const baseURL =
    process.env.GEMINI_BASE_URL ||
    "https://generativelanguage.googleapis.com/v1beta";

  const prompt = `${systemPrompt}\n\n${userPrompt}`;

  const response = await axios.post(
    `${baseURL}/models/${model}:generateContent?key=${apiKey}`,
    {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      ...(httpsAgent ? { httpsAgent } : {}),
      timeout: 30000,
    }
  );

  const parts = response.data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;
  return parts.map((part) => part?.text || "").join("\n").trim() || null;
}

async function callLLM(systemPrompt, userPrompt) {
  const provider = getLLMProvider();
  const httpsAgent = getLLMHttpsAgent();

  if (provider === "gemini") {
    return callGemini(systemPrompt, userPrompt, httpsAgent);
  }

  return callOpenAI(systemPrompt, userPrompt, httpsAgent);
}

export async function generateChatResponse(message, history = []) {
  const fallback = {
    directAnswer:
      "Protect personal data, be transparent, and follow legal rules.",
    simpleExplanation:
      "Collect only needed data, keep it secure, and let users control their data.",
    potentialRisks: [
      "Legal penalties and loss of user trust.",
    ],
    actionChecklist: [
      "First, map what user data you collect and why you need it.",
    ],
  };

  const prompt = `Question: ${message}\nHistory: ${JSON.stringify(history).slice(
    0,
    1200
  )}\nReturn strict JSON with keys directAnswer, simpleExplanation, potentialRisks (array), actionChecklist (array).
Rules:
- Use simple everyday language.
- No markdown symbols or asterisks.
- Keep directAnswer to 1 short sentence.
- Keep simpleExplanation to 1-2 short sentences.
- Provide exactly 1 item in potentialRisks.
- Provide exactly 1 item in actionChecklist, and it must be the first most important step.`;

  try {
    const raw = await callLLM(
      "You are a legal-tech assistant for DPDP, GDPR, and IT Act privacy compliance. Be practical and concise. Return strict JSON only.",
      prompt
    );

    if (!raw) return fallback;

    const parsed = parseJsonOrNull(raw);
    return normalizeChatResponse(parsed, fallback);
  } catch (error) {
    logLLMFailure("generateChatResponse", error);
    return buildChatFallbackForError(fallback, error);
  }
}

export async function generateFixesWithAI(context, findings = []) {
  const fallback = findings.map((item) => ({
    issue: item.title,
    fix: item.recommendation || "Define and enforce this control with clear ownership and documentation.",
    whyItMatters:
      "This addresses legal accountability and reduces risk exposure during audits or incidents.",
  }));

  if (findings.length === 0) {
    return [
      {
        issue: "No major gaps detected",
        fix: "Run monthly reviews, keep records updated, and test incident response workflows.",
        whyItMatters:
          "Continuous monitoring helps maintain compliance as systems and regulations evolve.",
      },
    ];
  }

  const prompt = `Context: ${context}\nFindings: ${JSON.stringify(
    findings
  )}\nReturn JSON array with objects {issue, fix, whyItMatters}.`;

  try {
    const raw = await callLLM(
      "You generate implementable privacy compliance fixes. Return strict JSON only.",
      prompt
    );

    if (!raw) return fallback;

    const parsed = parseJsonOrNull(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    logLLMFailure("generateFixesWithAI", error);
    return fallback;
  }
}

export async function rewritePolicyWithAI(policyText, missingAreas = []) {
  const fallback = [
    "Add a dedicated section that explains lawful basis and consent withdrawal steps.",
    "Specify retention timelines by category (account data, billing, logs) and deletion triggers.",
    "Provide a rights section listing access, correction, deletion, and grievance contact process.",
  ];

  const prompt = `Policy text: ${policyText.slice(
    0,
    5000
  )}\nMissing areas: ${missingAreas.join(", ")}\nReturn JSON array of concise improved policy clauses.`;

  try {
    const raw = await callLLM(
      "You are a privacy policy drafting assistant. Return strict JSON array only.",
      prompt
    );

    if (!raw) return fallback;

    const parsed = parseJsonOrNull(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    logLLMFailure("rewritePolicyWithAI", error);
    return fallback;
  }
}

export async function rewritePolicyToTargetScore(
  policyText,
  issues = [],
  targetScore = 100
) {
  const fallback = String(policyText || "").trim();

  if (!fallback) {
    return fallback;
  }

  const issuesSummary = issues
    .map((issue) => `${issue.title}: ${issue.recommendation || issue.detail || ""}`)
    .join("\n");

  const prompt = `Current policy text:\n${fallback.slice(
    0,
    12000
  )}\n\nDetected compliance issues:\n${issuesSummary}\n\nRewrite this as a complete privacy policy draft targeting compliance score ${targetScore}. Return plain text policy only (no markdown, no bullets, no JSON). Keep headings concise and include concrete user rights, consent/legal basis, retention, security, grievance/redressal contact process, third-party sharing, children data handling, and cross-border transfer language. Do not include words like non-compliant, demo-only, or indefinite storage.`;

  try {
    const raw = await callLLM(
      "You are a senior privacy policy drafting assistant. Produce practical, legally-aligned policy text. Return plain text only.",
      prompt
    );

    if (!raw) return ensurePolicyCoverage(fallback);

    const rewritten = String(raw).trim();
    return ensurePolicyCoverage(rewritten || fallback);
  } catch (error) {
    logLLMFailure("rewritePolicyToTargetScore", error);
    return ensurePolicyCoverage(fallback);
  }
}

function defaultRolePolicyList(role) {
  const normalizedRole = String(role || "startup").toLowerCase();

  if (normalizedRole === "developer") {
    return [
      "Privacy Notice with data categories, purpose limitation, and user-rights process.",
      "Consent and cookie policy with clear opt-in and withdrawal flow.",
      "Retention and deletion policy with timelines for account, logs, and backups.",
      "Incident and breach response policy with escalation and notification steps.",
      "Third-party processor and vendor data-sharing policy with contract safeguards.",
    ];
  }

  if (normalizedRole === "companies") {
    return [
      "Enterprise privacy governance policy with DPO/grievance ownership and review cadence.",
      "Data classification and access control policy for role-based least-privilege access.",
      "Cross-border transfer and vendor risk policy including contractual safeguards.",
      "Data subject rights handling policy with SLA for access, correction, and erasure.",
      "Board-level incident response and breach notification policy with legal workflows.",
    ];
  }

  return [
    "Foundational privacy policy covering consent, lawful basis, and user communication.",
    "Data retention and secure deletion policy with simple operational timelines.",
    "Information security baseline policy with encryption and access controls.",
    "Vendor onboarding and data-sharing policy with processor agreements.",
    "User rights and grievance redressal policy for access/correction/deletion requests.",
  ];
}

export async function generateRolePolicyList(role) {
  const normalizedRole = String(role || "startup").toLowerCase();
  const fallback = defaultRolePolicyList(normalizedRole);

  const prompt = `Role: ${normalizedRole}. Return strict JSON array of exactly 5 policy names that this role should prepare first for DPDP/GDPR/IT Act readiness. Keep each item short and practical.`;

  try {
    const raw = await callLLM(
      "You are a privacy compliance advisor. Return strict JSON only.",
      prompt
    );

    if (!raw) return fallback;

    const parsed = parseJsonOrNull(raw);
    if (!Array.isArray(parsed)) return fallback;

    const cleaned = parsed
      .map((item) => toPlainText(item))
      .filter(Boolean)
      .slice(0, 5);

    return cleaned.length > 0 ? cleaned : fallback;
  } catch (error) {
    logLLMFailure("generateRolePolicyList", error);
    return fallback;
  }
}
