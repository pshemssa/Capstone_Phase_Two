"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Save,
  Eye,
  Upload,
  X,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
    </div>
  ),
});

interface PostData {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  published: boolean;
}

export default function PostEditor() {
  const router = useRouter();
  const { data: session } = useSession();
  const editor = useRef(null);

  const [postData, setPostData] = useState<PostData>({
    title: "",
    content: "",
    excerpt: "",
    coverImage: "",
    tags: [],
    published: false,
  });

  const [currentTag, setCurrentTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const config = {
    readonly: false,
    placeholder: "Tell your story...",
    minHeight: 500,
    buttons: [
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "font",
      "fontsize",
      "|",
      "paragraph",
      "align",
      "|",
      "link",
      "image",
      "|",
      "undo",
      "redo",
    ],
    uploader: {
      insertImageAsBase64URI: false,
    },
    style: {
      font: "16px Inter, sans-serif",
    },
  };

  const handleContentChange = (newContent: string) => {
    setPostData((prev) => ({ ...prev, content: newContent }));
  };

  const addTag = () => {
    if (currentTag.trim() && !postData.tags.includes(currentTag.trim())) {
      if (postData.tags.length < 5) {
        setPostData((prev) => ({
          ...prev,
          tags: [...prev.tags, currentTag.trim()],
        }));
        setCurrentTag("");
      } else {
        setError("Maximum 5 tags allowed");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPostData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setImageUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostData((prev) => ({
          ...prev,
          coverImage: reader.result as string,
        }));
        setImageUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to upload image");
      setImageUploading(false);
    }
  };

  const saveDraft = async () => {
    if (!postData.title.trim()) {
      setError("Title is required");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      console.log("💾 Saving draft...", postData);

      const response = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: postData.title,
          content: postData.content || "<p>Start writing...</p>",
          excerpt: postData.excerpt,
          coverImage: postData.coverImage || undefined,
          tags: postData.tags,
          published: false,
        }),
      });

      console.log("📡 Response status:", response.status);

      const result = await response.json();
      console.log("📦 Response data:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to save draft");
      }

      // The API returns the post directly, not wrapped in 'data'
      const slug = result.slug;
      console.log("✅ Draft saved, redirecting to:", `/post/${slug}`);
      
      router.push(`/post/`);
      router.refresh();
    } catch (err: any) {
      console.error("❌ Error saving draft:", err);
      setError(err.message || "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const publishPost = async () => {
    if (!postData.title.trim()) {
      setError("Title is required");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!postData.content.trim()) {
      setError("Content is required");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("🚀 Publishing post...", {
        title: postData.title,
        contentLength: postData.content.length,
        tags: postData.tags,
      });

      const response = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt || postData.content.substring(0, 160),
          coverImage: postData.coverImage || undefined,
          tags: postData.tags,
          published: true,
        }),
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", response.headers.get("content-type"));

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("❌ Not JSON response:", text.substring(0, 200));
        throw new Error("Server returned non-JSON response. Check server logs.");
      }

      const result = await response.json();
      console.log("📦 Response data:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to publish post");
      }

      // The API returns the post directly
      const slug = result.slug;
      console.log("✅ Post published! Slug:", slug);
      
      // Redirect to the published post
      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error("❌ Error publishing:", err);
      setError(err.message || "Failed to publish post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="hidden sm:block text-sm text-gray-500">
                {isSaving ? "Saving..." : "Draft"}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={saveDraft}
                disabled={isSaving || isLoading}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>

              <Button
                size="sm"
                onClick={publishPost}
                disabled={isLoading || isSaving}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish"
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Editor Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image (Optional)</Label>
            <div className="relative">
              {postData.coverImage ? (
                <div className="relative group">
                  <img
                    src={postData.coverImage}
                    alt="Cover"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={() =>
                      setPostData((prev) => ({ ...prev, coverImage: "" }))
                    }
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-yellow-500 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {imageUploading ? (
                      <Loader2 className="w-10 h-10 text-yellow-600 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Title"
              value={postData.title}
              onChange={(e) =>
                setPostData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="text-4xl font-bold border-none focus:ring-0 px-0 placeholder:text-gray-300"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (up to 5)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {postData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="pl-3 pr-1 py-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add a tag..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                disabled={postData.tags.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={postData.tags.length >= 5}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label>Excerpt (Optional)</Label>
            <Input
              type="text"
              placeholder="Brief description of your story..."
              value={postData.excerpt}
              onChange={(e) =>
                setPostData((prev) => ({ ...prev, excerpt: e.target.value }))
              }
            />
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-2">
            <Label>Content</Label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <JoditEditor
                ref={editor}
                value={postData.content}
                config={config}
                onBlur={handleContentChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {postData.coverImage && (
              <img
                src={postData.coverImage}
                alt="Cover"
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold mb-4">
                {postData.title || "Untitled"}
              </h1>
              {postData.excerpt && (
                <p className="text-gray-600 mb-4">{postData.excerpt}</p>
              )}
              {postData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {postData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: postData.content }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}