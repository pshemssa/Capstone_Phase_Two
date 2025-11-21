"use client";

import { Post } from "../../types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FollowButton from "../users/FollowButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PostDetailProps {
  post: Post;
  isAuthor: boolean;
}

export default function PostDetail({ post, isAuthor }: PostDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/post/${post.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete post", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Cover Image */}
      {post.coverImage && (
        <div className="w-full h-96 relative">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-8 sm:p-12">
        {/* Author & Meta Info */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            {post.author.image ? (
              <img
                src={post.author.image}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white text-lg font-semibold">
                {post.author.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <Link
                href={`/users/${post.author.username}`}
                className="font-semibold text-gray-900 hover:text-yellow-700 transition"
              >
                {post.author.name}
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  
                </span>
                <span>·</span>
                <Clock className="w-3 h-3" />
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </div>
          {!isAuthor && (
            <div>
              <FollowButton username={post.author.username} />
            </div>
          )}

          {/* Edit/Delete Buttons for Author */}
          {isAuthor && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/write?edit=${post.id}`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Post</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this post? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/tag/${tag.toLowerCase()}`}>
                <Badge variant="secondary" className="cursor-pointer">
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Content */}
        {post.content && (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}
      </div>
    </div>
  );
}