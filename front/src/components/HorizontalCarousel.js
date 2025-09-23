import React from 'react';

export default function HorizontalCarousel({ items = [], onClickCard }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="overflow-x-auto py-3 -mx-6 px-6">
            <div className="flex gap-4 items-start">
                {items.map(it => (
                    <div key={it.id || it.tmdb_id} className="w-36 flex-shrink-0">
                        <div
                        className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transform transition"
                        onClick={() => onClickCard && onClickCard(it)}
                        >
                            <img src={it.poster_url || `https://image.tmdb.org/t/p/w342${it.poster_path || ''}`} alt={it.name || it.title} className="w-full h-48 object-cover" loading="lazy" />
                            <div className="p-2">
                                <div className="text-sm font-medium text-white truncate">{it.name || it.title}</div>
                                <div className="text-xs text-gray-400">{it.release_year || it.release_date ? (it.release_year || it.release_date?.slice(0,4)) : ''}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}