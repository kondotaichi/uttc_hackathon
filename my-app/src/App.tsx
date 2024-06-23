import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fireAuth } from './firebase/firebase.js';
import ReactMarkdown from 'react-markdown';
import './styles.css';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

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

const App: React.FC = () => {
  // ... (previous state declarations remain the same)
  const [rotatingPosts, setRotatingPosts] = useState<string[]>([]);

  // ... (previous useEffect and other functions remain the same)

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

      const response = await axios.post('https://uttc-hackathon3-lx5cqmshrq-uc.a.run.app/api/posts', {
        user_id: userID,
        content: userPost,
        is_reply: !!replyTo,
        parent_id: replyTo,
      });
      console.log("Post created");

      setUserPost('');
      setReplyTo(null);
      fetchPosts();

      // Add the new post ID to rotating posts
      const newPostId = response.data.id;
      setRotatingPosts(prev => [...prev, newPostId]);

      // Remove the post ID from rotating posts after 5 seconds
      setTimeout(() => {
        setRotatingPosts(prev => prev.filter(id => id !== newPostId));
      }, 5000);

    } catch (error) {
      console.error('Error creating post:', error);
      setError('Error creating post. Please try again.');
    }
  };

  // ... (fetchPosts and other functions remain the same)

  return (
    <div className="app">
      {/* ... (previous JSX remains the same) */}
      <div className="posts-container">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className={`post-card ${rotatingPosts.includes(post.id) ? 'rotating' : ''}`}
          >
            {/* ... (post content remains the same) */}
          </div>
        ))}
      </div>
      {/* ... (rest of the JSX remains the same) */}
    </div>
  );
};

export default App;