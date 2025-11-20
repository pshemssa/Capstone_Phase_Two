import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { redirect, notFound } from "next/navigation";
import PostEditor from "../../../components/post/PostEditor";
import { prisma } from "../../../lib/prisma";

export const metadata: Metadata = {
  title: "Edit Story | Lumen Yard",
  description: "Edit your story",
};

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get user ID
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || "" },
    select: { id: true },
  });

  if (!user) {
    redirect("/login");
  }

  // Fetch the post
  const post = await prisma.post.findFirst({
    where: {
      OR: [{ id: params.id }, { slug: params.id }],
      authorId: user.id,
    },
    include: {
      tags: true,
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PostEditor
        initialData={{
          id: post.id,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || "",
          coverImage: post.coverImage || "",
          tags: post.tags.map((tag: any) => tag.name),
          published: post.published,
        }}
      />
    </div>
  );
}

