import { getPostsByTag, getAllTags } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `#${decodedTag} - MyBlog`,
    description: `${decodedTag} 태그가 있는 글 목록`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = await getPostsByTag(decodedTag);
  const allTags = await getAllTags();

  if (posts.length === 0 && !allTags.includes(decodedTag)) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <Link
          href="/blog"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          &larr; 전체 글 보기
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          #{decodedTag}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {posts.length}개의 글
        </p>
      </header>

      {/* Other Tags */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {allTags.map((t) => (
            <Link
              key={t}
              href={`/blog/tag/${t}`}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                t === decodedTag
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              #{t}
            </Link>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="grid gap-6">
        {posts.map((post) => (
          <PostCard
            key={post.slug}
            title={post.title}
            description={post.description}
            date={post.date}
            slug={post.slug}
            tags={post.tags}
          />
        ))}
      </div>
    </div>
  );
}
