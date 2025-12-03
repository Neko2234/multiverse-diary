import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, BrainCircuit, Loader2, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { DEFAULT_PERSONAS } from '../constants/personas';
import { fetchGeminiAnalysis } from '../services/api';
import { CommentCard } from './CommentCard';
import { AnalysisSection } from './AnalysisSection';

// 折りたたみ状態を保存・取得するヘルパー
const getCollapsedState = (entryId, section) => {
    try {
        const saved = localStorage.getItem('multiverse_diary_collapsed_sections');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed[`${entryId}_${section}`] ?? false; // デフォルトは展開（false = not collapsed）
        }
    } catch (e) {
        console.error('Failed to load collapsed state', e);
    }
    return false;
};

const setCollapsedState = (entryId, section, isCollapsed) => {
    try {
        const saved = localStorage.getItem('multiverse_diary_collapsed_sections');
        const parsed = saved ? JSON.parse(saved) : {};
        parsed[`${entryId}_${section}`] = isCollapsed;
        localStorage.setItem('multiverse_diary_collapsed_sections', JSON.stringify(parsed));
    } catch (e) {
        console.error('Failed to save collapsed state', e);
    }
};

export const EntryItem = ({ entry, onDelete, onUpdate, apiKey, allPersonas }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [showComments, setShowComments] = useState(true);
    const [showAnalysis, setShowAnalysis] = useState(true);
    
    // allPersonasが渡されない場合はデフォルトを使用（後方互換性）
    const personas = allPersonas || DEFAULT_PERSONAS;
    
    // 初期読み込み時に保存された折りたたみ状態を復元
    useEffect(() => {
        setShowComments(!getCollapsedState(entry.id, 'comments'));
        setShowAnalysis(!getCollapsedState(entry.id, 'analysis'));
    }, [entry.id]);
    
    // 折りたたみ状態が変更されたら保存
    const toggleComments = () => {
        const newState = !showComments;
        setShowComments(newState);
        setCollapsedState(entry.id, 'comments', !newState);
    };
    
    const toggleAnalysis = () => {
        const newState = !showAnalysis;
        setShowAnalysis(newState);
        setCollapsedState(entry.id, 'analysis', !newState);
    };

    const handleAnalysis = async () => {
        if (!apiKey) {
            alert("AI機能を使うにはAPIキーを設定してください。");
            return;
        }
        setAnalyzing(true);
        const result = await fetchGeminiAnalysis(apiKey, entry.content);
        if (result) {
            onUpdate(entry.id, { ...entry, analysis: result });
            setShowAnalysis(true);
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

                {/* Analysis Section */}
                {entry.analysis ? (
                    <div>
                        {/* 折りたたみヘッダー */}
                        <button
                            onClick={toggleAnalysis}
                            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-colors mb-2"
                        >
                            <span className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                                <BrainCircuit size={18} />
                                AI感情分析レポート
                            </span>
                            {showAnalysis ? <ChevronUp size={18} className="text-indigo-500" /> : <ChevronDown size={18} className="text-indigo-500" />}
                        </button>
                        
                        {/* 折りたたみコンテンツ */}
                        {showAnalysis && (
                            <AnalysisSection analysis={entry.analysis} onClose={clearAnalysis} />
                        )}
                    </div>
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
                {/* 折りたたみヘッダー */}
                <button
                    onClick={toggleComments}
                    className="w-full flex items-center justify-between py-2 mb-3 hover:opacity-80 transition-opacity"
                >
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Heart size={16} className="text-pink-400" />
                        みんなからのコメント
                        <span className="text-xs font-normal text-gray-400 normal-case">({entry.comments.length}件)</span>
                    </h4>
                    {showComments ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                
                {/* 折りたたみコンテンツ */}
                {showComments && (
                    <div className="space-y-4 animate-fadeIn">
                        {entry.comments.map((c, i) => {
                            const persona = personas.find(p => p.id === c.personaId);
                            return persona ? <CommentCard key={i} persona={persona} text={c.text} index={i} /> : null;
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
