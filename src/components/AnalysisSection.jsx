import React from 'react';
import { Sparkles, Trash2 } from 'lucide-react';

export const AnalysisSection = ({ analysis, onClose }) => (
    <div className="analysis-section p-5 animate-scaleIn">
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
        
        {/* 分析結果を削除するボタン */}
        <div className="flex justify-end mt-4">
            <button 
                onClick={onClose} 
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
                <Trash2 size={14} />
                分析結果を削除
            </button>
        </div>
    </div>
);
