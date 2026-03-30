import { useEffect, useState } from "react";
import { Send, ShieldAlert, Scale, Bot } from "lucide-react";
import { askChatbot, fetchChatHistory, fetchChatStatus } from "../services/api";
import LoadingPulse from "../components/LoadingPulse";

const quickPrompts = [
  "Can I retain user data forever for analytics?",
  "What must I show in a DPDP consent notice?",
  "What is the legal response timeline after a data breach?",
  "How should we handle user deletion requests?",
];

const LEBO_DESCRIPTION = "Hi! I'm Lebo, your legal bot and I'm here to turn your legal 'Yikes!' into 'Yesss.' I translate boring laws into human English so you don't have to meditate on the DPDP Act for 40 days and 40 nights :)\n\nWhat's bothering you today?";

function normalizeAssistantText(rawText) {
  if (typeof rawText === "string") {
    return {
      directAnswer: rawText,
      simpleExplanation: "",
      potentialRisks: [],
      actionChecklist: [],
    };
  }

  return {
    directAnswer: rawText?.directAnswer || "",
    simpleExplanation: rawText?.simpleExplanation || "",
    potentialRisks: Array.isArray(rawText?.potentialRisks) ? rawText.potentialRisks : [],
    actionChecklist: Array.isArray(rawText?.actionChecklist) ? rawText.actionChecklist : [],
  };
}

export default function ChatbotPage() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introLeaving, setIntroLeaving] = useState(false);
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

  const applyPrompt = (prompt) => {
    setMessage(prompt);
  };

  const handleEnterChat = () => {
    if (introLeaving) return;

    setIntroLeaving(true);
    window.setTimeout(() => {
      setShowIntro(false);
    }, 420);
  };

  if (showIntro) {
    return (
      <section className="cool-enter relative flex h-screen flex-col items-center justify-start pt-6 overflow-hidden px-2 sm:px-0">
        <div className={`ambient-panel w-full max-w-4xl rounded-3xl border border-white/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 flex flex-col items-center ${introLeaving ? "translate-y-3 scale-[0.98] opacity-0" : "translate-y-0 scale-100 opacity-100"}`}>
          <div className="flex w-full justify-center">
            <div className="lebo-orb" />
          </div>

          <p className="text-center text-sm font-semibold uppercase tracking-[0.1em] text-slate-300 mt-5">Hi, I am LeBo</p>
          <p className="mx-auto text-center text-base leading-relaxed text-slate-200 mt-4 max-w-2xl italic" style={{letterSpacing: '0.05em', wordSpacing: '0.15em'}}>
            {LEBO_DESCRIPTION.split('\n\n').map((paragraph, i) => (
              <span key={i}>
                {paragraph}
                {i === 0 && <br className="my-2" />}
              </span>
            ))}
          </p>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleEnterChat}
              className="cool-button rounded-2xl bg-white px-8 py-3 text-sm font-semibold text-slate-900"
            >
              Chat with me
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/20 bg-gradient-to-r from-slate-900/85 via-slate-800/70 to-slate-900/85 p-8 shadow-2xl backdrop-blur-xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100">
          LeBo
        </p>
        <h1 className="mt-4 max-w-4xl text-3xl font-bold text-white md:text-5xl">LEBO Chat, Ask me anything :)</h1>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-200 md:text-base">
          {LEBO_DESCRIPTION}
        </p>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quick Prompts</p>
            <div className="mt-3 space-y-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => applyPrompt(prompt)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {chatStatus.loaded && !chatStatus.apiKeyConfigured && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {`${String(chatStatus.provider || "AI").toUpperCase()} API key is not configured on the backend. Responses will use fallback demo output.`}
            </div>
          )}

          <div className="max-h-[56vh] space-y-4 overflow-auto pr-2">
            {history.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                <p className="font-medium text-slate-800">Start with a practical question.</p>
                <p className="mt-1">Example: "What user rights must I provide under DPDP for account deletion and data access?"</p>
              </div>
            )}

            {history.map((entry, index) => {
              if (entry.role === "user") {
                return (
                  <div key={index} className="ml-auto max-w-2xl rounded-2xl bg-slate-900 p-4 text-slate-100 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-300">You</p>
                    <p className="mt-1">{entry.text}</p>
                  </div>
                );
              }

              const assistantText = normalizeAssistantText(entry.text);

              return (
                <div key={index} className="mr-auto max-w-4xl rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex rounded-full bg-slate-900 p-1.5 text-slate-100">
                      <Bot size={14} />
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assistant</p>
                  </div>

                  <p className="text-sm leading-relaxed">
                    {[assistantText.directAnswer, assistantText.simpleExplanation]
                      .filter(Boolean)
                      .join(" ")}
                  </p>

                  {(assistantText.potentialRisks.length > 0 || assistantText.actionChecklist.length > 0) && (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          <ShieldAlert size={14} /> Potential Risks
                        </div>
                        {assistantText.potentialRisks.length > 0 ? (
                          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                            {assistantText.potentialRisks.map((risk, i) => (
                              <li key={i}>{risk}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-500">No immediate legal risk highlighted.</p>
                        )}
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          <Scale size={14} /> Action Checklist
                        </div>
                        {assistantText.actionChecklist.length > 0 ? (
                          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                            {assistantText.actionChecklist.map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-500">No immediate actions required.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && <LoadingPulse text="Generating legal guidance..." />}
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask your question..."
                className="h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-900"
              />
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-slate-100"
              >
                <Send size={16} /> Send
              </button>
            </div>
          </form>
      </div>
    </section>
  );
}
