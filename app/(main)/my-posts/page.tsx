import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import PostCard from "../../components/post/PostCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "My Posts | Lumen Yard",
  description: "Manage your stories",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getMyPosts(session: any) {
  if (!session?.user?.email) {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, username: true },
  });

  if (!user) {
    return [];
  }

  const posts = await prisma.post.findMany({
    where: {
      authorId: user.id,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      author: {
        select: { id: true, name: true, username: true, image: true },
      },
      tags: { select: { name: true, slug: true } },
      _count: { select: { likes: true, comments: true } },
    },
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

export default async function MyPostsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/my-posts");
  }

  const posts = await getMyPosts(session);
  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Posts</h1>
            <p className="text-gray-600">
              {publishedCount} published · {draftCount} drafts
            </p>
          </div>
          <Button asChild>
            <Link href="/write">
              <Plus className="w-4 h-4 mr-2" />
              New Story
            </Link>
          </Button>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-8">
            {posts.map((post: any) => (
              <div key={post.id} className="relative">
                <PostCard post={post} />
                {!post.published && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Draft
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-600 mb-4">
              You haven't written any stories yet.
            </p>
            <Button asChild>
              <Link href="/write">
                <Plus className="w-4 h-4 mr-2" />
                Write Your First Story
              </Link>
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

