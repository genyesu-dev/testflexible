
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const body = await req.json();
  const { data: record, error: recErr } = await supabaseAdmin.from('sell_records').insert(body).select().single();
  if (recErr) return NextResponse.json({ error: recErr.message }, { status: 500 });

  if (body.stock_id) {
    const { data: stock } = await supabaseAdmin.from('stocks').select('*').eq('id', body.stock_id).single();
    if (stock) {
      const newQty = stock.quantity - body.quantity;
      if (newQty <= 0) {
        await supabaseAdmin.from('stocks').delete().eq('id', body.stock_id);
      } else {
        await supabaseAdmin.from('stocks').update({ quantity: newQty, updated_at: new Date().toISOString() }).eq('id', body.stock_id);
      }
    }
  }
  return NextResponse.json(record);
}
