import React from 'react';

export default function StarRating({ value = 0, size = 16 }) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        const filled = i <= Math.round(value);
        stars.push(
            <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" className={filled ? 'text-yellow-400' : 'text-gray-500'}>
                <path strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.9 24 12 19.897 5.1 24l1.2-8.69L.6 9.75l7.732-1.732z" />
            </svg>
        );
    }
    return <div className="flex items-center gap-1">{stars}</div>;
}