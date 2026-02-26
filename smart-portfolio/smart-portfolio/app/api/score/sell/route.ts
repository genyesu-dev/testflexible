
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchMarketData } from '@/lib/market/fetchData';
import { calcSellScore, allocateSellAmounts } from '@/lib/scoring/sellScore';
import { Settings, Stock } from '@/types';

export async function GET() {
  try {
    const [{ data: stocks }, { data: settings }] = await Promise.all([
      supabaseAdmin.from('stocks').select('*'),
      supabaseAdmin.from('settings').select('*').eq('id', 1).single(),
    ]);
    if (!stocks || !settings) return NextResponse.json([]);
    const s = settings as Settings;

    const scored = await Promise.all(
      stocks.map(async (stock: Stock) => {
        const md = await fetchMarketData(stock.symbol, stock.market);
        return calcSellScore(stock, s, md);
      })
    );

    const sellCandidates = scored
      .filter(st => st.profitRate >= s.min_sell_profit_rate)
      .sort((a, b) => b.totalScore - a.totalScore);

    const allocated = allocateSellAmounts(sellCandidates, s.daily_sell_target);
    return NextResponse.json(allocated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
