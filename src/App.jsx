import React, { useState, useEffect } from 'react';
import './App.css';
import { 
    BookOpen, PenTool, Send, Sparkles, Loader2, 
    Key, Settings, ChevronRight, Edit3, LogOut 
} from 'lucide-react';

// Constants
import { DEFAULT_PERSONAS } from './constants/personas';

// Services
import { fetchGeminiPersonas } from './services/api';
import { signInWithGoogle, signOut, subscribeToAuthChanges } from './services/authService';
import { 
    subscribeToUserData, 
    updateEntries, 
    updateCustomPersonas,
    updateSelectedPersonas,
    updateHiddenPersonaIds,
    updatePersonaOrder,
    deleteUserData,
    saveGeminiApiKeyLocal,
    getGeminiApiKeyLocal,
    removeGeminiApiKeyLocal
} from './services/firestoreService';

// Components
import { 
    PersonaSelector, 
    EntryItem, 
    SettingsModal, 
    AddPersonaModal,
    LoginScreen 
} from './components';

export default function App() {
    // 認証状態
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
    
    // データ状態
    const [entries, setEntries] = useState([]);
    const [inputText, setInputText] = useState("");
    const [selectedPersonas, setSelectedPersonas] = useState(['teacher', 'friend']);
    const [isWriting, setIsWriting] = useState(false);
    const [view, setView] = useState('list');
    
    // API Key State
    const [apiKey, setApiKey] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    
    // ペルソナ追加モーダル
    const [showAddPersonaModal, setShowAddPersonaModal] = useState(false);
    
    // カスタムペルソナ
    const [customPersonas, setCustomPersonas] = useState([]);
    
    // 非表示ペルソナID
    const [hiddenPersonaIds, setHiddenPersonaIds] = useState([]);
    
    // ペルソナの表示順序
    const [personaOrder, setPersonaOrder] = useState([]);
    
    // データ読み込み状態
    const [dataLoading, setDataLoading] = useState(false);
    
    // 全ペルソナ（デフォルト + カスタム）を順序通りに並べる
    const allPersonasRaw = [...DEFAULT_PERSONAS, ...customPersonas];
    const allPersonas = personaOrder.length > 0
        ? personaOrder
            .map(id => allPersonasRaw.find(p => p.id === id))
            .filter(Boolean)
            .concat(allPersonasRaw.filter(p => !personaOrder.includes(p.id)))
        : allPersonasRaw;
    
    // 表示用ペルソナ（非表示を除外）
    const visiblePersonas = allPersonas.filter(p => !hiddenPersonaIds.includes(p.id));

    // 認証状態の監視
    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges((authUser) => {
            setUser(authUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // ユーザーデータのリアルタイム同期
    useEffect(() => {
        if (!user) {
            // ログアウト時にデータをリセット
            setEntries([]);
            setCustomPersonas([]);
            setSelectedPersonas(['teacher', 'friend']);
            setHiddenPersonaIds([]);
            setPersonaOrder([]);
            setApiKey("");
            return;
        }

        setDataLoading(true);
        
        const unsubscribe = subscribeToUserData(user.uid, ({ data, error }) => {
            if (error) {
                console.error("Data sync error:", error);
                setDataLoading(false);
                return;
            }
            
            if (data) {
                setEntries(data.entries || []);
                setCustomPersonas(data.customPersonas || []);
                setSelectedPersonas(data.selectedPersonas || ['teacher', 'friend']);
                setHiddenPersonaIds(data.hiddenPersonaIds || []);
                setPersonaOrder(data.personaOrder || []);
                // APIキーはローカルストレージから読み込み（セキュリティのため）
                setApiKey(getGeminiApiKeyLocal());
            }
            setDataLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Googleログイン処理
    const handleGoogleSignIn = async () => {
        setAuthError(null);
        setAuthLoading(true);
        const { user: authUser, error } = await signInWithGoogle();
        if (error) {
            setAuthError(error);
        }
        setAuthLoading(false);
    };

    // ログアウト処理
    const handleSignOut = async () => {
        if (window.confirm("ログアウトしますか？")) {
            await signOut();
        }
    };

    // APIキーの保存（ローカルストレージのみ、セキュリティのためFirestoreには保存しない）
    const handleSaveKey = (key) => {
        setApiKey(key);
        saveGeminiApiKeyLocal(key);
        setShowSettings(false);
    };
    
    // エントリの更新（Firestoreに保存）
    const saveEntries = async (newEntries) => {
        setEntries(newEntries);
        if (user) {
            await updateEntries(user.uid, newEntries);
        }
    };
    
    // カスタムペルソナの追加
    const handleAddCustomPersona = async (newPersona) => {
        const newCustomPersonas = [...customPersonas, newPersona];
        setCustomPersonas(newCustomPersonas);
        if (user) {
            await updateCustomPersonas(user.uid, newCustomPersonas);
        }
    };
    
    // カスタムペルソナの削除
    const handleDeleteCustomPersona = async (personaId) => {
        const newCustomPersonas = customPersonas.filter(p => p.id !== personaId);
        const newSelectedPersonas = selectedPersonas.filter(id => id !== personaId);
        const newPersonaOrder = personaOrder.filter(id => id !== personaId);
        
        setCustomPersonas(newCustomPersonas);
        setSelectedPersonas(newSelectedPersonas);
        setPersonaOrder(newPersonaOrder);
        
        if (user) {
            await updateCustomPersonas(user.uid, newCustomPersonas);
            await updateSelectedPersonas(user.uid, newSelectedPersonas);
            await updatePersonaOrder(user.uid, newPersonaOrder);
        }
    };
    
    // ペルソナの表示/非表示切り替え
    const handleTogglePersonaVisibility = async (personaId) => {
        const newHiddenIds = hiddenPersonaIds.includes(personaId)
            ? hiddenPersonaIds.filter(id => id !== personaId)
            : [...hiddenPersonaIds, personaId];
        
        setHiddenPersonaIds(newHiddenIds);
        
        // 非表示にしたペルソナは選択解除
        if (!hiddenPersonaIds.includes(personaId)) {
            const newSelectedPersonas = selectedPersonas.filter(id => id !== personaId);
            setSelectedPersonas(newSelectedPersonas);
            if (user) {
                await updateSelectedPersonas(user.uid, newSelectedPersonas);
            }
        }
        
        if (user) {
            await updateHiddenPersonaIds(user.uid, newHiddenIds);
        }
    };
    
    // ペルソナの並び替え（上下）
    const handleMovePersona = async (personaId, direction) => {
        const currentOrder = personaOrder.length > 0 
            ? personaOrder 
            : allPersonasRaw.map(p => p.id);
        const index = currentOrder.indexOf(personaId);
        if (index === -1) return;
        
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= currentOrder.length) return;
        
        const newOrder = [...currentOrder];
        [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
        
        setPersonaOrder(newOrder);
        if (user) {
            await updatePersonaOrder(user.uid, newOrder);
        }
    };
    
    // ドラッグ＆ドロップによる並び替え
    const handleReorderPersonas = async (newOrderIds) => {
        setPersonaOrder(newOrderIds);
        if (user) {
            await updatePersonaOrder(user.uid, newOrderIds);
        }
    };
    
    // 全データ削除
    const handleClearAllData = async () => {
        if (user) {
            await deleteUserData(user.uid);
        }
        // ローカルストレージのAPIキーも削除
        removeGeminiApiKeyLocal();
        setEntries([]);
        setApiKey("");
        setCustomPersonas([]);
        setSelectedPersonas(['teacher', 'friend']);
        setHiddenPersonaIds([]);
        setPersonaOrder([]);
        setShowSettings(false);
    };

    const handleExportData = () => {
        const exportData = {
            exportDate: new Date().toISOString(),
            appName: 'Multiverse Diary',
            entries: entries
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `multiverse-diary-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const togglePersona = async (id) => {
        const newSelectedPersonas = selectedPersonas.includes(id) 
            ? selectedPersonas.filter(p => p !== id) 
            : [...selectedPersonas, id];
        
        setSelectedPersonas(newSelectedPersonas);
        if (user) {
            await updateSelectedPersonas(user.uid, newSelectedPersonas);
        }
    };

    const handleUpdateEntry = async (id, updatedEntry) => {
        const newEntries = entries.map(e => e.id === id ? updatedEntry : e);
        await saveEntries(newEntries);
    };

    const handleSubmit = async () => {
        if (!inputText.trim()) return;
        if (selectedPersonas.length === 0) {
            alert("コメントをくれる人を選んでください！");
            return;
        }
        
        if (!apiKey) {
            setShowSettings(true);
            return;
        }

        setIsWriting(true);

        const aiResponses = await fetchGeminiPersonas(apiKey, inputText, selectedPersonas, allPersonas);
        
        const newComments = aiResponses.map(r => ({
            personaId: r.id,
            text: r.comment
        }));

        const newEntry = {
            id: Date.now(),
            date: new Date().toLocaleString('ja-JP', { 
                year: 'numeric', month: '2-digit', day: '2-digit', 
                hour: '2-digit', minute: '2-digit', weekday: 'short'
            }),
            content: inputText,
            comments: newComments
        };

        await saveEntries([newEntry, ...entries]);
        setInputText("");
        setIsWriting(false);
        setView('list');
    };

    const handleDelete = async (id) => {
        if (window.confirm("この日記を削除しますか？")) {
            await saveEntries(entries.filter(e => e.id !== id));
        }
    };

    // ローディング画面
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-indigo-500 mx-auto mb-4" />
                    <p className="text-gray-500">読み込み中...</p>
                </div>
            </div>
        );
    }

    // ログイン画面
    if (!user) {
        return (
            <LoginScreen 
                onGoogleSignIn={handleGoogleSignIn}
                isLoading={authLoading}
                error={authError}
            />
        );
    }

    // データ読み込み中
    if (dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-indigo-500 mx-auto mb-4" />
                    <p className="text-gray-500">データを同期中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-16">
            {/* Header */}
            <header className="app-header py-3 px-4 sm:py-5 sm:px-8 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <h1 
                        className="text-lg sm:text-2xl font-bold tracking-tight flex items-center gap-2 sm:gap-3 cursor-pointer" 
                        onClick={() => setView('list')}
                    >
                        <span className="text-2xl sm:text-3xl">🌌</span> 
                        <span className="app-logo">Multiverse Diary</span>
                    </h1>
                    
                    <div className="flex gap-2 items-center">
                        {/* ユーザーアバター */}
                        {user.photoURL && (
                            <img 
                                src={user.photoURL} 
                                alt={user.displayName}
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                title={user.displayName}
                            />
                        )}
                        
                        <button 
                            onClick={() => setShowSettings(true)}
                            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all hover:bg-gray-100"
                            title="設定"
                        >
                            <Settings 
                                size={20} 
                                className="sm:w-[22px] sm:h-[22px]"
                                style={{ color: apiKey ? '#6366f1' : '#ef4444' }}
                            />
                        </button>

                        {view === 'list' && (
                            <button 
                                onClick={() => setView('new')}
                                className="btn-primary !py-2 !px-3 sm:!py-2.5 sm:!px-5"
                            >
                                <PenTool size={16} className="sm:w-[18px] sm:h-[18px]" />
                                <span className="hidden sm:inline">日記を書く</span>
                            </button>
                        )}
                        {view === 'new' && (
                            <button 
                                onClick={() => setView('list')}
                                className="btn-secondary !py-2"
                            >
                                キャンセル
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-8 pt-6 sm:pt-10">
                {/* Warning Banner if no Key */}
                {!apiKey && view === 'list' && (
                    <div 
                        onClick={() => setShowSettings(true)} 
                        className="api-banner text-white p-4 sm:p-6 mb-6 sm:mb-10 cursor-pointer flex items-center justify-between gap-3 sm:gap-4"
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                                <Key size={20} className="sm:w-[24px] sm:h-[24px]" />
                            </div>
                            <div>
                                <div className="font-bold text-base sm:text-lg">APIキーを設定しよう</div>
                                <div className="text-xs sm:text-sm text-white/80">タップしてGemini APIキーを入力</div>
                            </div>
                        </div>
                        <ChevronRight size={24} className="text-white/60 sm:w-[28px] sm:h-[28px]" />
                    </div>
                )}

                {/* New Entry View */}
                {view === 'new' && (
                    <div className="animate-slideUp">
                        <div className="diary-card p-5 sm:p-8">
                            <label className="block text-gray-800 font-bold mb-4 text-lg sm:text-xl flex items-center gap-2 sm:gap-3">
                                <span className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                                    <Edit3 size={18} className="text-indigo-500 sm:w-[20px] sm:h-[20px]" />
                                </span>
                                今日の出来事は？
                            </label>
                            <textarea
                                className="textarea-diary mb-2"
                                placeholder="例：仕事で失敗しちゃったけど、ランチのパスタが美味しかった。&#10;&#10;嬉しかったこと、悲しかったこと、なんでもOK！"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value.slice(0, 2000))}
                                maxLength={2000}
                                autoFocus
                            ></textarea>
                            <div className="text-right text-sm text-gray-400 mb-4">
                                {inputText.length} / 2000
                            </div>
                            
                            <PersonaSelector 
                                selected={selectedPersonas} 
                                togglePersona={togglePersona} 
                                personas={visiblePersonas}
                                onShowAddModal={() => setShowAddPersonaModal(true)}
                            />

                            <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isWriting || !inputText.trim()}
                                    className="btn-primary w-full sm:w-auto"
                                >
                                    {isWriting ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            <span>AIがコメント生成中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={20} />
                                            <span>保存してコメントをもらう</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* List View */}
                {view === 'list' && (
                    <div>
                        {entries.length === 0 ? (
                            <div className="empty-state text-center animate-fadeIn">
                                <div className="empty-state-icon">
                                    <BookOpen size={32} className="sm:w-[40px] sm:h-[40px]" strokeWidth={1.5} />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">まだ日記がありません</h2>
                                <p className="text-gray-500 mb-6 sm:mb-10 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
                                    今日あったことを書いて、<br/>
                                    AIキャラクターたちからコメントをもらいましょう
                                </p>
                                <button 
                                    onClick={() => setView('new')}
                                    className="btn-primary"
                                >
                                    <Edit3 size={18} />
                                    最初の日記を書く
                                </button>
                            </div>
                        ) : (
                            <div>
                                {entries.map((entry, index) => (
                                    <div 
                                        key={entry.id} 
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <EntryItem 
                                            entry={entry} 
                                            onDelete={handleDelete} 
                                            onUpdate={handleUpdateEntry} 
                                            apiKey={apiKey}
                                            allPersonas={allPersonas}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Settings Modal */}
            {showSettings && (
                <SettingsModal 
                    savedKey={apiKey} 
                    onSave={handleSaveKey} 
                    onCancel={() => setShowSettings(false)}
                    entriesCount={entries.length}
                    onClearAllData={handleClearAllData}
                    onExportData={handleExportData}
                    customPersonas={customPersonas}
                    onDeleteCustomPersona={handleDeleteCustomPersona}
                    allPersonas={allPersonas}
                    hiddenPersonaIds={hiddenPersonaIds}
                    onTogglePersonaVisibility={handleTogglePersonaVisibility}
                    onMovePersona={handleMovePersona}
                    onReorderPersonas={handleReorderPersonas}
                    onAddPersona={() => setShowAddPersonaModal(true)}
                    user={user}
                    onSignOut={handleSignOut}
                />
            )}

            {/* Add Persona Modal */}
            {showAddPersonaModal && (
                <AddPersonaModal 
                    onAdd={(newPersona) => {
                        handleAddCustomPersona(newPersona);
                        setShowAddPersonaModal(false);
                    }}
                    onCancel={() => setShowAddPersonaModal(false)}
                />
            )}
        </div>
    );
}
