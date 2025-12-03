import React from 'react';
import { Sparkles, X } from 'lucide-react';

export const AnalysisSection = ({ analysis, onClose }) => (
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
