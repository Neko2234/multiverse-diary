// Firestore データサービス
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc,
    deleteDoc,
    query, 
    orderBy,
    onSnapshot,
    serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

// ユーザーデータのドキュメント参照を取得
const getUserDocRef = (userId) => doc(db, "users", userId);

// ユーザーデータを取得（初回ロード用）
export const getUserData = async (userId) => {
    try {
        const docRef = getUserDocRef(userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { data: docSnap.data(), error: null };
        } else {
            // 新規ユーザーの場合、初期データを作成
            // 注意: Gemini APIキーはセキュリティ上、ローカルストレージに保存（Firestoreには保存しない）
            const initialData = {
                entries: [],
                customPersonas: [],
                selectedPersonas: ['teacher', 'friend'],
                hiddenPersonaIds: [],
                personaOrder: [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            await setDoc(docRef, initialData);
            return { data: initialData, error: null };
        }
    } catch (error) {
        console.error("Error getting user data:", error);
        return { data: null, error: error.message };
    }
};

// ユーザーデータをリアルタイムで監視
export const subscribeToUserData = (userId, callback) => {
    const docRef = getUserDocRef(userId);
    
    return onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
            callback({ data: docSnap.data(), error: null });
        } else {
            // ドキュメントが存在しない場合、初期データを作成
            console.log("Creating initial user data for:", userId);
            const initialData = {
                entries: [],
                customPersonas: [],
                selectedPersonas: ['teacher', 'friend'],
                hiddenPersonaIds: [],
                personaOrder: [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            try {
                await setDoc(docRef, initialData);
                // setDoc後、onSnapshotが再度トリガーされるので、ここではcallbackを呼ばない
            } catch (error) {
                console.error("Error creating initial user data:", error);
                callback({ data: null, error: error.message });
            }
        }
    }, (error) => {
        console.error("Error subscribing to user data:", error);
        callback({ data: null, error: error.message });
    });
};

// 日記エントリを更新
export const updateEntries = async (userId, entries) => {
    try {
        const docRef = getUserDocRef(userId);
        await updateDoc(docRef, { 
            entries,
            updatedAt: serverTimestamp()
        });
        return { error: null };
    } catch (error) {
        console.error("Error updating entries:", error);
        return { error: error.message };
    }
};

// カスタムペルソナを更新
export const updateCustomPersonas = async (userId, customPersonas) => {
    try {
        const docRef = getUserDocRef(userId);
        await updateDoc(docRef, { 
            customPersonas,
            updatedAt: serverTimestamp()
        });
        return { error: null };
    } catch (error) {
        console.error("Error updating custom personas:", error);
        return { error: error.message };
    }
};

// 選択中のペルソナを更新
export const updateSelectedPersonas = async (userId, selectedPersonas) => {
    try {
        const docRef = getUserDocRef(userId);
        await updateDoc(docRef, { 
            selectedPersonas,
            updatedAt: serverTimestamp()
        });
        return { error: null };
    } catch (error) {
        console.error("Error updating selected personas:", error);
        return { error: error.message };
    }
};

// 非表示ペルソナIDsを更新
export const updateHiddenPersonaIds = async (userId, hiddenPersonaIds) => {
    try {
        const docRef = getUserDocRef(userId);
        await updateDoc(docRef, { 
            hiddenPersonaIds,
            updatedAt: serverTimestamp()
        });
        return { error: null };
    } catch (error) {
        console.error("Error updating hidden persona IDs:", error);
        return { error: error.message };
    }
};

// ペルソナの順序を更新
export const updatePersonaOrder = async (userId, personaOrder) => {
    try {
        const docRef = getUserDocRef(userId);
        await updateDoc(docRef, { 
            personaOrder,
            updatedAt: serverTimestamp()
        });
        return { error: null };
    } catch (error) {
        console.error("Error updating persona order:", error);
        return { error: error.message };
    }
};

// Gemini APIキーはセキュリティ上、ローカルストレージに保存（Firestoreには保存しない）
export const saveGeminiApiKeyLocal = (apiKey) => {
    try {
        localStorage.setItem('gemini_api_key', apiKey);
        return { error: null };
    } catch (error) {
        console.error("Error saving API key:", error);
        return { error: error.message };
    }
};

export const getGeminiApiKeyLocal = () => {
    try {
        return localStorage.getItem('gemini_api_key') || "";
    } catch (error) {
        console.error("Error getting API key:", error);
        return "";
    }
};

export const removeGeminiApiKeyLocal = () => {
    try {
        localStorage.removeItem('gemini_api_key');
    } catch (error) {
        console.error("Error removing API key:", error);
    }
};

// ユーザーデータを削除
export const deleteUserData = async (userId) => {
    try {
        const docRef = getUserDocRef(userId);
        await deleteDoc(docRef);
        return { error: null };
    } catch (error) {
        console.error("Error deleting user data:", error);
        return { error: error.message };
    }
};
