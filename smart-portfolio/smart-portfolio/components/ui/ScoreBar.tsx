
interface ScoreBarProps {
  label: string;
  score: number;
  maxScore: number;
  detail: string;
  color: string;
}

export default function ScoreBar({ label, score, maxScore, detail, color }: ScoreBarProps) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-400">{detail}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
        <span className="text-xs font-bold min-w-[40px] text-right" style={{ color }}>{score}/{maxScore}</span>
      </div>
    </div>
  );
}
