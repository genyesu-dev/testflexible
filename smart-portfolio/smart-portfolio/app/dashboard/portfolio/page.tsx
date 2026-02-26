
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stock } from '@/types';
import { formatNumber, formatPercent } from '@/lib/utils';
import { ArrowLeft, Plus, Pencil, Trash2, X } from 'lucide-react';

export default function PortfolioPage() {
  const router = useRouter();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ symbol: '', name: '', market: 'KR' as 'KR'|'US', avg_price: '', quantity: '', buy_date: '', memo: '' });
  const [editId, setEditId] = useState<string|null>(null);

  const fetchStocks = () => { fetch('/api/stocks').then(r => r.json()).then(d => { if (Array.isArray(d)) setStocks(d); }); };
  useEffect(() => { fetchStocks(); }, []);

  const handleSubmit = async () => {
    const body = { ...form, avg_price: Number(form.avg_price), quantity: Number(form.quantity), buy_date: form.buy_date || null };
    if (editId) {
      await fetch(`/api/stocks/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      await fetch('/api/stocks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setShowAdd(false); setEditId(null);
    setForm({ symbol: '', name: '', market: 'KR', avg_price: '', quantity: '', buy_date: '', memo: '' });
    fetchStocks();
  };

  const handleEdit = (s: Stock) => {
    setForm({ symbol: s.symbol, name: s.name, market: s.market, avg_price: String(s.avg_price), quantity: String(s.quantity), buy_date: s.buy_date || '', memo: s.memo || '' });
    setEditId(s.id); setShowAdd(true);
  };

  const handleDelete = async (id: string) => { await fetch(`/api/stocks/${id}`, { method: 'DELETE' }); fetchStocks(); };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-lg font-bold">보유 종목 관리</h1>
        </div>
        <button onClick={() => { setEditId(null); setForm({ symbol:'',name:'',market:'KR',avg_price:'',quantity:'',buy_date:'',memo:'' }); setShowAdd(true); }} className="bg-blue-500 text-white p-2 rounded-xl"><Plus className="w-4 h-4" /></button>
      </div>

      <div className="text-sm text-gray-500">{stocks.length} / 15 종목</div>

      <div className="space-y-2">
        {stocks.map(s => (
          <div key={s.id} className="bg-white rounded-xl border p-3 flex items-center gap-3">
            <div className={`w-1 h-12 rounded-full ${s.avg_price ? 'bg-blue-400' : 'bg-gray-300'}`} />
            <div className="flex-1">
              <div className="font-semibold text-sm">{s.name} <span className="text-gray-400 text-xs">{s.symbol}</span></div>
              <div className="text-xs text-gray-500">평단 ₩{formatNumber(s.avg_price)} × {s.quantity}주 = ₩{formatNumber(s.avg_price * s.quantity)}</div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-3.5 h-3.5 text-gray-400" /></button>
              <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-gray-100"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-2xl p-6 w-full max-w-lg space-y-3">
            <div className="flex justify-between"><h3 className="font-bold">{editId ? '종목 수정' : '종목 등록'}</h3><button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-gray-500">종목코드 *</label><input value={form.symbol} onChange={e=>setForm({...form,symbol:e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500">종목명 *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-gray-500">시장</label><select value={form.market} onChange={e=>setForm({...form,market:e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm mt-1"><option value="KR">한국</option><option value="US">미국</option></select></div>
              <div><label className="text-xs text-gray-500">매수일</label><input type="date" value={form.buy_date} onChange={e=>setForm({...form,buy_date:e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-gray-500">매수 평균가 *</label><input type="number" value={form.avg_price} onChange={e=>setForm({...form,avg_price:e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500">수량 *</label><input type="number" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
            </div>
            <div><label className="text-xs text-gray-500">메모</label><input value={form.memo} onChange={e=>setForm({...form,memo:e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
            <button onClick={handleSubmit} disabled={!form.symbol||!form.name||!form.avg_price||!form.quantity} className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl disabled:opacity-50">{editId ? '수정하기' : '등록하기'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
