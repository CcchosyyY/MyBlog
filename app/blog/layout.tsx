import { getPostCountByCategory } from '@/lib/posts';
import CategorySidebar from '@/components/CategorySidebar';

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const postCounts = await getPostCountByCategory();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <CategorySidebar postCounts={postCounts} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
