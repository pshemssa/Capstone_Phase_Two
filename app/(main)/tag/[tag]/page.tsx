import { Metadata } from "next";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import PostCard from "../../../components/post/PostCard";
import { Badge } from "@/components/ui/badge";
import { Tag as TagIcon } from "lucide-react";

async function getPostsByTag(tag: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/post?tag=${tag}&limit=20`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return { posts: [], total: 0 };
    }

    const result = await response.json();
    return { posts: result.data || [], total: result.pagination?.total || 0 };
  } catch (error) {
    return { posts: [], total: 0 };
  }
}

export async function generateMetadata(
  context: { params: Promise<{ tag: string }> }
): Promise<Metadata> {
  const { tag } = await context.params;
  const formattedTag = decodeURIComponent(tag).replace(/-/g, " ");

  return {
    title: `${formattedTag} Stories | Lumen Yard`,
    description: `Read stories about ${formattedTag} on Lumen Yard`,
  };
}

export default async function TagPage(
  context: { params: Promise<{ tag: string }> }
) {
  const { tag } = await context.params;
  const tagSlug = decodeURIComponent(tag);
  const formattedTag = tagSlug.replace(/-/g, " ");
  const { posts, total } = await getPostsByTag(tagSlug);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
 
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tag Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <TagIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                {formattedTag}
              </h1>
              <p className="text-gray-600">
                {total} {total === 1 ? "story" : "stories"}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            #{tagSlug}
          </Badge>
        </div>

        {/* Posts */}
        <div className="space-y-8">
          {posts.length > 0 ? (
            posts.map((post: any) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
              <TagIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No stories yet
              </h3>
              <p className="text-gray-600">
                Be the first to write about {formattedTag}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}