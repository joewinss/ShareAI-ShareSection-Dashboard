import React from 'react';
import { Button } from 'antd';

const SharePlatformListV2 = ({ platforms = [], onShareClick, loading = false }) => {
    // Dynamic grid columns based on platform count
    const gridCols = platforms.length === 1 ? 'grid-cols-1' : 'grid-cols-2';

    return (
        <div className={`grid ${gridCols} gap-4 w-full p-4`}>
            {platforms.map((platform) => (
                <div
                    key={platform.id || platform.name}
                    className="flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-6"
                    style={{
                        border: '1px solid rgba(0,0,0,0.06)',
                        minHeight: '180px'
                    }}
                >
                    {/* Platform Icon */}
                    <div className="mb-4">
                        <img
                            src={platform.icon}
                            alt={platform.displayName || platform.title || platform.name}
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                objectFit: 'cover',
                            }}
                        />
                    </div>

                    {/* Platform Name */}
                    <div className="mb-4 text-center">
                        <span className="text-gray-800 font-medium text-sm">
                            {platform.displayName || platform.title || platform.name}
                        </span>
                    </div>

                    {/* Share Button */}
                    <Button
                        className="gradient-border"
                        size="large"
                        block
                        id={`share-btn-${platform.name.toLowerCase()}`}
                        loading={loading}
                        onClick={() => onShareClick && onShareClick(platform)}
                        style={{
                            borderRadius: '8px',
                            fontWeight: '500',
                            color: 'var(--primary-color)'
                        }}
                    >
                        Share
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default SharePlatformListV2;
