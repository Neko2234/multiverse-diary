import React, { useState, useEffect } from 'react';
import './App.css';
import { 
    BookOpen, PenTool, Send, Sparkles, Loader2, 
    Key, Settings, ChevronRight, Edit3 
} from 'lucide-react';

// Constants
import { DEFAULT_PERSONAS } from './constants/personas';

// Services
import { fetchGeminiPersonas } from './services/api';

// Components
import { 
    PersonaSelector, 
    EntryItem, 
    SettingsModal, 
    AddPersonaModal 
} from './components';

export default function App() {
    const [entries, setEntries] = useState([]);
    const [inputText, setInputText] = useState("");
    const [selectedPersonas, setSelectedPersonas] = useState([]);
    const [isWriting, setIsWriting] = useState(false);
    const [view, setView] = useState('list'); // 'list' or 'new'
    
    // API Key State
    const [apiKey, setApiKey] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    
    // ペルソナ追加モーダル
    const [showAddPersonaModal, setShowAddPersonaModal] = useState(false);
    
    // カスタムペルソナ
    const [customPersonas, setCustomPersonas] = useState([]);
    
    // 非表示ペルソナID（デフォルトペルソナ用）
    const [hiddenPersonaIds, setHiddenPersonaIds] = useState([]);
    
    // ペルソナの表示順序（IDの配列）
    const [personaOrder, setPersonaOrder] = useState([]);
    
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
    
    // 初期読み込み完了フラグ
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize logic - 読み込み
    useEffect(() => {
        try {
            // Load Entries
            const savedEntries = localStorage.getItem('multiverse_diary_entries');
            if (savedEntries) {
                const parsed = JSON.parse(savedEntries);
                if (Array.isArray(parsed)) {
                    const validEntries = parsed.filter(entry => 
                        entry && 
                        typeof entry.id !== 'undefined' &&
                        typeof entry.content === 'string' &&
                        typeof entry.date === 'string' &&
                        Array.isArray(entry.comments)
                    );
                    setEntries(validEntries);
                }
            }
            
            // Load API Key
            const savedKey = localStorage.getItem('gemini_api_key');
            if (savedKey && typeof savedKey === 'string') {
                setApiKey(savedKey);
            }
            
            // Load Custom Personas
            const savedCustomPersonas = localStorage.getItem('multiverse_diary_custom_personas');
            if (savedCustomPersonas) {
                const parsed = JSON.parse(savedCustomPersonas);
                if (Array.isArray(parsed)) {
                    const validPersonas = parsed.filter(p =>
                        p &&
                        typeof p.id === 'string' &&
                        typeof p.name === 'string' &&
                        typeof p.role === 'string' &&
                        typeof p.desc === 'string'
                    );
                    setCustomPersonas(validPersonas);
                }
            }
            
            // Load Selected Personas (前回選択したペルソナ)
            const savedSelectedPersonas = localStorage.getItem('multiverse_diary_selected_personas');
            if (savedSelectedPersonas) {
                const parsed = JSON.parse(savedSelectedPersonas);
                if (Array.isArray(parsed)) {
                    setSelectedPersonas(parsed);
                }
            } else {
                // デフォルト選択
                setSelectedPersonas(['teacher', 'friend']);
            }
            
            // Load Hidden Persona IDs
            const savedHiddenIds = localStorage.getItem('multiverse_diary_hidden_personas');
            if (savedHiddenIds) {
                const parsed = JSON.parse(savedHiddenIds);
                if (Array.isArray(parsed)) {
                    setHiddenPersonaIds(parsed);
                }
            }
            
            // Load Persona Order
            const savedOrder = localStorage.getItem('multiverse_diary_persona_order');
            if (savedOrder) {
                const parsed = JSON.parse(savedOrder);
                if (Array.isArray(parsed)) {
                    setPersonaOrder(parsed);
                }
            }
        } catch (e) {
            console.error("Failed to load data", e);
            localStorage.removeItem('multiverse_diary_entries');
        }
        setIsLoaded(true);
    }, []);

    // Save Entries
    useEffect(() => {
        if (!isLoaded) return;
        try {
            localStorage.setItem('multiverse_diary_entries', JSON.stringify(entries));
        } catch (e) { console.error("Failed to save entries", e); }
    }, [entries, isLoaded]);
    
    // Save Custom Personas
    useEffect(() => {
        if (!isLoaded) return;
        try {
            localStorage.setItem('multiverse_diary_custom_personas', JSON.stringify(customPersonas));
        } catch (e) { console.error("Failed to save custom personas", e); }
    }, [customPersonas, isLoaded]);
    
    // Save Selected Personas
    useEffect(() => {
        if (!isLoaded) return;
        try {
            localStorage.setItem('multiverse_diary_selected_personas', JSON.stringify(selectedPersonas));
        } catch (e) { console.error("Failed to save selected personas", e); }
    }, [selectedPersonas, isLoaded]);
    
    // Save Hidden Persona IDs
    useEffect(() => {
        if (!isLoaded) return;
        try {
            localStorage.setItem('multiverse_diary_hidden_personas', JSON.stringify(hiddenPersonaIds));
        } catch (e) { console.error("Failed to save hidden personas", e); }
    }, [hiddenPersonaIds, isLoaded]);
    
    // Save Persona Order
    useEffect(() => {
        if (!isLoaded) return;
        try {
            localStorage.setItem('multiverse_diary_persona_order', JSON.stringify(personaOrder));
        } catch (e) { console.error("Failed to save persona order", e); }
    }, [personaOrder, isLoaded]);

    const handleSaveKey = (key) => {
        setApiKey(key);
        localStorage.setItem('gemini_api_key', key);
        setShowSettings(false);
    };
    
    const handleAddCustomPersona = (newPersona) => {
        setCustomPersonas(prev => [...prev, newPersona]);
    };
    
    const handleDeleteCustomPersona = (personaId) => {
        setCustomPersonas(prev => prev.filter(p => p.id !== personaId));
        setSelectedPersonas(prev => prev.filter(id => id !== personaId));
        setPersonaOrder(prev => prev.filter(id => id !== personaId));
    };
    
    const handleTogglePersonaVisibility = (personaId) => {
        setHiddenPersonaIds(prev => 
            prev.includes(personaId) 
                ? prev.filter(id => id !== personaId)
                : [...prev, personaId]
        );
        // 非表示にしたペルソナは選択解除
        if (!hiddenPersonaIds.includes(personaId)) {
            setSelectedPersonas(prev => prev.filter(id => id !== personaId));
        }
    };
    
    const handleMovePersona = (personaId, direction) => {
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
    };
    
    // ドラッグ＆ドロップによる並び替え
    const handleReorderPersonas = (newOrderIds) => {
        setPersonaOrder(newOrderIds);
    };
    
    const handleClearAllData = () => {
        localStorage.removeItem('multiverse_diary_entries');
        localStorage.removeItem('gemini_api_key');
        localStorage.removeItem('multiverse_diary_custom_personas');
        localStorage.removeItem('multiverse_diary_selected_personas');
        localStorage.removeItem('multiverse_diary_hidden_personas');
        localStorage.removeItem('multiverse_diary_persona_order');
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

    const togglePersona = (id) => {
        setSelectedPersonas(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleUpdateEntry = (id, updatedEntry) => {
        setEntries(entries.map(e => e.id === id ? updatedEntry : e));
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

        setEntries([newEntry, ...entries]);
        setInputText("");
        setIsWriting(false);
        setView('list');
    };

    const handleDelete = (id) => {
        if (window.confirm("この日記を削除しますか？")) {
            setEntries(entries.filter(e => e.id !== id));
        }
    };

    return (
        <div className="min-h-screen pb-16">
            {/* Header */}
            <header className="app-header py-5 px-5 sm:py-6 sm:px-8 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <h1 
                        className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3 sm:gap-4 cursor-pointer" 
                        onClick={() => setView('list')}
                    >
                        <span className="text-3xl sm:text-4xl">🌌</span> 
                        <span className="app-logo">Multiverse Diary</span>
                    </h1>
                    
                    <div className="flex gap-2 sm:gap-3">
                        <button 
                            onClick={() => setShowSettings(true)}
                            className={`p-3 rounded-xl transition-all ${
                                apiKey 
                                    ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                                    : 'text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg animate-pulse'
                            }`}
                            title="APIキー設定"
                        >
                            <Settings size={24} />
                        </button>

                        {view === 'list' && (
                            <button 
                                onClick={() => setView('new')}
                                className="btn-primary !py-3 !px-5 sm:!px-6"
                            >
                                <PenTool size={20} />
                                <span className="hidden sm:inline">日記を書く</span>
                            </button>
                        )}
                        {view === 'new' && (
                            <button 
                                onClick={() => setView('list')}
                                className="btn-secondary !py-2.5"
                            >
                                キャンセル
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 sm:pt-10">
                {/* Warning Banner if no Key */}
                {!apiKey && view === 'list' && (
                    <div 
                        onClick={() => setShowSettings(true)} 
                        className="api-banner text-white p-6 mb-10 cursor-pointer flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <Key size={28} />
                            </div>
                            <div>
                                <div className="font-bold text-lg">APIキーを設定しよう</div>
                                <div className="text-sm text-white/80">タップしてGemini APIキーを入力</div>
                            </div>
                        </div>
                        <ChevronRight size={28} className="text-white/60" />
                    </div>
                )}

                {/* New Entry View */}
                {view === 'new' && (
                    <div className="animate-slideUp">
                        <div className="diary-card p-6 sm:p-10">
                            <label className="block text-gray-800 font-bold mb-5 text-xl flex items-center gap-3">
                                <span className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                                    <Edit3 size={22} className="text-indigo-500" />
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
                                    <BookOpen size={44} strokeWidth={1.5} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">まだ日記がありません</h2>
                                <p className="text-gray-500 mb-10 text-base leading-relaxed max-w-sm mx-auto">
                                    今日あったことを書いて、<br/>
                                    AIキャラクターたちからコメントをもらいましょう
                                </p>
                                <button 
                                    onClick={() => setView('new')}
                                    className="btn-primary"
                                >
                                    <Edit3 size={20} />
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
