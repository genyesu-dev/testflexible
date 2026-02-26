
import { NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';

export async function POST(req: Request) {
  const { password } = await req.json();
  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: '비밀번호가 틀렸습니다.' }, { status: 401 });
  }
  const token = await createToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set('auth-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
  return response;
}
