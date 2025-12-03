import React from 'react';

export const Avatar = ({ icon, className }) => (
    <div className={`persona-avatar ${className}`}>
        {icon}
    </div>
);
