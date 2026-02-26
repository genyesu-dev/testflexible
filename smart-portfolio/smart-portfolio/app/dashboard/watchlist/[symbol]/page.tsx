
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScoredWatchItem } from '@/types';
import { formatPercent, formatNumber } from '@/lib/utils';
import ScoreBar from '@/components/ui/ScoreBar';
import { ArrowLeft } from 'lucide-react';

export default function WatchlistDetailPage({ params }: { params: { symbol: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<ScoredWatchItem | null>(null);
  const [budget, setBudget] = useState(500000);

  useEffect(() => {
    fetch('/api/score/buy').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        const found = data.find((s: ScoredWatchItem) => s.symbol === params.symbol);
        if (found) setItem(found);
      }
    });
  }, [params.symbol]);

  if (!item) return <div className="p-12 text-center text-gray-400">로딩 중...</div>;

  const buyQty = Math.floor(budget / item.currentPrice);

  const handleBuyNow = async () => {
    await fetch('/api/stocks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: item.symbol, name: item.name, market: item.market, avg_price: item.currentPrice, quantity: buyQty, memo: item.memo }),
    });
    await fetch(`/api/watchlist/${item.id}`, { method: 'DELETE' });
    router.push('/dashboard');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">매수 추천 상세</h1>
      </div>

      <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
        {item.totalScore >= 80 && <span className="inline-block text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold mb-1">매수 타이밍!</span>}
        <div className="flex items-center justify-between">
          <div><h2 className="text-lg font-bold">{item.name}</h2><span className="text-xs text-gray-500">{item.symbol}</span></div>
          <div className="bg-purple-500 text-white px-3 py-1.5 rounded-xl font-bold text-lg">{item.totalScore}점</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center mt-3">
          <div><div className="text-[10px] text-gray-400">현재가</div><div className="text-sm font-semibold">₩{formatNumber(Math.round(item.currentPrice))}</div></div>
          <div><div className="text-[10px] text-gray-400">희망가</div><div className="text-sm font-semibold text-purple-600">₩{formatNumber(item.target_price || 0)}</div></div>
          <div><div className="text-[10px] text-gray-400">괴리율</div><div className={`text-sm font-semibold ${item.gapRate <= 0 ? 'text-green-600' : 'text-orange-500'}`}>{formatPercent(item.gapRate)}</div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-4 space-y-3">
        <h3 className="font-bold text-sm">매수 타이밍 스코어</h3>
        {item.breakdown.map((b, i) => <ScoreBar key={i} {...b} />)}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-bold">종합 매수 스코어</span>
          <span className="text-2xl font-bold text-purple-500">{item.totalScore} / 100</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-4 space-y-3">
        <h3 className="font-bold text-sm">매수 시뮬레이션</h3>
        <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-sm" />
        <div className="flex gap-2">
          {[300000,500000,1000000].map(a => (
            <button key={a} onClick={() => setBudget(a)} className={`text-xs px-2.5 py-1 rounded-lg border ${budget===a?'bg-purple-50 border-purple-300 text-purple-600':'border-gray-200'}`}>{a/10000}만</button>
          ))}
        </div>
        {buyQty > 0 && (
          <div className="bg-purple-50 rounded-xl p-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">매수 가능 수량</span><span className="font-semibold">{buyQty}주</span></div>
            <div className="flex justify-between"><span className="text-gray-500">총 매수 금액</span><span className="font-semibold">₩{formatNumber(buyQty * Math.round(item.currentPrice))}</span></div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={handleBuyNow} className="flex-1 py-3 bg-green-500 text-white font-semibold rounded-xl">현재가 매수 기록</button>
        <button onClick={() => router.back()} className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl">뒤로</button>
      </div>
    </div>
  );
}
