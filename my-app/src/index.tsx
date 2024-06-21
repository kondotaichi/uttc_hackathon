import React from 'react';
import createRoot from 'react-dom';
import './styles.css';
import App from './App';
import './firebase/firebase.ts';  // firebaseの初期化をインポート

createRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
