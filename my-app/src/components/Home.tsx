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

interface HomeProps {
  userID: string | null;
}

const Home: React.FC<HomeProps> = ({ userID }) => {
  const [userPost, setUserPost] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const makePost = async () => {
    try {
      if (!userID) {
        console.error('No user is logged in');
        setError('No user is logged in. Please log in first.');
        return;
      }
      if (!userPost.trim()) {
        console.error('Post content is empty');
        setError('Post content is empty. Please enter some content.');
        return;
      }

      await axios.post('http://localhost:8080/api/posts', {
        user_id: userID,
        content: userPost,
        is_reply: !!replyTo,
        parent_id: replyTo,
      });
      console.log("Post created");

      setUserPost('');
      setReplyTo(null);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Error creating post. Please try again.');
    }
  };

  const makeLike = async (postID: string) => {
    try {
      if (!userID) {
        console.error('No user is logged in');
        setError('No user is logged in. Please log in first.');
        return;
      }

      await axios.post('http://localhost:8080/api/likes', {
        user_id: userID,
        post_id: postID,
      });
      console.log("Like created");
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
      setError('Error liking post. Please try again.');
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Error fetching posts. Please try again.');
    }
  };

  return (
    <div>
      {replyTo === null && (
        <>
          <textarea
            value={userPost}
            onChange={(e) => setUserPost(e.target.value)}
            placeholder="What's happening?"
            className="textarea"
          />
          <button onClick={makePost} className="button">Post</button>
        </>
      )}
      <div className="posts">
        {posts.map((post) => (
          <div key={post.id} className="post">
            {post.is_reply && post.parent_content && (
              <div className="parent-post">
                <p>Replying to: {post.parent_content}</p>
              </div>
            )}
            <p>{post.content}</p>
            <button className="button" onClick={() => setReplyTo(post.id)}>
              Reply
            </button>
            <button className="button" onClick={() => makeLike(post.id)}>
              Like
            </button>
            <small>
              Posted by {post.nickname} at {new Date(post.created_at).toLocaleString()}
            </small>
            <p>Likes: {post.like_count}</p>
            {replyTo === post.id && (
              <div className="reply-section">
                <textarea
                  value={userPost}
                  onChange={(e) => setUserPost(e.target.value)}
                  placeholder="Write a reply..."
                  className="textarea"
                />
                <button onClick={makePost} className="button">Reply</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;