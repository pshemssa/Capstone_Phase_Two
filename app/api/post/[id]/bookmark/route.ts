import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "../../../../lib/auth";
import prisma from "@/app/lib/prisma";
// import { prisma } from "../../../../lib/prisma";

// GET  Check if user bookmarked + return bookmark count
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    let userId: string | null = null;
    
    // Try to get user ID if authenticated
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      userId = user?.id || null;
    } else {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      userId = (token?.id as string) || null;
    }

    // Find post first to get the actual post ID
    const post = await prisma.post.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      select: { id: true }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found", bookmarked: false, count: 0 }, { status: 404 });
    }

    // Get bookmark count (always available)
    const bookmarkCount = await prisma.bookmark.count({
      where: { postId: post.id },
    });

    // Check if user bookmarked (only if authenticated)
    let bookmarked = false;
    if (userId) {
      const existingBookmark = await prisma.bookmark.findUnique({
        where: {
          postId_userId: {
            postId: post.id,
            userId: userId,
          },
        },
      });
      bookmarked = !!existingBookmark;
    }

    return NextResponse.json({
      bookmarked,
      count: bookmarkCount,
    });
  } catch (error: any) {
    console.error("Error checking bookmark status:", error);
    return NextResponse.json(
      { error: error.message || "Server error", bookmarked: false, count: 0 },
      { status: 500 }
    );
  }
}

// POST - Bookmark the post
export async function POST(
  request: NextRequest,
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
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      userId = user.id;
    } else {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      userId = token.id as string;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  // Find post by id (params.id could be id or slug)
  const post = await prisma.post.findFirst({
    where: {
      OR: [
        { id },
        { slug: id }
      ]
    }
  });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        postId_userId: {
          postId: post.id,
          userId: userId,
        },
      },
    });

    if (existingBookmark) {
      return NextResponse.json({ error: "Already bookmarked" }, { status: 400 });
    }

    // Create the bookmark in the database
    await prisma.bookmark.create({
      data: { postId: post.id, userId: userId },
    });

    // Get updated bookmark count
    const bookmarkCount = await prisma.bookmark.count({
      where: { postId: post.id },
    });

    return NextResponse.json({ bookmarked: true, count: bookmarkCount });
  } catch (error: any) {
    console.error("Error bookmarking post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to bookmark post" },
      { status: 500 }
    );
  }
}

// DELETE - Unbookmark
export async function DELETE(
  request: NextRequest,
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
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      userId = user.id;
    } else {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      userId = token.id as string;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the bookmark from the database
    await prisma.bookmark.delete({
      where: {
        postId_userId: {
          postId: id,
          userId: userId,
        },
      },
    });

    // Get updated bookmark count
    const bookmarkCount = await prisma.bookmark.count({
      where: { postId: id },
    });

    return NextResponse.json({ bookmarked: false, count: bookmarkCount });
  } catch (error: any) {
    console.error("Error unbookmarking post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to unbookmark post" },
      { status: 500 }
    );
  }
}

