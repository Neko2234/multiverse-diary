import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../constants/personas';

export const AddPersonaModal = ({ onAdd, onCancel }) => {
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
        <div className="modal-overlay fixed inset-0 flex justify-center z-[100] p-4 pt-24 animate-fadeIn overflow-y-auto">
            <div className="modal-content p-6 sm:p-8 mb-8 h-fit">
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
