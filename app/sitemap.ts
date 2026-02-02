import { MetadataRoute } from 'next';
import { getAllPosts, getAllTags } from '@/lib/posts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://myblog.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const tags = await getAllTags();

  const postUrls = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const tagUrls = tags.map((tag) => ({
    url: `${SITE_URL}/blog/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...postUrls,
    ...tagUrls,
  ];
}
