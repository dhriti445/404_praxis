import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  timeout: 120000,
});

export async function askChatbot(payload) {
  const { data } = await api.post("/chat", payload);
  return data;
}

export async function fetchChatStatus() {
  const { data } = await api.get("/chat/status");
  return data;
}

export async function fetchChatHistory() {
  const { data } = await api.get("/chat/history");
  return data;
}

export async function runComplianceCheck(payload) {
  const { data } = await api.post("/compliance/check", payload);
  return data;
}

export async function analyzeCompliancePolicyV2(payload) {
  const { data } = await api.post("/compliance/analyze-policy", payload);
  return data;
}

export async function fetchComplianceGuidelines() {
  const { data } = await api.get("/compliance/guidelines");
  return data;
}

export async function checkWebsite(url) {
  const { data } = await api.post("/compliance/check-website", { url });
  return data;
}

export async function getComplianceHistory() {
  const { data } = await api.get("/compliance/history");
  return data;
}

export async function analyzePolicy(payload) {
  const { data } = await api.post("/policy/analyze", payload);
  return data;
}

export async function fetchReports() {
  const { data } = await api.get("/reports");
  return data;
}

export async function fetchIndustryPlaybooks() {
  const { data } = await api.get("/playbooks");
  return data;
}
