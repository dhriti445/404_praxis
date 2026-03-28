import { useState } from "react";
import { Upload } from "lucide-react";
import ResultReport from "../components/ResultReport";
import LoadingPulse from "../components/LoadingPulse";
import { analyzePolicy } from "../services/api";

export default function PolicyAnalyzerPage() {
  const [policyText, setPolicyText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setPolicyText(text);
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await analyzePolicy({ policyText });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Policy Analyzer</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Analyze Privacy Policy Text</h1>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          <Upload size={16} /> Upload Policy File
          <input type="file" className="hidden" accept=".txt,.md,.html" onChange={handleFileUpload} />
        </label>
        <textarea
          value={policyText}
          onChange={(event) => setPolicyText(event.target.value)}
          rows={12}
          placeholder="Paste your privacy policy text here..."
          className="w-full rounded-2xl border border-slate-300 p-4 text-sm outline-none transition focus:border-slate-900"
        />
        <button
          type="submit"
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100"
        >
          Analyze Policy and Generate Fixes
        </button>
      </form>

      {loading && <LoadingPulse text="Scanning policy for compliance gaps..." />}
      <ResultReport title="Policy Analysis" report={result} strengthsKey="strengths" />
    </section>
  );
}
