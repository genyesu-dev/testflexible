
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('watchlist').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { count } = await supabaseAdmin.from('watchlist').select('*', { count: 'exact', head: true });
  if ((count || 0) >= 20) return NextResponse.json({ error: '관심 종목은 최대 20개까지 등록할 수 있습니다.' }, { status: 400 });
  const { data, error } = await supabaseAdmin.from('watchlist').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
