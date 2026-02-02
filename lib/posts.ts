import { getSupabase, Post } from './supabase';
import { CATEGORIES, getCategoryName } from './categories';

export { CATEGORIES, getCategoryName };
export type { CategoryId } from './categories';

export interface PostMeta {
  title: string;
  description: string;
  date: string;
  tags: string[];
  category: string;
  slug: string;
  readingTime: string;
}

export interface PostWithContent extends PostMeta {
  content: string;
}

function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

function mapPostToMeta(post: Post): PostMeta {
  return {
    title: post.title,
    description: post.description || '',
    date: post.published_at || post.created_at,
    tags: post.tags || [],
    category: post.category || 'daily',
    slug: post.slug,
    readingTime: calculateReadingTime(post.content),
  };
}

export async function getAllPosts(): Promise<PostMeta[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    return (data || []).map(mapPostToMeta);
  } catch (e) {
    console.error('Supabase not configured:', e);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<PostWithContent | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !data) {
      return null;
    }

    return {
      ...mapPostToMeta(data),
      content: data.content,
    };
  } catch (e) {
    console.error('Supabase not configured:', e);
    return null;
  }
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts();
  const tags = new Set<string>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
}

export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .contains('tags', [tag])
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts by tag:', error);
      return [];
    }

    return (data || []).map(mapPostToMeta);
  } catch (e) {
    console.error('Supabase not configured:', e);
    return [];
  }
}

export async function getPostsByCategory(categoryId: string): Promise<PostMeta[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .eq('category', categoryId)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts by category:', error);
      return [];
    }

    return (data || []).map(mapPostToMeta);
  } catch (e) {
    console.error('Supabase not configured:', e);
    return [];
  }
}

export async function getPostCountByCategory(): Promise<Record<string, number>> {
  const posts = await getAllPosts();
  const counts: Record<string, number> = {};

  CATEGORIES.forEach((cat) => {
    counts[cat.id] = 0;
  });

  posts.forEach((post) => {
    if (counts[post.category] !== undefined) {
      counts[post.category]++;
    }
  });

  return counts;
}

// Admin functions

export interface CreatePostInput {
  title: string;
  content: string;
  slug: string;
  description?: string;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  suggested_category?: string;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

export async function createPost(input: CreatePostInput): Promise<Post | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...input,
        published_at: input.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Supabase not configured:', e);
    return null;
  }
}

export async function updatePost(input: UpdatePostInput): Promise<Post | null> {
  try {
    const supabase = getSupabase();
    const { id, ...updateData } = input;

    // If status is changing to published, set published_at
    if (updateData.status === 'published') {
      const { data: existingPost } = await supabase
        .from('posts')
        .select('published_at')
        .eq('id', id)
        .single();

      if (!existingPost?.published_at) {
        (updateData as Record<string, unknown>).published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('posts')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Supabase not configured:', e);
    return null;
  }
}

export async function deletePost(id: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Supabase not configured:', e);
    return false;
  }
}

export async function getDrafts(): Promise<Post[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'draft')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching drafts:', error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('Supabase not configured:', e);
    return [];
  }
}

export async function getAllPostsAdmin(): Promise<Post[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching all posts:', error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('Supabase not configured:', e);
    return [];
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching post by id:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Supabase not configured:', e);
    return null;
  }
}
