
import { Stock, Settings, MarketData, ScoredStock, ScoreBreakdown } from '@/types';
import { calcRSI, calcMA } from '@/lib/market/indicators';

export function calcSellScore(stock: Stock, settings: Settings, md: MarketData): ScoredStock {
  const currentPrice = md.currentPrice;
  const profitRate = ((currentPrice - stock.avg_price) / stock.avg_price) * 100;
  const profitAmount = (currentPrice - stock.avg_price) * stock.quantity;
  const closes = md.history.map(h => h.close);

  // 1. 고점 근접도
  const peakPct = md.high52w > 0 ? (currentPrice / md.high52w) * 100 : 50;
  const peakScore = Math.min(peakPct, 100);
  const peakMax = settings.sell_w_peak;
  const peakWeighted = (peakScore / 100) * peakMax;

  // 2. 수익률 점수
  const profitScore = Math.min(Math.max((profitRate - settings.min_sell_profit_rate) / 25, 0), 1) * 100;
  const profitMax = settings.sell_w_profit;
  const profitWeighted = (profitScore / 100) * profitMax;

  // 3. RSI
  const rsi = calcRSI(closes);
  const rsiScore = rsi > 70 ? Math.min((rsi - 70) / 30, 1) * 100 : 0;
  const rsiMax = settings.sell_w_rsi;
  const rsiWeighted = (rsiScore / 100) * rsiMax;

  // 4. 추세 약화
  const ma5 = calcMA(closes, 5);
  const ma20 = calcMA(closes, 20);
  const trendScore = ma5 < ma20 ? 100 : ma5 < ma20 * 1.02 ? 50 : 0;
  const trendMax = settings.sell_w_trend;
  const trendWeighted = (trendScore / 100) * trendMax;

  const totalScore = Math.round(peakWeighted + profitWeighted + rsiWeighted + trendWeighted);

  const breakdown: ScoreBreakdown[] = [
    { name: '고점 근접도', weight: settings.sell_w_peak, score: Math.round(peakWeighted), maxScore: peakMax, detail: `현재가/고점 ${peakPct.toFixed(0)}%`, color: '#EF4444' },
    { name: '수익률', weight: settings.sell_w_profit, score: Math.round(profitWeighted), maxScore: profitMax, detail: `+${profitRate.toFixed(1)}%`, color: '#F59E0B' },
    { name: 'RSI 과매수', weight: settings.sell_w_rsi, score: Math.round(rsiWeighted), maxScore: rsiMax, detail: `RSI ${rsi.toFixed(0)}`, color: '#EF4444' },
    { name: '추세 약화', weight: settings.sell_w_trend, score: Math.round(trendWeighted), maxScore: trendMax, detail: ma5 < ma20 ? '5일선<20일선' : '상승 유지', color: '#F59E0B' },
  ];

  return {
    ...stock, currentPrice, profitRate, profitAmount, totalScore, breakdown,
    high52w: md.high52w, rsi,
    status: totalScore >= 90 ? '강력추천' : totalScore >= 70 ? '추천' : totalScore >= 50 ? '고려' : '보유',
  };
}

export function allocateSellAmounts(stocks: ScoredStock[], dailyTarget: number): ScoredStock[] {
  let remainingTarget = dailyTarget;

  return stocks.map((stock, idx) => {
    if (remainingTarget <= 0 || stock.profitRate <= 0) {
      return { ...stock, sellQty: 0, sellAmount: 0, expectedProfit: 0 };
    }

    const profitPerShare = stock.currentPrice - stock.avg_price;
    if (profitPerShare <= 0) return { ...stock, sellQty: 0, sellAmount: 0, expectedProfit: 0 };

    const ratio = stock.totalScore >= 90 ? 0.6 : stock.totalScore >= 70 ? 0.3 : 0.1;
    const targetProfit = Math.min(remainingTarget, dailyTarget * ratio);
    let sellQty = Math.min(Math.ceil(targetProfit / profitPerShare), stock.quantity);
    const expectedProfit = sellQty * profitPerShare;
    const sellAmount = sellQty * stock.currentPrice;

    remainingTarget -= expectedProfit;

    return { ...stock, sellQty, sellAmount, expectedProfit };
  });
}
