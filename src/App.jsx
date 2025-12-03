import React, { useState, useEffect } from 'react';
import './App.css';
import { BookOpen, PenTool, Trash2, Send, MessageCircle, Calendar, Edit3, Sparkles, BrainCircuit, Loader2, Key, Settings, LogOut, X, ChevronRight, Heart, AlertTriangle, Database, Download, Plus, UserPlus, Users } from 'lucide-react';

// --- Data & Logic Definition ---

// デフォルトのペルソナ（削除不可）
const DEFAULT_PERSONAS = [
    { id: 'teacher', name: '田中先生', role: '先生', icon: '👨‍🏫', color: 'bg-green-100 text-green-800', desc: '優しく諭してくれる恩師。少し古風だが生徒思い。教育的指導を含めることが多い。', isDefault: true },
    { id: 'friend', name: '親友のミカ', role: '友達', icon: '👱‍♀️', color: 'bg-yellow-100 text-yellow-800', desc: 'いつも味方でいてくれる元気な友人。ギャル語混じりで、共感力が高い。テンションが高い。', isDefault: true },
    { id: 'lover', name: '恋人のユウタ', role: '恋人', icon: '🥰', color: 'bg-pink-100 text-pink-800', desc: '全肯定してくれる甘い存在。ユーザーのことが大好きで、少し過保護。キザなセリフも言う。', isDefault: true },
    { id: 'aunt', name: 'お節介な叔母さん', role: '親戚', icon: '👵', color: 'bg-orange-100 text-orange-800', desc: '心配性で現実的なアドバイスをくれる。健康や食事のことを気にする。口調は「〜だわよ」「〜しなさい」。', isDefault: true },
    { id: 'celeb', name: 'カリスマタレントRay', role: '有名人', icon: '😎', color: 'bg-purple-100 text-purple-800', desc: '少し上から目線だが、夢を語るスター。英語混じりのルー大柴的な口調。ポジティブで野心的。', isDefault: true },
    { id: 'isekai', name: '暗黒騎士ゼイド', role: '異世界人', icon: '🐉', color: 'bg-gray-800 text-gray-100', desc: '現代の常識が通じない、魔界の住人。ユーザーを「契約者」や「盟友」と呼ぶ。中二病的な言い回し。', isDefault: true },
];

// 選択可能なアイコンリスト
const AVAILABLE_ICONS = ['😀', '😎', '🥰', '😇', '🤗', '😈', '👨', '👩', '👴', '👵', '🧑‍🎤', '🧑‍💼', '🧑‍🔬', '🧑‍🎨', '🦸', '🧙', '🧛', '🧜', '🐱', '🐶', '🦊', '🐰', '🐻', '🐼', '🦁', '🐲', '👽', '🤖', '👻', '💀'];

// 選択可能なカラーリスト
const AVAILABLE_COLORS = [
    { id: 'green', value: 'bg-green-100 text-green-800', label: '緑' },
    { id: 'yellow', value: 'bg-yellow-100 text-yellow-800', label: '黄' },
    { id: 'pink', value: 'bg-pink-100 text-pink-800', label: 'ピンク' },
    { id: 'orange', value: 'bg-orange-100 text-orange-800', label: 'オレンジ' },
    { id: 'purple', value: 'bg-purple-100 text-purple-800', label: '紫' },
    { id: 'blue', value: 'bg-blue-100 text-blue-800', label: '青' },
    { id: 'red', value: 'bg-red-100 text-red-800', label: '赤' },
    { id: 'gray', value: 'bg-gray-800 text-gray-100', label: '黒' },
    { id: 'indigo', value: 'bg-indigo-100 text-indigo-800', label: '藍' },
    { id: 'teal', value: 'bg-teal-100 text-teal-800', label: 'ティール' },
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
const fetchGeminiPersonas = async (apiKey, text, selectedIds, allPersonas) => {
    const personaList = allPersonas || DEFAULT_PERSONAS;
    const selectedPersonas = personaList.filter(p => selectedIds.includes(p.id));
    
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
        
        // レスポンスの検証
        if (!parsed.responses || !Array.isArray(parsed.responses)) {
            throw new Error('Invalid response format');
        }
        
        // 各レスポンスを検証・サニタイズ
        return parsed.responses
            .filter(r => r && typeof r.id === 'string' && typeof r.comment === 'string')
            .map(r => ({
                id: String(r.id).slice(0, 50),  // IDは50文字まで
                comment: String(r.comment).slice(0, 500)  // コメントは500文字まで
            }));

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
        const parsed = JSON.parse(jsonText);
        
        // 必須フィールドの検証とサニタイズ
        return {
            mood_score: Math.min(100, Math.max(0, Number(parsed.mood_score) || 50)),
            emotional_weather: String(parsed.emotional_weather || '不明').slice(0, 50),
            hidden_emotions: String(parsed.hidden_emotions || '').slice(0, 300),
            lucky_action: String(parsed.lucky_action || '').slice(0, 200),
            deep_advice: String(parsed.deep_advice || '').slice(0, 300)
        };
    } catch (error) {
        console.error("Gemini API Error (Analysis):", error);
        return null;
    }
};

