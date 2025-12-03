import React, { useState, useMemo } from 'react';
import { Settings, Key, Database, Users, UserPlus, ChevronRight, Download, Trash2, AlertTriangle, X, Eye, EyeOff, GripVertical, Plus, LogOut, User } from 'lucide-react';
import { DEFAULT_PERSONAS } from '../constants/personas';
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    TouchSensor,
    useSensor, 
    useSensors 
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    useSortable, 
    verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ドラッグ可能なペルソナアイテム
const SortablePersonaItem = ({ persona, isHidden, isCustom, onToggleVisibility, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: persona.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto',
    };
    
    return (
        <div 
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-3 rounded-lg group transition-colors ${
                isDragging ? 'bg-indigo-100 shadow-lg' : isHidden ? 'bg-gray-100 opacity-60' : 'bg-gray-50'
            }`}
        >
            <div className="flex items-center gap-3 min-w-0">
                {/* ドラッグハンドル */}
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
                    title="ドラッグして並び替え"
                >
                    <GripVertical size={18} />
                </button>
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${persona.color || 'bg-gray-200'}`}>
                    {persona.icon}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium truncate ${isHidden ? 'text-gray-400' : 'text-gray-700'}`}>
                            {persona.name}
                        </span>
                        {isCustom && (
                            <span className="text-xs bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded">カスタム</span>
                        )}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{persona.role}</div>
                </div>
            </div>
            
            <div className="flex items-center gap-1">
                {/* 表示/非表示ボタン */}
                <button
                    onClick={() => onToggleVisibility?.(persona.id)}
                    className={`p-2 rounded-lg transition-colors ${
                        isHidden 
                            ? 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50' 
                            : 'text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                    title={isHidden ? '表示する' : '非表示にする'}
                >
                    {isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                
                {/* カスタムキャラクターのみ削除可能 */}
                {isCustom && (
                    <button
                        onClick={() => onDelete(persona.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="削除"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export const SettingsModal = ({ 
    savedKey, 
    onSave, 
    onCancel, 
    entriesCount, 
    onClearAllData, 
    onExportData, 
    customPersonas, 
    onDeleteCustomPersona,
    allPersonas,
    hiddenPersonaIds,
    onTogglePersonaVisibility,
    onMovePersona,
    onReorderPersonas,
    onAddPersona,
    user,
    onSignOut
}) => {
    const [key, setKey] = useState(savedKey || "");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState('api'); // 'api', 'data', or 'personas'
    
    // ドラッグ＆ドロップのセンサー設定
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px動かすとドラッグ開始
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 150, // スマホでは150ms長押しでドラッグ開始
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    
    // ペルソナのID配列を取得
    const personaIds = useMemo(() => 
        (allPersonas || [...DEFAULT_PERSONAS, ...(customPersonas || [])]).map(p => p.id),
        [allPersonas, customPersonas]
    );
    
    // ドラッグ終了時のハンドラ
    const handleDragEnd = (event) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            const oldIndex = personaIds.indexOf(active.id);
            const newIndex = personaIds.indexOf(over.id);
            const newOrder = arrayMove(personaIds, oldIndex, newIndex);
            onReorderPersonas?.(newOrder);
        }
    };

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
                    <button 
                        onClick={() => setActiveTab('account')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'account' 
                                ? 'border-indigo-500 text-indigo-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <User size={16} />
                            アカウント
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
                        <p className="text-sm text-gray-500 mb-4">
                            キャラクターをドラッグして並び替えたり、表示/非表示を切り替えられます。
                        </p>
                        
                        {/* 全キャラクター一覧 - ドラッグ可能 */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={personaIds}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                                    {(allPersonas || [...DEFAULT_PERSONAS, ...(customPersonas || [])]).map((p) => {
                                        const isHidden = hiddenPersonaIds?.includes(p.id);
                                        const isCustom = !p.isDefault;
                                        
                                        return (
                                            <SortablePersonaItem
                                                key={p.id}
                                                persona={p}
                                                isHidden={isHidden}
                                                isCustom={isCustom}
                                                onToggleVisibility={onTogglePersonaVisibility}
                                                onDelete={onDeleteCustomPersona}
                                            />
                                        );
                                    })}
                                </div>
                            </SortableContext>
                        </DndContext>
                        
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600">
                                💡 ドラッグで順番を変更できます。非表示にしたキャラクターは日記作成画面に表示されませんが、過去の日記のコメントはそのまま残ります。
                            </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                            <button onClick={onCancel} className="btn-secondary flex-1 order-2 sm:order-1">
                                閉じる
                            </button>
                            <button 
                                onClick={() => {
                                    onCancel();
                                    onAddPersona?.();
                                }} 
                                className="btn-primary flex-1 order-1 sm:order-2"
                            >
                                <Plus size={18} />
                                キャラクターを追加
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
                            ☁️ データはクラウドに保存され、どのデバイスからもアクセスできます
                        </p>
                    </div>
                )}

                {/* アカウントタブ */}
                {activeTab === 'account' && (
                    <div className="animate-fadeIn">
                        {user && (
                            <div className="bg-gray-50 rounded-xl p-5 mb-6">
                                <div className="flex items-center gap-4 mb-4">
                                    {user.photoURL ? (
                                        <img 
                                            src={user.photoURL} 
                                            alt={user.displayName}
                                            className="w-14 h-14 rounded-full border-2 border-white shadow-md"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <User size={24} className="text-indigo-500" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-semibold text-gray-800">{user.displayName || 'ユーザー'}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 bg-white rounded-lg p-3">
                                    <p>✅ Googleアカウントでログイン中</p>
                                    <p className="mt-1">☁️ データはクラウドに自動保存されます</p>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={() => {
                                onCancel();
                                onSignOut?.();
                            }}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl text-left hover:bg-gray-50 transition-colors flex items-center gap-4"
                        >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <LogOut size={20} className="text-gray-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">ログアウト</div>
                                <div className="text-xs text-gray-500">別のアカウントに切り替えられます</div>
                            </div>
                        </button>

                        <p className="text-xs text-gray-400 mt-6 text-center">
                            🔐 ログアウトしてもデータは保持されます
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
