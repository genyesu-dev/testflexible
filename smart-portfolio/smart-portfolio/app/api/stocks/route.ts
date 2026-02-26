
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('stocks').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { count } = await supabaseAdmin.from('stocks').select('*', { count: 'exact', head: true });
  if ((count || 0) >= 15) return NextResponse.json({ error: '보유 종목은 최대 15개까지 등록할 수 있습니다.' }, { status: 400 });
  const { data, error } = await supabaseAdmin.from('stocks').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
