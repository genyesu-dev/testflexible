
export interface Stock {
  id: string;
  symbol: string;
  name: string;
  market: 'KR' | 'US';
  avg_price: number;
  quantity: number;
  buy_date?: string;
  memo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  market: 'KR' | 'US';
  target_price?: number;
  category: 'buy_interest' | 'monitoring';
  memo?: string;
  tags: string[];
  created_at?: string;
}

export interface SellRecord {
  stock_id?: string;
  symbol: string;
  name: string;
  sell_price: number;
  quantity: number;
  profit: number;
  profit_rate: number;
  sell_date: string;
}

export interface BuyRecord {
  stock_id?: string;
  symbol: string;
  name: string;
  buy_price: number;
  quantity: number;
  type: 'new_buy' | 'averaging_down';
  buy_date: string;
}

export interface Settings {
  daily_sell_target: number;
  min_sell_profit_rate: number;
  stop_loss_rate: number;
  sell_w_peak: number;
  sell_w_profit: number;
  sell_w_rsi: number;
  sell_w_trend: number;
  avg_w_mcap_trend: number;
  avg_w_mcap_stability: number;
  avg_w_sector: number;
  avg_w_flow: number;
  avg_w_technical: number;
  buy_w_target_gap: number;
  buy_w_mcap_trend: number;
  buy_w_mcap_stability: number;
  buy_w_rsi: number;
  buy_w_sector: number;
  buy_w_flow: number;
}

export interface MarketData {
  currentPrice: number;
  previousClose: number;
  changeRate: number;
  high52w: number;
  low52w: number;
  volume: number;
  marketCap: number;
  history: DayCandle[];
  mcapHistory: { date: string; mcap: number }[];
  sectorName: string;
  sectorReturn20d: number;
  foreignNetBuy5d: number;
  instNetBuy5d: number;
}

export interface DayCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ScoreBreakdown {
  name: string;
  weight: number;
  score: number;
  maxScore: number;
  detail: string;
  color: string;
}

export interface ScoredStock extends Stock {
  currentPrice: number;
  profitRate: number;
  profitAmount: number;
  totalScore: number;
  breakdown: ScoreBreakdown[];
  sellQty?: number;
  sellAmount?: number;
  expectedProfit?: number;
  status?: string;
  high52w?: number;
  rsi?: number;
}

export interface ScoredWatchItem extends WatchlistItem {
  currentPrice: number;
  changeRate: number;
  gapRate: number;
  totalScore: number;
  breakdown: ScoreBreakdown[];
  signal: string;
}
