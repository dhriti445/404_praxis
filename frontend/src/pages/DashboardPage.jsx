import { MessagesSquare, ClipboardCheck, FileSearch } from "lucide-react";
import FeatureCard from "../components/FeatureCard";

export default function DashboardPage() {
  return (
    <section>
      <div className="mb-8 rounded-3xl bg-white/70 p-8 shadow-xl shadow-slate-900/5 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Privacy Intelligence Platform</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
          Turn DPDP and GDPR complexity into measurable compliance actions.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">
          Ask legal questions, evaluate your controls, and rewrite policy gaps with AI-assisted fixes in one workflow.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <FeatureCard
          to="/chat"
          title="Ask Questions"
          description="Conversational legal guidance with simplified explanation and risk impact."
          icon={<MessagesSquare size={20} />}
        />
        <FeatureCard
          to="/compliance"
          title="Run Compliance Check"
          description="Score your current controls and get prioritized violations, risks, and fixes."
          icon={<ClipboardCheck size={20} />}
        />
        <FeatureCard
          to="/policy"
          title="Analyze Policy"
          description="Scan policy text for missing sections and generate stronger compliant clauses."
          icon={<FileSearch size={20} />}
        />
      </div>
    </section>
  );
}
