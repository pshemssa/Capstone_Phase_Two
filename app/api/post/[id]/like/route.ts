// // app/api/posts/[id]/like/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../../../lib/auth";
// import {prisma} from "../../../../lib/prisma";

// // POST /api/posts/[id]/like - Like a post
// export async function POST(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Check if post exists
//     const post = await prisma.post.findUnique({
//       where: { id: params.id },
//     });

//     if (!post) {
//       return NextResponse.json({ error: "Post not found" }, { status: 404 });
//     }

//     // Check if already liked
//     const existingLike = await prisma.like.findUnique({
//       where: {
//         postId_userId: {
//           postId: params.id,
//           userId: (session.user as any).id,
//         },
//       },
//     });

//     if (existingLike) {
//       return NextResponse.json(
//         { error: "Already liked" },
//         { status: 400 }
//       );
//     }

//     // Create like
//     await prisma.like.create({
//       data: {
//         postId: params.id,
//         userId: (session.user as any).id,
//       },
//     });

//     // Get updated like count
//     const likeCount = await prisma.like.count({
//       where: { postId: params.id },
//     });

//     return NextResponse.json({ liked: true, likeCount });
//   } catch (error) {
//     console.error("Error liking post:", error);
//     return NextResponse.json(
//       { error: "Failed to like post" },
//       { status: 500 }
//     );
//   }
// }

// // DELETE /api/posts/[id]/like - Unlike a post
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Delete like
//     await prisma.like.delete({
//       where: {
//         postId_userId: {
//           postId: params.id,
//           userId: (session.user as any).id,
//         },
//       },
//     });

//     // Get updated like count
//     const likeCount = await prisma.like.count({
//       where: { postId: params.id },
//     });

//     return NextResponse.json({ liked: false, likeCount });
//   } catch (error) {
//     console.error("Error unliking post:", error);
//     return NextResponse.json(
//       { error: "Failed to unlike post" },
//       { status: 500 }
//     );
//   }
// }

// app/api/posts/[id]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "../../../../lib/auth";
import prisma from "@/app/lib/prisma";

// GET — Check if user liked + return current like count
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
        select: { id: true } 
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
      return NextResponse.json({ error: "Post not found", liked: false, likeCount: 0 }, { status: 404 });
    }

    // Get like count (always available)
    const likeCount = await prisma.like.count({
      where: { postId: post.id },
    });

    // Check if user liked (only if authenticated)
    let liked = false;
    if (userId) {
      const existingLike = await prisma.like.findUnique({
        where: { 
          postId_userId: { 
            postId: post.id, 
            userId: userId 
          } 
        },
      });
      liked = !!existingLike;
    }

    return NextResponse.json({ liked, likeCount });
  } catch (error: any) {
    console.error("Error checking like status:", error);
    return NextResponse.json(
      { error: error.message || "Server error", liked: false, likeCount: 0 },
      { status: 500 }
    );
  }
}

// POST — Like the post
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    let userId: string | null = null;
    
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
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

    const existingLike = await prisma.like.findUnique({
      where: { postId_userId: { postId: post.id, userId: userId } },
    });

    if (existingLike) {
      return NextResponse.json({ error: "Already liked" }, { status: 400 });
    }

    // Create the like in the database
    await prisma.like.create({ 
      data: { 
        postId: post.id, 
        userId: userId 
      } 
    });

    // Get updated like count
    const likeCount = await prisma.like.count({ where: { postId: post.id } });

    return NextResponse.json({ liked: true, likeCount });
  } catch (error: any) {
    console.error("Error liking post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to like post" },
      { status: 500 }
    );
  }
}

// DELETE — Unlike
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    let userId: string | null = null;
    
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
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

    // Delete the like from the database
  // Find post first to get the actual post ID
  const post = await prisma.post.findFirst({
    where: {
      OR: [
        { id },
        { slug: id }
      ]
    }
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await prisma.like.delete({ 
    where: { 
      postId_userId: { 
        postId: post.id, 
        userId: userId 
      } 
    } 
  });

  // Get updated like count
  const likeCount = await prisma.like.count({ where: { postId: post.id } });

    return NextResponse.json({ liked: false, likeCount });
  } catch (error: any) {
    console.error("Error unliking post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to unlike post" },
      { status: 500 }
    );
  }
}