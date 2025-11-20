import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import PostCard from "../../../components/post/PostCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, UserMinus } from "lucide-react";
import FollowButton from "../../../components/users/FollowButton";

async function getUser(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

async function getUserPosts(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) return [];

    const posts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        published: true,
      },
      orderBy: { publishedAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, username: true, image: true },
        },
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
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return [];
  }
}

export async function generateMetadata(
  context: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await context.params;
  const user = await getUser(username);

  if (!user) {
    return {
      title: "User Not Found | Lumen Yard",
    };
  }

  return {
    title: `${user.name || user.username} | Lumen Yard`,
    description: user.bio || `Read stories by ${user.name || user.username}`,
    openGraph: {
      title: `${user.name || user.username}`,
      description: user.bio || `Read stories by ${user.name || user.username}`,
      images: user.image ? [user.image] : [],
      type: "profile",
    },
  };
}

export default async function UserProfilePage(
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;
  const user = await getUser(username);
  const session = await getServerSession(authOptions);
  const posts = await getUserPosts(username);

  if (!user) {
    notFound();
  }

  const isOwnProfile =
    session?.user &&
    ((session.user as any).username === user.username ||
      session.user.email === user.email);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.image || undefined} alt={user.name || user.username} />
              <AvatarFallback className="text-2xl">
                {(user.name || user.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.name || user.username}
              </h1>
              <p className="text-gray-600 mb-4">@{user.username}</p>
              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-semibold text-gray-900">
                    {user._count.posts}
                  </span>{" "}
                  {user._count.posts === 1 ? "story" : "stories"}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">
                    {user._count.followers}
                  </span>{" "}
                  {user._count.followers === 1 ? "follower" : "followers"}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">
                    {user._count.following}
                  </span>{" "}
                  following
                </div>
              </div>
            </div>

            {!isOwnProfile && (
              <FollowButton username={user.username} />
            )}
          </div>
        </div>

        {/* User Posts */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {isOwnProfile ? "Your Stories" : "Stories"}
          </h2>

          {posts.length > 0 ? (
            <>
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-600">
                {isOwnProfile
                  ? "You haven't published any stories yet."
                  : `${user.name || user.username} hasn't published any stories yet.`}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

