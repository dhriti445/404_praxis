import { useEffect, useState } from "react";
import { fetchReports } from "../services/api";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadReports() {
      const data = await fetchReports();
      setReports(data.reports || []);
      setMessage(data.message || "");
    }

    loadReports();
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-300/50 bg-white/75 p-6 shadow-soft backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Results / Report View</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Recent Compliance Reports</h1>
      </div>

      {message && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}

      <div className="space-y-3">
        {reports.length === 0 && (
          <p className="rounded-xl bg-white p-4 text-sm text-slate-600 shadow-sm">
            No saved reports yet. Run compliance checks or policy analysis first.
          </p>
        )}

        {reports.map((report) => (
          <details key={report._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">
              {report.reportType.toUpperCase()} - {new Date(report.createdAt).toLocaleString()}
            </summary>
            <pre className="mt-3 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
              {JSON.stringify(report.result, null, 2)}
            </pre>
          </details>
        ))}
      </div>
    </section>
  );
}
