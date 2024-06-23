import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fireAuth } from './firebase/firebase.js';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [userPost, setUserPost] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const [showSmiley, setShowSmiley] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    onAuthStateChanged(fireAuth, async (user) => {
      setLoggedIn(!!user);
      if (user) {
        setUserID(user.uid);
        fetchPosts();
      }
    });
  }, []);

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(fireAuth, email, password);
      const user = userCredential.user;
      await makeUser(user.uid, email, nickname);
      setUserID(user.uid);
    } catch (error) {
      console.error('Error signing up:', error);
      setError('Error signing up. Please try again.');
    }
  };

  const makeUser = async (uid: string, email: string, nickname: string) => {
    try {
      await axios.post('https://uttc-hackathon3-lx5cqmshrq-uc.a.run.app/api/users', {
        id: uid,
        email: email,
        nickname: nickname,
        password: password,
      });
      console.log("User created");
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Error creating user. Please try again.');
    }
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(fireAuth, email, password);
      setUserID(userCredential.user.uid);
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Error logging in. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(fireAuth);
      setUserID(null);
      setLoggedIn(false);
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Error logging out. Please try again.');
    }
  };

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

      await axios.post('https://uttc-hackathon3-lx5cqmshrq-uc.a.run.app/api/posts', {
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

      await axios.post('https://uttc-hackathon3-lx5cqmshrq-uc.a.run.app/api/likes', {
        user_id: userID,
        post_id: postID,
      });
      console.log("Like created");
      fetchPosts();
      setShowSmiley((prev) => ({ ...prev, [postID]: true }));
      setTimeout(() => {
        setShowSmiley((prev) => ({ ...prev, [postID]: false }));
      }, 1000);
    } catch (error) {
      console.error('Error liking post:', error);
      setError('Error liking post. Please try again.');
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get('https://uttc-hackathon3-lx5cqmshrq-uc.a.run.app/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Error fetching posts. Please try again.');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="app">
      <h1>ツイッター風</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loggedIn ? (
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="textarea"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="textarea"
          />
          <input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="textarea"
          />
          <button onClick={handleSignUp} className="button">Sign Up</button>
          <button onClick={handleLogin} className="button">Login</button>
        </div>
      ) : (
        <div>
          {replyTo === null && (
            <>
              <button onClick={handleLogout} className="button">Logout</button>
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
                <div className="button-group">
                  <button className="button" onClick={() => setReplyTo(post.id)}>
                    リプライ
                  </button>
                  <button className="button" onClick={() => makeLike(post.id)}>
                    ええやん！
                  </button>
                </div>
                <small>
                  Posted by {post.nickname} at {new Date(post.created_at).toLocaleString()}
                </small>
                <p>Likes: {post.like_count}</p>
                {showSmiley[post.id] && <div className="smiley">😊</div>}
                {replyTo === post.id && (
                  <div className="reply-section">
                    <textarea
                      value={userPost}
                      onChange={(e) => setUserPost(e.target.value)}
                      placeholder="返信書けやこら"
                      className="textarea"
                    />
                    <button onClick={makePost} className="button">Reply</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
