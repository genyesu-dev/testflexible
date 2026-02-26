
import { formatPercent, formatCurrency } from '@/lib/utils';

interface StockCardProps {
  rank: number;
  name: string;
  symbol: string;
  market: 'KR' | 'US';
  value1: { label: string; value: string; color?: string };
  value2: { label: string; value: string; color?: string };
  score: number;
  scoreColor: string;
  badge?: string;
  badgeColor?: string;
  extra?: string;
  onClick?: () => void;
}

export default function StockCard({ rank, name, symbol, value1, value2, score, scoreColor, badge, badgeColor, extra, onClick }: StockCardProps) {
  const rankColors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-gray-400', 'bg-gray-300'];
  return (
    <div onClick={onClick} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer border border-gray-100">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${rankColors[Math.min(rank - 1, 4)]}`}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm truncate">{name}</span>
          {badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: badgeColor + '22', color: badgeColor }}>{badge}</span>}
        </div>
        <div className="flex gap-3 mt-0.5">
          <span className="text-xs" style={{ color: value1.color || '#666' }}>{value1.label} {value1.value}</span>
          <span className="text-xs" style={{ color: value2.color || '#666' }}>{value2.label} {value2.value}</span>
        </div>
        {extra && <span className="text-[10px] text-gray-400">{extra}</span>}
      </div>
      <div className="text-right">
        <div className="text-lg font-bold" style={{ color: scoreColor }}>{score}</div>
        <div className="text-[10px] text-gray-400">점</div>
      </div>
    </div>
  );
}
