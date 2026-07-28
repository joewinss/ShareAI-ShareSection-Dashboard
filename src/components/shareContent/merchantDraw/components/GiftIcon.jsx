import React from "react";

export default function GiftIcon({ size = 68, completed = false }) {
    const viewBox = completed ? "0 0 100 115" : "0 0 100 100";

    return (
        <svg
            width={size}
            height={size}
            viewBox={viewBox}
            fill="none"
            style={{
                animation: completed ? "none" : "ldGiftFloat 3.2s ease-in-out infinite",
                filter: completed
                    ? "drop-shadow(0 3px 8px rgba(217,119,6,0.2))"
                    : "drop-shadow(0 5px 12px rgba(217,119,6,0.55))",
                position: "relative",
                overflow: completed ? "visible" : undefined,
                zIndex: 1,
            }}
        >
            {completed && (
                <style>
                    {`@keyframes giftLidFloat { 0%,100% { transform: translate(0, 0); } 50% { transform: translate(0, -4px); } } @keyframes giftInnerPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.6; } }`}
                </style>
            )}

            <g opacity={completed ? 0.45 : 1}>
                <rect x="10" y="48" width="80" height="44" rx="5" fill="url(#heroGiftBody)" />
                {completed && <rect x="43" y="48" width="14" height="44" fill="#FDE68A" opacity="0.5" />}
                {completed && <ellipse cx="30" cy="62" rx="8" ry="3" fill="rgba(255,255,255,0.12)" transform="rotate(-15 30 62)" />}
            </g>

            {completed && (
                <>
                    <ellipse
                        cx="50"
                        cy="48"
                        rx="28"
                        ry="8"
                        fill="#FDE68A"
                        opacity="0.3"
                        style={{ animation: "giftInnerPulse 3s ease-in-out infinite" }}
                    />
                    <ellipse
                        cx="50"
                        cy="46"
                        rx="18"
                        ry="5"
                        fill="#FBBF24"
                        opacity="0.25"
                        style={{ animation: "giftInnerPulse 3s ease-in-out infinite", animationDelay: "-1.5s" }}
                    />
                </>
            )}

            <g
                opacity={completed ? 0.55 : 1}
                transform={completed ? "translate(-6, -22) rotate(-12, 50, 36)" : undefined}
                style={completed ? {
                    animation: "giftLidFloat 4s ease-in-out infinite",
                } : undefined}
            >
                <rect x="6" y="36" width="88" height="16" rx="4" fill="url(#heroGiftLid)" />
                {completed && <rect x="6" y="40" width="88" height="8" fill="#FBBF24" opacity="0.5" />}
                {completed && (
                    <>
                        <ellipse cx="38" cy="30" rx="16" ry="10" fill="#F59E0B" transform="rotate(-20 38 30)" />
                        <ellipse cx="38" cy="30" rx="10" ry="6" fill="#FDE68A" transform="rotate(-20 38 30)" />
                        <ellipse cx="62" cy="30" rx="16" ry="10" fill="#F59E0B" transform="rotate(20 62 30)" />
                        <ellipse cx="62" cy="30" rx="10" ry="6" fill="#FDE68A" transform="rotate(20 62 30)" />
                        <circle cx="50" cy="36" r="7" fill="#D97706" />
                        <circle cx="50" cy="36" r="4" fill="#FBBF24" />
                    </>
                )}
            </g>

            {!completed && (
                <>
                    <rect
                        x="43"
                        y="36"
                        width="14"
                        height="56"
                        fill="#FDE68A"
                        opacity="0.9"
                        style={{ animation: "ldRibbonShimmer 2.8s ease-in-out 0.4s infinite" }}
                    />
                    <rect
                        x="6"
                        y="40"
                        width="88"
                        height="8"
                        fill="#FBBF24"
                        opacity="0.9"
                        style={{ animation: "ldRibbonShimmer 2.8s ease-in-out 0.9s infinite" }}
                    />
                    <ellipse cx="38" cy="30" rx="16" ry="10" fill="#F59E0B" transform="rotate(-20 38 30)" />
                    <ellipse cx="38" cy="30" rx="10" ry="6" fill="#FDE68A" transform="rotate(-20 38 30)" />
                    <ellipse cx="62" cy="30" rx="16" ry="10" fill="#F59E0B" transform="rotate(20 62 30)" />
                    <ellipse cx="62" cy="30" rx="10" ry="6" fill="#FDE68A" transform="rotate(20 62 30)" />
                    <circle cx="50" cy="36" r="7" fill="#D97706" />
                    <circle cx="50" cy="36" r="4" fill="#FBBF24" />
                    <ellipse cx="30" cy="62" rx="8" ry="3" fill="rgba(255,255,255,0.12)" transform="rotate(-15 30 62)" />
                </>
            )}

            {!completed && (
                <g fill="#FBBF24">
                    <path d="M18 70L19 67L20 70L23 71L20 72L19 75L18 72L15 71Z" opacity="0.7" />
                    <path d="M76 56L77 53.5L78 56L80.5 57L78 58L77 60.5L76 58L73.5 57Z" opacity="0.6" />
                </g>
            )}

            {completed && (
                <g>
                    <rect x="28" y="25" width="6" height="3" rx="1" fill="#EF4444" opacity="0.8" />
                    <rect x="68" y="22" width="7" height="3" rx="1" fill="#22C55E" transform="rotate(25, 71, 23)" opacity="0.75" />
                    <rect x="38" y="15" width="4" height="4" rx="0.5" fill="#3B82F6" opacity="0.7" />
                    <rect x="58" y="12" width="4" height="4" rx="0.5" fill="#FBBF24" transform="rotate(45, 60, 14)" opacity="0.8" />
                    <rect x="22" y="18" width="5" height="3" rx="1" fill="#EC4899" transform="rotate(-15, 24, 19)" opacity="0.65" />
                </g>
            )}

            <defs>
                <linearGradient id="heroGiftBody" x1="10" y1="48" x2="90" y2="92" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#B45309" />
                    <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
                <linearGradient id="heroGiftLid" x1="6" y1="36" x2="94" y2="52" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#92400E" />
                </linearGradient>
            </defs>
        </svg>
    );
}
