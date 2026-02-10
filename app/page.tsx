import Link from 'next/link';
import PostCard from '@/components/PostCard';
import CategorySidebar from '@/components/CategorySidebar';

import { getAllPosts, getPostCountByCategory } from '@/lib/posts';

export default async function Home() {
  const allPosts = await getAllPosts();
  const postCounts = await getPostCountByCategory();
  const recentPosts = allPosts.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-center">
        {/* Category Sidebar - Left of main content */}
        <div className="hidden lg:block w-48 shrink-0 mr-12">
          <div className="sticky top-24">
            <CategorySidebar postCounts={postCounts} />
          </div>
        </div>

        {/* Main Content - Centered */}
        <div className="w-full max-w-2xl">
          {/* Hero Section */}
          <section className="text-center py-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-light mb-4">
              안녕하세요!
            </h1>
            <p className="text-xl text-light/70 mb-8 max-w-2xl mx-auto">
              여러 일들의 과정이나 내가 했던 일들을 정리하는 공간입니다.
              <br />
              개발, 일상, 그리고 배움의 기록을 남깁니다.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/blog"
                className="px-6 py-3 bg-teal text-light rounded-lg hover:bg-teal/80 transition-colors font-medium"
              >
                블로그 보기
              </Link>
              <Link
                href="/about"
                className="px-6 py-3 border border-rose text-rose rounded-lg hover:bg-rose/10 transition-colors font-medium"
              >
                소개
              </Link>
            </div>
          </section>

          {/* Recent Posts */}
          <section className="py-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-light">
                최근 글
              </h2>
              <Link
                href="/blog"
                className="text-teal hover:text-rose transition-colors"
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
                <p className="text-light/50">
                  아직 작성된 글이 없습니다.
                </p>
              </div>
            )}
          </section>

          {/* Profile Section */}
          <section className="py-8 border-t border-light/10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal to-rose flex items-center justify-center text-light text-3xl font-bold">
                M
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-semibold text-light">
                  Blog Owner
                </h3>
                <p className="text-light/70 mt-2">
                  개발과 일상을 기록하는 블로거입니다.
                  <br />
                  새로운 것을 배우고 공유하는 것을 좋아합니다.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right sidebar - Write button */}
        <div className="hidden lg:block w-48 shrink-0 ml-12">
          <div className="sticky top-24 space-y-4">
            <Link
              href="/admin/write"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-teal text-light rounded-lg hover:bg-teal/80 transition-colors font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              글쓰기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
