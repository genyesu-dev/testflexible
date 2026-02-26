
'use client';
import { useEffect, useState } from 'react';
import { Settings } from '@/types';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DEFAULT: Settings = { daily_sell_target:200000, min_sell_profit_rate:5, stop_loss_rate:-15, sell_w_peak:40, sell_w_profit:30, sell_w_rsi:20, sell_w_trend:10, avg_w_mcap_trend:30, avg_w_mcap_stability:20, avg_w_sector:20, avg_w_flow:15, avg_w_technical:15, buy_w_target_gap:25, buy_w_mcap_trend:20, buy_w_mcap_stability:15, buy_w_rsi:15, buy_w_sector:15, buy_w_flow:10 };

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => { if (d && !d.error) setSettings(d); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const SliderRow = ({ label, value, field, color }: { label: string; value: number; field: keyof Settings; color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-bold" style={{ color }}>{value}%</span>
      </div>
      <input type="range" min="0" max="100" step="5" value={value}
        onChange={e => setSettings({ ...settings, [field]: Number(e.target.value) })}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: color }} />
    </div>
  );

  const sellSum = settings.sell_w_peak + settings.sell_w_profit + settings.sell_w_rsi + settings.sell_w_trend;
  const avgSum = settings.avg_w_mcap_trend + settings.avg_w_mcap_stability + settings.avg_w_sector + settings.avg_w_flow + settings.avg_w_technical;
  const buySum = settings.buy_w_target_gap + settings.buy_w_mcap_trend + settings.buy_w_mcap_stability + settings.buy_w_rsi + settings.buy_w_sector + settings.buy_w_flow;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/dashboard')} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">설정</h1>
      </div>

      <div className="bg-white rounded-2xl border p-4 space-y-4">
        <h3 className="font-bold">매도 원칙</h3>
        <div className="space-y-3">
          <div><label className="text-xs text-gray-500">일일 매도 목표 수익 (원)</label>
            <input type="number" value={settings.daily_sell_target} onChange={e => setSettings({...settings, daily_sell_target: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">최소 매도 수익률 (%)</label>
            <input type="number" value={settings.min_sell_profit_rate} onChange={e => setSettings({...settings, min_sell_profit_rate: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">손절 기준 (%)</label>
            <input type="number" value={settings.stop_loss_rate} onChange={e => setSettings({...settings, stop_loss_rate: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-4 space-y-3">
        <div className="flex justify-between"><h3 className="font-bold">매도 스코어 가중치</h3><button onClick={() => setSettings({...settings, sell_w_peak:40,sell_w_profit:30,sell_w_rsi:20,sell_w_trend:10})} className="text-xs text-blue-500">초기화</button></div>
        <SliderRow label="고점 근접도" value={settings.sell_w_peak} field="sell_w_peak" color="#EF4444" />
        <SliderRow label="수익률" value={settings.sell_w_profit} field="sell_w_profit" color="#F59E0B" />
        <SliderRow label="RSI 과매수" value={settings.sell_w_rsi} field="sell_w_rsi" color="#EF4444" />
        <SliderRow label="추세 약화" value={settings.sell_w_trend} field="sell_w_trend" color="#F59E0B" />
        <div className={`text-xs text-center font-medium ${sellSum === 100 ? 'text-green-500' : 'text-red-500'}`}>합계: {sellSum}% {sellSum === 100 ? '✓' : '(100% 필요)'}</div>
      </div>

      <div className="bg-white rounded-2xl border p-4 space-y-3">
        <div className="flex justify-between"><h3 className="font-bold">물타기 스코어 가중치</h3><button onClick={() => setSettings({...settings, avg_w_mcap_trend:30,avg_w_mcap_stability:20,avg_w_sector:20,avg_w_flow:15,avg_w_technical:15})} className="text-xs text-blue-500">초기화</button></div>
        <SliderRow label="시총 추세" value={settings.avg_w_mcap_trend} field="avg_w_mcap_trend" color="#22C55E" />
        <SliderRow label="시총 안정성" value={settings.avg_w_mcap_stability} field="avg_w_mcap_stability" color="#22C55E" />
        <SliderRow label="업종 모멘텀" value={settings.avg_w_sector} field="avg_w_sector" color="#3B82F6" />
        <SliderRow label="수급" value={settings.avg_w_flow} field="avg_w_flow" color="#8B5CF6" />
        <SliderRow label="기술적 반등" value={settings.avg_w_technical} field="avg_w_technical" color="#F59E0B" />
        <div className={`text-xs text-center font-medium ${avgSum === 100 ? 'text-green-500' : 'text-red-500'}`}>합계: {avgSum}% {avgSum === 100 ? '✓' : '(100% 필요)'}</div>
      </div>

      <div className="bg-white rounded-2xl border p-4 space-y-3">
        <div className="flex justify-between"><h3 className="font-bold">매수 스코어 가중치</h3><button onClick={() => setSettings({...settings, buy_w_target_gap:25,buy_w_mcap_trend:20,buy_w_mcap_stability:15,buy_w_rsi:15,buy_w_sector:15,buy_w_flow:10})} className="text-xs text-blue-500">초기화</button></div>
        <SliderRow label="목표가 근접도" value={settings.buy_w_target_gap} field="buy_w_target_gap" color="#8B5CF6" />
        <SliderRow label="시총 추세" value={settings.buy_w_mcap_trend} field="buy_w_mcap_trend" color="#22C55E" />
        <SliderRow label="시총 안정성" value={settings.buy_w_mcap_stability} field="buy_w_mcap_stability" color="#22C55E" />
        <SliderRow label="RSI" value={settings.buy_w_rsi} field="buy_w_rsi" color="#F59E0B" />
        <SliderRow label="업종" value={settings.buy_w_sector} field="buy_w_sector" color="#3B82F6" />
        <SliderRow label="수급" value={settings.buy_w_flow} field="buy_w_flow" color="#8B5CF6" />
        <div className={`text-xs text-center font-medium ${buySum === 100 ? 'text-green-500' : 'text-red-500'}`}>합계: {buySum}% {buySum === 100 ? '✓' : '(100% 필요)'}</div>
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
        {saved ? <><Save className="w-4 h-4" /> 저장 완료!</> : saving ? '저장 중...' : <><Save className="w-4 h-4" /> 설정 저장</>}
      </button>
    </div>
  );
}
