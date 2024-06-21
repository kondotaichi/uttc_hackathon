import React from 'react';

interface AuthProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  nickname: string;
  setNickname: (nickname: string) => void;
  handleSignUp: () => void;
  handleLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  nickname,
  setNickname,
  handleSignUp,
  handleLogin,
}) => (
  <div className="auth-container">
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="input"
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="input"
    />
    <input
      type="text"
      placeholder="Nickname"
      value={nickname}
      onChange={(e) => setNickname(e.target.value)}
      className="input"
    />
    <button onClick={handleSignUp} className="button">Sign Up</button>
    <button onClick={handleLogin} className="button">Login</button>
  </div>
);

export default Auth;