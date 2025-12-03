import React, { useState, useEffect } from 'react';
import { BookOpen, PenTool, Trash2, Send, MessageCircle, Calendar, Edit3, Sparkles, BrainCircuit, Loader2, Key, Settings, LogOut, X } from 'lucide-react';

// --- Data & Logic Definition ---

const PERSONAS = [
    { id: 'teacher', name: '田中先生', role: '先生', icon: '👨‍🏫', color: 'bg-green-100 text-green-800', desc: '優しく諭してくれる恩師。少し古風だが生徒思い。教育的指導を含めることが多い。' },
    { id: 'friend', name: '親友のミカ', role: '架空の友達', icon: '👱‍♀️', color: 'bg-yellow-100 text-yellow-800', desc: 'いつも味方でいてくれる元気な友人。ギャル語混じりで、共感力が高い。テンションが高い。' },
    { id: 'lover', name: '恋人', role: '恋人', icon: '🥰', color: 'bg-pink-100 text-pink-800', desc: '全肯定してくれる甘い存在。ユーザーのことが大好きで、少し過保護。キザなセリフも言う。' },
    { id: 'aunt', name: 'お節介な叔母さん', role: '親戚', icon: '👵', color: 'bg-orange-100 text-orange-800', desc: '心配性で現実的なアドバイスをくれる。健康や食事のことを気にする。口調は「〜だわよ」「〜しなさい」。' },
    { id: 'celeb', name: 'カリスマRay', role: '有名人', icon: '😎', color: 'bg-purple-100 text-purple-800', desc: '少し上から目線だが、夢を語るスター。英語混じりのルー大柴的な口調。ポジティブで野心的。' },
    { id: 'isekai', name: '暗黒騎士ゼイド', role: '異世界人', icon: '🐉', color: 'bg-gray-800 text-gray-100', desc: '現代の常識が通じない、魔界の住人。ユーザーを「契約者」や「盟友」と呼ぶ。中二病的な言い回し。' },
];

// Fallback logic (Local) for when API fails
const generateLocalResponse = (text, personaId) => {
    const t = text.toLowerCase();
    const keywords = {
        negative: ['疲れた', 'つらい', '死にたい', '失敗', '嫌', '悲しい', '怒', '最悪', '泣', '不安'],
        positive: ['楽しい', '嬉しい', '最高', '成功', '好き', '愛', '良かっ', '笑', 'ハッピー'],
        effort: ['頑張', '勉強', '仕事', '練習', '努力', '目標', '挑戦'],
        food: ['食べ', '美味しい', 'お腹', 'ラーメン', '肉', '酒', 'ごはん'],
        love: ['恋', '愛', 'デート', '彼氏', '彼女', '結婚', '推し']
    };
    const type = Object.keys(keywords).find(key => keywords[key].some(k => t.includes(k))) || 'neutral';
    const responses = {
        teacher: { negative: "辛い時は無理せず休むのも勇気ですよ。", positive: "素晴らしい！その意気です。", effort: "努力は必ず報われますよ。", neutral: "なるほど、記録しておくことは大切ですね。" },
        friend: { negative: "えー大丈夫？話聞くよ！", positive: "最高じゃん！", effort: "えらすぎ！", neutral: "そっかそっか〜。" },
        lover: { negative: "大丈夫？飛んでいこうか？", positive: "君が笑顔なら僕も幸せだ。", effort: "頑張り屋な君が好きだよ。", neutral: "君のことを知れて嬉しいよ。" },
        aunt: { negative: "ちゃんとご飯食べて寝なさいよ！", positive: "あらよかったじゃない！", effort: "根詰めすぎちゃだめよ。", neutral: "たまには顔見せなさいね。" },
        celeb: { negative: "Rainy days make flowers grow.", positive: "Excellent!", effort: "Dream big.", neutral: "Keep it cool." },
        isekai: { negative: "心の闇が広がっているな...", positive: "光の加護があらんことを！", effort: "修練か、悪くない。", neutral: "異界の日常とは興味深い。" }
    };
    return responses[personaId]?.[type] || responses[personaId]?.neutral;
};

