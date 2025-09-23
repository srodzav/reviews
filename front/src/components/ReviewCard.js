import React from 'react';
import StarRating from './StarRating';

export default function ReviewCard({ review }) {
    const m = review.movie || {};
    return (
        <article className="bg-gray-800 text-white rounded-lg p-4 shadow-md flex gap-4">
            <img src={m.poster_url || 'https://via.placeholder.com/96x140?text=No+Image'} alt={m.name} className="w-24 h-36 object-cover rounded-md flex-shrink-0" loading="lazy" />
            <div className="flex-1">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h3 className="text-lg font-semibold">{m.name || '—'} {m.release_year ? `(${m.release_year})` : ''}</h3>
                        <div className="text-sm text-gray-400">Director: {m.director || '—'}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-indigo-400 font-bold text-2xl">{review.rating}</div>
                        <StarRating value={review.rating} size={14} />
                    </div>
                </div>
                <p className="mt-3 text-gray-200">{review.comment || <span className="text-gray-400">No comment</span>}</p>
            </div>
        </article>
    );
}