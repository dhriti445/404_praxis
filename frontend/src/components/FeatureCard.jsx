import { Link } from "react-router-dom";

export default function FeatureCard({ to, title, description, icon, className = "" }) {
  return (
    <Link
      to={to}
      className={`group rounded-3xl border border-white/30 bg-white/75 p-6 shadow-lg shadow-slate-900/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl ${className}`}
    >
      <div className="mb-4 inline-flex rounded-2xl bg-slate-900 p-3 text-slate-100">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-500 group-hover:text-slate-900">
        Open Module
      </p>
    </Link>
  );
}
