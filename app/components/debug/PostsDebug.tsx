"use client";

interface PostsDebugProps {
  posts: any[];
  username: string;
  isOwnProfile: boolean;
}

export default function PostsDebug({ posts, username, isOwnProfile }: PostsDebugProps) {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">Debug Info</h3>
      <p className="text-sm text-yellow-700">
        Username: {username} | Own Profile: {isOwnProfile ? 'Yes' : 'No'} | Posts Found: {posts.length}
      </p>
      {posts.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-yellow-600 font-medium">Posts:</p>
          <ul className="text-xs text-yellow-600 ml-4">
            {posts.map((post, i) => (
              <li key={i}>
                {post.title} - {post.published ? 'Published' : 'Draft'} - {post.createdAt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}