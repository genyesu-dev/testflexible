
import { WatchlistItem, Settings, MarketData, ScoredWatchItem, ScoreBreakdown } from '@/types';
import { calcRSI, calcMA, calcStdDev } from '@/lib/market/indicators';

export function calcBuyScore(item: WatchlistItem, settings: Settings, md: MarketData): ScoredWatchItem {
  const currentPrice = md.currentPrice;
  const targetPrice = item.target_price || currentPrice;
  const gapRate = targetPrice > 0 ? ((currentPrice - targetPrice) / targetPrice) * 100 : 0;
  const closes = md.history.map(h => h.close);

  // 1. 목표가 근접도
  const tgScore = gapRate <= 0 ? 100 : Math.max(0, 100 - gapRate * 5);
  const tgMax = settings.buy_w_target_gap;
  const tgWeighted = (tgScore / 100) * tgMax;

  // 2. 시총 추세
  const mcaps = md.mcapHistory.map(m => m.mcap);
  let mcapRate = 0;
  if (mcaps.length >= 5) {
    const r = calcMA(mcaps.slice(-5), 5);
    const p = calcMA(mcaps.slice(-10, -5).length > 0 ? mcaps.slice(-10, -5) : mcaps.slice(0, 5), 5);
    mcapRate = p > 0 ? ((r - p) / p) * 100 : 0;
  }
  const mcapScore = Math.min(Math.max(mcapRate * 15 + 50, 0), 100);
  const mcapMax = settings.buy_w_mcap_trend;
  const mcapWeighted = (mcapScore / 100) * mcapMax;

  // 3. 시총 안정성
  const mcapStd = calcStdDev(mcaps);
  const mcapMean = mcaps.length > 0 ? mcaps.reduce((a, b) => a + b, 0) / mcaps.length : 1;
  const cv = mcapMean > 0 ? mcapStd / mcapMean : 0;
  const stabScore = Math.max(0, Math.min((1 - cv * 20) * 100, 100));
  const stabMax = settings.buy_w_mcap_stability;
  const stabWeighted = (stabScore / 100) * stabMax;

  // 4. RSI
  const rsi = calcRSI(closes);
  const rsiScore = rsi < 30 ? 100 : rsi < 40 ? 70 : rsi < 50 ? 40 : 0;
  const rsiMax = settings.buy_w_rsi;
  const rsiWeighted = (rsiScore / 100) * rsiMax;

  // 5. 업종
  const secScore = Math.min(Math.max(md.sectorReturn20d * 10 + 50, 0), 100);
  const secMax = settings.buy_w_sector;
  const secWeighted = (secScore / 100) * secMax;

  // 6. 수급
  const net = md.foreignNetBuy5d + md.instNetBuy5d;
  const flowScore = net > 0 ? Math.min(70 + net / 1e10 * 30, 100) : Math.max(30, 0);
  const flowMax = settings.buy_w_flow;
  const flowWeighted = (flowScore / 100) * flowMax;

  const totalScore = Math.round(tgWeighted + mcapWeighted + stabWeighted + rsiWeighted + secWeighted + flowWeighted);

  const signal = totalScore >= 80 ? '매수 근접!' : totalScore >= 60 ? '관심' : gapRate <= 5 ? '근접' : '대기';

  const breakdown: ScoreBreakdown[] = [
    { name: '목표가 근접도', weight: settings.buy_w_target_gap, score: Math.round(tgWeighted), maxScore: tgMax, detail: `괴리 ${gapRate >= 0 ? '+' : ''}${gapRate.toFixed(1)}%`, color: '#8B5CF6' },
    { name: '시총 추세', weight: settings.buy_w_mcap_trend, score: Math.round(mcapWeighted), maxScore: mcapMax, detail: `${mcapRate >= 0 ? '+' : ''}${mcapRate.toFixed(1)}%`, color: '#22C55E' },
    { name: '시총 안정성', weight: settings.buy_w_mcap_stability, score: Math.round(stabWeighted), maxScore: stabMax, detail: cv < 0.02 ? '안정' : '보통', color: '#22C55E' },
    { name: 'RSI', weight: settings.buy_w_rsi, score: Math.round(rsiWeighted), maxScore: rsiMax, detail: `RSI ${rsi.toFixed(0)}`, color: '#F59E0B' },
    { name: '업종', weight: settings.buy_w_sector, score: Math.round(secWeighted), maxScore: secMax, detail: md.sectorName || '-', color: '#3B82F6' },
    { name: '수급', weight: settings.buy_w_flow, score: Math.round(flowWeighted), maxScore: flowMax, detail: net > 0 ? '순매수' : '-', color: '#8B5CF6' },
  ];

  return {
    ...item, currentPrice, changeRate: md.changeRate, gapRate, totalScore, breakdown, signal,
  };
}
