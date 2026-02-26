
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScoredStock } from '@/types';
import { formatPercent, formatNumber } from '@/lib/utils';
import ScoreBar from '@/components/ui/ScoreBar';
import { ArrowLeft, Check } from 'lucide-react';

export default function SellDetailPage({ params }: { params: { symbol: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const market = searchParams.get('market') || 'KR';
  const [stock, setStock] = useState<ScoredStock | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    fetch('/api/score/sell').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        const found = data.find((s: ScoredStock) => s.symbol === params.symbol);
        if (found) setStock(found);
      }
    });
  }, [params.symbol]);

  const handleSell = async () => {
    if (!stock || !stock.sellQty) return;
    setRecording(true);
    await fetch('/api/records/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stock_id: stock.id, symbol: stock.symbol, name: stock.name,
        sell_price: stock.currentPrice, quantity: stock.sellQty,
        profit: stock.expectedProfit, profit_rate: stock.profitRate,
        sell_date: new Date().toISOString().split('T')[0],
      }),
    });
    setRecording(false);
    setShowConfirm(false);
    router.push('/dashboard');
  };

  if (!stock) return <div className="p-12 text-center text-gray-400">로딩 중...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">매도 상세</h1>
      </div>

      {/* 종목 헤더 */}
      <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold">{stock.name}</h2>
            <span className="text-xs text-gray-500">{stock.symbol} · {market}</span>
          </div>
          <div className="bg-red-500 text-white px-3 py-1.5 rounded-xl font-bold text-lg">{stock.totalScore}점</div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div><div className="text-[10px] text-gray-400">매수가</div><div className="text-sm font-semibold">₩{formatNumber(stock.avg_price)}</div></div>
          <div><div className="text-[10px] text-gray-400">현재가</div><div className="text-sm font-semibold text-green-600">₩{formatNumber(Math.round(stock.currentPrice))}</div></div>
          <div><div className="text-[10px] text-gray-400">수익률</div><div className="text-sm font-semibold text-green-600">{formatPercent(stock.profitRate)}</div></div>
          <div><div className="text-[10px] text-gray-400">보유</div><div className="text-sm font-semibold">{stock.quantity}주</div></div>
        </div>
      </div>

      {/* 스코어 분해 */}
      <div className="bg-white rounded-2xl border p-4 space-y-3">
        <h3 className="font-bold text-sm">매도 스코어 상세</h3>
        {stock.breakdown.map((b, i) => (
          <ScoreBar key={i} label={b.name} score={b.score} maxScore={b.maxScore} detail={b.detail} color={b.color} />
        ))}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-bold">종합 매도 스코어</span>
          <span className="text-2xl font-bold text-red-500">{stock.totalScore} / 100</span>
        </div>
      </div>

      {/* 매도 추천 */}
      {stock.sellQty && stock.sellQty > 0 && (
        <div className="bg-white rounded-2xl border p-4 space-y-2">
          <h3 className="font-bold text-sm">매도 추천</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">추천 매도 수량</span><span className="font-semibold">{stock.sellQty}주</span></div>
            <div className="flex justify-between"><span className="text-gray-500">매도 예상 금액</span><span className="font-semibold">₩{formatNumber(Math.round(stock.sellAmount || 0))}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">예상 실현 수익</span><span className="font-bold text-green-600">₩{formatNumber(Math.round(stock.expectedProfit || 0))}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">매도 후 잔여</span><span className="font-semibold">{stock.quantity - stock.sellQty}주</span></div>
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <button onClick={() => setShowConfirm(true)}
          className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition">
          매도 기록하기
        </button>
        <button onClick={() => router.back()}
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition">
          보류
        </button>
      </div>

      {/* 확인 모달 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-lg">매도 기록 확인</h3>
            <p className="text-sm text-gray-600">{stock.name} {stock.sellQty}주를 ₩{formatNumber(Math.round(stock.currentPrice))}에 매도 기록하시겠습니까?</p>
            <div className="flex gap-3">
              <button onClick={handleSell} disabled={recording}
                className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-xl disabled:opacity-50">
                {recording ? '기록 중...' : '확인'}
              </button>
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 bg-gray-100 rounded-xl font-semibold">취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
