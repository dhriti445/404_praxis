import { useEffect, useMemo, useState } from "react";
import { Trash2, Download } from "lucide-react";
import { fetchReports } from "../services/api";

export default function ComplianceHistoryPage() {
  const [history, setHistory] = useState(null);
  const [chatActivity, setChatActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const trendChart = useMemo(() => {
    const snapshots = Array.isArray(history?.history) ? history.history : [];
    if (!snapshots.length) {
      return null;
    }

    const sorted = [...snapshots].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const width = 920;
    const height = 260;
    const paddingX = 52;
    const paddingY = 20;
    const innerWidth = width - paddingX * 2;
    const innerHeight = height - paddingY * 2;

    const points = sorted.map((snapshot, index) => {
      const denominator = Math.max(sorted.length - 1, 1);
      const x = paddingX + (index / denominator) * innerWidth;
      const normalizedScore = Math.max(0, Math.min(100, Number(snapshot.score) || 0));
      const y = paddingY + ((100 - normalizedScore) / 100) * innerHeight;

      return {
        x,
        y,
        score: normalizedScore,
        label: snapshot.label,
        timestamp: snapshot.timestamp,
      };
    });

    const linePath = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    return {
      width,
      height,
      paddingX,
      paddingY,
      points,
      linePath,
      areaPath,
    };
  }, [history]);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const data = await fetchReports();
      const reports = Array.isArray(data?.reports) ? data.reports : [];

      const complianceSnapshots = reports
        .filter((report) => report?.reportType === "compliance")
        .map((report, index) => {
          const result = report?.result || {};

          return {
            id: report?._id || `snapshot-${index}`,
            label: result.mode === "policy_list" ? "Policy Recommendation" : "Compliance Check",
            timestamp: report?.createdAt || new Date().toISOString(),
            score: Number(result?.score ?? 0),
            riskLevel: result?.riskLevel || "unknown",
            dpdpScore: Number(result?.score ?? 0),
            gdprScore: Number(result?.score ?? 0),
            darkPatterns: Array.isArray(result?.risks) ? result.risks.length : 0,
            criticalAlerts: Array.isArray(result?.violations)
              ? result.violations.filter((item) => item?.severity === "critical").length
              : 0,
          };
        })
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const firstSnapshot = complianceSnapshots[0] || null;
      const latestSnapshot = complianceSnapshots[complianceSnapshots.length - 1] || null;
      const improvement = firstSnapshot && latestSnapshot ? latestSnapshot.score - firstSnapshot.score : 0;
      const baseScore = firstSnapshot?.score || 0;
      const improvementPercentage =
        baseScore > 0 ? Math.round((improvement / baseScore) * 100) : 0;

      setHistory({
        summary: {
          totalSnapshots: complianceSnapshots.length,
          firstSnapshot: firstSnapshot
            ? { date: firstSnapshot.timestamp, score: firstSnapshot.score }
            : { date: new Date().toISOString(), score: 0 },
          latestSnapshot: latestSnapshot
            ? { date: latestSnapshot.timestamp, score: latestSnapshot.score }
            : { date: new Date().toISOString(), score: 0 },
          improvement,
          trend:
            improvement > 0 ? "improving" : improvement < 0 ? "declining" : "flat",
          improvementPercentage,
        },
        history: complianceSnapshots,
      });

      const chatReports = reports
        .filter((report) => report?.reportType === "chat")
        .map((report, index) => ({
          id: report?._id || `chat-${index}`,
          message: String(report?.input?.message || "No message preview"),
          timestamp: report?.createdAt || new Date().toISOString(),
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);

      setChatActivity(chatReports);
    } catch (error) {
      console.error("Failed to load history:", error);
      setHistory({
        summary: {
          totalSnapshots: 0,
          firstSnapshot: { date: new Date().toISOString(), score: 0 },
          latestSnapshot: { date: new Date().toISOString(), score: 0 },
          improvement: 0,
          trend: "flat",
          improvementPercentage: 0,
        },
        history: [],
      });
      setChatActivity([]);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading compliance history...</p>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">No compliance history available</p>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 p-8 shadow-xl shadow-slate-900/5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
          Compliance Tracking
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Compliance History</h1>
        <p className="mt-4 max-w-2xl text-slate-700">
          Track your compliance improvements over time. See how your privacy policy evolves and meets standards.
        </p>
      </div>

      {/* Improvement Summary */}
      {history.summary && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Snapshots */}
            <div>
              <p className="text-sm text-slate-600">Total Audits</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{history.summary.totalSnapshots}</p>
            </div>

            {/* First Score */}
            <div>
              <p className="text-sm text-slate-600">Starting Score</p>
              <div className="mt-2">
                <p className="text-3xl font-bold text-slate-900">{history.summary.firstSnapshot.score}</p>
                <p className="text-xs text-slate-500">
                  {new Date(history.summary.firstSnapshot.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Latest Score */}
            <div>
              <p className="text-sm text-slate-600">Current Score</p>
              <div className="mt-2">
                <p className="text-3xl font-bold text-green-600">{history.summary.latestSnapshot.score}</p>
                <p className="text-xs text-slate-500">
                  {new Date(history.summary.latestSnapshot.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Improvement */}
            <div>
              <p className="text-sm text-slate-600">Total Improvement</p>
              <div className="mt-2 flex items-end gap-2">
                <p className="text-3xl font-bold text-green-600">+{history.summary.improvement}</p>
                <p className="mb-1 text-sm text-green-600">({history.summary.improvementPercentage}%)</p>
              </div>
              <p className="mt-1 text-xs text-green-600">📈 {history.summary.trend}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Compliance Timeline</h2>
        <div className="mt-6 space-y-4">
          {history.history.map((snapshot, index) => (
            <div
              key={snapshot.id}
              className="flex gap-6 border-l-4 border-slate-200 py-4 pl-6"
              style={{
                borderLeftColor: snapshot.score >= 80 ? "#10b981" : snapshot.score >= 50 ? "#f59e0b" : "#ef4444",
              }}
            >
              {/* Dot */}
              <div className="relative flex flex-col items-center">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{
                    backgroundColor:
                      snapshot.score >= 80 ? "#10b981" : snapshot.score >= 50 ? "#f59e0b" : "#ef4444",
                  }}
                />
                {index < history.history.length - 1 && (
                  <div className="mt-2 h-12 w-0.5 bg-slate-200" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{snapshot.label}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(snapshot.timestamp).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{snapshot.score}</p>
                      <p className="text-xs capitalize text-slate-500">{snapshot.riskLevel} risk</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200">
                        <Download size={16} />
                      </button>
                      <button className="rounded-lg bg-red-100 p-2 hover:bg-red-200">
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Snapshot Details */}
                <div className="mt-3 grid gap-4 sm:grid-cols-4 text-sm">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">DPDP</p>
                    <p className="font-semibold text-slate-900">{snapshot.dpdpScore}%</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">GDPR</p>
                    <p className="font-semibold text-slate-900">{snapshot.gdprScore}%</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">Dark Patterns</p>
                    <p className="font-semibold text-slate-900">{snapshot.darkPatterns}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">Critical Alerts</p>
                    <p className="font-semibold text-slate-900">{snapshot.criticalAlerts}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Score Trend</h2>
          <p className="text-sm text-slate-500">Progress across all recorded compliance audits</p>
        </div>

        {!trendChart ? (
          <div className="mt-6 h-64 rounded-lg bg-slate-50 flex items-center justify-center">
            <p className="text-slate-500">No score history available yet.</p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <svg viewBox={`0 0 ${trendChart.width} ${trendChart.height}`} className="h-72 w-full" role="img" aria-label="Compliance score trend chart">
              {[0, 25, 50, 75, 100].map((tick) => {
                const y = trendChart.paddingY + ((100 - tick) / 100) * (trendChart.height - trendChart.paddingY * 2);
                return (
                  <g key={tick}>
                    <line
                      x1={trendChart.paddingX}
                      y1={y}
                      x2={trendChart.width - trendChart.paddingX}
                      y2={y}
                      stroke="#cbd5e1"
                      strokeDasharray="3 4"
                    />
                    <text x={trendChart.paddingX - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">
                      {tick}
                    </text>
                  </g>
                );
              })}

              <path d={trendChart.areaPath} fill="#dbeafe" opacity="0.45" />
              <path d={trendChart.linePath} fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />

              {trendChart.points.map((point) => (
                <g key={`${point.timestamp}-${point.label}`}>
                  <circle cx={point.x} cy={point.y} r="5" fill="#0f172a" />
                  <circle cx={point.x} cy={point.y} r="11" fill="#0f172a" opacity="0.12" />
                  <text x={point.x} y={point.y - 12} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f172a">
                    {point.score}
                  </text>
                  <text x={point.x} y={trendChart.height - 4} textAnchor="middle" fontSize="10" fill="#64748b">
                    {new Date(point.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Chat Activity</h2>
        <p className="mt-1 text-sm text-slate-600">Recent chatbot questions saved in history</p>

        <div className="mt-4 space-y-2">
          {chatActivity.length === 0 && (
            <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">No chat history available yet.</p>
          )}

          {chatActivity.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-900">{item.message}</p>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
