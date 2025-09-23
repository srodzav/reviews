import React from 'react';

export default function ProfileHeader({ title = 'My Reviews', avatar }) {
    return (
        <div className="bg-gray-900 text-white rounded-b-lg shadow-md">
            <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
                <img
                src={avatar || 'https://sebastianrdz.com/assets/images/cv.jpg'}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500"
                />
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
                </div>
                <div className="ml-auto"></div>
            </div>
        </div>
    );
}