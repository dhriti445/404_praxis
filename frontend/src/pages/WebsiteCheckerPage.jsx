import { useState } from "react";
import { Globe, AlertTriangle, CheckCircle2, AlertCircle, Link2 } from "lucide-react";
import { checkWebsite } from "../services/api";

export default function WebsiteCheckerPage() {
  const [url, setUrl] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleCheck() {
    if (!url.trim()) {
      setError("Please enter a website URL");
      return;
    }

    setIsChecking(true);
    setError("");

    try {
      const result = await checkWebsite(url);
      setResult(result);
    } catch (err) {
      setError(err?.response?.data?.error || "Website check failed");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-50 to-cyan-50 p-8 shadow-xl shadow-slate-900/5 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
          Real-Time Compliance Audit
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Website Compliance Checker</h1>
        <p className="mt-4 max-w-2xl text-slate-700">
          Enter any website URL and we'll audit it for GDPR/DPDP compliance, check for privacy policies,
          cookie banners, and consent mechanisms.
        </p>
      </div>

      {/* Input Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g., https://example.com or example.com"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          />
          <button
            onClick={handleCheck}
            disabled={isChecking || !url.trim()}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isChecking ? "🔄 Checking..." : "🔍 Check Website"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">❌ {error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            {/* Score */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg">
              <p className="text-xs uppercase tracking-wider text-blue-100">Compliance Score</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-bold">{Math.round(result.complianceScore)}</span>
                <span className="mb-1 text-blue-100">/100</span>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-slate-600">Privacy Policy</p>
              <div className="mt-3 flex items-center gap-2">
                {result.findings.privacyPolicy.found ? (
                  <>
                    <CheckCircle2 className="text-green-600" size={24} />
                    <span className="text-sm font-semibold text-green-600">Found</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="text-red-600" size={24} />
                    <span className="text-sm font-semibold text-red-600">Missing</span>
                  </>
                )}
              </div>
            </div>

            {/* Cookie Banner */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-slate-600">Cookie Banner</p>
              <div className="mt-3 flex items-center gap-2">
                {result.findings.cookieBanner.detected ? (
                  <>
                    <CheckCircle2 className="text-green-600" size={24} />
                    <span className="text-sm font-semibold text-green-600">Detected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="text-yellow-600" size={24} />
                    <span className="text-sm font-semibold text-yellow-600">Missing</span>
                  </>
                )}
              </div>
            </div>

            {/* Consent Widget */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-slate-600">CMP</p>
              <div className="mt-3 flex items-center gap-2">
                {result.findings.consentWidget.detected ? (
                  <>
                    <CheckCircle2 className="text-green-600" size={24} />
                    <span className="text-sm font-semibold text-green-600">
                      {result.findings.consentWidget.details.provider}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="text-gray-600" size={24} />
                    <span className="text-sm font-semibold text-gray-600">None</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
              <h3 className="font-semibold text-red-900">⚠️ Issues Found</h3>
              <div className="mt-4 space-y-3">
                {result.issues.map((issue, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border-l-4 bg-white p-3 ${
                      issue.severity === "critical" ? "border-red-600" : "border-yellow-600"
                    }`}
                  >
                    <p className="font-medium text-slate-900">{issue.title}</p>
                    <p className="text-sm text-slate-600">{issue.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
            <h3 className="font-semibold text-blue-900">💡 Recommendations</h3>
            <ul className="mt-4 space-y-2">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3 text-sm text-blue-800">
                  <span>✓</span> {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy Policy Analysis */}
          {result.findings.privacyPolicy.analysis && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900">Privacy Policy Analysis</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-600">DPDP Score</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {result.findings.privacyPolicy.analysis.dpdp.score}%
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-600">GDPR Score</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {result.findings.privacyPolicy.analysis.gdpr.score}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
