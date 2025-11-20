import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import Header from "../../components/layout/Header";
import Navigation from "../../components/layout/Navigation";
import Sidebar from "../../components/layout/Sidebar";
import Footer from "../../components/layout/Footer";
import PostCard from "../../components/post/PostCard";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { prisma } from "../../lib/prisma";

export const metadata: Metadata = {
  title: "Your Feed | Lumen Yard",
  description: "Read stories from writers you follow",
};

async function getFollowingPosts(session: any) {
  if (!session?.user) {
    return [];
  }

  // Get user ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return [];
  }

  // Get users that the current user follows
  const following = await prisma.follow.findMany({
    where: { followerId: user.id },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  // If not following anyone, show recent posts
  if (followingIds.length === 0) {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
        tags: { select: { name: true, slug: true } },
        _count: { select: { likes: true, comments: true } },
      },
      take: 10,
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
  }

  // Get posts from followed authors
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      authorId: { in: followingIds },
    },
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      tags: { select: { name: true, slug: true } },
      _count: { select: { likes: true, comments: true } },
    },
    take: 20,
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

export default async function FeedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/feed");
  }

  const posts = await getFollowingPosts(session);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      <main className="app-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts Feed */}
          <div className="lg:col-span-2 space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Your Feed</h1>

            <Suspense fallback={<PostsLoading />}>
              {posts.length > 0 ? (
                <>
                  {posts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))}

                  <div className="flex justify-center">
                    <Button variant="secondary" size="lg">
                      Load more stories
                    </Button>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                  <p className="text-gray-600 mb-4">
                    Your feed is empty. Start following writers to see their
                    stories here!
                  </p>
                  <Button asChild>
                    <a href="/explore">Explore Stories</a>
                  </Button>
                </div>
              )}
            </Suspense>
          </div>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </main>

      <Footer />
    </div>
  );
}