// Gemini API Call for Personas
const fetchGeminiPersonas = async (apiKey, text, selectedIds) => {
    const selectedPersonas = PERSONAS.filter(p => selectedIds.includes(p.id));
    
    const systemPrompt = `
    You are a roleplay AI.
    Analyze the user's diary entry and provide a response from EACH of the following characters.
    
    Characters:
    ${selectedPersonas.map(p => `- ID: "${p.id}", Name: "${p.name}", Role: "${p.role}", Personality: "${p.desc}"`).join('\n')}
    
    Instructions:
    - Respond in Japanese.
    - Keep each response short (max 2 sentences).
    - Stay strictly in character based on the Personality description.
    - Output MUST be valid JSON with this schema: { "responses": [ { "id": "persona_id", "comment": "comment text" } ] }
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Diary Entry: "${text}"` }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!jsonText) throw new Error('No text generated');
        
        const parsed = JSON.parse(jsonText);
        return parsed.responses; // Expecting array of {id, comment}

    } catch (error) {
        console.error("Gemini API Error (Personas):", error);
        return selectedPersonas.map(p => ({
            id: p.id,
            comment: generateLocalResponse(text, p.id) // Fallback
        }));
    }
};

// Gemini API Call for Analysis
const fetchGeminiAnalysis = async (apiKey, text) => {
    const systemPrompt = `
    You are a psychological counselor and fortune teller.
    Analyze the user's diary entry and provide an "Emotional Insight" report.
    
    Output JSON schema:
    {
      "mood_score": number (0-100),
      "emotional_weather": string (e.g., "晴れ時々曇り", "大嵐", "快晴"),
      "hidden_emotions": string (Briefly explain subconscious feelings),
      "lucky_action": string (A small, positive action suggested for tomorrow),
      "deep_advice": string (One sentence of profound advice)
    }
    Response in Japanese.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Diary Entry: "${text}"` }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Gemini API Error (Analysis):", error);
        return null;
    }
};

// --- Components ---

const Avatar = ({ icon, className }) => (
    <div className={`w-12 h-12 flex items-center justify-center rounded-full text-2xl shadow-sm ${className}`}>
        {icon}
    </div>
);

const CommentCard = ({ persona, text }) => (
    <div className="flex gap-3 mb-4 animate-fadeIn">
        <Avatar icon={persona.icon} className={persona.color + " flex-shrink-0"} />
        <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm border border-gray-100 flex-1 relative group">
            <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold text-sm text-gray-700">{persona.name}</span>
                <span className="text-xs text-gray-400">{persona.role}</span>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed">{text}</p>
        </div>
    </div>
);

const AnalysisSection = ({ analysis, onClose }) => (
    <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100 animate-fadeIn">
        <div className="flex justify-between items-start mb-3">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                AI 感情分析レポート
            </h4>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs">閉じる</button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/60 p-3 rounded-lg">
                <div className="text-xs text-indigo-600 font-bold mb-1">心の天気</div>
                <div className="text-lg font-bold text-gray-800">{analysis.emotional_weather}</div>
            </div>
            <div className="bg-white/60 p-3 rounded-lg">
                <div className="text-xs text-indigo-600 font-bold mb-1">ムードスコア</div>
                <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-indigo-600">{analysis.mood_score}</span>
                    <span className="text-xs text-gray-500 mb-1">/100</span>
                </div>
            </div>
        </div>

        <div className="space-y-3">
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">隠れた感情</div>
                <p className="text-sm text-gray-800 bg-white/60 p-2 rounded">{analysis.hidden_emotions}</p>
            </div>
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">ラッキーアクション</div>
                <p className="text-sm text-gray-800 bg-white/60 p-2 rounded flex items-center gap-2">
                    <span>🍀</span> {analysis.lucky_action}
                </p>
            </div>
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">深層アドバイス</div>
                <p className="text-sm text-indigo-800 italic border-l-4 border-indigo-300 pl-3 py-1">
                    "{analysis.deep_advice}"
                </p>
            </div>
        </div>
    </div>
);

