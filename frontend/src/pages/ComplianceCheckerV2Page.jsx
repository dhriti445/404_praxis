import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Shield,
  Zap,
  AlertCircle,
  Copy,
  Download,
  RefreshCw,
} from "lucide-react";
import { analyzeCompliancePolicyV2 } from "../services/api.js";

export default function ComplianceCheckerV2Page() {
  const [policyText, setPolicyText] = useState("");
  const [consentFlow, setConsentFlow] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("policy");

  async function handleAnalyze() {
    if (!policyText.trim()) {
      setError("Please enter a privacy policy to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const data = await analyzeCompliancePolicyV2({
        policyText,
        consentFlow,
        role: "startup",
      });
      setResults(data);
    } catch (err) {
      setError(err?.response?.data?.error || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-white/70 p-8 shadow-xl shadow-slate-900/5 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Smart Compliance Analyzer
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          Privacy Policy & Consent Flow Analyzer
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Upload your privacy policy and we'll check compliance with DPDP Act 2023, GDPR, and identify
          dark patterns, risks, and missing clauses.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Policy Text Input */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700">
            Privacy Policy Text *
          </label>
          <textarea
            value={policyText}
            onChange={(e) => setPolicyText(e.target.value)}
            placeholder="Paste your privacy policy here..."
            className="mt-2 min-h-64 w-full rounded-xl border border-slate-200 p-3 font-mono text-sm text-slate-700 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
          />
          <p className="mt-2 text-xs text-slate-500">{policyText.length} characters</p>
        </div>

        {/* Consent Flow Input */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700">
            Consent Flow Description (Optional)
          </label>
          <textarea
            value={consentFlow}
            onChange={(e) => setConsentFlow(e.target.value)}
            placeholder="Describe your consent flow: e.g., 'We have separate toggles for marketing and analytics. Consent is explicit opt-in with one-click opt-out.'"
            className="mt-2 min-h-64 w-full rounded-xl border border-slate-200 p-3 font-mono text-sm text-slate-700 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
          />
          <p className="mt-2 text-xs text-slate-500">{consentFlow.length} characters</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          ❌ {error}
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || !policyText.trim()}
        className="w-full rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {isAnalyzing ? "🔄 Analyzing..." : "📊 Analyze Compliance"}
      </button>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            {/* Overall Score */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
              <p className="text-xs uppercase tracking-wider text-slate-300">Overall Score</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-bold">{results.summary.overallScore}</span>
                <span className="mb-1 text-lg text-slate-300">/100</span>
              </div>
              <p className="mt-3 text-xs capitalize text-slate-300">
                Risk: {results.summary.riskLevel}
              </p>
            </div>

            {/* Policy Analysis */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-slate-500">DPDP Score</p>
              <div className="mt-2 text-3xl font-bold text-slate-900">{results.compliance.dpdp.score}%</div>
              <p className="mt-2 text-xs text-slate-600">
                {results.compliance.dpdp.sections}/{results.compliance.dpdp.totalRequired} sections
              </p>
            </div>

            {/* GDPR Score */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-slate-500">GDPR Score</p>
              <div className="mt-2 text-3xl font-bold text-slate-900">{results.compliance.gdpr.score}%</div>
              <p className="mt-2 text-xs text-slate-600">
                {results.compliance.gdpr.sections}/{results.compliance.gdpr.totalRequired} sections
              </p>
            </div>

            {/* Risk Level */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-slate-500">Dark Patterns</p>
              <div className="mt-2 text-3xl font-bold text-red-600">
                {results.darkPatterns.darkPatternsFound}
              </div>
              <p className="mt-2 text-xs text-slate-600">
                {results.darkPatterns.riskLevel} risk
              </p>
            </div>
          </div>

          {/* Tabs for detailed results */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex gap-2 border-b border-slate-200">
              {[
                { id: "overview", label: "Overview", icon: "📋" },
                { id: "darkpatterns", label: "Dark Patterns", icon: "⚠️" },
                { id: "risks", label: "Risk Alerts", icon: "🚨" },
                { id: "rights", label: "Data Rights", icon: "👤" },
                { id: "fixes", label: "Auto Fixes", icon: "🔧" },
                { id: "consent", label: "Consent Flow", icon: "✅" },
                { id: "legitimacy", label: "Legitimacy", icon: "🛡️" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "border-b-2 border-slate-900 text-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{results.summary.recommendation}</p>
                    <div className="mt-4 space-y-3">
                      {results.nextSteps.map((step, i) => (
                        <div key={i} className="flex gap-3 rounded-lg bg-white p-3">
                          <div className="text-xl">{step.priority === "urgent" ? "🔴" : "🟡"}</div>
                          <div>
                            <p className="font-medium text-slate-900">{step.action}</p>
                            <p className="text-sm text-slate-600">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Dark Patterns Tab */}
              {activeTab === "darkpatterns" && (
                <div className="space-y-3">
                  {results.darkPatterns.patterns.length > 0 ? (
                    results.darkPatterns.patterns.map((pattern, i) => (
                      <div key={i} className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                        <p className="font-semibold text-red-900">{pattern.message}</p>
                        <p className="mt-2 text-sm text-red-800">{pattern.fix}</p>
                        <p className="mt-2 text-xs text-red-700">Found {pattern.occurrences} time(s)</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-600">✅ No dark patterns detected</p>
                  )}
                </div>
              )}

              {/* Risk Alerts Tab */}
              {activeTab === "risks" && (
                <div className="space-y-3">
                  {results.riskAlerts.alerts.length > 0 ? (
                    results.riskAlerts.alerts.map((alert, i) => (
                      <div
                        key={i}
                        className={`rounded-lg border-l-4 p-4 ${
                          alert.severity === "critical"
                            ? "border-red-500 bg-red-50"
                            : "border-yellow-500 bg-yellow-50"
                        }`}
                      >
                        <p className={`font-semibold ${alert.severity === "critical" ? "text-red-900" : "text-yellow-900"}`}>
                          {alert.title}
                        </p>
                        <p className={`mt-1 text-sm ${alert.severity === "critical" ? "text-red-800" : "text-yellow-800"}`}>
                          {alert.description}
                        </p>
                        <p className={`mt-2 text-xs ${alert.severity === "critical" ? "text-red-700" : "text-yellow-700"}`}>
                          💡 {alert.suggestion}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-600">✅ No critical alerts</p>
                  )}
                </div>
              )}

              {/* Data Rights Tab */}
              {activeTab === "rights" && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Coverage: {results.dataRights.criticalRightsCoverage} critical rights mentioned
                  </p>
                  {results.dataRights.rights.map((right, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                      <div className="mt-1">{right.mentioned ? "✅" : "❌"}</div>
                      <div>
                        <p className="font-medium text-slate-900">{right.name}</p>
                        <p className="text-xs text-slate-600">{right.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Auto Fixes Tab */}
              {activeTab === "fixes" && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {results.autoFixes.fixes.length} issues found • Estimated improvement: +{results.autoFixes.estimatedComplianceImprovement}%
                  </p>
                  {results.autoFixes.fixes.map((fix, i) => (
                    <div key={i} className="rounded-lg bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900">{fix.issue}</p>
                          <p className="mt-2 whitespace-pre-wrap font-mono text-xs text-slate-700">
                            {fix.suggestion}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(fix.suggestion)}
                          className="text-slate-400 hover:text-slate-900"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Consent Flow Tab */}
              {activeTab === "consent" && results.consentAnalysis && (
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900">{results.consentAnalysis.score}%</p>
                    <p className="text-sm text-slate-600 capitalize">{results.consentAnalysis.complianceLevel}</p>
                  </div>
                  {results.consentAnalysis.checks.map((check, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                      <div>{check.passed ? "✅" : "❌"}</div>
                      <div>
                        <p className="font-medium text-slate-900">{check.check}</p>
                        <p className="text-xs text-slate-600">{check.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Legitimacy Tab */}
              {activeTab === "legitimacy" && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-50 p-4 text-center">
                    <p className="text-3xl font-bold capitalize text-slate-900">
                      {results.fakePolicy.verdict === "legitimate" ? "✅" : "⚠️"} {results.fakePolicy.verdict}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">{results.fakePolicy.recommendation}</p>
                  </div>
                  {results.fakePolicy.issues.map((issue, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
                      <p className="font-medium text-slate-900">{issue.check}</p>
                      <p className="mt-1 text-sm text-slate-600">{issue.issue}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
