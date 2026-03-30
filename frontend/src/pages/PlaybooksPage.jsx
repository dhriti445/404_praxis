import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BookMarked, Building2, FileText, Scale } from "lucide-react";
import { fetchIndustryPlaybooks } from "../services/api";

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPlaybooks() {
      try {
        const data = await fetchIndustryPlaybooks();
        const items = Array.isArray(data?.playbooks) ? data.playbooks : [];
        setPlaybooks(items);
        if (items.length > 0) {
          setSelectedId(items[0].id);
        }
      } catch (err) {
        setError(err?.response?.data?.error || "Could not load industry playbooks right now.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPlaybooks();
  }, []);

  const selectedPlaybook = useMemo(
    () => playbooks.find((item) => item.id === selectedId) || playbooks[0],
    [playbooks, selectedId]
  );

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-300/50 bg-gradient-to-r from-slate-200/95 to-slate-300/90 p-6 shadow-xl shadow-slate-900/5 backdrop-blur md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Industry-specific playbooks</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">Sector guidance for faster compliant drafting</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 md:text-base">
          Pick your sector to view legal obligations, ready-to-use policy language, and common compliance mistakes.
        </p>
      </div>

      {isLoading && <p className="rounded-xl bg-white p-3 text-sm text-slate-600 shadow-sm">Loading industry playbooks...</p>}

      {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {playbooks.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {playbooks.map((item) => {
            const isActive = item.id === selectedPlaybook?.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-slate-100"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className={`mt-1 text-xs ${isActive ? "text-slate-300" : "text-slate-500"}`}>{item.focus}</p>
              </button>
            );
          })}
        </div>
      )}

      {!selectedPlaybook && !error && (
        <p className="rounded-xl bg-white p-4 text-sm text-slate-600 shadow-sm">No playbooks available right now.</p>
      )}

      {selectedPlaybook && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
              <Building2 size={14} />
              Sector
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-900">{selectedPlaybook.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{selectedPlaybook.focus}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
              <Scale size={14} />
              Key obligations by law
            </div>
            <ul className="space-y-3">
              {(selectedPlaybook.keyObligations || []).map((item, idx) => (
                <li key={`${item.law}-${idx}`} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{item.law}</p>
                  <p className="mt-1 text-sm text-slate-700">{item.obligation}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
              <FileText size={14} />
              Sample policy snippets
            </div>
            <ul className="space-y-3">
              {(selectedPlaybook.samplePolicySnippets || []).map((snippet, idx) => (
                <li key={idx} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-slate-100">
                    {idx + 1}
                  </span>
                  {snippet}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
              <AlertTriangle size={14} />
              Common pitfalls
            </div>
            <ul className="space-y-2">
              {(selectedPlaybook.commonPitfalls || []).map((pitfall, idx) => (
                <li key={idx} className="rounded-lg bg-amber-50/60 p-2 text-sm text-amber-900">
                  {pitfall}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="inline-flex items-center gap-2 font-semibold text-slate-700">
          <BookMarked size={16} />
          Drafting note
        </p>
        <p className="mt-2">
          These playbooks are practical starting points. Adapt language to your exact data flows, vendors, and retention rules before publishing.
        </p>
      </div>
    </section>
  );
}