// --- Components ---

const Avatar = ({ icon, className }) => (
    <div className={`persona-avatar ${className}`}>
        {icon}
    </div>
);

const CommentCard = ({ persona, text, index }) => (
    <div 
        className="flex gap-3 mb-4 animate-fadeIn"
        style={{ animationDelay: `${index * 0.1}s` }}
    >
        <Avatar icon={persona.icon} className={persona.color} />
        <div className="comment-bubble p-4 flex-1">
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm text-gray-800">{persona.name}</span>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{persona.role}</span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
        </div>
    </div>
);

const AnalysisSection = ({ analysis, onClose }) => (
    <div className="analysis-section mt-6 p-5 animate-scaleIn">
        <div className="flex justify-between items-start mb-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                </span>
                AI 感情分析レポート
            </h4>
            <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-white/50 rounded-full transition-colors"
            >
                <X size={18} />
            </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/70 p-4 rounded-xl border border-white/50">
                <div className="text-xs text-purple-600 font-semibold mb-1.5 uppercase tracking-wide">心の天気</div>
                <div className="text-xl font-bold text-gray-800">{analysis.emotional_weather}</div>
            </div>
            <div className="bg-white/70 p-4 rounded-xl border border-white/50">
                <div className="text-xs text-purple-600 font-semibold mb-1.5 uppercase tracking-wide">ムードスコア</div>
                <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{analysis.mood_score}</span>
                    <span className="text-sm text-gray-400 mb-1">/100</span>
                </div>
            </div>
        </div>

        <div className="space-y-3">
            <div className="bg-white/70 p-4 rounded-xl border border-white/50">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">🔮 隠れた感情</div>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.hidden_emotions}</p>
            </div>
            <div className="bg-white/70 p-4 rounded-xl border border-white/50">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">🍀 ラッキーアクション</div>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.lucky_action}</p>
            </div>
            <div className="bg-gradient-to-r from-indigo-100/80 to-purple-100/80 p-4 rounded-xl">
                <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">✨ 深層アドバイス</div>
                <p className="text-sm text-indigo-800 italic font-medium leading-relaxed">
                    "{analysis.deep_advice}"
                </p>
            </div>
        </div>
    </div>
);

const PersonaSelector = ({ selected, togglePersona, personas, onShowAddModal }) => {
    return (
        <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-indigo-500" />
                誰からコメントをもらう？
            </h3>
            <div className="flex flex-wrap gap-3">
                {personas.map(p => {
                    const isSelected = selected.includes(p.id);
                    return (
                        <button
                            key={p.id}
                            onClick={() => togglePersona(p.id)}
                            className={`persona-btn ${isSelected ? 'persona-btn-active' : 'persona-btn-inactive'}`}
                        >
                            <span className="text-base">{p.icon}</span>
                            <span>{p.role}</span>
                        </button>
                    )
                })}
                {/* 追加ボタン */}
                <button
                    onClick={onShowAddModal}
                    className="persona-btn persona-btn-inactive !border-dashed !border-2"
                    title="キャラクターを追加"
                >
                    <Plus size={18} />
                    <span>追加</span>
                </button>
            </div>
        </div>
    );
};

