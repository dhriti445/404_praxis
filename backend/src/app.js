import express from "express";
import cors from "cors";

import chatbotAgent from "./agents/chatbot-agent/index.js";
import complianceAgent from "./agents/compliance-agent/index.js";
import policyAgent from "./agents/policy-agent/index.js";
import reportRoutes from "./routes/reportRoutes.js";
import playbookRoutes from "./routes/playbookRoutes.js";

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow all localhost variants for development
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "dpdp-compliance-api" });
});

app.use("/api/chat", chatbotAgent.router);
app.use("/api/compliance", complianceAgent.router);
app.use("/api/policy", policyAgent.router);
app.use("/api/reports", reportRoutes);
app.use("/api/playbooks", playbookRoutes);

app.use((error, req, res, next) => {
  res.status(500).json({ error: error.message || "Unexpected server error" });
});

export default app;
