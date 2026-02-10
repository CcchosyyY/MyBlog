import { NextResponse } from 'next/server';
import { createSession, setSessionCookie, deleteSession } from '@/lib/auth';

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { password } = body;

  if (password === process.env.ADMIN_PASSWORD) {
    const token = await createSession();
    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: '비밀번호가 틀렸습니다.' }, { status: 401 });
}

export async function DELETE() {
  await deleteSession();
  return NextResponse.json({ success: true });
}
