import { useMemo, useState } from "react";
import ToggleField from "../components/ToggleField";
import ResultReport from "../components/ResultReport";
import { complianceQuestions } from "../data/complianceQuestions";
import { runComplianceCheck } from "../services/api";
import LoadingPulse from "../components/LoadingPulse";

function buildInitialState() {
  return complianceQuestions.reduce((acc, item) => {
    acc[item.key] = null;
    return acc;
  }, {});
}

export default function ComplianceCheckerPage() {
  const [answers, setAnswers] = useState(buildInitialState);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const completion = useMemo(() => {
    const total = complianceQuestions.length;
    const filled = complianceQuestions.filter((item) => answers[item.key] !== null).length;
    return Math.round((filled / total) * 100);
  }, [answers]);

  const handleRunCheck = async (event) => {
    event.preventDefault();
    setLoading(true);

    const normalizedAnswers = Object.fromEntries(
      Object.entries(answers).map(([key, value]) => [key, Boolean(value)])
    );

    try {
      const data = await runComplianceCheck({ answers: normalizedAnswers });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Risk Score Engine</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Compliance Checker</h1>
        </div>
        <p className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-100">
          Form Completion: {completion}%
        </p>
      </div>

      <form onSubmit={handleRunCheck} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        {complianceQuestions.map((question) => (
          <ToggleField
            key={question.key}
            title={question.title}
            help={question.help}
            value={answers[question.key]}
            onChange={(value) => setAnswers((prev) => ({ ...prev, [question.key]: value }))}
          />
        ))}
        <button
          type="submit"
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100"
        >
          Generate Compliance Report
        </button>
      </form>

      {loading && <LoadingPulse text="Evaluating controls and generating fixes..." />}
      <ResultReport title="Compliance Check" report={result} strengthsKey="goodPractices" />
    </section>
  );
}
