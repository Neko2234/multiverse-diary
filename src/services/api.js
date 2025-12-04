import { DEFAULT_PERSONAS } from '../constants/personas';

// 利用可能なGeminiモデル
export const GEMINI_MODELS = {
    flash: {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: '高速・高精度（推奨）',
        endpoint: 'gemini-2.5-flash'
    },
    pro: {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro', 
        description: '最高精度・無料枠小',
        endpoint: 'gemini-2.5-pro'
    }
};

// デフォルトモデル
export const DEFAULT_MODEL = 'flash';

// モデル設定の保存・読み込み（ローカルストレージ）
export const saveGeminiModel = (modelId) => {
    localStorage.setItem('gemini_model', modelId);
};

export const getGeminiModel = () => {
    return localStorage.getItem('gemini_model') || DEFAULT_MODEL;
};

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
    return responses[personaId]?.[type] || responses[personaId]?.neutral || "...（返答なし）";
};

// Gemini API Call for Personas
export const fetchGeminiPersonas = async (apiKey, text, selectedIds, allPersonas, modelId = null) => {
    const personaList = allPersonas || DEFAULT_PERSONAS;
    const selectedPersonas = personaList.filter(p => selectedIds.includes(p.id));
    
    // モデルの選択（引数で指定されていない場合はローカルストレージから取得）
    const selectedModel = modelId || getGeminiModel();
    const modelEndpoint = GEMINI_MODELS[selectedModel]?.endpoint || GEMINI_MODELS.flash.endpoint;
    
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
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}:generateContent?key=${apiKey}`, {
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
                id: String(r.id).slice(0, 50),
                comment: String(r.comment).slice(0, 500)
            }));

    } catch (error) {
        console.error("Gemini API Error (Personas):", error);
        return selectedPersonas.map(p => ({
            id: p.id,
            comment: generateLocalResponse(text, p.id)
        }));
    }
};

// Gemini API Call for Analysis
export const fetchGeminiAnalysis = async (apiKey, text, modelId = null) => {
    // モデルの選択
    const selectedModel = modelId || getGeminiModel();
    const modelEndpoint = GEMINI_MODELS[selectedModel]?.endpoint || GEMINI_MODELS.flash.endpoint;
    
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
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}:generateContent?key=${apiKey}`, {
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
