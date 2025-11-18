import Link from "next/link";

interface StaffPick {
  id: string;
  title: string;
  slug: string;
  author: {
    name: string;
    username: string;
  };
}

interface SidebarProps {
  trendingTags?: string[];
  staffPicks?: StaffPick[];
}

export default function Sidebar({ trendingTags = [], staffPicks = [] }: SidebarProps) {
  const defaultTags = [
    "JavaScript",
    "React",
    "Next.js",
    "TypeScript",
    "Web Development",
    "AI",
    "Design",
  ];

  const tags = trendingTags.length > 0 ? trendingTags : defaultTags;

  return (
    <div className="hidden lg:block">
      <div className="sticky top-20">
        {/* Trending Tags */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-sm font-semibold mb-4 text-gray-900">
            Discover more of what matters to you
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium border border-yellow-200 transition"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Staff Picks */}
        {staffPicks.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold mb-4 text-gray-900">Staff Picks</h3>
            <div className="space-y-4">
              {staffPicks.map((post) => (
                <div
                  key={post.id}
                  className="cursor-pointer hover:opacity-75 transition pb-4 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white text-xs">
                      {post.author.name.substring(0, 2).toUpperCase()}
                    </div>
                    <Link
                      href={`/`}
                      className="text-xs font-medium text-gray-700 hover:text-yellow-700 transition"
                    >
                      {post.author.name}
                    </Link>
                  </div>
                  <Link href={`/`}>
                    <h4 className="text-sm font-semibold line-clamp-2 mb-1 text-gray-900 hover:text-yellow-700 transition">
                      {post.title}
                    </h4>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}