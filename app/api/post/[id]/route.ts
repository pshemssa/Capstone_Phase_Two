import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "../../../lib/auth";
import { z } from "zod";
import { handleApiError, createErrorResponse, createSuccessResponse } from "../../../lib/api-utils";
import prisma from "@/app/lib/prisma";

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional().or(z.literal("")).nullable(),
  tags: z.array(z.string().min(1).max(50)).max(5).optional(),
  published: z.boolean().optional(),
});

// GET - Fetch single post by slug or ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const post = await prisma.post.findFirst({
      where: {
        OR: [{ slug: id }, { id }],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return createErrorResponse("Post not found", 404);
    }

    return createSuccessResponse({
      ...post,
      tags: post.tags.map((tag:any) => tag.name),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() || null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Update post
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return createErrorResponse("Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return createErrorResponse("User not found", 404);
    }

    const post = await prisma.post.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!post) {
      return createErrorResponse("Post not found", 404);
    }

    if (post.authorId !== user.id) {
      return createErrorResponse("Forbidden", 403);
    }

    const body = await req.json();
    const validatedData = updatePostSchema.parse(body);

    // Update slug if title changed
    let slug = post.slug;
    if (validatedData.title && validatedData.title !== post.title) {
      const baseSlug = validatedData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
        .substring(0, 100);

      let newSlug = baseSlug;
      let counter = 1;

      while (
        await prisma.post.findFirst({
          where: {
            slug: newSlug,
            NOT: { id: post.id },
          },
        })
      ) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      slug = newSlug;
    }

    // Handle tags
    let tagConnections;
    if (validatedData.tags) {
      const tagData = await Promise.all(
        validatedData.tags.map(async (tagName) => {
          const tagSlug = tagName
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .substring(0, 50);

          return await prisma.tag.upsert({
            where: { slug: tagSlug },
            update: {},
            create: {
              name: tagName,
              slug: tagSlug,
            },
          });
        })
      );

      tagConnections = tagData.map((tag:any) => ({ id: tag.id }));

      await prisma.post.update({
        where: { id: post.id },
        data: {
          tags: {
            set: [],
          },
        },
      });
    }

    // Calculate read time if content changed
    let readTime = post.readTime;
    if (validatedData.content) {
      const wordCount = validatedData.content.split(/\s+/).length;
      readTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    const updateData: any = {};

    if (validatedData.title) {
      updateData.title = validatedData.title;
      updateData.slug = slug;
    }

    if (validatedData.content) {
      updateData.content = validatedData.content;
      updateData.readTime = readTime;
    }

    if (validatedData.excerpt !== undefined) {
      updateData.excerpt = validatedData.excerpt;
    }

    if (validatedData.coverImage !== undefined) {
      updateData.coverImage = validatedData.coverImage;
    }

    if (validatedData.published !== undefined) {
      updateData.published = validatedData.published;
      if (validatedData.published && !post.published) {
        updateData.publishedAt = new Date();
      }
    }

    if (tagConnections) {
      updateData.tags = {
        connect: tagConnections,
      };
    }

    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        tags: {
          select: {
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return createSuccessResponse(
      {
        ...updatedPost,
        tags: updatedPost.tags.map((tag:any) => tag.name),
        createdAt: updatedPost.createdAt.toISOString(),
        updatedAt: updatedPost.updatedAt.toISOString(),
        publishedAt: updatedPost.publishedAt?.toISOString() || null,
      },
      "Post updated successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Delete post
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    let userId: string | null = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (!user) {
        return createErrorResponse("User not found", 404);
      }
      userId = user.id;
    } else {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (!token?.id) {
        return createErrorResponse("Unauthorized", 401);
      }
      userId = token.id as string;
    }

    const post = await prisma.post.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!post) {
      return createErrorResponse("Post not found", 404);
    }

    if (post.authorId !== userId) {
      return createErrorResponse("Forbidden", 403);
    }

    await prisma.post.delete({
      where: { id: post.id },
    });

    return createSuccessResponse(null, "Post deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}