import React from 'react';

interface SignUpProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  nickname: string;
  setNickname: (nickname: string) => void;
  handleSignUp: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ email, setEmail, password, setPassword, nickname, setNickname, handleSignUp }) => (
  <div>
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    <input
      type="text"
      placeholder="Nickname"
      value={nickname}
      onChange={(e) => setNickname(e.target.value)}
    />
    <button onClick={handleSignUp}>Sign Up</button>
  </div>
);

export default SignUp;