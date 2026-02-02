import {
  getPostsByCategory,
  getCategoryName,
  CATEGORIES,
  getAllPosts,
} from '@/lib/posts';
import PostCard from '@/components/PostCard';
import { notFound } from 'next/navigation';
import SearchBar from '@/components/SearchBar';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.id }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const categoryName = getCategoryName(category);
  return {
    title: `${categoryName} - MyBlog`,
    description: `${categoryName} 카테고리의 글 목록`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const validCategory = CATEGORIES.find((c) => c.id === category);

  if (!validCategory) {
    notFound();
  }

  const posts = await getPostsByCategory(category);
  const categoryName = getCategoryName(category);
  const allPosts = await getAllPosts();

  const searchPosts = allPosts.map((post) => ({
    title: post.title,
    description: post.description,
    slug: post.slug,
    date: post.date,
  }));

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {categoryName}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {posts.length}개의 글이 있습니다.
        </p>
        <SearchBar posts={searchPosts} />
      </header>

      {/* Posts */}
      {posts.length > 0 ? (
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
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            이 카테고리에 작성된 글이 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
