import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { getAllPosts } from '@/lib/posts';

export default async function Home() {
  const allPosts = await getAllPosts();
  const recentPosts = allPosts.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          안녕하세요!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          여러 일들의 과정이나 내가 했던 일들을 정리하는 공간입니다.
          <br />
          개발, 일상, 그리고 배움의 기록을 남깁니다.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/blog"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            블로그 보기
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            소개
          </Link>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            최근 글
          </h2>
          <Link
            href="/blog"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            모든 글 보기 &rarr;
          </Link>
        </div>
        {recentPosts.length > 0 ? (
          <div className="grid gap-6">
            {recentPosts.map((post) => (
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
              아직 작성된 글이 없습니다.
            </p>
          </div>
        )}
      </section>

      {/* Profile Section */}
      <section className="py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            M
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Blog Owner
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              개발과 일상을 기록하는 블로거입니다.
              <br />
              새로운 것을 배우고 공유하는 것을 좋아합니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
