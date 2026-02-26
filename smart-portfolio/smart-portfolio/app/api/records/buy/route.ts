
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const body = await req.json();
  const { data: record, error: recErr } = await supabaseAdmin.from('buy_records').insert(body).select().single();
  if (recErr) return NextResponse.json({ error: recErr.message }, { status: 500 });

  if (body.stock_id && body.type === 'averaging_down') {
    const { data: stock } = await supabaseAdmin.from('stocks').select('*').eq('id', body.stock_id).single();
    if (stock) {
      const totalCost = stock.avg_price * stock.quantity + body.buy_price * body.quantity;
      const totalQty = stock.quantity + body.quantity;
      const newAvg = totalCost / totalQty;
      await supabaseAdmin.from('stocks').update({ avg_price: newAvg, quantity: totalQty, updated_at: new Date().toISOString() }).eq('id', body.stock_id);
    }
  }
  return NextResponse.json(record);
}
