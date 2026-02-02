import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createPost, updatePost, deletePost, getAllPostsAdmin, getPostById } from '@/lib/posts';

async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const post = await getPostById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  }

  const posts = await getAllPostsAdmin();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const post = await createPost(body);

  if (!post) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }

  return NextResponse.json(post);
}

export async function PUT(request: Request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const post = await updatePost(body);

  if (!post) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }

  return NextResponse.json(post);
}

export async function DELETE(request: Request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
  }

  const success = await deletePost(id);

  if (!success) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
