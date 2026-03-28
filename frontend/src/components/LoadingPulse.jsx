export default function LoadingPulse({ text = "Analyzing..." }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm">
      <div className="mb-2 h-2 w-24 animate-pulse rounded-full bg-amber-400" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}
