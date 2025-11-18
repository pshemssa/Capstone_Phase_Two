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

    setIsLiking(true);
    try {
      const method = liked ? "DELETE" : "POST";
      const res = await fetch(`/api/post/${post.id}/like`, { method });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setIsBookmarking(true);
    try {
      const method = bookmarked ? "DELETE" : "POST";
      const res = await fetch(`/api/post/${post.id}/bookmark`, { method });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
        setBookmarkCount(data.count);
      }
    } catch (err) {
      console.error(err);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={liked ? "text-red-600" : "text-gray-600"}
          >
            <Heart className={`w-5 h-5 mr-2 ${liked ? "fill-current" : ""}`} />
            <span className="font-semibold">{likeCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })}
            className="text-gray-600"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            <span className="font-semibold">{post._count.comments}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBookmark} disabled={isBookmarking} className={bookmarked ? "text-yellow-700" : "text-gray-600"}>
            <Bookmark className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`} />
            {bookmarkCount !== null && <span className="ml-2 text-sm">{bookmarkCount}</span>}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} className="text-gray-600">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}