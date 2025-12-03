// Firebase 設定と初期化
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBLRqnLMkKv3yTqdmWDwnQh_wQqjDGxcp0",
    authDomain: "multiverse-diary.firebaseapp.com",
    projectId: "multiverse-diary",
    storageBucket: "multiverse-diary.firebasestorage.app",
    messagingSenderId: "944699167684",
    appId: "1:944699167684:web:6a88971587af8895180a91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
