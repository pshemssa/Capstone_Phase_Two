import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

// GET - Check follow status
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const session = await getServerSession(authOptions);
    let followerId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      followerId = user?.id || null;
    } else {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      followerId = (token?.id as string) || null;
    }

    if (!followerId) {
      return NextResponse.json({ following: false });
    }

    const userToCheck = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!userToCheck) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userToCheck.id,
        },
      },
    });

    return NextResponse.json({ following: !!existingFollow });
  } catch (error) {
    console.error("Check follow error:", error);
    return NextResponse.json({ following: false });
  }
}

// POST - Toggle follow
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let followerId: string | null = null;
    if (session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      followerId = user.id;
    } else {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (!token?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      followerId = token.id as string;
    }

    // Find user to follow
    const userToFollow = await prisma.user.findUnique({
      where: { username },
    });

    if (!userToFollow) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (userToFollow.id === followerId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userToFollow.id,
        },
      },
    });

    if (existingFollow) {
      // Unfollow - Delete from database
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId: userToFollow.id,
          },
        },
      });

      return NextResponse.json({
        message: "Unfollowed successfully",
        following: false,
      });
    } else {
      // Follow - Create in database
      await prisma.follow.create({
        data: {
          followerId,
          followingId: userToFollow.id,
        },
      });

      return NextResponse.json({
        message: "Followed successfully",
        following: true,
      });
    }
  } catch (error) {
    console.error("Toggle follow error:", error);
    return NextResponse.json(
      { error: "Failed to toggle follow" },
      { status: 500 }
    );
  }
}