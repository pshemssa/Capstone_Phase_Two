import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import {prisma} from "../../../lib/prisma";
import Link from "next/link";
import PostActions from "../../../components/post/PostActions";



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

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Lumen Yard`,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.coverImage ? [post.coverImage] : [],
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name || "Anonymous"],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  const session = await getServerSession(authOptions);

  if (!post) {
    notFound();
  }

  const isAuthor = session?.user?.email === post.author.email;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/my-posts" className="text-blue-600 hover:text-blue-700">
            ← Back to Posts
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <p className="font-medium text-lg">{post.author.name}</p>
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

          {/* Edit button for author */}
          {isAuthor && (
            <div className="mt-6 pt-6 border-t">
              <Link
                href={`/write/${post.id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit Post →
              </Link>
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
      </main>
    </div>
  );
}