const PersonaSelector = ({ selected, togglePersona }) => (
    <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-2">
            <MessageCircle size={16} />
            誰からコメントをもらいますか？
        </h3>
        <div className="flex flex-wrap gap-2">
            {PERSONAS.map(p => {
                const isSelected = selected.includes(p.id);
                return (
                    <button
                        key={p.id}
                        onClick={() => togglePersona(p.id)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all flex items-center gap-1
                            ${isSelected 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        <span>{p.icon}</span>
                        {p.role}
                    </button>
                )
            })}
        </div>
    </div>
);

const EntryItem = ({ entry, onDelete, onUpdate, apiKey }) => {
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalysis = async () => {
        if (!apiKey) {
            alert("AI機能を使うにはAPIキーを設定してください。");
            return;
        }
        setAnalyzing(true);
        const result = await fetchGeminiAnalysis(apiKey, entry.content);
        if (result) {
            onUpdate(entry.id, { ...entry, analysis: result });
        } else {
            alert("分析に失敗しました。APIキーが正しいか確認してください。");
        }
        setAnalyzing(false);
    };

    const clearAnalysis = () => {
        const { analysis, ...rest } = entry;
        onUpdate(entry.id, rest);
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                <span className="text-gray-400 text-sm font-mono flex items-center gap-1">
                    <Calendar size={14} />
                    {entry.date}
                </span>
                <button 
                    onClick={() => onDelete(entry.id)} 
                    className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50"
                    title="削除"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            
            <div className="mb-6">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
            </div>

            {/* Analysis Button or Section */}
            {entry.analysis ? (
                <AnalysisSection analysis={entry.analysis} onClose={clearAnalysis} />
            ) : (
                <div className="mb-4 flex justify-end">
                    <button 
                        onClick={handleAnalysis}
                        disabled={analyzing}
                        className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                    >
                        {analyzing ? <Loader2 size={12} className="animate-spin" /> : <BrainCircuit size={14} />}
                        {analyzing ? '分析中...' : 'AI感情分析を実行'}
                    </button>
                </div>
            )}

            <div className="space-y-4 border-t border-gray-100 pt-4 bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-xl">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MessageCircle size={12} />
                    Comments (AI Powered)
                </h4>
                {entry.comments.map((c, i) => {
                    const persona = PERSONAS.find(p => p.id === c.personaId);
                    return persona ? <CommentCard key={i} persona={persona} text={c.text} /> : null;
                })}
            </div>
        </div>
    );
};

// --- Settings Modal ---
const ApiKeyModal = ({ savedKey, onSave, onCancel }) => {
    const [key, setKey] = useState(savedKey || "");

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Key className="text-indigo-600" /> APIキーの設定
                    </h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    AI機能（Gemini）を使用するために、Google AI StudioのAPIキーを入力してください。<br/>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">
                        APIキーの取得はこちらから（無料）
                    </a>
                </p>
                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none mb-4 font-mono text-sm"
                />
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm">
                        キャンセル
                    </button>
                    <button 
                        onClick={() => onSave(key)} 
                        disabled={!key.trim()}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        保存して開始
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">
                    ※キーはブラウザにのみ保存され、外部サーバーには送信されません。
                </p>
            </div>
        </div>
    );
};


// --- Main App Component ---

export default function App() {
    const [entries, setEntries] = useState([]);
    const [inputText, setInputText] = useState("");
    const [selectedPersonas, setSelectedPersonas] = useState(['teacher', 'friend']);
    const [isWriting, setIsWriting] = useState(false);
    const [view, setView] = useState('list'); // 'list' or 'new'
    
    // API Key State
    const [apiKey, setApiKey] = useState("");
    const [showSettings, setShowSettings] = useState(false);

    // Initialize logic
    useEffect(() => {
        try {
            // Load Entries
            const savedEntries = localStorage.getItem('multiverse_diary_entries');
            if (savedEntries) {
                const parsed = JSON.parse(savedEntries);
                if (Array.isArray(parsed)) setEntries(parsed);
            }
            
            // Load API Key
            const savedKey = localStorage.getItem('gemini_api_key');
            if (savedKey) {
                setApiKey(savedKey);
            } else {
                // If no key, show settings immediately (optional, or let user explore first)
                // setShowSettings(true); 
            }
        } catch (e) {
            console.error("Failed to load data", e);
        }
    }, []);

    // Save Data
    useEffect(() => {
        try {
            localStorage.setItem('multiverse_diary_entries', JSON.stringify(entries));
        } catch (e) { console.error("Failed to save entries", e); }
    }, [entries]);

    const handleSaveKey = (key) => {
        setApiKey(key);
        localStorage.setItem('gemini_api_key', key);
        setShowSettings(false);
    };
    
    const handleClearKey = () => {
        if(confirm("APIキーを削除しますか？")) {
            setApiKey("");
            localStorage.removeItem('gemini_api_key');
        }
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
        
        // Check API Key
        if (!apiKey) {
            setShowSettings(true);
            return;
        }

        setIsWriting(true);

        // Fetch AI responses with the stored API Key
        const aiResponses = await fetchGeminiPersonas(apiKey, inputText, selectedPersonas);
        
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
        <div className="min-h-screen bg-[#f0f4f8] font-sans text-gray-900 pb-10">
            {/* Header */}
            <header className="py-6 px-4 bg-white/80 sticky top-0 z-10 shadow-sm backdrop-blur-md">
                <div className="max-w-2xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2 cursor-pointer" onClick={() => setView('list')}>
                        <span className="text-3xl">🌌</span> 
                        <span className="hidden sm:inline">Multiverse Diary</span>
                    </h1>
                    
                    <div className="flex gap-2">
                         {/* Settings Button */}
                        <button 
                            onClick={() => setShowSettings(true)}
                            className={`p-2 rounded-lg transition-colors ${apiKey ? 'text-gray-400 hover:text-gray-600' : 'text-indigo-600 bg-indigo-50 animate-pulse'}`}
                            title="APIキー設定"
                        >
                            <Settings size={20} />
                        </button>

                        {view === 'list' && (
                            <button 
                                onClick={() => setView('new')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors text-sm font-bold flex items-center gap-2"
                            >
                                <PenTool size={16} />
                                <span className="hidden sm:inline">書く</span>
                            </button>
                        )}
                        {view === 'new' && (
                            <button 
                                onClick={() => setView('list')}
                                className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm font-medium"
                            >
                                キャンセル
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-4">
                {/* Warning Banner if no Key */}
                {!apiKey && view === 'list' && (
                    <div onClick={() => setShowSettings(true)} className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg mb-6 cursor-pointer hover:bg-indigo-700 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Key className="animate-bounce" />
                            <div>
                                <div className="font-bold">APIキーが設定されていません</div>
                                <div className="text-xs text-indigo-200">ここをクリックしてGemini APIキーを設定してください</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* New Entry View */}
                {view === 'new' && (
                    <div className="animate-fadeIn">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <label className="block text-gray-700 font-bold mb-2">今日の出来事は？</label>
                            <textarea
                                className="w-full h-40 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none transition-all text-lg mb-6"
                                placeholder="例：仕事で失敗しちゃったけど、ランチのパスタが美味しかった。"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                autoFocus
                            ></textarea>
                            
                            <PersonaSelector selected={selectedPersonas} togglePersona={togglePersona} />

                            <div className="flex justify-end mt-8 border-t border-gray-100 pt-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isWriting || !inputText.trim()}
                                    className={`
                                        px-6 py-3 rounded-lg font-bold shadow-md flex items-center gap-2 transition-all w-full sm:w-auto justify-center
                                        ${isWriting || !inputText.trim() 
                                            ? 'bg-gray-100 cursor-not-allowed text-gray-400 shadow-none' 
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-105 active:scale-95'}
                                    `}
                                >
                                    {isWriting ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 size={18} className="animate-spin" />
                                            AIがコメントを生成中...
                                        </span>
                                    ) : (
                                        <>
                                            <Sparkles size={18} />
                                            保存してAIコメントをもらう
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* List View */}
                {view === 'list' && (
                    <div className="space-y-6">
                        {entries.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300 mx-4 sm:mx-0">
                                <div className="text-gray-300 mb-4 flex justify-center">
                                    <BookOpen size={64} strokeWidth={1} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-700 mb-2">まだ日記がありません</h2>
                                <p className="text-gray-500 mb-6 text-sm">
                                    今日あったことを書いて、<br/>
                                    AIキャラクターたちからコメントをもらいましょう。
                                </p>
                                <button 
                                    onClick={() => setView('new')}
                                    className="bg-blue-100 text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-200 transition-colors inline-flex items-center gap-2"
                                >
                                    <Edit3 size={16} />
                                    最初の日記を書く
                                </button>
                            </div>
                        ) : (
                            entries.map(entry => (
                                <EntryItem key={entry.id} entry={entry} onDelete={handleDelete} onUpdate={handleUpdateEntry} apiKey={apiKey} />
                            ))
                        )}
                    </div>
                )}
            </main>

            {/* API Key Modal */}
            {showSettings && (
                <ApiKeyModal 
                    savedKey={apiKey} 
                    onSave={handleSaveKey} 
                    onCancel={() => setShowSettings(false)} // Always allow close
                />
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
}