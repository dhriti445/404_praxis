import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { askChatbot, fetchChatHistory, fetchChatStatus } from "../services/api";
import LoadingPulse from "../components/LoadingPulse";

export default function ChatbotPage() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatStatus, setChatStatus] = useState({
    provider: "ai",
    apiKeyConfigured: true,
    loaded: false,
  });

  useEffect(() => {
    let active = true;

    async function loadChatData() {
      try {
        const [statusData, historyData] = await Promise.all([
          fetchChatStatus(),
          fetchChatHistory(),
        ]);

        if (!active) return;

        if (Array.isArray(historyData?.history) && historyData.history.length > 0) {
          setHistory(historyData.history);
        }

        setChatStatus({
          provider: statusData?.provider || "ai",
          apiKeyConfigured: Boolean(statusData?.apiKeyConfigured),
          loaded: true,
        });
      } catch {
        if (!active) return;
        setChatStatus({
          provider: "ai",
          apiKeyConfigured: true,
          loaded: true,
        });
      }
    }

    loadChatData();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    const userText = message.trim();
    setMessage("");
    setLoading(true);

    try {
      const nextHistory = [...history, { role: "user", text: userText }];
      const data = await askChatbot({ message: userText, history: nextHistory });
      setHistory([...nextHistory, { role: "assistant", text: data.reply }]);
    } catch (error) {
      setHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text: {
            directAnswer: "Could not process your request right now.",
            simpleExplanation: error.message,
            potentialRisks: [],
            actionChecklist: [],
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">AI Legal Assistant</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Chat About DPDP, GDPR, and IT Act Privacy</h1>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
        {chatStatus.loaded && !chatStatus.apiKeyConfigured && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {`${String(chatStatus.provider || "AI").toUpperCase()} API key is not configured on the backend. Responses will use fallback demo output.`}
          </div>
        )}

        <div className="max-h-[50vh] space-y-4 overflow-auto pr-2">
          {history.length === 0 && (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              Ask anything like: "Can I retain user data forever?" or "What rights must I provide under DPDP?"
            </p>
          )}
          {history.map((entry, index) => (
            <div
              key={index}
              className={`rounded-2xl p-4 ${
                entry.role === "user"
                  ? "ml-auto max-w-2xl bg-slate-900 text-slate-100"
                  : "mr-auto max-w-3xl bg-slate-100 text-slate-900"
              }`}
            >
              {entry.role === "user" ? (
                <p>{entry.text}</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Direct:</span> {entry.text.directAnswer}</p>
                  <p><span className="font-semibold">Simple:</span> {entry.text.simpleExplanation}</p>
                  <div>
                    <p className="font-semibold">Potential Risks</p>
                    <ul className="list-disc space-y-1 pl-5">
                      {entry.text.potentialRisks.map((risk, i) => (
                        <li key={i}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">Action Checklist</p>
                    <ul className="list-disc space-y-1 pl-5">
                      {entry.text.actionChecklist.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && <LoadingPulse text="Generating legal guidance..." />}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask your compliance question..."
            className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100"
          >
            <Send size={16} /> Send
          </button>
        </form>
      </div>
    </section>
  );
}
