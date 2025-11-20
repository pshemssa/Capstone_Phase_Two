"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PostActionsProps {
  post: { id: string; slug: string; title: string; excerpt?: string; _count: { likes: number; comments: number } };
}

export default function PostActions({ post }: PostActionsProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [isLiking, setIsLiking] = useState(false);

  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState<number | null>(null);
  const [isBookmarking, setIsBookmarking] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      checkLikeStatus();
      checkBookmarkStatus();
    }
  }, [status, post.id]);

  const checkLikeStatus = async () => {
    try {
      const res = await fetch(`/api/post/${post.id}/like`);
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      }
    } catch {}
  };

  const checkBookmarkStatus = async () => {
    try {
      const res = await fetch(`/api/post/${post.id}/bookmark`);
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
        setBookmarkCount(data.count);
      }
    } catch {}
  };

  const handleLike = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    // Optimistic update
    const previousLiked = liked;
    const previousCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    setIsLiking(true);

    try {
      const method = liked ? "DELETE" : "POST";
      const res = await fetch(`/api/post/${post.id}/like`, { method });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      } else {
        // Revert on error
        setLiked(previousLiked);
        setLikeCount(previousCount);
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to like post:", errorData.error);
      }
    } catch (err) {
      // Revert on error
      setLiked(previousLiked);
      setLikeCount(previousCount);
      console.error("Error liking post:", err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    // Optimistic update
    const previousBookmarked = bookmarked;
    setBookmarked(!bookmarked);
    setIsBookmarking(true);

    try {
      const method = bookmarked ? "DELETE" : "POST";
      const res = await fetch(`/api/post/${post.id}/bookmark`, { method });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
        setBookmarkCount(data.count);
      } else {
        // Revert on error
        setBookmarked(previousBookmarked);
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to bookmark post:", errorData.error);
      }
    } catch (err) {
      // Revert on error
      setBookmarked(previousBookmarked);
      console.error("Error bookmarking post:", err);
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  return (
    <div className="border-t border-gray-200 px-8 py-6 bg-gray-50">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={`transition-all ${
              liked 
                ? "text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700" 
                : "text-gray-600 hover:text-red-600 hover:bg-gray-50"
            } ${isLiking ? "opacity-50" : ""}`}
            aria-label={liked ? "Unlike this post" : "Like this post"}
          >
            <Heart 
              className={`w-5 h-5 mr-2 transition-transform ${liked ? "fill-current scale-110" : ""} ${isLiking ? "animate-pulse" : ""}`} 
              strokeWidth={liked ? 0 : 2}
            />
            <span className="font-semibold">{likeCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })}
            className="text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 transition-all"
            aria-label="View comments"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            <span className="font-semibold">{post._count.comments}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBookmark} 
            disabled={isBookmarking} 
            className={`transition-all ${
              bookmarked 
                ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100 hover:text-yellow-700" 
                : "text-gray-600 hover:text-yellow-600 hover:bg-gray-50"
            } ${isBookmarking ? "opacity-50" : ""}`}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark this post"}
          >
            <Bookmark 
              className={`w-5 h-5 transition-transform ${bookmarked ? "fill-current scale-110" : ""} ${isBookmarking ? "animate-pulse" : ""}`}
              strokeWidth={bookmarked ? 0 : 2}
            />
            {bookmarkCount !== null && bookmarkCount > 0 && (
              <span className="ml-2 text-sm font-medium">{bookmarkCount}</span>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShare} 
            className="text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 transition-all"
            aria-label="Share this post"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}