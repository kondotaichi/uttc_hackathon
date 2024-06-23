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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [userPost, setUserPost] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const [showSmiley, setShowSmiley] = useState<{ [key: string]: boolean }>({});
  const [rotatingPosts, setRotatingPosts] = useState<string[]>([]);

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
      
      if (!userPost.trim() && !imageUrl.trim()) {
        console.error('Post content and image URL are empty');
        setError('Post content and image URL are empty. Please enter some content or provide an image URL.');
        return;
      }

      const content = `${userPost.trim()} ${imageUrl.trim()}`;

      const response = await axios.post('https://uttc-hackathon3-lx5cqmshrq-uc.a.run.app/api/posts', {
        user_id: userID,
        content: content,
        is_reply: !!replyTo,
        parent_id: replyTo,
      });
      console.log("Post created");

      setUserPost('');
      setImageUrl('');
      setReplyTo(null);
      fetchPosts();

      const newPostId = response.data.id;
      setRotatingPosts(prev => [...prev, newPostId]);

      setTimeout(() => {
        setRotatingPosts(prev => prev.filter(id => id !== newPostId));
      }, 5000);

    } catch (error) {
      console.error('Error creating post:', error);
      setError('Error creating post. Please try again.');
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get('https://uttc-hackathon3-lx5cqmshrq-uc.a.run.app/api/posts');
      const postsWithJST = response.data.map((post: Post) => ({
        ...post,
        created_at: new Date(post.created_at).toISOString() 
      }));
      setPosts(postsWithJST);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Error fetching posts. Please try again.');
    }
  };

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
  
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');
  
    const ripple = button.getElementsByClassName('ripple')[0];
  
    if (ripple) {
      ripple.remove();
    }
  
    button.appendChild(circle);
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

  useEffect(() => {
    fetchPosts();
  }, []);

  const formatToJST = (dateString: string) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 9); // 日本標準時に変換
    return date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  };
  

  return (
    <div className="app">
      <h1 className="app-title">ゆるメディア
      </h1>
      {error && <p className="error-message">{error}</p>}
      {!loggedIn ? (
        <div className="auth-container">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />
          <input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="auth-input"/>
          <button onClick={(e) => { createRipple(e); handleLogin(); }} className="auth-button">ログインするで〜</button>
          <button onClick={(e) => { createRipple(e); handleSignUp(); }} className="auth-button">新規登録するで〜</button>
        </div>
      ) : (
        <div className="content-container">
          {replyTo === null && (
            <div className="post-form">
              <button onClick={(e) => { createRipple(e); handleLogout(); }} className="logout-button">ログアウト</button>
              <textarea
                value={userPost}
                onChange={(e) => setUserPost(e.target.value)}
                placeholder="どないしたん？"
                className="post-textarea"
              />
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="画像いれたかったらURL貼ってな！"
                className="image-url-input"
              />
              <button onClick={(e) => { createRipple(e); makePost(); }} className="post-button">Post</button>
            </div>
          )}
          <div className="posts-container">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className={`post-card ${rotatingPosts.includes(post.id) ? 'rotating' : ''}`}
              >
                {post.is_reply && post.parent_content && (
                  <div className="parent-post">
                    <p>返信先: <ReactMarkdown>{post.parent_content}</ReactMarkdown></p>
                  </div>
                )}
                <ReactMarkdown className="post-content">{post.content}</ReactMarkdown>
                {post.content.match(/https?:\/\/[^\s]+/g) && (
                  <img src={post.content.match(/https?:\/\/[^\s]+/g)![0]} alt="Post image" className="post-image" />
                )}
                <div className="post-actions">
                  <button className="action-button" onClick={() => setReplyTo(post.id)}>
                    返信せい！
                  </button>
                  <button className="action-button" onClick={() => makeLike(post.id)}>
                    ええやん！
                  </button>
                </div>
                <div className="post-meta">
                  <small>
                    Posted by {post.nickname} at {formatToJST(post.created_at)}
                  </small>
                  <p>お前のいいねはこんなもん: {post.like_count}</p>
                </div>
                {showSmiley[post.id] && <div className="hand-wave">👍</div>}
                {replyTo === post.id && (
                  <div className="reply-form">
                    <textarea
                      value={userPost}
                      onChange={(e) => setUserPost(e.target.value)}
                      placeholder="Write your reply (Markdown supported)"
                      className="reply-textarea"
                    />
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Image URL (optional)"
                      className="image-url-input"
                    />
                    <button onClick={makePost} className="reply-button">リプライ！</button>
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
