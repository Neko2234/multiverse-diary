import React from 'react';
import { Avatar } from './Avatar';

export const CommentCard = ({ persona, text, index }) => (
    <div 
        className="flex gap-2 sm:gap-3 mb-3 sm:mb-4 animate-fadeIn"
        style={{ animationDelay: `${index * 0.1}s` }}
    >
        <Avatar icon={persona.icon} className={persona.color} />
        <div className="comment-bubble p-3 sm:p-4 flex-1">
            <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                <span className="font-semibold text-xs sm:text-sm text-gray-800">{persona.name}</span>
                <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-50 px-1.5 sm:px-2 py-0.5 rounded-full">{persona.role}</span>
            </div>
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{text}</p>
        </div>
    </div>
);
