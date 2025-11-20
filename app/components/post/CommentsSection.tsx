"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { Comment } from "../../types";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Fetch comments
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await fetch(`/api/comments?postId=${postId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      return data.data || [];
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, postId, parentId }),
      });
      if (!res.ok) throw new Error("Failed to create comment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setCommentText("");
      setReplyingTo(null);
      setReplyText("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }
    if (!commentText.trim()) return;
    createCommentMutation.mutate({ content: commentText.trim() });
  };

  const handleReply = (parentId: string) => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (!replyText.trim()) return;
    createCommentMutation.mutate({ content: replyText.trim(), parentId });
  };

  const comments: Comment[] = commentsData || [];

  return (
    <div id="comments" className="mt-12 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      {session ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button
            type="submit"
            disabled={!commentText.trim() || createCommentMutation.isPending}
          >
            {createCommentMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Post Comment
              </>
            )}
          </Button>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-600 mb-2">
            Please{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:underline"
            >
              sign in
            </button>{" "}
            to comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onReply={handleReply}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              session={session}
              router={router}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  postId,
  onReply,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  session,
  router,
}: {
  comment: Comment;
  postId: string;
  onReply: (parentId: string) => void;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  session: any;
  router: any;
}) {
  const isReplying = replyingTo === comment.id;

  return (
    <div className="border-l-2 border-gray-200 pl-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.author.image || undefined} />
            <AvatarFallback>
              {(comment.author.name || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/users/${comment.author.username || ''}`}
                className="font-semibold text-gray-900 hover:text-yellow-700 transition"
              >
                {comment.author.name}
              </Link>
              <span className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700 mb-2 whitespace-pre-wrap">
              {comment.content}
            </p>
          {session && (
            <button
              onClick={() => setReplyingTo(isReplying ? null : comment.id)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isReplying ? "Cancel" : "Reply"}
            </button>
          )}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onReply(comment.id)}
                  disabled={!replyText.trim()}
                >
                  Post Reply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 ml-8 space-y-4">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={reply.author.image || undefined} />
                <AvatarFallback>
                  {(reply.author.name || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/users/${reply.author.username || ''}`}
                    className="font-semibold text-gray-900 hover:text-yellow-700 transition"
                  >
                    {reply.author.name}
                  </Link>
                  <span className="text-sm text-gray-500">
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {reply.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

