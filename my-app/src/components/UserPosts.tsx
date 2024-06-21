import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  nickname: string;
  like_count: number;
  is_reply: boolean;
  parent_id: string;
  parent_content?: string;
}

interface UserPostsProps {
  userID: string | null;
}

const UserPosts: React.FC<UserPostsProps> = ({ userID }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userID) {
      fetchUserPosts(userID);
    }
  }, [userID]);

  const fetchUserPosts = async (userId: string) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/user-posts?user_id=${userId}`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Error fetching user posts. Please try again.');
    }
  };

  return (
    <div className="posts">
      {error && <p className="error">{error}</p>}
      {posts.map((post) => (
        <div key={post.id} className="post">
          {post.is_reply && post.parent_content && (
            <div className="parent-post">
              <p>Replying to: {post.parent_content}</p>
            </div>
          )}
          <p>{post.content}</p>
          <div className="button-group">
            <button className="button" onClick={() => console.log('Replying not available in UserPosts view')}>
              Reply
            </button>
            <button className="button" onClick={() => console.log('Liking not available in UserPosts view')}>
              Like
            </button>
          </div>
          <small>
            Posted by {post.nickname} at {new Date(post.created_at).toLocaleString()}
          </small>
          <p>Likes: {post.like_count}</p>
        </div>
      ))}
    </div>
  );
};

export default UserPosts;