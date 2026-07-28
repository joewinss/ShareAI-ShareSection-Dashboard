import React from 'react';
import { Globe } from 'lucide-react';
import { Background, ShareAi } from '../../../../public/assets';

export const ProfilePreview = ({
    bannerUrl,
    avatarUrl,
    className = ""
}) => {
    // Default fallback images
    const defaultBanner = Background;
    const defaultAvatar = ShareAi;

    return (
        <div className={`w-full bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200 ${className}`}>
            {/* Banner Area */}
            <div className="relative w-full h-48 md:h-64 bg-slate-100 group">
                <img
                    src={bannerUrl || defaultBanner}
                    alt="Profile Banner"
                    className="w-full h-full object-cover transition-opacity duration-500"
                />

                {/* Top Right Action */}
                <div className="absolute top-4 right-4">
                    <button className="bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 p-2 rounded-lg shadow-sm transition-all border border-slate-200/50">
                        <Globe size={20} />
                    </button>
                </div>

                {/* Gradient Overlay (only when default banner is shown) */}
                {!bannerUrl && (
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900/10 to-transparent pointer-events-none" />
                )}
            </div>

            {/* Avatar & Content */}
            <div className="relative px-6 pb-6">
                {/* Avatar overlapping */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-white ring-1 ring-slate-100">
                            <img
                                src={avatarUrl || defaultAvatar}
                                alt="Profile Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Status Dot */}
                        <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                    </div>
                </div>

                {/* Placeholder Info */}
                <div className="pt-20 text-center space-y-2">
                    <div className="h-6 w-48 bg-slate-100 rounded-full mx-auto animate-pulse" />
                    <div className="h-4 w-64 bg-slate-50 rounded-full mx-auto" />
                </div>
            </div>
        </div>
    );
};