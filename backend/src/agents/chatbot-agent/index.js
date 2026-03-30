/**
 * Chatbot Agent
 * 
 * Provides conversational legal guidance for DPDP, GDPR, and IT Act compliance.
 * Single responsibility: Handle Q&A interactions with AI provider.
 */

import router from "./routes.js";

export default {
  router,
  agentName: "chatbot",
  agentVersion: "1.0.0",
  agentDescription: "Conversational legal compliance assistant",
};
