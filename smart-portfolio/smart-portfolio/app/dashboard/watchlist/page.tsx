
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScoredWatchItem, WatchlistItem } from '@/types';
import { formatPercent, formatNumber } from '@/lib/utils';
import StockCard from '@/components/ui/StockCard';
import { ArrowLeft, Plus, X } from 'lucide-react';

export default function WatchlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<ScoredWatchItem[]>([]);
  const [allItems, setAllItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState<'all' | 'buy_interest' | 'monitoring'>('all');
  const [form, setForm] = useState({ symbol: '', name: '', market: 'KR' as 'KR'|'US', target_price: '', category: 'buy_interest' as const, memo: '', tags: '' });

  const fetchData = async () => {
    setLoading(true);
    const [scoreRes, rawRes] = await Promise.all([fetch('/api/score/buy'), fetch('/api/watchlist')]);
    const [scored, raw] = await Promise.all([scoreRes.json(), rawRes.json()]);
    if (Array.isArray(scored)) setItems(scored);
    if (Array.isArray(raw)) setAllItems(raw);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    await fetch('/api/watchlist', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, target_price: form.target_price ? Number(form.target_price) : null, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] }),
    });
    setShowAdd(false);
    setForm({ symbol: '', name: '', market: 'KR', target_price: '', category: 'buy_interest', memo: '', tags: '' });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/watchlist/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const displayed = tab === 'all' ? allItems : allItems.filter(i => i.category === tab);
  const scoredMap = new Map(items.map(i => [i.symbol, i]));

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-lg font-bold text-purple-500">관심종목</h1>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-purple-500 text-white p-2 rounded-xl"><Plus className="w-4 h-4" /></button>
      </div>

      <div className="bg-purple-50 rounded-xl p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-purple-700 font-medium">등록 현황</span>
          <span className="text-purple-500 font-bold">{allItems.length} / 20 종목</span>
        </div>
        <div className="mt-1.5 h-1.5 bg-purple-200 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(allItems.length / 20) * 100}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'buy_interest', 'monitoring'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${tab === t ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
            {t === 'all' ? `전체 (${allItems.length})` : t === 'buy_interest' ? `관심매수 (${allItems.filter(i=>i.category==='buy_interest').length})` : `모니터링 (${allItems.filter(i=>i.category==='monitoring').length})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {loading ? <div className="p-12 text-center text-gray-400">로딩 중...</div> :
         displayed.length === 0 ? <div className="p-12 text-center text-gray-400">관심종목을 추가해보세요</div> :
         displayed.map((item) => {
          const scored = scoredMap.get(item.symbol);
          return (
            <div key={item.id} className="relative">
              <StockCard rank={0} name={item.name} symbol={item.symbol} market={item.market}
                value1={{ label: '희망가', value: item.target_price ? `₩${formatNumber(item.target_price)}` : '-' }}
                value2={{ label: '', value: item.category === 'buy_interest' ? '관심매수' : '모니터링', color: '#8B5CF6' }}
                score={scored?.totalScore || 0} scoreColor="#8B5CF6"
                badge={scored?.signal || item.category === 'monitoring' ? '모니터링' : '대기'} badgeColor={scored?.signal === '매수 근접!' ? '#22C55E' : '#94A3B8'}
                extra={item.memo || undefined}
                onClick={() => router.push(`/dashboard/watchlist/${item.symbol}?market=${item.market}`)}
              />
              <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"><X className="w-3 h-3 text-gray-400" /></button>
            </div>
          );
        })}
      </div>

      {/* 추가 모달 */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl p-6 w-full max-w-lg space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">관심종목 추가</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">종목코드 *</label>
                  <input value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value})} placeholder="005930 또는 AAPL" className="w-full px-3 py-2 border rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">종목명 *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="삼성전자" className="w-full px-3 py-2 border rounded-lg text-sm mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">시장</label>
                  <select value={form.market} onChange={e => setForm({...form, market: e.target.value as 'KR'|'US'})} className="w-full px-3 py-2 border rounded-lg text-sm mt-1">
                    <option value="KR">한국</option><option value="US">미국</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">분류</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm mt-1">
                    <option value="buy_interest">관심매수</option><option value="monitoring">모니터링</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">희망 매수가</label>
                <input type="number" value={form.target_price} onChange={e => setForm({...form, target_price: e.target.value})} placeholder="65000" className="w-full px-3 py-2 border rounded-lg text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">메모</label>
                <input value={form.memo} onChange={e => setForm({...form, memo: e.target.value})} placeholder="매수 이유..." className="w-full px-3 py-2 border rounded-lg text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">태그 (쉼표 구분)</label>
                <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="반도체, 배당" className="w-full px-3 py-2 border rounded-lg text-sm mt-1" />
              </div>
              <button onClick={handleAdd} disabled={!form.symbol || !form.name}
                className="w-full py-3 bg-purple-500 text-white font-semibold rounded-xl disabled:opacity-50">등록하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
