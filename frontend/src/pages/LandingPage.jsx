import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleEnterWorkspace = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    window.setTimeout(() => {
      navigate("/workspace");
    }, 520);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-12 text-slate-100 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-sky-400/30 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <div
        className={`cool-enter relative mx-auto flex min-h-[86vh] w-full max-w-6xl items-center justify-center transition-all duration-500 ${
          isTransitioning ? "translate-y-3 scale-[0.98] opacity-0" : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        <div className="ambient-panel w-full rounded-[2rem] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl sm:p-12">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100/85">
            <Sparkles size={14} /> LeBo Platform
          </p>

          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl">
            Navigating the complex world of data laws, so you can focus on building what matters.
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-200 md:text-lg">
            Ask legal questions, evaluate your controls, and get AI-assisted policy fixes all in one place.
          </p>

          <button
            type="button"
            onClick={handleEnterWorkspace}
            className="cool-button mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900"
          >
            LEBO
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
