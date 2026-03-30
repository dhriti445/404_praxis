/**
 * RAG Legal Assistant
 * Uses LangChain with embeddings to answer legal questions based on law documents
 */

import { HuggingFaceEmbeddings } from "@langchain/community/embeddings/hf/index.js";
import { MemoryVectorStore } from "langchain/vectorstores/memory.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter.js";

// Legal document chunks (simplified DPDP and GDPR references)
const LEGAL_DOCUMENTS = {
  dpdp: `
    DPDP Act 2023 - Key Provisions:
    
    Section 1: Short title and commencement - This Act may be called the Digital Personal Data Protection Act, 2023.
    
    Section 3: Scope - This Act applies to processing of personal data by entities in India or outside India using means of processing located in India.
    
    Section 4: Definitions - 'Personal data' means any information related to an individual.
    
    Section 5: Right to Consent - No personal data shall be processed without the consent of the data principal.
    
    Section 6: Processing of Personal Data - Processing shall be for specified purpose, lawful and transparent.
    
    Section 7: Sensitive personal data - Includes passwords, financial data, health data, children's data.
    
    Section 8: Rights of data principal - Rights to access, correct, erase data.
    
    Section 10: Right to erasure - Data principal can request deletion of personal data.
    
    Section 11: Right to withdraw consent - Can withdraw consent at any time.
    
    Section 18: Grievance redressal mechanism - Entities must establish within 30 days.
    
    Penalties: Up to 500 crore for violations.
  `,
  
  gdpr: `
    GDPR - Key Provisions:
    
    Article 1: Subject matter and objectives - Protection of fundamental rights of individuals regarding personal data processing.
    
    Article 4: Definitions - Personal data means information relating to identified or identifiable person.
    
    Article 5: Principles - Lawfulness, fairness, transparency, purpose limitation, data minimization, accuracy, integrity, confidentiality.
    
    Article 6: Lawful basis - Requires one valid basis: consent, contract, legal obligation, vital interests, public task, legitimate interests.
    
    Article 7: Conditions for consent - Must be freely given, specific, informed, and unambiguous.
    
    Article  13: Information to be provided where personal data are collected from the data subject.
    
    Article 15: Right of access - Data subject right to access data held about them.
    
    Article 16: Right to rectification - Right to obtain correction of inaccurate data.
    
    Article 17: Right to erasure (Right to be forgotten) - Can request deletion of personal data.
    
    Article 20: Right to data portability - Can receive data in structured machine-readable format.
    
    Article 21: Right to object - Can object to processing for direct marketing.
    
    Article 33: Notification of data breach - Notify within 72 hours of awareness.
    
    Penalties: Up to €20 million or 4% of annual global revenue.
  `,
  
  bestPractices: `
    Privacy Policy Best Practices:
    
    1. Clear Language - Use plain English, avoid legal jargon. Write for 10-year-old reading level where possible.
    
    2. Specific Consent - Never use bundled consent. Have separate opt-ins for: Marketing, Analytics, Third-party sharing.
    
    3. Easy Opt-out - Provide one-click unsubscribe and preference management that's as easy as opting in.
    
    4. Data Retention - Always specify retention periods: "We delete customer data 30 days after account closure."
    
    5. Third-party Transparency - List all partners: "We share data with Stripe (payments), AWS (hosting), Segment (analytics)."
    
    6. Security Measures - Describe measures: "We use 256-bit encryption, 2FA, annual security audits."
    
    7. User Rights - Always include: Access, Correction, Deletion, Portability (where applicable).
    
    8. Breach Notification - Commit to timeline: "We notify users within 72 hours of data breach."
    
    9. Children Protection - If applicable: "For users under 18, we require parental consent via verified email."
    
    10. Grievance Mechanism - Provide contact: "Email privacy@company.com for concerns. We respond within 7 days."
  `,
};

let vectorStore = null;

export async function initializeLegalAI() {
  try {
    // Initialize embeddings (using HuggingFace for free embedding)
    const embeddings = new HuggingFaceEmbeddings({
      model: "Xenova/all-MiniLM-L6-v2",
    });
    
    // Combine all documents
    const documents = Object.values(LEGAL_DOCUMENTS).join("\n\n");
    
    // Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
    
    const chunks = await splitter.splitText(documents);
    
    // Create vector store
    vectorStore = await MemoryVectorStore.fromTexts(chunks, {}, embeddings);
    
    console.log("[rag] Legal AI initialized with", chunks.length, "document chunks");
  } catch (error) {
    console.warn("[rag] Failed to initialize LangChain:", error.message);
    // Continue without RAG if LangChain fails
  }
}

export async function answerLegalQuestion(question) {
  try {
    if (!vectorStore) {
      return fallbackAnswer(question);
    }
    
    // Search for relevant documents
    const results = await vectorStore.similaritySearch(question, 2);
    
    const context = results.map((doc) => doc.pageContent).join("\n\n");
    
    return {
      answer: generateAnswer(question, context),
      sources: results.length,
      relevantLaws: extractLaws(question),
    };
  } catch (error) {
    console.warn("[rag] RAG query failed:", error.message);
    return fallbackAnswer(question);
  }
}

function generateAnswer(question, context) {
  // Simple template-based answer generation
  if (question.toLowerCase().includes("consent")) {
    return `Based on GDPR and DPDP Act: ${context.slice(0, 500)}... 
    
Key Point: Consent must be freely given, specific, informed, and unambiguous. Pre-checked boxes are not valid consent.`;
  }
  
  if (question.toLowerCase().includes("delete") || question.toLowerCase().includes("erasure")) {
    return `Data subjects have the right to request deletion under both GDPR (Article 17) and DPDP Act (Section 10). 
    
Your policy should state: "Users can request data deletion from their Account Settings. We delete all personal data within 30 days."`;
  }
  
  if (question.toLowerCase().includes("breach")) {
    return `Both GDPR (Article 33) and DPDP require breach notification:
    - GDPR: 72 hours to notify authorities
    - DPDP: No specific timeline, but "without undue delay"
    
Your policy should state: "We notify affected users within 72 hours of discovering a breach."`;
  }
  
  if (question.toLowerCase().includes("cookie")) {
    return `Cookies require consent under both GDPR and DPDP. Your policy must:
    1. Clearly list all cookies and third-party trackers
    2. Obtain separate consent (not bundled)
    3. Allow easy opt-out via preference center
    
Current best practice: "Click 'Manage Preferences' to control cookies and tracking."`;
  }
  
  return context.slice(0, 300) + "...";
}

function extractLaws(question) {
  const laws = [];
  
  if (
    question.toLowerCase().includes("india") ||
    question.toLowerCase().includes("dpdp")
  ) {
    laws.push("DPDP Act 2023");
  }
  
  if (question.toLowerCase().includes("eu") || question.toLowerCase().includes("gdpr")) {
    laws.push("GDPR");
  }
  
  if (laws.length === 0) {
    laws.push("DPDP Act 2023", "GDPR");
  }
  
  return laws;
}

function fallbackAnswer(question) {
  return {
    answer: "Please clarify your question. Common topics: consent, data deletion, breaches, cookies, children's data, third-party sharing.",
    sources: 0,
    relevantLaws: extractLaws(question),
    tips: [
      "Ask about specific compliance topics (e.g., 'How do I handle consent for GDPR?')",
      "Reference industry: 'I'm a healthcare app, what should I disclose?'",
      "Ask about specific clauses: 'What does DPDP say about parental consent?'",
    ],
  };
}

export { initializeLegalAI, answerLegalQuestion };
