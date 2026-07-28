import { useEffect, useId, useState } from "react";
import { MERCHANT_DRAW_STATUS } from "@/constants/user";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";

const WHEEL_KEYFRAMES = `
@keyframes mdwSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes mdwFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes mdwSparkle { 0%,100% { opacity: 0; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1); } }
@keyframes mdwGemBlink { 0%,100% { opacity: var(--mdwGemLow, 0.4); } 50% { opacity: var(--mdwGemHigh, 1); } }
@media (prefers-reduced-motion: reduce) { .mdwMotion { animation: none !important; } }
`;

const GEM_STUDS = [
    { cx: 50, cy: 1.5, r: 2.4, fill: "#FCD34D", lowOpacity: 0.4, highOpacity: 1, dur: "1.5s", dimOpacity: 0.25 },
    { cx: 75, cy: 4.5, r: 1.5, fill: "#F9A8D4", lowOpacity: 0.3, highOpacity: 0.8, dur: "1.8s", dimOpacity: 0.2 },
    { cx: 93, cy: 18, r: 2.4, fill: "#93C5FD", lowOpacity: 0.4, highOpacity: 1, dur: "1.6s", dimOpacity: 0.25 },
    { cx: 98.5, cy: 40, r: 1.5, fill: "#6EE7B7", lowOpacity: 0.3, highOpacity: 0.7, dur: "2s", dimOpacity: 0.2 },
    { cx: 98.5, cy: 60, r: 2.4, fill: "#FCA5A5", lowOpacity: 0.5, highOpacity: 1, dur: "1.4s", dimOpacity: 0.25 },
    { cx: 93, cy: 82, r: 1.5, fill: "#C4B5FD", lowOpacity: 0.3, highOpacity: 0.8, dur: "1.7s", dimOpacity: 0.2 },
    { cx: 75, cy: 95.5, r: 2.4, fill: "#FCD34D", lowOpacity: 0.4, highOpacity: 0.9, dur: "1.9s", dimOpacity: 0.25 },
    { cx: 50, cy: 98.5, r: 1.5, fill: "#93C5FD", lowOpacity: 0.3, highOpacity: 0.7, dur: "1.5s", dimOpacity: 0.2 },
    { cx: 25, cy: 95.5, r: 2.4, fill: "#F9A8D4", lowOpacity: 0.5, highOpacity: 1, dur: "1.6s", dimOpacity: 0.25 },
    { cx: 7, cy: 82, r: 1.5, fill: "#6EE7B7", lowOpacity: 0.3, highOpacity: 0.8, dur: "2.1s", dimOpacity: 0.2 },
    { cx: 1.5, cy: 60, r: 2.4, fill: "#FCA5A5", lowOpacity: 0.4, highOpacity: 0.9, dur: "1.3s", dimOpacity: 0.25 },
    { cx: 1.5, cy: 40, r: 1.5, fill: "#C4B5FD", lowOpacity: 0.3, highOpacity: 0.7, dur: "1.8s", dimOpacity: 0.2 },
    { cx: 7, cy: 18, r: 2.4, fill: "#FCD34D", lowOpacity: 0.5, highOpacity: 1, dur: "1.5s", dimOpacity: 0.25 },
    { cx: 25, cy: 4.5, r: 1.5, fill: "#93C5FD", lowOpacity: 0.3, highOpacity: 0.8, dur: "1.7s", dimOpacity: 0.2 },
];

const SEGMENT_PATHS = [
    { key: "s1", d: "M50,50 L50,8 A42,42 0 0,1 86.4,29 Z" },
    { key: "s2", d: "M50,50 L86.4,29 A42,42 0 0,1 86.4,71 Z" },
    { key: "s3", d: "M50,50 L86.4,71 A42,42 0 0,1 50,92 Z" },
    { key: "s4", d: "M50,50 L50,92 A42,42 0 0,1 13.6,71 Z" },
    { key: "s5", d: "M50,50 L13.6,71 A42,42 0 0,1 13.6,29 Z" },
    { key: "s6", d: "M50,50 L13.6,29 A42,42 0 0,1 50,8 Z" },
];

const DIVIDER_LINES = [
    { x2: 50, y2: 8 },
    { x2: 86.4, y2: 29 },
    { x2: 86.4, y2: 71 },
    { x2: 50, y2: 92 },
    { x2: 13.6, y2: 71 },
    { x2: 13.6, y2: 29 },
];

const SparkleStar = ({ className, style, size, fill }) => (
    <div className={className} style={style}>
        <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" focusable="false">
            <path d="M8 0l1.5 5.5L16 8l-6.5 2.5L8 16l-1.5-5.5L0 8l6.5-2.5z" fill={fill} />
        </svg>
    </div>
);

const usePrefersReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return undefined;
        }

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
        updatePreference();

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", updatePreference);
            return () => mediaQuery.removeEventListener("change", updatePreference);
        }

        if (typeof mediaQuery.addListener === "function") {
            mediaQuery.addListener(updatePreference);
            return () => mediaQuery.removeListener(updatePreference);
        }

        return undefined;
    }, []);

    return prefersReducedMotion;
};

const CompactCheckBadge = () => (
    <div style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(145deg,#FEF3C7,#FDE68A)", border: "2.5px solid #D97706", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(217,119,6,0.3)", zIndex: 2 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M5 12l5 5L20 7" /></svg>
    </div>
);

const MerchantDrawWheel = ({ merchantDrawStatus, reward, businessName, onEnter, compact = false }) => {
    const { t } = useTranslation();
    const rawSvgId = useId();
    const svgIdSuffix = rawSvgId.replace(/[^a-zA-Z0-9_-]/g, "");
    const svgIds = {
        wbg: `mdw-${svgIdSuffix}-wbg`,
        s1: `mdw-${svgIdSuffix}-s1`,
        s2: `mdw-${svgIdSuffix}-s2`,
        s3: `mdw-${svgIdSuffix}-s3`,
        s4: `mdw-${svgIdSuffix}-s4`,
        s5: `mdw-${svgIdSuffix}-s5`,
        s6: `mdw-${svgIdSuffix}-s6`,
        gloss: `mdw-${svgIdSuffix}-gloss`,
        cap: `mdw-${svgIdSuffix}-cap`,
        ptrglow: `mdw-${svgIdSuffix}-ptrglow`,
    };
    const urlFor = (id) => `url(#${id})`;
    const isCompleted = merchantDrawStatus === MERCHANT_DRAW_STATUS.COMPLETED;
    const prefersReducedMotion = usePrefersReducedMotion();
    const canAnimate = !isCompleted && !prefersReducedMotion;
    const isInteractive = typeof onEnter === "function";

    const handleClick = () => {
        if (isInteractive) {
            onEnter();
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onEnter?.();
        }
    };
    const interactiveProps = isInteractive
        ? { onClick: handleClick, onKeyDown: handleKeyDown, role: "button", tabIndex: 0 }
        : {};

    if (compact) {
        return (
            <div
                style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)", borderRadius: 18, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", cursor: isInteractive ? "pointer" : "default", transition: "transform 0.15s ease-out" }}
                {...interactiveProps}
            >
                <style>{WHEEL_KEYFRAMES}</style>
                <div style={{ flexShrink: 0, width: 72, height: 72, borderRadius: 16, background: isCompleted ? "linear-gradient(145deg,#f3f4f6,#e5e7eb)" : "linear-gradient(145deg,#1e293b,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", boxShadow: isCompleted ? "none" : "0 4px 14px rgba(15,23,42,0.25)" }}>
                    <div style={{ filter: isCompleted ? "saturate(0.35)" : "none", opacity: isCompleted ? 0.45 : 1 }}>
                        <svg viewBox="0 0 100 100" width="56" height="56" aria-hidden="true" focusable="false">
                            <defs>
                                {Object.entries(svgIds).filter(([k]) => k.startsWith("s") || k === "wbg" || k === "gloss" || k === "cap").map(([k, id]) => {
                                    const colors = { wbg: ["#1e293b","#0f172a"], s1: ["#7C3AED","#5B21B6"], s2: ["#3B82F6","#1D4ED8"], s3: ["#EF4444","#B91C1C"], s4: ["#F59E0B","#B45309"], s5: ["#10B981","#059669"], s6: ["#EC4899","#BE185D"] };
                                    if (colors[k]) return <linearGradient key={id} id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={colors[k][0]} /><stop offset="100%" stopColor={colors[k][1]} /></linearGradient>;
                                    if (k === "gloss") return <linearGradient key={id} id={id} x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgba(255,255,255,0.2)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" /></linearGradient>;
                                    if (k === "cap") return <radialGradient key={id} id={id} cx="38%" cy="32%"><stop offset="0%" stopColor="#475569" /><stop offset="100%" stopColor="#1e293b" /></radialGradient>;
                                    return null;
                                })}
                            </defs>
                            <circle cx="50" cy="50" r="49" fill={urlFor(svgIds.wbg)} stroke="#334155" strokeWidth="0.8" />
                            <g style={{ transformOrigin: "50px 50px", animation: canAnimate ? "mdwSpin 15s linear infinite" : "none" }}>
                                {SEGMENT_PATHS.map((seg) => <path key={seg.key} d={seg.d} fill={urlFor(svgIds[seg.key])} stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />)}
                            </g>
                            <circle cx="50" cy="50" r="13" fill="#0f172a" />
                            <circle cx="50" cy="50" r="12" fill={urlFor(svgIds.cap)} />
                            <polygon points="50,8 55,22 50,18 45,22" fill="#F59E0B" stroke="#92400E" strokeWidth="0.6" strokeLinejoin="round" />
                            <circle cx="50" cy="4" r="3.5" fill="#FDE68A" stroke="#92400E" strokeWidth="0.6" />
                        </svg>
                    </div>
                    {isCompleted && <CompactCheckBadge />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", lineHeight: 1.25 }}>
                        {t("merchantDraw", sourceKey.user)}
                    </div>
                    <div style={{ fontSize: 12, color: isCompleted ? "#16a34a" : "#a08060", marginTop: 3, fontWeight: isCompleted ? 600 : 400 }}>
                        {isCompleted ? t("youWonAPrize", sourceKey.user) : t("spinTheWheelForPrizes", sourceKey.user)}
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <div style={isCompleted
                            ? { display: "inline-block", background: "#fff", color: "#6b5740", padding: "9px 22px", borderRadius: 11, fontSize: 13, fontWeight: 700, border: "1.5px solid #e5e0d8", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }
                            : { display: "inline-block", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#fffbf0", padding: "9px 22px", borderRadius: 11, fontSize: 13, fontWeight: 800, boxShadow: "0 4px 14px rgba(245,158,11,0.3),0 0 0 2px rgba(245,158,11,0.1)" }
                        }>
                            {isCompleted ? t("viewPrize", sourceKey.user) : `${t("spinAndWin", sourceKey.user)} →`}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{ cursor: isInteractive ? "pointer" : "default", textAlign: "center", width: 200 }}
            {...interactiveProps}
        >
            <style>{WHEEL_KEYFRAMES}</style>
            <div style={{ height: 195, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
                className="mdwMotion"
                style={{
                    width: 163,
                    height: 163,
                    position: "relative",
                    animation: canAnimate ? "mdwFloat 4s ease-in-out infinite" : "none",
                }}
            >
                <div style={{ filter: isCompleted ? "saturate(0.35)" : "none", opacity: isCompleted ? 0.5 : 1 }}>
                    <svg viewBox="0 0 100 100" width="163" height="163" aria-hidden="true" focusable="false">
                        <defs>
                            <linearGradient id={svgIds.wbg} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#1e293b" />
                                <stop offset="60%" stopColor="#0f172a" />
                                <stop offset="100%" stopColor="#1e293b" />
                            </linearGradient>
                            <linearGradient id={svgIds.s1} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#7C3AED" />
                                <stop offset="100%" stopColor="#5B21B6" />
                            </linearGradient>
                            <linearGradient id={svgIds.s2} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#1D4ED8" />
                            </linearGradient>
                            <linearGradient id={svgIds.s3} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#EF4444" />
                                <stop offset="100%" stopColor="#B91C1C" />
                            </linearGradient>
                            <linearGradient id={svgIds.s4} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#F59E0B" />
                                <stop offset="100%" stopColor="#B45309" />
                            </linearGradient>
                            <linearGradient id={svgIds.s5} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#10B981" />
                                <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                            <linearGradient id={svgIds.s6} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#EC4899" />
                                <stop offset="100%" stopColor="#BE185D" />
                            </linearGradient>
                            <linearGradient id={svgIds.gloss} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                            </linearGradient>
                            <radialGradient id={svgIds.cap} cx="38%" cy="32%">
                                <stop offset="0%" stopColor="#475569" />
                                <stop offset="100%" stopColor="#1e293b" />
                            </radialGradient>
                            <filter id={svgIds.ptrglow}>
                                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#F59E0B" floodOpacity="0.7" />
                            </filter>
                        </defs>

                        <circle cx="50" cy="50" r="49" fill={urlFor(svgIds.wbg)} stroke="#334155" strokeWidth="0.8" />

                        {GEM_STUDS.map((gem, index) => (
                            <circle
                                key={index}
                                className={canAnimate ? "mdwMotion" : undefined}
                                cx={gem.cx}
                                cy={gem.cy}
                                r={gem.r}
                                fill={gem.fill}
                                opacity={isCompleted ? gem.dimOpacity : undefined}
                                style={!isCompleted
                                    ? {
                                        "--mdwGemLow": String(gem.lowOpacity),
                                        "--mdwGemHigh": String(gem.highOpacity),
                                        animation: canAnimate ? `mdwGemBlink ${gem.dur} ease-in-out infinite` : "none",
                                    }
                                    : undefined}
                            />
                        ))}

                        <g
                            className="mdwMotion"
                            style={{ transformOrigin: "50px 50px", animation: canAnimate ? "mdwSpin 15s linear infinite" : "none" }}
                        >
                            {SEGMENT_PATHS.map((segment) => (
                                <path
                                    key={segment.key}
                                    d={segment.d}
                                    fill={urlFor(svgIds[segment.key])}
                                    stroke={isCompleted ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)"}
                                    strokeWidth="0.3"
                                />
                            ))}
                            <circle cx="50" cy="50" r="42" fill={urlFor(svgIds.gloss)} opacity="0.3" />
                            {DIVIDER_LINES.map((line) => (
                                <line
                                    key={`${line.x2}-${line.y2}`}
                                    x1="50"
                                    y1="50"
                                    x2={line.x2}
                                    y2={line.y2}
                                    stroke={isCompleted ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)"}
                                    strokeWidth="0.4"
                                />
                            ))}
                        </g>

                        <circle cx="50" cy="50" r="13" fill="#0f172a" />
                        <circle cx="50" cy="50" r="12" fill={urlFor(svgIds.cap)} />

                        <g filter={urlFor(svgIds.ptrglow)}>
                            <circle cx="50" cy="3" r="4" fill="#FDE68A" stroke="#92400E" strokeWidth="0.8" />
                            <circle cx="50" cy="3" r="2" fill="#78350F" />
                            <polygon
                                points="50,8 55,22 50,18 45,22"
                                fill="#F59E0B"
                                stroke="#92400E"
                                strokeWidth="0.6"
                                strokeLinejoin="round"
                            />
                        </g>
                    </svg>
                </div>

                {canAnimate && (
                    <>
                        <SparkleStar
                            className="mdwMotion"
                            size={14}
                            fill="rgba(147,197,253,0.8)"
                            style={{
                                position: "absolute",
                                top: -8,
                                right: -5,
                                animation: "mdwSparkle 2s ease-in-out infinite",
                            }}
                        />
                        <SparkleStar
                            className="mdwMotion"
                            size={10}
                            fill="rgba(252,211,77,0.7)"
                            style={{
                                position: "absolute",
                                bottom: 0,
                                left: -6,
                                animation: "mdwSparkle 2.5s ease-in-out infinite",
                                animationDelay: "-1.2s",
                            }}
                        />
                    </>
                )}

                {isCompleted && (
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
                        <div
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: "50%",
                                background: "linear-gradient(145deg,#FEF3C7,#FDE68A)",
                                border: "3px solid #D97706",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 20px rgba(245,158,11,0.45),0 0 0 4px rgba(245,158,11,0.12)",
                            }}
                        >
                            <svg
                                width="26"
                                height="26"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#92400E"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                                focusable="false"
                            >
                                <path d="M5 12l5 5L20 7" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
            </div>

            <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#1a1a1a" }}>
                    {t("merchantDraw", sourceKey.user)}
                </div>
                <div
                    style={{
                        fontSize: 12,
                        color: isCompleted ? "#16a34a" : "#a08060",
                        marginTop: 3,
                        fontWeight: isCompleted ? 600 : 400,
                    }}
                >
                    {isCompleted
                        ? t("youWonAPrize", sourceKey.user)
                        : t("spinTheWheelForPrizes", sourceKey.user)}
                </div>
            </div>

            <div style={{ marginTop: 16 }}>
                <div
                    style={isCompleted
                        ? {
                            display: "inline-block",
                            background: "#fff",
                            color: "#6b5740",
                            padding: "12px 28px",
                            borderRadius: 13,
                            fontSize: 14,
                            fontWeight: 700,
                            border: "1.5px solid #e5e0d8",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        }
                        : {
                            display: "inline-block",
                            background: "linear-gradient(135deg,#F59E0B,#D97706)",
                            color: "#fff",
                            padding: "12px 28px",
                            borderRadius: 13,
                            fontSize: 14,
                            fontWeight: 800,
                            boxShadow: "0 4px 16px rgba(245,158,11,0.35),0 0 0 3px rgba(245,158,11,0.15)",
                        }}
                >
                    {isCompleted
                        ? t("viewPrize", sourceKey.user)
                        : `${t("spinAndWin", sourceKey.user)} \u2192`}
                </div>
            </div>
        </div>
    );
};

export default MerchantDrawWheel;
