
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScoredStock } from '@/types';
import { formatPercent, formatNumber } from '@/lib/utils';
import StockCard from '@/components/ui/StockCard';
import { ArrowLeft } from 'lucide-react';

export default function SellPage() {
  const router = useRouter();
  const [stocks, setStocks] = useState<ScoredStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/score/sell').then(r => r.json()).then(d => { if (Array.isArray(d)) setStocks(d); setLoading(false); });
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/dashboard')} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold text-red-500">매도 추천 전체</h1>
      </div>
      <div className="space-y-2">
        {loading ? <div className="p-12 text-center text-gray-400">분석 중...</div> :
         stocks.length === 0 ? <div className="p-12 text-center text-gray-400">수익률 5% 이상 종목이 없습니다</div> :
         stocks.map((st, i) => (
          <StockCard key={st.id} rank={i + 1} name={st.name} symbol={st.symbol} market={st.market}
            value1={{ label: '수익률', value: formatPercent(st.profitRate), color: '#22C55E' }}
            value2={{ label: '매도수익', value: st.expectedProfit ? `₩${formatNumber(Math.round(st.expectedProfit))}` : '-', color: '#EF4444' }}
            score={st.totalScore} scoreColor="#EF4444"
            badge={st.status} badgeColor={st.totalScore >= 90 ? '#EF4444' : '#F59E0B'}
            extra={st.sellQty ? `추천 매도 ${st.sellQty}주 · ₩${formatNumber(Math.round(st.sellAmount || 0))}` : undefined}
            onClick={() => router.push(`/dashboard/sell/${st.symbol}?market=${st.market}`)}
          />
        ))}
      </div>
    </div>
  );
}
