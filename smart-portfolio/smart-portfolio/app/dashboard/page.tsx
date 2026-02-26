
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScoredStock, ScoredWatchItem } from '@/types';
import { formatPercent, formatNumber } from '@/lib/utils';
import StockCard from '@/components/ui/StockCard';
import { LogOut, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [sellStocks, setSellStocks] = useState<ScoredStock[]>([]);
  const [avgStocks, setAvgStocks] = useState<ScoredStock[]>([]);
  const [buyItems, setBuyItems] = useState<ScoredWatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sellRes, avgRes, buyRes] = await Promise.all([
        fetch('/api/score/sell'), fetch('/api/score/averaging'), fetch('/api/score/buy'),
      ]);
      const [sell, avg, buy] = await Promise.all([sellRes.json(), avgRes.json(), buyRes.json()]);
      if (Array.isArray(sell)) setSellStocks(sell);
      if (Array.isArray(avg)) setAvgStocks(avg);
      if (Array.isArray(buy)) setBuyItems(buy);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const totalSellProfit = sellStocks.reduce((s, st) => s + (st.expectedProfit || 0), 0);
  const sellWithAmount = sellStocks.filter(s => (s.sellQty || 0) > 0);
  const buySignals = buyItems.filter(b => b.totalScore >= 80);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Smart Portfolio</h1>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="p-2 rounded-lg hover:bg-gray-100 transition">
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 transition">
            <LogOut className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* 오늘의 액션 요약 */}
      <div className="bg-slate-900 rounded-2xl p-4">
        <p className="text-slate-400 text-xs mb-3 font-medium">오늘의 액션 요약</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-red-500/20 rounded-xl p-3 text-center cursor-pointer" onClick={() => router.push('/dashboard/sell')}>
            <div className="text-red-400 text-xs font-medium">매도</div>
            <div className="text-white font-bold text-lg">{sellStocks.length}</div>
            <div className="text-red-400 text-[10px]">₩{formatNumber(Math.round(totalSellProfit))}</div>
          </div>
          <div className="bg-green-500/20 rounded-xl p-3 text-center cursor-pointer" onClick={() => router.push('/dashboard/averaging')}>
            <div className="text-green-400 text-xs font-medium">물타기</div>
            <div className="text-white font-bold text-lg">{avgStocks.length}</div>
          </div>
          <div className="bg-purple-500/20 rounded-xl p-3 text-center cursor-pointer" onClick={() => router.push('/dashboard/watchlist')}>
            <div className="text-purple-400 text-xs font-medium">매수신호</div>
            <div className="text-white font-bold text-lg">{buySignals.length}</div>
            {buySignals.length > 0 && <div className="text-purple-400 text-[10px]">NEW!</div>}
          </div>
        </div>
      </div>

      {/* 매도 추천 */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="font-bold text-red-500 flex items-center gap-1">🔴 매도 추천</h2>
          <button onClick={() => router.push('/dashboard/sell')} className="text-xs text-blue-500">더보기 &gt;</button>
        </div>
        <div className="px-3 pb-2 space-y-1">
          {loading ? <div className="p-8 text-center text-gray-400 text-sm">분석 중...</div> :
           sellStocks.length === 0 ? <div className="p-6 text-center text-gray-400 text-sm">매도 대상 종목이 없습니다</div> :
           sellStocks.slice(0, 4).map((st, i) => (
            <StockCard key={st.id} rank={i + 1} name={st.name} symbol={st.symbol} market={st.market}
              value1={{ label: '', value: formatPercent(st.profitRate), color: '#22C55E' }}
              value2={{ label: '매도', value: st.sellQty ? `₩${formatNumber(Math.round(st.expectedProfit || 0))}` : '-', color: st.sellQty ? '#EF4444' : '#999' }}
              score={st.totalScore} scoreColor="#EF4444"
              badge={st.status} badgeColor={st.totalScore >= 90 ? '#EF4444' : st.totalScore >= 70 ? '#F59E0B' : '#94A3B8'}
              onClick={() => router.push(`/dashboard/sell/${st.symbol}?market=${st.market}`)}
            />
          ))}
        </div>
        {sellWithAmount.length > 0 && (
          <div className="mx-3 mb-3 p-2 bg-red-50 rounded-lg text-center">
            <span className="text-xs text-red-500 font-medium">
              매도 목표: {sellWithAmount.map((s, i) => `${i + 1}순위 ₩${formatNumber(Math.round(s.expectedProfit || 0))}`).join(' + ')} = ₩{formatNumber(Math.round(totalSellProfit))}
            </span>
          </div>
        )}
      </section>

      {/* 물타기 추천 */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="font-bold text-green-500 flex items-center gap-1">🟢 물타기 추천</h2>
          <button onClick={() => router.push('/dashboard/averaging')} className="text-xs text-blue-500">더보기 &gt;</button>
        </div>
        <div className="px-3 pb-3 space-y-1">
          {loading ? <div className="p-8 text-center text-gray-400 text-sm">분석 중...</div> :
           avgStocks.length === 0 ? <div className="p-6 text-center text-gray-400 text-sm">물타기 대상 종목이 없습니다</div> :
           avgStocks.slice(0, 3).map((st, i) => (
            <StockCard key={st.id} rank={i + 1} name={st.name} symbol={st.symbol} market={st.market}
              value1={{ label: '', value: formatPercent(st.profitRate), color: '#EF4444' }}
              value2={{ label: 'RSI', value: st.rsi ? st.rsi.toFixed(0) : '-' }}
              score={st.totalScore} scoreColor="#22C55E"
              onClick={() => router.push(`/dashboard/averaging/${st.symbol}?market=${st.market}`)}
            />
          ))}
        </div>
      </section>

      {/* 관심종목 매수 신호 */}
      <section className="bg-white rounded-2xl border border-purple-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="font-bold text-purple-500 flex items-center gap-1">🟣 관심종목 매수 신호</h2>
          <button onClick={() => router.push('/dashboard/watchlist')} className="text-xs text-blue-500">전체 {buyItems.length}종목 &gt;</button>
        </div>
        <div className="px-3 pb-3 space-y-1">
          {loading ? <div className="p-8 text-center text-gray-400 text-sm">분석 중...</div> :
           buyItems.length === 0 ? <div className="p-6 text-center text-gray-400 text-sm">관심종목을 등록해보세요</div> :
           buyItems.slice(0, 4).map((item, i) => (
            <StockCard key={item.id} rank={i + 1} name={item.name} symbol={item.symbol} market={item.market}
              value1={{ label: '현재', value: `₩${formatNumber(Math.round(item.currentPrice))}` }}
              value2={{ label: '괴리', value: formatPercent(item.gapRate), color: item.gapRate <= 0 ? '#22C55E' : '#F59E0B' }}
              score={item.totalScore} scoreColor="#8B5CF6"
              badge={item.signal} badgeColor={item.signal === '매수 근접!' ? '#22C55E' : '#94A3B8'}
              onClick={() => router.push(`/dashboard/watchlist/${item.symbol}?market=${item.market}`)}
            />
          ))}
        </div>
      </section>

      {/* 면책조항 */}
      <p className="text-center text-[10px] text-gray-400 pb-4">
        본 서비스는 투자 참고 정보이며, 투자 판단의 최종 책임은 사용자에게 있습니다.
      </p>
    </div>
  );
}
