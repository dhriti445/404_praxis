import {
  generateChatResponse,
  getActiveAiProvider,
  isAiProviderKeyConfigured,
} from "../services/aiService.js";
import { listRecentReports, saveReport } from "../services/reportStore.js";

export function chatStatusHandler(req, res) {
  return res.json({
    provider: getActiveAiProvider(),
    apiKeyConfigured: isAiProviderKeyConfigured(),
  });
}

export async function chatHistoryHandler(req, res) {
  try {
    const { reports } = await listRecentReports(1, "chat");
    const latest = reports[0];

    if (!latest) {
      return res.json({ history: [] });
    }

    const savedConversation = Array.isArray(latest?.result?.conversation)
      ? latest.result.conversation
      : null;

    const priorHistory = Array.isArray(latest?.input?.history)
      ? latest.input.history
      : [];
    const history =
      savedConversation ||
      [...priorHistory, { role: "assistant", text: latest?.result?.reply || latest.result }];

    return res.json({
      history,
      savedAt: latest.createdAt,
    });
  } catch {
    return res.json({ history: [] });
  }
}

export async function chatHandler(req, res) {
  try {
    const { message, history = [] } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const reply = await generateChatResponse(message, history);
    const conversation = [...history, { role: "assistant", text: reply }];

    try {
      await saveReport("chat", { message, history }, { reply, conversation });
    } catch {
      // Storage can fail in restricted environments; reply should still succeed.
    }

    return res.json({ reply });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Chat failed" });
  }
}
