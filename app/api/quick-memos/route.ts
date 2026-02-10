import { NextResponse } from 'next/server';
import { getQuickMemos, createQuickMemo, deleteQuickMemo } from '@/lib/quick-memos';
import { isAuthenticated } from '@/lib/auth';

const LIMIT_DEFAULT = 10;
const LIMIT_MIN = 1;
const LIMIT_MAX = 50;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = parseInt(searchParams.get('limit') || String(LIMIT_DEFAULT), 10);
  const limit = Math.min(Math.max(parsed || LIMIT_DEFAULT, LIMIT_MIN), LIMIT_MAX);

  const memos = await getQuickMemos(limit);
  return NextResponse.json(memos);
}

export async function POST(request: Request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { content } = body;

  if (!content || typeof content !== 'string' || content.trim() === '') {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  const memo = await createQuickMemo(content.trim());

  if (!memo) {
    return NextResponse.json({ error: 'Failed to create memo' }, { status: 500 });
  }

  return NextResponse.json(memo);
}

export async function DELETE(request: Request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Memo ID required' }, { status: 400 });
  }

  const success = await deleteQuickMemo(id);

  if (!success) {
    return NextResponse.json({ error: 'Failed to delete memo' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
