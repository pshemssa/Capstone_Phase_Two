import { Suspense } from "react";
import Header from "./components/layout/Header";
import Navigation from "./components/layout/Navigation";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";
import PostCard from "./components/post/PostCard";
import { Button } from "../components/ui/button";
import { Post } from "./types";
import { prisma } from "./lib/prisma";

// Fetch published posts from the database and map to UI-friendly shape
async function getPosts(limit: number = 10): Promise<Post[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, username: true, image: true },
        },
        tags: { select: { name: true, slug: true } },
        _count: { select: { likes: true, comments: true } },
      },
      take: limit,
    });

  return posts.map((post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: undefined,
    excerpt: post.excerpt || "",
    coverImage: post.coverImage || null,
    published: post.published,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    readTime: post.readTime ?? 0,
    authorId: post.authorId,
    author: {
      id: post.author.id,
      name: post.author.name ?? "Anonymous",
      username: post.author.username,
      image: post.author.image ?? null,
    },
    tags: post.tags.map((t: any) => t.name),
    _count: post._count,
  }));
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    // Return empty array on error instead of crashing
    return [];
  }
}

async function getTrendingTags(): Promise<string[]> {
  const tags = await prisma.tag.findMany({
    select: { name: true },
    orderBy: { posts: { _count: "desc" } },
    take: 10,
  });

  return tags.map((t) => t.name);
}

async function getStaffPicks() {
  const posts = await getPosts();
  return posts.slice(0, 3).map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    author: {
      name: post.author.name,
      username: post.author.username,
    },
  }));
}

function PostsLoading() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 animate-pulse"
        >
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      ))}
    </div>
  );
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function HomePage() {
  const posts = await getPosts(10);
  const trendingTags = await getTrendingTags();
  const staffPicks = await getStaffPicks();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      <main className="app-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts Feed */}
          <div className="lg:col-span-2 space-y-8">
            <Suspense fallback={<PostsLoading />}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </Suspense>

            <div className="flex justify-center">
              <Button variant="secondary" size="lg">
                Load more stories
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <Sidebar trendingTags={trendingTags} staffPicks={staffPicks} />
        </div>
      </main>

      <Footer />
    </div>
  );
}