import React, { useState } from 'react';
import { Settings, Key, Database, Users, UserPlus, ChevronRight, Download, Trash2, AlertTriangle, X } from 'lucide-react';
import { DEFAULT_PERSONAS } from '../constants/personas';

export const SettingsModal = ({ 
    savedKey, 
    onSave, 
    onCancel, 
    entriesCount, 
    onClearAllData, 
    onExportData, 
    customPersonas, 
    onDeleteCustomPersona 
}) => {
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
