// デフォルトのペルソナ（削除不可）
export const DEFAULT_PERSONAS = [
    { id: 'teacher', name: '田中先生', role: '先生', icon: '👨‍🏫', color: 'bg-green-100 text-green-800', desc: '優しく諭してくれる恩師。少し古風だが生徒思い。教育的指導を含めることが多い。', isDefault: true },
    { id: 'friend', name: '親友のミカ', role: '友達', icon: '👱‍♀️', color: 'bg-yellow-100 text-yellow-800', desc: 'いつも味方でいてくれる元気な友人。ギャル語混じりで、共感力が高い。テンションが高い。', isDefault: true },
    { id: 'lover', name: '恋人のユウタ', role: '恋人', icon: '🥰', color: 'bg-pink-100 text-pink-800', desc: '全肯定してくれる甘い存在。ユーザーのことが大好きで、少し過保護。キザなセリフも言う。', isDefault: true },
    { id: 'aunt', name: 'お節介な叔母さん', role: '親戚', icon: '👵', color: 'bg-orange-100 text-orange-800', desc: '心配性で現実的なアドバイスをくれる。健康や食事のことを気にする。口調は「〜だわよ」「〜しなさい」。', isDefault: true },
    { id: 'celeb', name: 'カリスマタレントRay', role: '有名人', icon: '😎', color: 'bg-purple-100 text-purple-800', desc: '少し上から目線だが、夢を語るスター。英語混じりのルー大柴的な口調。ポジティブで野心的。', isDefault: true },
    { id: 'isekai', name: '暗黒騎士ゼイド', role: '異世界人', icon: '🐉', color: 'bg-gray-800 text-gray-100', desc: '現代の常識が通じない、魔界の住人。ユーザーを「契約者」や「盟友」と呼ぶ。中二病的な言い回し。', isDefault: true },
];

// 選択可能なアイコンリスト
export const AVAILABLE_ICONS = [
    '😀', '😎', '🥰', '😇', '🤗', '😈', '👨', '👩', '👴', '👵', 
    '🧑‍🎤', '🧑‍💼', '🧑‍🔬', '🧑‍🎨', '🦸', '🧙', '🧛', '🧜', 
    '🐱', '🐶', '🦊', '🐰', '🐻', '🐼', '🦁', '🐲', '👽', '🤖', '👻', '💀'
];

// 選択可能なカラーリスト
export const AVAILABLE_COLORS = [
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
