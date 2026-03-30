import { useState } from "react";
import { Copy, ChevronDown } from "lucide-react";
import ScoreRing from "./ScoreRing";

function riskBadge(riskLevel = "medium") {
  if (riskLevel === "critical") return "bg-rose-700 text-white";
  if (riskLevel === "high") return "bg-rose-100 text-rose-700";
  if (riskLevel === "low") return "bg-emerald-100 text-emerald-700";
  return "bg-amber-100 text-amber-700";
}

function ItemList({ title, items = [], emptyText = "Nothing to show." }) {
  const [openIndex, setOpenIndex] = useState(items.length ? 0 : null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="mb-3 text-lg font-semibold text-slate-900">{title}</h4>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={`${item.key || item.title}-${index}`} className="rounded-xl border border-slate-200 p-3">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between text-left"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.title || item.issue}</p>
                  {item.severity && (
                    <p className="text-xs uppercase tracking-wide text-slate-500">{item.severity} severity</p>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`transition ${openIndex === index ? "rotate-180" : ""}`}
                />
              </button>
              {openIndex === index && (
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  {item.detail && <p>{item.detail}</p>}
                  {item.recommendation && <p className="font-medium">Fix: {item.recommendation}</p>}
                  {item.fix && <p className="font-medium">Fix: {item.fix}</p>}
                  {item.whyItMatters && <p>Why: {item.whyItMatters}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResultReport({ title, report, strengthsKey = "goodPractices" }) {
  if (!report) return null;

  const violations = report.violations || report.issues || [];
  const risks = report.risks || [];
  const strengths = report[strengthsKey] || report.strengths || [];
  const fixes = report.aiFixes || [];
  const policyRecommendations = report.policyRecommendations || [];
  const systemChecks = report.systemChecks || [];
  const rewrittenClauses = report.rewrittenClauses || [];
  const rewrittenPolicyText = report.rewrittenPolicyText || "";
  const generatedAtLabel = report.generatedAt
    ? new Date(report.generatedAt).toLocaleString()
    : "Just now";

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // No-op in unsupported clipboard contexts.
    }
  };

  return (
    <section className="mt-8 space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Compliance Intelligence Report</h3>
            <p className="mt-2 text-sm text-slate-600">Generated at {generatedAtLabel}</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${riskBadge(report.riskLevel)}`}>
              {report.riskLevel} risk
            </span>
          </div>
          <ScoreRing score={report.score} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Violations</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{violations.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Risk Signals</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{risks.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Good Practices</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{strengths.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Auto-Fixes</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{fixes.length}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ItemList title="Violations / Gaps" items={violations} emptyText="No critical violations found." />
        <ItemList title="Risk Signals" items={risks} emptyText="No medium-risk signals found." />
        <ItemList title="Good Practices" items={strengths} emptyText="No strong controls detected yet." />
        <ItemList title="AI Auto-Fixes" items={fixes} emptyText="No fixes required." />
      </div>

      {policyRecommendations.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="mb-3 text-lg font-semibold text-slate-900">Role-based Policy List</h4>
          <div className="space-y-2">
            {policyRecommendations.map((item, index) => (
              <p key={`${item}-${index}`} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                {item}
              </p>
            ))}
          </div>
        </div>
      )}

      {systemChecks.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="mb-3 text-lg font-semibold text-slate-900">System Checks</h4>
          <div className="grid gap-2 md:grid-cols-2">
            {systemChecks.map((check) => (
              <div key={check.key} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-900">{check.title}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  Status: {check.passed ? "Pass" : "Gap"} | Impact if missing: {String(check.impactIfMissing || "medium")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {rewrittenClauses.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-900">Rewritten Policy Suggestions</h4>
            <button
              type="button"
              onClick={() => handleCopy(rewrittenClauses.join("\n\n"))}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Copy size={14} /> Copy All
            </button>
          </div>
          <div className="space-y-2">
            {rewrittenClauses.map((clause, index) => (
              <p key={index} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                {clause}
              </p>
            ))}
          </div>
        </div>
      )}

      {rewrittenPolicyText && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-900">Rewritten Policy</h4>
            <button
              type="button"
              onClick={() => handleCopy(rewrittenPolicyText)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Copy size={14} /> Copy Rewritten Policy
            </button>
          </div>

          <p className="mb-3 text-sm text-slate-600">
            Rewritten Score: <span className="font-semibold text-slate-900">{report.rewrittenScore ?? "-"}</span>
            {report.targetScore ? ` / Target ${report.targetScore}` : ""}
            {report.targetAchieved ? " (Target achieved)" : ""}
          </p>

          <pre className="max-h-96 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100 whitespace-pre-wrap">
            {rewrittenPolicyText}
          </pre>
        </div>
      )}
    </section>
  );
}
