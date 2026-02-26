
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchMarketData } from '@/lib/market/fetchData';
import { calcBuyScore } from '@/lib/scoring/buyScore';
import { Settings, WatchlistItem } from '@/types';

export async function GET() {
  try {
    const [{ data: items }, { data: settings }] = await Promise.all([
      supabaseAdmin.from('watchlist').select('*').eq('category', 'buy_interest'),
      supabaseAdmin.from('settings').select('*').eq('id', 1).single(),
    ]);
    if (!items || !settings) return NextResponse.json([]);
    const s = settings as Settings;

    const scored = await Promise.all(
      items.map(async (item: WatchlistItem) => {
        const md = await fetchMarketData(item.symbol, item.market);
        return calcBuyScore(item, s, md);
      })
    );

    return NextResponse.json(scored.sort((a, b) => b.totalScore - a.totalScore));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
