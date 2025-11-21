"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  username: string;
}

export default function FollowButton({ username }: FollowButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = status === "authenticated";
  const isOwnProfile =
    Boolean(session?.user) &&
    (session?.user as any)?.username === username;

  useEffect(() => {
    if (status !== "authenticated") {
      setFollowing(false);
      return;
    }
    checkFollowStatus();
  }, [status, username]);

  const checkFollowStatus = async () => {
    try {
      const res = await fetch(`/api/users/${username}/follow`);
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following || false);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/users/${username}`);
      return;
    }

    // Optimistic update
    const previousFollowing = following;
    setFollowing(!following);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/users/${username}/follow`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
        router.refresh();
      } else {
        // Revert on error
        setFollowing(previousFollowing);
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to toggle follow:", errorData.error);
      }
    } catch (error) {
      // Revert on error
      setFollowing(previousFollowing);
      console.error("Error toggling follow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isOwnProfile) {
    return null;
  }

  return (
    <Button
      variant={following ? "outline" : "default"}
      onClick={handleFollow}
      disabled={isLoading}
      className={`min-w-[120px] transition-all ${
        following 
          ? "border-gray-300 hover:border-red-300 hover:text-red-600 hover:bg-red-50" 
          : "bg-yellow-600 hover:bg-yellow-700 text-white"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={following ? "Unfollow this user" : "Follow this user"}
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
          {following ? "Unfollowing..." : "Following..."}
        </span>
      ) : following ? (
        <>
          <UserMinus className="w-4 h-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}
