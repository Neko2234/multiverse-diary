import React, { useState } from 'react';
import { Calendar, Trash2, BrainCircuit, Loader2, Heart } from 'lucide-react';
import { DEFAULT_PERSONAS } from '../constants/personas';
import { fetchGeminiAnalysis } from '../services/api';
import { CommentCard } from './CommentCard';
import { AnalysisSection } from './AnalysisSection';

export const EntryItem = ({ entry, onDelete, onUpdate, apiKey, allPersonas }) => {
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
