function getRingColor(score) {
  if (score < 60) return "#ef4444";
  if (score < 85) return "#f59e0b";
  return "#16a34a";
}

export default function ScoreRing({ score = 0, size = 160 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));
  const stroke = (progress / 100) * circumference;
  const color = getRingColor(progress);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth="12"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - stroke}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-bold text-slate-900">{Math.round(progress)}%</p>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Score</p>
      </div>
    </div>
  );
}
