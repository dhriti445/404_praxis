import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShieldCheck, ClipboardCheck, FileSearch, History, FileText, X, Menu, BarChart3, Globe, Wand2, BookOpenText, Bot } from "lucide-react";
import { fetchReports } from "../services/api";

const navItems = [
  { to: "/chat", label: "Chatbot", icon: <BookOpenText size={16} /> },
  { to: "/compliance", label: "Compliance Checker", icon: <ClipboardCheck size={16} /> },
  { to: "/compliance-analyzer", label: "Advanced Analyzer", icon: <BarChart3 size={16} /> },
  { to: "/website-checker", label: "Website Checker", icon: <Globe size={16} /> },
  { to: "/policy-generator", label: "Policy Generator", icon: <Wand2 size={16} /> },
  { to: "/policy", label: "Policy Analyzer", icon: <FileSearch size={16} /> },
  { to: "/playbooks", label: "Playbooks", icon: <BookOpenText size={16} /> },
];

export default function AppShell({ children }) {
  const location = useLocation();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activePanelTab, setActivePanelTab] = useState("history");
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadRecentReports() {
      try {
        const data = await fetchReports();
        if (!active) return;

        const reports = Array.isArray(data?.reports) ? data.reports.slice(0, 6) : [];
        setRecentReports(reports);
      } catch {
        if (!active) return;
        setRecentReports([]);
      }
    }

    loadRecentReports();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-sky-400/30 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <div
        className={`fixed inset-0 z-20 bg-slate-900/30 transition ${isPanelOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setIsPanelOpen(false)}
      />

      {location.pathname !== "/chat" && (
        <Link
          to="/chat"
          className="chatbot-fab fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-2xl"
          aria-label="Open Chatbot"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Bot size={16} />
          </span>
          Chatbot
        </Link>
      )}

      <aside
        className={`fixed left-0 top-0 z-30 h-full w-[320px] border-r border-slate-200 bg-white p-5 shadow-xl transition-transform ${
          isPanelOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">History & Reports</h3>
          <button
            type="button"
            onClick={() => setIsPanelOpen(false)}
            className="rounded-full bg-slate-100 p-2 text-slate-700"
          >
            <X size={14} />
          </button>
        </div>

        <div className="mt-4 inline-flex w-full rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActivePanelTab("history")}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              activePanelTab === "history" ? "bg-white text-slate-900" : "text-slate-600"
            }`}
          >
            History
          </button>
          <button
            type="button"
            onClick={() => setActivePanelTab("reports")}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              activePanelTab === "reports" ? "bg-white text-slate-900" : "text-slate-600"
            }`}
          >
            Reports Uploaded
          </button>
        </div>

        {activePanelTab === "history" ? (
          <div className="mt-5 space-y-3">
            <NavLink
              to="/compliance-history"
              onClick={() => setIsPanelOpen(false)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
            >
              <History size={15} /> Open History
            </NavLink>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent Activity</p>
              <div className="mt-2 space-y-2">
                {recentReports.slice(0, 4).map((report) => (
                  <p key={report._id} className="text-xs text-slate-600">
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "Recent"} - {String(report.reportType || "report")}
                  </p>
                ))}
                {recentReports.length === 0 && (
                  <p className="text-xs text-slate-500">No recent activity yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <NavLink
              to="/reports"
              onClick={() => setIsPanelOpen(false)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
            >
              <FileText size={15} /> Open Reports
            </NavLink>

            <div className="space-y-2">
              {recentReports.length === 0 && (
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                  No uploaded reports yet.
                </p>
              )}
              {recentReports.map((report) => (
                <div key={report._id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {String(report.reportType || "report")}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {report.createdAt ? new Date(report.createdAt).toLocaleString() : "Saved recently"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <header className="sticky top-0 z-10 border-b border-slate-700/60 bg-slate-900/45 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-7xl px-4 py-2 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPanelOpen((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 p-2 text-slate-100 shadow-soft"
                aria-label="Open history and reports panel"
              >
                <Menu size={18} />
              </button>

              <Link to="/" className="inline-flex items-center gap-2 text-slate-100">
                <span className="rounded-xl bg-slate-900 p-2 text-slate-100">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">LeBo</p>
                  <p className="text-sm font-bold text-slate-100">Legal Platform</p>
                </div>
              </Link>
            </div>
          </div>

          <nav className="mt-2 flex flex-wrap gap-1.5 pb-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 text-slate-100 shadow-soft"
                      : "border border-slate-700 bg-slate-800/70 text-slate-300 hover:bg-slate-700"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main key={location.pathname} className="page-enter relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
