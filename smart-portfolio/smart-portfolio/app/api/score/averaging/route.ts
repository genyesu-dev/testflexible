
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchMarketData } from '@/lib/market/fetchData';
import { calcAveragingScore } from '@/lib/scoring/averagingScore';
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
        return calcAveragingScore(stock, s, md);
      })
    );

    const candidates = scored.filter(st => st.profitRate < 0).sort((a, b) => b.totalScore - a.totalScore);
    return NextResponse.json(candidates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
