import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCTYYkfGYKLl0Eff9EVJGMyWDaSjkb_B0E",
  authDomain: "alicia-44394.firebaseapp.com",
  projectId: "alicia-44394",
  storageBucket: "alicia-44394.firebasestorage.app",
  messagingSenderId: "19778147732",
  appId: "1:19778147732:web:d4ca3efd2870c32c60ab81",
  measurementId: "G-JDXBLFDY8D",
};

// Prevent re-initialization in Next.js hot-module-replacement
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export default app;
