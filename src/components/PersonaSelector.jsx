import React from 'react';
import { MessageCircle, Plus } from 'lucide-react';

export const PersonaSelector = ({ selected, togglePersona, personas, onShowAddModal }) => {
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
