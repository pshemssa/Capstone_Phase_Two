import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import {prisma} from "../../../lib/prisma";
import Link from "next/link";
import PostActions from "../../../components/post/PostActions";
import CommentsSection from "../../../components/post/CommentsSection";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import DeletePostButton from "../../../components/post/DeletePostButton";



async function getPost(slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
            bio: true,
          },
        },
        tags: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function generateMetadata(
  context: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await context.params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const postUrl = `${siteUrl}/post/${post.slug}`;

  return {
    title: `${post.title} | Lumen Yard`,
    description: post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, ""),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, ""),
      url: postUrl,
      siteName: "Lumen Yard",
      images: post.coverImage ? [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name || "Anonymous"],
      tags: post.tags.map((tag: any) => tag.name),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, ""),
      images: post.coverImage ? [post.coverImage] : [],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function PostPage(
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const post = await getPost(slug);
  const session = await getServerSession(authOptions);

  if (!post) {
    notFound();
  }

  const isAuthor = session?.user?.email === post.author.email;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition flex items-center gap-2"
          >
            <span>←</span> Back to Home
          </Link>
        </div>
        {/* Post Content */}
        <article className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden p-8">
          {/* Cover Image */}
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-8"
            />
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>

          {/* Author Info */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b">
            {post.author.image ? (
              <img
                src={post.author.image}
                alt={post.author.name || "Author"}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {post.author.name?.charAt(0) || "A"}
              </div>
            )}
            <div>
              <Link 
                href={`/users/${post.author.username}`}
                className="font-medium text-lg hover:text-yellow-700 transition"
              >
                {post.author.name}
              </Link>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag:any) => (
                <span
                  key={tag.id}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Actions */}
          <PostActions post={{ id: post.id, slug: post.slug, title: post.title, excerpt: post.excerpt || undefined, _count: post._count }} />

          {/* Edit/Delete buttons for author */}
          {isAuthor && (
            <div className="mt-6 pt-6 border-t flex items-center gap-4">
              <Link
                href={`/write/${post.id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit Post →
              </Link>
              <DeletePostButton postId={post.id} postSlug={post.slug} />
            </div>
          )}
        </article>

        {/* Author Bio */}
        {post.author.bio && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-start gap-4">
              {post.author.image ? (
                <img
                  src={post.author.image}
                  alt={post.author.name || "Author"}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                  {post.author.name?.charAt(0) || "A"}
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg mb-2">{post.author.name}</h3>
                <p className="text-gray-600">{post.author.bio}</p>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <CommentsSection postId={post.id} />
      </main>

      <Footer />
    </div>
  );
}

// Generate static params for published posts (SSG)
export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true },
      take: 100, // Generate first 100 posts statically
    });

    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;