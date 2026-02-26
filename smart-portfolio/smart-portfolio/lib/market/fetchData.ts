
import { MarketData, DayCandle } from '@/types';

const cache = new Map<string, { data: any; expiry: number }>();

function getCached(key: string, ttlMs: number): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) return entry.data;
  return null;
}

function setCache(key: string, data: any, ttlMs: number) {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

// 한국 주식 데이터 (Naver Finance)
async function fetchKRStock(symbol: string): Promise<MarketData> {
  const cacheKey = `kr_${symbol}`;
  const cached = getCached(cacheKey, 5 * 60 * 1000);
  if (cached) return cached;

  try {
    // 현재가 + 기본 정보
    const res = await fetch(
      `https://m.stock.naver.com/api/stock/${symbol}/basic`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 300 } }
    );
    const basic = await res.json();

    // 일봉 데이터
    const now = new Date();
    const start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const chartRes = await fetch(
      `https://m.stock.naver.com/api/stock/${symbol}/chart?chartType=day&range=1y`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 3600 } }
    );

    let history: DayCandle[] = [];
    let high52w = 0, low52w = Infinity;

    try {
      const chartData = await chartRes.json();
      if (Array.isArray(chartData)) {
        history = chartData.map((d: any) => ({
          date: d.localDate || d.dt || '',
          open: Number(d.openPrice || d.o || 0),
          high: Number(d.highPrice || d.h || 0),
          low: Number(d.lowPrice || d.l || 0),
          close: Number(d.closePrice || d.c || 0),
          volume: Number(d.accumulatedTradingVolume || d.v || 0),
        }));
        high52w = Math.max(...history.map(h => h.high));
        low52w = Math.min(...history.map(h => h.low));
      }
    } catch {}

    const currentPrice = Number(basic?.closePrice || basic?.currentPrice || 0);
    const previousClose = Number(basic?.previousClosePrice || basic?.prevClose || 0);

    const data: MarketData = {
      currentPrice,
      previousClose,
      changeRate: previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0,
      high52w: high52w || currentPrice * 1.1,
      low52w: low52w || currentPrice * 0.9,
      volume: Number(basic?.accumulatedTradingVolume || 0),
      marketCap: Number(basic?.marketCap || 0),
      history,
      mcapHistory: [],
      sectorName: basic?.sectorName || '',
      sectorReturn20d: 0,
      foreignNetBuy5d: 0,
      instNetBuy5d: 0,
    };

    setCache(cacheKey, data, 5 * 60 * 1000);
    return data;
  } catch (error) {
    console.error(`KR stock fetch error for ${symbol}:`, error);
    return getDefaultMarketData();
  }
}

// 미국 주식 데이터 (Yahoo Finance)
async function fetchUSStock(symbol: string): Promise<MarketData> {
  const cacheKey = `us_${symbol}`;
  const cached = getCached(cacheKey, 5 * 60 * 1000);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1y&interval=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 300 } }
    );
    const json = await res.json();
    const result = json?.chart?.result?.[0];

    if (!result) return getDefaultMarketData();

    const meta = result.meta;
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};

    const history: DayCandle[] = timestamps.map((t: number, i: number) => ({
      date: new Date(t * 1000).toISOString().split('T')[0],
      open: quotes.open?.[i] || 0,
      high: quotes.high?.[i] || 0,
      low: quotes.low?.[i] || 0,
      close: quotes.close?.[i] || 0,
      volume: quotes.volume?.[i] || 0,
    })).filter((d: DayCandle) => d.close > 0);

    const closes = history.map(h => h.close);
    const highs = history.map(h => h.high);
    const lows = history.map(h => h.low);

    const data: MarketData = {
      currentPrice: meta.regularMarketPrice || closes[closes.length - 1] || 0,
      previousClose: meta.chartPreviousClose || meta.previousClose || 0,
      changeRate: meta.chartPreviousClose ? 
        ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100 : 0,
      high52w: Math.max(...highs.slice(-252)),
      low52w: Math.min(...lows.slice(-252).filter(l => l > 0)),
      volume: quotes.volume?.[timestamps.length - 1] || 0,
      marketCap: meta.marketCap || 0,
      history,
      mcapHistory: history.slice(-20).map(h => ({ date: h.date, mcap: (meta.marketCap || 0) * (h.close / closes[closes.length - 1]) })),
      sectorName: '',
      sectorReturn20d: 0,
      foreignNetBuy5d: 0,
      instNetBuy5d: 0,
    };

    setCache(cacheKey, data, 5 * 60 * 1000);
    return data;
  } catch (error) {
    console.error(`US stock fetch error for ${symbol}:`, error);
    return getDefaultMarketData();
  }
}

function getDefaultMarketData(): MarketData {
  return {
    currentPrice: 0, previousClose: 0, changeRate: 0,
    high52w: 0, low52w: 0, volume: 0, marketCap: 0,
    history: [], mcapHistory: [],
    sectorName: '', sectorReturn20d: 0,
    foreignNetBuy5d: 0, instNetBuy5d: 0,
  };
}

export async function fetchMarketData(symbol: string, market: 'KR' | 'US'): Promise<MarketData> {
  if (market === 'KR') return fetchKRStock(symbol);
  return fetchUSStock(symbol);
}