// ペルソナ追加モーダル
const AddPersonaModal = ({ onAdd, onCancel }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [icon, setIcon] = useState('😀');
    const [color, setColor] = useState(AVAILABLE_COLORS[0].value);
    const [desc, setDesc] = useState('');

    const handleSubmit = () => {
        if (!name.trim() || !role.trim() || !desc.trim()) {
            alert('すべての項目を入力してください');
            return;
        }
        
        const newPersona = {
            id: `custom_${Date.now()}`,
            name: name.trim().slice(0, 20),
            role: role.trim().slice(0, 10),
            icon,
            color,
            desc: desc.trim().slice(0, 200),
            isDefault: false
        };
        
        onAdd(newPersona);
    };

    return (
        <div className="modal-overlay fixed inset-0 flex justify-center z-[100] p-4 pt-24 animate-fadeIn">
            <div className="modal-content p-6 sm:p-8 mb-8 max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <UserPlus className="text-white" size={20} />
                        </span>
                        キャラクターを追加
                    </h2>
                    <button 
                        onClick={onCancel} 
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* アイコン選択 */}
                <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">アイコン</label>
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl max-h-32 overflow-y-auto">
                        {AVAILABLE_ICONS.map(i => (
                            <button
                                key={i}
                                onClick={() => setIcon(i)}
                                className={`w-10 h-10 text-xl rounded-lg transition-all ${
                                    icon === i 
                                        ? 'bg-indigo-500 scale-110 shadow-lg' 
                                        : 'bg-white hover:bg-gray-100'
                                }`}
                            >
                                {i}
                            </button>
                        ))}
                    </div>
                </div>

                {/* カラー選択 */}
                <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">テーマカラー</label>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_COLORS.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setColor(c.value)}
                                className={`w-10 h-10 rounded-lg transition-all ${c.value} ${
                                    color === c.value 
                                        ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' 
                                        : ''
                                }`}
                                title={c.label}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 名前 */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">名前（20文字以内）</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value.slice(0, 20))}
                        placeholder="例：幼なじみのケン"
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>

                {/* 役割 */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">役割（10文字以内）</label>
                    <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value.slice(0, 10))}
                        placeholder="例：幼なじみ"
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>

                {/* 性格・話し方 */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        性格・話し方（200文字以内）
                        <span className="font-normal text-gray-400 ml-2">※AIがこの設定に基づいてコメントします</span>
                    </label>
                    <textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value.slice(0, 200))}
                        placeholder="例：小さい頃からの付き合いで、遠慮なくツッコミを入れてくる。でも本当は優しい。関西弁で話す。"
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all h-24 resize-none"
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">{desc.length}/200</div>
                </div>

                {/* プレビュー */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="text-xs font-semibold text-gray-500 mb-2">プレビュー</div>
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${color}`}>
                            {icon}
                        </div>
                        <div>
                            <div className="font-semibold text-gray-800">{name || '名前未設定'}</div>
                            <div className="text-sm text-gray-500">{role || '役割未設定'}</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={onCancel} 
                        className="btn-secondary order-2 sm:order-1 flex-1"
                    >
                        キャンセル
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!name.trim() || !role.trim() || !desc.trim()}
                        className="btn-primary order-1 sm:order-2 flex-1"
                    >
                        <UserPlus size={18} />
                        追加する
                    </button>
                </div>
            </div>
        </div>
    );
};

const EntryItem = ({ entry, onDelete, onUpdate, apiKey, allPersonas }) => {
    const [analyzing, setAnalyzing] = useState(false);
    
    // allPersonasが渡されない場合はデフォルトを使用（後方互換性）
    const personas = allPersonas || DEFAULT_PERSONAS;

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
        <div className="entry-wrapper mb-10 animate-slideUp">
            {/* 日記本体カード */}
            <div className="diary-card p-6 sm:p-8">
                {/* ヘッダー */}
                <div className="flex justify-between items-center mb-6 pb-5 border-b-2 border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                            <Calendar size={22} className="text-indigo-500" />
                        </div>
                        <div>
                            <span className="text-gray-800 text-base font-semibold">{entry.date}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => onDelete(entry.id)} 
                        className="text-gray-300 hover:text-red-400 transition-colors p-2.5 rounded-xl hover:bg-red-50"
                        title="削除"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
                
                {/* 本文 */}
                <div className="mb-6">
                    <p className="text-gray-800 whitespace-pre-wrap leading-loose text-base sm:text-lg">{entry.content}</p>
                </div>

                {/* Analysis Button or Section */}
                {entry.analysis ? (
                    <AnalysisSection analysis={entry.analysis} onClose={clearAnalysis} />
                ) : (
                    <div className="flex justify-end">
                        <button 
                            onClick={handleAnalysis}
                            disabled={analyzing}
                            className="text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 hover:shadow-sm"
                        >
                            {analyzing ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
                            {analyzing ? '分析中...' : 'AI感情分析'}
                        </button>
                    </div>
                )}
            </div>

            {/* コメントセクション - カードの外、階層構造で表示 */}
            <div className="comments-wrapper mt-4 ml-6 sm:ml-10 pl-6 sm:pl-8 border-l-4 border-indigo-200">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <Heart size={16} className="text-pink-400" />
                    みんなからのコメント
                </h4>
                <div className="space-y-4">
                    {entry.comments.map((c, i) => {
                        const persona = personas.find(p => p.id === c.personaId);
                        return persona ? <CommentCard key={i} persona={persona} text={c.text} index={i} /> : null;
                    })}
                </div>
            </div>
        </div>
    );
};

// --- Settings Modal ---
const SettingsModal = ({ savedKey, onSave, onCancel, entriesCount, onClearAllData, onExportData, customPersonas, onDeleteCustomPersona }) => {
    const [key, setKey] = useState(savedKey || "");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState('api'); // 'api', 'data', or 'personas'

    const handleClearData = () => {
        onClearAllData();
        setShowDeleteConfirm(false);
    };

    return (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="modal-content p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Settings className="text-white" size={20} />
                        </span>
                        設定
                    </h2>
                    <button 
                        onClick={onCancel} 
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* タブ */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab('api')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'api' 
                                ? 'border-indigo-500 text-indigo-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <Key size={16} />
                            APIキー
                        </span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('personas')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'personas' 
                                ? 'border-indigo-500 text-indigo-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <Users size={16} />
                            キャラクター
                        </span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('data')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'data' 
                                ? 'border-indigo-500 text-indigo-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <Database size={16} />
                            データ管理
                        </span>
                    </button>
                </div>

                {/* APIキータブ */}
                {activeTab === 'api' && (
                    <div className="animate-fadeIn">
                        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                            AI機能（Gemini）を使用するために、Google AI StudioのAPIキーを入力してください。
                        </p>
                        
                        <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 text-indigo-600 text-sm font-medium mb-5 hover:text-indigo-700 transition-colors"
                        >
                            APIキーを取得（無料）
                            <ChevronRight size={16} />
                        </a>
                        
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none mb-5 font-mono text-sm transition-all"
                        />
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                                onClick={onCancel} 
                                className="btn-secondary order-2 sm:order-1 flex-1"
                            >
                                キャンセル
                            </button>
                            <button 
                                onClick={() => onSave(key)} 
                                disabled={!key.trim()}
                                className="btn-primary order-1 sm:order-2 flex-1"
                            >
                                保存
                            </button>
                        </div>
                        
                        <p className="text-xs text-gray-400 mt-5 text-center">
                            🔒 キーはブラウザにのみ保存され、外部サーバーには送信されません
                        </p>
                    </div>
                )}

                {/* キャラクター管理タブ */}
                {activeTab === 'personas' && (
                    <div className="animate-fadeIn">
                        {/* デフォルトキャラクター */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Users size={16} className="text-indigo-500" />
                                デフォルトキャラクター（{DEFAULT_PERSONAS.length}人）
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {DEFAULT_PERSONAS.map(p => (
                                    <div key={p.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <span className="text-lg">{p.icon}</span>
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-gray-700 truncate">{p.name}</div>
                                            <div className="text-xs text-gray-400 truncate">{p.role}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* カスタムキャラクター */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <UserPlus size={16} className="text-pink-500" />
                                追加したキャラクター（{customPersonas?.length || 0}人）
                            </h3>
                            {customPersonas && customPersonas.length > 0 ? (
                                <div className="space-y-2">
                                    {customPersonas.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${p.color}`}>
                                                    {p.icon}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-gray-700 truncate">{p.name}</div>
                                                    <div className="text-xs text-gray-400 truncate">{p.role}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onDeleteCustomPersona(p.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="削除"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">まだキャラクターを追加していません</p>
                                    <p className="text-xs mt-1">日記作成画面の「＋追加」ボタンから追加できます</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <button onClick={onCancel} className="btn-secondary w-full">
                                閉じる
                            </button>
                        </div>
                    </div>
                )}

                {/* データ管理タブ */}
                {activeTab === 'data' && (
                    <div className="animate-fadeIn">
                        {/* ストレージ使用状況 */}
                        <div className="bg-gray-50 rounded-xl p-5 mb-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Database size={16} className="text-indigo-500" />
                                ローカルストレージ
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">保存された日記</span>
                                    <span className="font-semibold text-gray-800">{entriesCount} 件</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">APIキー</span>
                                    <span className={`font-semibold ${savedKey ? 'text-green-600' : 'text-gray-400'}`}>
                                        {savedKey ? '設定済み' : '未設定'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* エクスポートボタン */}
                        <button 
                            onClick={onExportData}
                            disabled={entriesCount === 0}
                            className="w-full mb-4 p-4 border-2 border-gray-200 rounded-xl text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4"
                        >
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Download size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">データをエクスポート</div>
                                <div className="text-xs text-gray-500">日記データをJSONファイルとしてダウンロード</div>
                            </div>
                        </button>

                        {/* 削除ボタン */}
                        {!showDeleteConfirm ? (
                            <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full p-4 border-2 border-red-200 rounded-xl text-left hover:bg-red-50 transition-colors flex items-center gap-4"
                            >
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Trash2 size={20} className="text-red-600" />
                                </div>
                                <div>
                                    <div className="font-semibold text-red-700">すべてのデータを削除</div>
                                    <div className="text-xs text-gray-500">日記データとAPIキーをブラウザから完全に削除</div>
                                </div>
                            </button>
                        ) : (
                            <div className="border-2 border-red-300 bg-red-50 rounded-xl p-5 animate-scaleIn">
                                <div className="flex items-start gap-3 mb-4">
                                    <AlertTriangle size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-bold text-red-800 mb-1">本当に削除しますか？</div>
                                        <p className="text-sm text-red-700">
                                            この操作は取り消せません。すべての日記（{entriesCount}件）とAPIキーが完全に削除されます。
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 py-2.5 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        キャンセル
                                    </button>
                                    <button 
                                        onClick={handleClearData}
                                        className="flex-1 py-2.5 px-4 bg-red-600 rounded-lg text-white font-medium hover:bg-red-700 transition-colors"
                                    >
                                        削除する
                                    </button>
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-gray-400 mt-6 text-center">
                            📱 データはこのブラウザにのみ保存されています
                        </p>
                    </div>
                )}
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
    
    // ペルソナ追加モーダル
    const [showAddPersonaModal, setShowAddPersonaModal] = useState(false);
    
    // カスタムペルソナ
    const [customPersonas, setCustomPersonas] = useState([]);
    
    // 全ペルソナ（デフォルト + カスタム）
    const allPersonas = [...DEFAULT_PERSONAS, ...customPersonas];
    
    // 初期読み込み完了フラグ
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize logic - 読み込み
    useEffect(() => {
        try {
            // Load Entries
            const savedEntries = localStorage.getItem('multiverse_diary_entries');
            if (savedEntries) {
                const parsed = JSON.parse(savedEntries);
                // 配列であること、各エントリが必要なプロパティを持つことを確認
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
        } catch (e) {
            console.error("Failed to load data", e);
            // 破損したデータをクリア
            localStorage.removeItem('multiverse_diary_entries');
        }
        // 読み込み完了
        setIsLoaded(true);
    }, []);

    // Save Data - 読み込み完了後のみ保存する
    useEffect(() => {
        if (!isLoaded) return; // 初期読み込み前は保存しない
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
        // 選択中なら選択解除
        setSelectedPersonas(prev => prev.filter(id => id !== personaId));
    };
    
    const handleClearAllData = () => {
        // すべてのデータを削除
        localStorage.removeItem('multiverse_diary_entries');
        localStorage.removeItem('gemini_api_key');
        localStorage.removeItem('multiverse_diary_custom_personas');
        setEntries([]);
        setApiKey("");
        setCustomPersonas([]);
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
        
        // Check API Key
        if (!apiKey) {
            setShowSettings(true);
            return;
        }

        setIsWriting(true);

        // Fetch AI responses with the stored API Key
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
                         {/* Settings Button */}
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
                                personas={allPersonas}
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

            {/* API Key Modal */}
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
                />
            )}

            {/* ペルソナ追加モーダル */}
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