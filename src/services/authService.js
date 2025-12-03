// 認証サービス
import { 
    signInWithPopup, 
    signOut as firebaseSignOut,
    onAuthStateChanged 
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

// Google でサインイン
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { user: result.user, error: null };
    } catch (error) {
        console.error("Google sign-in error:", error);
        return { user: null, error: error.message };
    }
};

// サインアウト
export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
        return { error: null };
    } catch (error) {
        console.error("Sign-out error:", error);
        return { error: error.message };
    }
};

// 認証状態の監視
export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, callback);
};
