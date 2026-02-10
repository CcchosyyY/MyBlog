import { NextResponse } from 'next/server';
import { createPost, updatePost, deletePost, getAllPostsAdmin, getPostById } from '@/lib/posts';
import { isAuthenticated } from '@/lib/auth';
import { CATEGORIES } from '@/lib/categories';

const VALID_CATEGORY_IDS = CATEGORIES.map((c) => c.id as string);
const VALID_STATUSES = ['draft', 'published'];
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateCreatePost(body: Record<string, unknown>): string | null {
  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    return 'title is required and must be a non-empty string';
  }
  if (!body.slug || typeof body.slug !== 'string' || !SLUG_REGEX.test(body.slug)) {
    return 'slug is required and must be URL-safe (lowercase letters, numbers, hyphens)';
  }
  if (!body.content || typeof body.content !== 'string' || body.content.trim() === '') {
    return 'content is required and must be a non-empty string';
  }
  if (body.category !== undefined && !VALID_CATEGORY_IDS.includes(body.category as string)) {
    return `category must be one of: ${VALID_CATEGORY_IDS.join(', ')}`;
  }
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status as string)) {
    return 'status must be "draft" or "published"';
  }
  if (body.tags !== undefined && (!Array.isArray(body.tags) || !body.tags.every((t: unknown) => typeof t === 'string'))) {
    return 'tags must be an array of strings';
  }
  return null;
}

function validateUpdatePost(body: Record<string, unknown>): string | null {
  if (!body.id || typeof body.id !== 'string' || body.id.trim() === '') {
    return 'id is required';
  }
  if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim() === '')) {
    return 'title must be a non-empty string';
  }
  if (body.slug !== undefined && (typeof body.slug !== 'string' || !SLUG_REGEX.test(body.slug))) {
    return 'slug must be URL-safe (lowercase letters, numbers, hyphens)';
  }
  if (body.content !== undefined && (typeof body.content !== 'string' || body.content.trim() === '')) {
    return 'content must be a non-empty string';
  }
  if (body.category !== undefined && !VALID_CATEGORY_IDS.includes(body.category as string)) {
    return `category must be one of: ${VALID_CATEGORY_IDS.join(', ')}`;
  }
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status as string)) {
    return 'status must be "draft" or "published"';
  }
  if (body.tags !== undefined && (!Array.isArray(body.tags) || !body.tags.every((t: unknown) => typeof t === 'string'))) {
    return 'tags must be an array of strings';
  }
  return null;
}

export async function GET(request: Request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validationError = validateCreatePost(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validationError = validateUpdatePost(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

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
