import express from "express";
import cors from "cors";

import chatRoutes from "./routes/chatRoutes.js";
import complianceRoutes from "./routes/complianceRoutes.js";
import policyRoutes from "./routes/policyRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "dpdp-compliance-api" });
});

app.use("/api/chat", chatRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/policy", policyRoutes);
app.use("/api/reports", reportRoutes);

app.use((error, req, res, next) => {
  res.status(500).json({ error: error.message || "Unexpected server error" });
});

export default app;
