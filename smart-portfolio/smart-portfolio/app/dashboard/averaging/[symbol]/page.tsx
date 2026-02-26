
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScoredStock } from '@/types';
import { formatPercent, formatNumber } from '@/lib/utils';
import ScoreBar from '@/components/ui/ScoreBar';
import { ArrowLeft } from 'lucide-react';

export default function AveragingDetailPage({ params }: { params: { symbol: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stock, setStock] = useState<ScoredStock | null>(null);
  const [amount, setAmount] = useState(500000);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    fetch('/api/score/averaging').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        const found = data.find((s: ScoredStock) => s.symbol === params.symbol);
        if (found) setStock(found);
      }
    });
  }, [params.symbol]);

  if (!stock) return <div className="p-12 text-center text-gray-400">로딩 중...</div>;

  const buyQty = Math.floor(amount / stock.currentPrice);
  const newTotalQty = stock.quantity + buyQty;
  const newAvgPrice = (stock.avg_price * stock.quantity + stock.currentPrice * buyQty) / newTotalQty;
  const newProfitRate = ((stock.currentPrice - newAvgPrice) / newAvgPrice) * 100;
  const improvement = stock.avg_price - newAvgPrice;

  const handleBuy = async () => {
    setRecording(true);
    await fetch('/api/records/buy', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock_id: stock.id, symbol: stock.symbol, name: stock.name, buy_price: stock.currentPrice, quantity: buyQty, type: 'averaging_down', buy_date: new Date().toISOString().split('T')[0] }),
    });
    setRecording(false);
    router.push('/dashboard');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">물타기 상세</h1>
      </div>

      <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
        <div className="flex items-center justify-between mb-2">
          <div><h2 className="text-lg font-bold">{stock.name}</h2><span className="text-xs text-gray-500">{stock.symbol}</span></div>
          <div className="bg-green-500 text-white px-3 py-1.5 rounded-xl font-bold text-lg">{stock.totalScore}점</div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div><div className="text-[10px] text-gray-400">평단가</div><div className="text-sm font-semibold">₩{formatNumber(stock.avg_price)}</div></div>
          <div><div className="text-[10px] text-gray-400">현재가</div><div className="text-sm font-semibold text-red-600">₩{formatNumber(Math.round(stock.currentPrice))}</div></div>
          <div><div className="text-[10px] text-gray-400">손실률</div><div className="text-sm font-semibold text-red-600">{formatPercent(stock.profitRate)}</div></div>
          <div><div className="text-[10px] text-gray-400">보유</div><div className="text-sm font-semibold">{stock.quantity}주</div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-4 space-y-3">
        <h3 className="font-bold text-sm">물타기 스코어 상세</h3>
        {stock.breakdown.map((b, i) => <ScoreBar key={i} {...b} />)}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-bold">종합 물타기 스코어</span>
          <span className="text-2xl font-bold text-green-500">{stock.totalScore} / 100</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-4 space-y-3">
        <h3 className="font-bold text-sm">물타기 시뮬레이션</h3>
        <div>
          <label className="text-xs text-gray-500">추가 매수 금액</label>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-xl text-sm" />
          <div className="flex gap-2 mt-2">
            {[100000, 300000, 500000, 1000000].map(a => (
              <button key={a} onClick={() => setAmount(a)} className={`text-xs px-2.5 py-1 rounded-lg border ${amount === a ? 'bg-green-50 border-green-300 text-green-600' : 'border-gray-200'}`}>
                {a >= 1000000 ? `${a/10000}만` : `${a/10000}만`}
              </button>
            ))}
          </div>
        </div>
        {buyQty > 0 && (
          <div className="bg-green-50 rounded-xl p-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">추가 매수 수량</span><span className="font-semibold">{buyQty}주</span></div>
            <div className="flex justify-between"><span className="text-gray-500">새 평단가</span><span className="font-semibold">₩{formatNumber(Math.round(newAvgPrice))}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">평단가 개선</span><span className="font-bold text-green-600">-₩{formatNumber(Math.round(improvement))}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">새 손실률</span><span className="font-semibold text-red-500">{formatPercent(newProfitRate)}</span></div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={handleBuy} disabled={recording || buyQty === 0} className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl disabled:opacity-50">
          {recording ? '기록 중...' : '물타기 기록하기'}
        </button>
        <button onClick={() => router.back()} className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl">뒤로</button>
      </div>
    </div>
  );
}
