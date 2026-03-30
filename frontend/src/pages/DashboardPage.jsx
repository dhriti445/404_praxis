import { BookOpenText, ClipboardCheck, FileSearch } from "lucide-react";
import FeatureCard from "../components/FeatureCard";

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-300/50 bg-white/70 p-7 shadow-soft backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">LeBo Workspace</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">Choose A Module To Start</h1>
        <p className="mt-2 max-w-4xl text-sm text-slate-600 md:text-base">
          Start with core modules and use navigation for advanced tools when needed.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Core Modules</h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <FeatureCard
            to="/chat"
            title="Chatbot"
            description="Ask legal/privacy questions and get actionable guidance."
            icon={<BookOpenText size={20} />}
          />
          <FeatureCard
            to="/compliance"
            title="Compliance Checker"
            description="Evaluate controls, identify risks, and generate fixes."
            icon={<ClipboardCheck size={20} />}
          />
          <FeatureCard
            to="/policy"
            title="Policy Analyzer"
            description="Analyze policy text for missing sections and stronger clauses."
            icon={<FileSearch size={20} />}
          />
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Additional modules are available from the top navigation and side panel.
        </p>
      </div>

    </section>
  );
}
