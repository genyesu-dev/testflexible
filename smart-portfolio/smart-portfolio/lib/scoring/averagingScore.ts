
import { Stock, Settings, MarketData, ScoredStock, ScoreBreakdown } from '@/types';
import { calcRSI, calcMA, calcStdDev } from '@/lib/market/indicators';

export function calcAveragingScore(stock: Stock, settings: Settings, md: MarketData): ScoredStock {
  const currentPrice = md.currentPrice;
  const profitRate = ((currentPrice - stock.avg_price) / stock.avg_price) * 100;
  const profitAmount = (currentPrice - stock.avg_price) * stock.quantity;
  const closes = md.history.map(h => h.close);

  // 1. 시총 추세
  const mcaps = md.mcapHistory.map(m => m.mcap);
  let mcapTrendRate = 0;
  if (mcaps.length >= 5) {
    const recent = calcMA(mcaps.slice(-5), 5);
    const prev = calcMA(mcaps.slice(-10, -5), 5);
    mcapTrendRate = prev > 0 ? ((recent - prev) / prev) * 100 : 0;
  }
  const mcapTrendScore = Math.min(Math.max(mcapTrendRate * 15 + 50, 0), 100);
  const mcapTrendMax = settings.avg_w_mcap_trend;
  const mcapTrendWeighted = (mcapTrendScore / 100) * mcapTrendMax;

  // 2. 시총 안정성
  const mcapStd = calcStdDev(mcaps);
  const mcapMean = mcaps.length > 0 ? mcaps.reduce((a, b) => a + b, 0) / mcaps.length : 1;
  const cv = mcapMean > 0 ? mcapStd / mcapMean : 0;
  const stabilityScore = Math.max(0, (1 - cv * 20)) * 100;
  const stabilityMax = settings.avg_w_mcap_stability;
  const stabilityWeighted = (Math.min(stabilityScore, 100) / 100) * stabilityMax;

  // 3. 업종 모멘텀
  const sectorScore = Math.min(Math.max(md.sectorReturn20d * 10 + 50, 0), 100);
  const sectorMax = settings.avg_w_sector;
  const sectorWeighted = (sectorScore / 100) * sectorMax;

  // 4. 수급
  const netBuy = md.foreignNetBuy5d + md.instNetBuy5d;
  const flowScore = netBuy > 0 ? Math.min(70 + netBuy / 1e10 * 30, 100) : Math.max(30 + netBuy / 1e10 * 30, 0);
  const flowMax = settings.avg_w_flow;
  const flowWeighted = (flowScore / 100) * flowMax;

  // 5. 기술적 반등
  const rsi = calcRSI(closes);
  const rsiOversold = rsi < 30 ? (30 - rsi) / 30 * 100 : rsi < 40 ? 30 : 0;
  const technicalScore = Math.min(rsiOversold, 100);
  const techMax = settings.avg_w_technical;
  const techWeighted = (technicalScore / 100) * techMax;

  const totalScore = Math.round(mcapTrendWeighted + stabilityWeighted + sectorWeighted + flowWeighted + techWeighted);

  const breakdown: ScoreBreakdown[] = [
    { name: '시총 추세', weight: settings.avg_w_mcap_trend, score: Math.round(mcapTrendWeighted), maxScore: mcapTrendMax, detail: `${mcapTrendRate >= 0 ? '+' : ''}${mcapTrendRate.toFixed(1)}%`, color: '#22C55E' },
    { name: '시총 안정성', weight: settings.avg_w_mcap_stability, score: Math.round(stabilityWeighted), maxScore: stabilityMax, detail: cv < 0.02 ? '낮음(안정)' : cv < 0.05 ? '중간' : '높음', color: '#22C55E' },
    { name: '업종 모멘텀', weight: settings.avg_w_sector, score: Math.round(sectorWeighted), maxScore: sectorMax, detail: md.sectorName || '업종', color: '#3B82F6' },
    { name: '수급', weight: settings.avg_w_flow, score: Math.round(flowWeighted), maxScore: flowMax, detail: netBuy > 0 ? '순매수' : '순매도', color: '#8B5CF6' },
    { name: '기술적 반등', weight: settings.avg_w_technical, score: Math.round(techWeighted), maxScore: techMax, detail: `RSI ${rsi.toFixed(0)}`, color: '#F59E0B' },
  ];

  return { ...stock, currentPrice, profitRate, profitAmount, totalScore, breakdown, rsi };
}
