// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCpzTIqwAtZQ5qmmY7IH3CzR0dR8fcE9_Y",
  authDomain: "term5-taichi-kondo.firebaseapp.com",
  projectId: "term5-taichi-kondo",
  storageBucket: "term5-taichi-kondo.appspot.com",
  messagingSenderId: "141152310423",
  appId: "1:141152310423:web:496fd4581d62c78615c5d2",
  measurementId: "G-9606039019"
};

const app = initializeApp(firebaseConfig);
const fireAuth = getAuth(app);

export { fireAuth };