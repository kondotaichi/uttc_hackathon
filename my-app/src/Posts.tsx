import React from 'react';

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  nickname: string; // ニックネームを追加
  like_count: number; // いいねのカウントを追加
  is_reply: boolean; // リプライかどうかを示すフラグ
  parent_id: string; // 親投稿のID
}

interface PostsProps {
  posts: Post[];
  userPost: string;
  setUserPost: (userPost: string) => void;
  replyTo: string | null;
  setReplyTo: (replyTo: string | null) => void;
  makePost: () => void;
  makeLike: (postID: string) => void;
}

const Posts: React.FC<PostsProps> = ({ posts, userPost, setUserPost, replyTo, setReplyTo, makePost, makeLike }) => (
  <div className="posts">
    {posts.map((post) => (
      <div key={post.id} className="post">
        <p>{post.content}</p>
        <button className="button" style={{ marginLeft: "auto" }} onClick={() => setReplyTo(post.id)}>
          Reply
        </button>
        <button className="button" style={{ marginLeft: "auto" }} onClick={() => makeLike(post.id)}>
          ええやん！
        </button>
        <small>
          Posted by {post.nickname} at {new Date(post.created_at).toLocaleString()}
        </small>
        <p>ええやん！: {post.like_count}</p>
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
);

export default Posts;