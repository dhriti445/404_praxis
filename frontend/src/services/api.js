import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  timeout: 30000,
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

export async function analyzePolicy(payload) {
  const { data } = await api.post("/policy/analyze", payload);
  return data;
}

export async function fetchReports() {
  const { data } = await api.get("/reports");
  return data;
}
