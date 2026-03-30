import { useMemo, useState } from "react";
import ToggleField from "../components/ToggleField";
import ResultReport from "../components/ResultReport";
import {
  allComplianceQuestions,
  getRoleComplianceQuestions,
  roleModeMeta,
} from "../data/complianceQuestions";
import { runComplianceCheck } from "../services/api";
import LoadingPulse from "../components/LoadingPulse";

const roleOptions = [
  { value: "developer", label: "Developer" },
  { value: "startup", label: "Startup" },
  { value: "companies", label: "Companies" },
];

function buildInitialState() {
  return allComplianceQuestions.reduce((acc, item) => {
    acc[item.key] = null;
    return acc;
  }, {});
}

export default function ComplianceCheckerPage() {
  const [role, setRole] = useState("developer");
  const [hasComplianceForm, setHasComplianceForm] = useState(true);
  const [complianceForm, setComplianceForm] = useState("");
  const [answers, setAnswers] = useState(buildInitialState);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const activeQuestions = useMemo(() => getRoleComplianceQuestions(role), [role]);
  const modeInfo = roleModeMeta[role] || roleModeMeta.startup;
  const answeredCount = useMemo(
    () => activeQuestions.filter((item) => answers[item.key] !== null).length,
    [answers, activeQuestions]
  );

  const completion = useMemo(() => {
    if (!hasComplianceForm) {
      return 0;
    }

    const total = activeQuestions.length;
    if (!total) {
      return 0;
    }

    const filled = activeQuestions.filter((item) => answers[item.key] !== null).length;
    return Math.round((filled / total) * 100);
  }, [answers, activeQuestions, hasComplianceForm]);

  const handleRunCheck = async (event) => {
    event.preventDefault();
    setLoading(true);

    const normalizedAnswers = hasComplianceForm
      ? Object.fromEntries(Object.entries(answers).map(([key, value]) => [key, Boolean(value)]))
      : {};

    try {
      const data = await runComplianceCheck({
        role,
        hasComplianceForm,
        complianceForm,
        answers: normalizedAnswers,
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-blue-50 to-cyan-50 p-8 shadow-xl shadow-slate-900/5 backdrop-blur">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Risk Score Engine</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">Compliance Checker</h1>
          </div>
          <p className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-100">
            Form Completion: {completion}%
          </p>
        </div>
      </div>

      <form onSubmit={handleRunCheck} className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <label htmlFor="compliance-role" className="mb-2 block text-sm font-semibold text-slate-900">
              Select role
            </label>
            <select
              id="compliance-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">
              For {roleOptions.find((option) => option.value === role)?.label || "this role"}, do you already have a compliance form/policy draft?
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setHasComplianceForm(true)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                  hasComplianceForm
                    ? "bg-slate-900 text-slate-100"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                Yes, I have one
              </button>
              <button
                type="button"
                onClick={() => setHasComplianceForm(false)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                  !hasComplianceForm
                    ? "bg-slate-900 text-slate-100"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                No, suggest policies
              </button>
            </div>

            <label htmlFor="compliance-form" className="mt-4 block text-sm font-semibold text-slate-900">
              Compliance form / policy text
            </label>
            <textarea
              id="compliance-form"
              rows={6}
              value={complianceForm}
              onChange={(event) => setComplianceForm(event.target.value)}
              placeholder={
                hasComplianceForm
                  ? "Paste your current compliance form or policy draft here for role-aware analysis..."
                  : "Optional: leave empty to get a role-based policy list."
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
            />
          </div>

          {hasComplianceForm && (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Controls checklist for selected role
              </p>
              <div className="space-y-3">
                {activeQuestions.map((question) => (
                  <ToggleField
                    key={question.key}
                    title={question.title}
                    help={question.help}
                    value={answers[question.key]}
                    onChange={(value) => setAnswers((prev) => ({ ...prev, [question.key]: value }))}
                  />
                ))}
              </div>
            </>
          )}

          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 xl:hidden"
          >
            {hasComplianceForm ? "Generate Compliance Report" : "Suggest Role-based Policies"}
          </button>
        </div>

        <aside className="self-start xl:sticky xl:top-24">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Selected Mode</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{modeInfo.label}</p>
              <p className="mt-1 text-sm text-slate-600">{modeInfo.description}</p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Checklist Progress</span>
                <span>{hasComplianceForm ? `${answeredCount}/${activeQuestions.length}` : "Policy mode"}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-slate-900 transition-all"
                  style={{ width: `${hasComplianceForm ? completion : 100}%` }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="hidden w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 xl:block"
            >
              {hasComplianceForm ? "Generate Compliance Report" : "Suggest Role-based Policies"}
            </button>
          </div>
        </aside>
      </form>

      {loading && <LoadingPulse text="Evaluating controls and generating fixes..." />}
      {result?.mode === "policy_list" && (
        <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
          {result.message}
        </p>
      )}
      <ResultReport title="Compliance Check" report={result} strengthsKey="goodPractices" />
    </section>
  );
}
