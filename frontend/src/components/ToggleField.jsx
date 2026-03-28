export default function ToggleField({ title, help, value, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{help}</p>
        </div>
        <div className="inline-flex rounded-full border border-slate-300 bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onChange(true)}
            className={`rounded-full px-3 py-1 ${
              value ? "bg-emerald-600 text-white" : "text-slate-600"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onChange(false)}
            className={`rounded-full px-3 py-1 ${
              value === false ? "bg-rose-600 text-white" : "text-slate-600"
            }`}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
