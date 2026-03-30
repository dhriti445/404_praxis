import { Link } from "react-router-dom";

export default function FeatureCard({ to, title, description, icon, className = "" }) {
  return (
    <Link
      to={to}
      className={`group flex h-full cursor-pointer flex-col rounded-3xl border border-slate-300/50 bg-white/75 p-6 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-400/50 hover:bg-white ${className}`}
    >
      <div className="mb-4 inline-flex rounded-2xl bg-slate-900 p-3 text-slate-100 shadow-soft">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      <p className="mt-auto pt-6 text-xs font-semibold uppercase tracking-widest text-slate-500 group-hover:text-slate-900">
        Open Module
      </p>
    </Link>
  );
}
