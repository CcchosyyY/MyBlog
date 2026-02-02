import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey);
  return supabaseInstance;
}

export const supabase = {
  get client() {
    return getSupabase();
  }
};

export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  description: string | null;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  suggested_category: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}
