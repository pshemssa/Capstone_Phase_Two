"use client";
import Link from "next/link";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Post } from "../../types";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [bookmark, setBookmark] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [busyLike, setBusyLike] = useState(false);
  const [busyBookmark, setBusyBookmark] = useState(false);
  const [busyComment, setBusyComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post._count.comments);
  const { status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === "authenticated";
  const isSessionLoading = status === "loading";

  const buildCallbackUrl = () => {
    if (typeof window === "undefined") {
      return `/post/${post.slug}`;
    }
    const { pathname, search } = window.location;
    return `${pathname}${search || ""}`;
  };

  const ensureAuthenticated = () => {
    if (isSessionLoading) {
      return false;
    }
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(buildCallbackUrl())}`);
      return false;
    }
    return true;
  };

  useEffect(() => {
    let mounted = true;
    const postId = post.id;
    Promise.all([
      fetch(`/api/post/${postId}/like`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/post/${postId}/bookmark`).then((r) => r.ok ? r.json() : null),
    ])
      .then(([likeData, bookmarkData]) => {
        if (!mounted) return;
        if (likeData) {
          setLiked(!!likeData.liked);
          if (typeof likeData.likeCount === "number") setLikeCount(likeData.likeCount);
        }
        if (bookmarkData) {
          setBookmark(!!bookmarkData.bookmarked);
        }
      })
      .catch(() => {})
      ;
    return () => {
      mounted = false;
    };
  }, [post.id]);

  async function toggleLike() {
    if (busyLike) return;
    if (!ensureAuthenticated()) return;
    setBusyLike(true);
    const postId = post.id;
    try {
      const nextLiked = !liked;
      const method = liked ? "DELETE" : "POST";
      setLiked(nextLiked);
      setLikeCount((c) => c + (nextLiked ? 1 : -1));
      const res = await fetch(`/api/post/${postId}/like`, { method });
      const data = await res.json();
      if (!res.ok) {
        setLiked(!nextLiked);
        setLikeCount((c) => c + (nextLiked ? -1 : 1));
        if (data?.error) alert(data.error);
        else alert("Failed to update like");
        return;
      }
      if (typeof data.likeCount === "number") setLikeCount(data.likeCount);
    } finally {
      setBusyLike(false);
    }
  }

  async function toggleBookmark() {
    if (busyBookmark) return;
    if (!ensureAuthenticated()) return;
    setBusyBookmark(true);
    const postId = post.id;
    const previousBookmark = bookmark;
    try {
      const nextBookmark = !previousBookmark;
      const method = previousBookmark ? "DELETE" : "POST";
      // Optimistic update
      setBookmark(nextBookmark);
      const res = await fetch(`/api/post/${postId}/bookmark`, { method });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        // Revert on error
        setBookmark(previousBookmark);
        console.error(data?.error || "Failed to update bookmark");
        return;
      }
      // Success - state already updated optimistically
    } catch (error) {
      // Revert on error
      setBookmark(previousBookmark);
      console.error("Error toggling bookmark:", error);
    } finally {
      setBusyBookmark(false);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (busyComment || !commentText.trim()) return;
    if (!ensureAuthenticated()) return;
    setBusyComment(true);
    const postId = post.id;
    try {
      const res = await fetch(`/api/post/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setCommentText("");
        setCommentOpen(false);
        setCommentsCount((c) => c + 1);
        alert("Comment posted");
      } else {
        if (data?.error) alert(data.error);
        else alert("Failed to post comment");
      }
    } finally {
      setBusyComment(false);
    }
  }

  return (
    <article 
      className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 hover:border-yellow-200"
      onClick={() => window.location.href = `/post/${post.slug}`}
    >
      {/* Author Info */}
      <div className="flex items-center space-x-2 mb-3">
        {post.author.image ? (
          <img
            src={post.author.image}
            alt={post.author.name}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white text-xs font-semibold">
            {post.author.name.substring(0, 2).toUpperCase()}
          </div>
        )}
        <Link
          href={`/users/${post.author.username}`}
          className="text-sm font-medium text-gray-900 hover:text-yellow-700 transition"
          onClick={(e) => e.stopPropagation()}
        >
          {post.author.name}
        </Link>
      </div>

      {/* Content */}
      <div className="flex gap-6">
        <div className="flex-1">
          <Link href={`/post/${post.slug}`} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-2 line-clamp-2 hover:text-yellow-700 transition text-gray-900">
              {post.title}
            </h2>
          </Link>
          <p className="text-gray-600 text-base mb-4 line-clamp-2">
            {post.excerpt}
          </p>

          {/* Meta Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500">
              <span>{new Date(post.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric' 
              })}</span>
              <span>·</span>
              <span>{post.readTime} min read</span>
              {post.tags.length > 0 && (
                <>
                  <span className="hidden sm:inline">·</span>
                  <div className="flex gap-2">
                    {post.tags.slice(0, 2).map((tag:any) => (
                      <Link
                        key={tag}
                        href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                        className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium border border-yellow-200 hover:bg-yellow-100 transition"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 text-gray-500">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleLike();
                }}
                disabled={busyLike}
                className={`flex items-center space-x-1.5 px-2 py-1 rounded-md transition-all ${
                  liked 
                    ? "text-red-600 bg-red-50 hover:bg-red-100" 
                    : "hover:text-red-600 hover:bg-gray-50"
                } ${busyLike ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                aria-label={`${liked ? "Unlike" : "Like"} this post`}
                aria-pressed={liked}
                title={liked ? "Unlike" : "Like"}
              >
                <Heart 
                  className={`w-4 h-4 transition-transform ${liked ? "scale-110" : ""} ${busyLike ? "animate-pulse" : ""}`} 
                  fill={liked ? "currentColor" : "none"} 
                  strokeWidth={liked ? 0 : 2}
                />
                <span className="text-sm font-medium">{likeCount}</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!ensureAuthenticated()) return;
                  setCommentOpen((o) => !o);
                }}
                className="flex items-center space-x-1.5 px-2 py-1 rounded-md hover:text-yellow-800 hover:bg-yellow text-yellow-800 transition-all"
                aria-label="Comments"
                aria-expanded={commentOpen}
                title="View comments"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{commentsCount}</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleBookmark();
                }}
                disabled={busyBookmark}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all ${
                  bookmark 
                    ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100" 
                    : "hover:text-yellow-600 hover:bg-gray-50"
                } ${busyBookmark ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                aria-label={`${bookmark ? "Remove bookmark" : "Bookmark"} this post`}
                aria-pressed={bookmark}
                title={bookmark ? "Remove bookmark" : "Bookmark"}
              >
                <Bookmark 
                  className={`w-4 h-4 transition-transform ${bookmark ? "scale-110" : ""} ${busyBookmark ? "animate-pulse" : ""}`} 
                  fill={bookmark ? "currentColor" : "none"} 
                  strokeWidth={bookmark ? 0 : 2}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <Link href={`/post/${post.slug}`}>
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-32 h-32 object-cover rounded-lg"
            />
          </Link>
        )}
      </div>
      {commentOpen && (
        <form onSubmit={submitComment} className="mt-4 space-y-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-600"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={busyComment || !commentText.trim()}
              className="inline-flex items-center justify-center rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              {busyComment ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      )}
    </article>
  );
}