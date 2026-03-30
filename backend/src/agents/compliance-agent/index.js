/**
 * Compliance Agent
 * 
 * Evaluates compliance posture across Developer, Startup, and Company modes.
 * Single responsibility: Assess compliance gap and generate role-specific recommendations.
 */

import router from "./routes.js";

export default {
  router,
  agentName: "compliance",
  agentVersion: "1.0.0",
  agentDescription: "Role-based compliance checker with AI-powered fix suggestions",
};
