import { Link, NavLink } from "react-router-dom";
import { ShieldCheck, MessagesSquare, ClipboardCheck, FileSearch, History } from "lucide-react";

const navItems = [
  { to: "/chat", label: "Ask Questions", icon: <MessagesSquare size={16} /> },
  { to: "/compliance", label: "Compliance Check", icon: <ClipboardCheck size={16} /> },
  { to: "/policy", label: "Policy Analyzer", icon: <FileSearch size={16} /> },
  { to: "/reports", label: "Reports", icon: <History size={16} /> },
];

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-app-pattern">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-900">
            <span className="rounded-xl bg-slate-900 p-2 text-slate-100">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">DPDP Intelligence</p>
              <p className="text-sm font-bold">Compliance & Data Protection Bot</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-slate-900 text-slate-100"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
