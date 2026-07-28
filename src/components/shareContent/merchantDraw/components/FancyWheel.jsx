import { useEffect, useRef, useState } from "react";
import { Gift, Sparkles } from "lucide-react";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { LucideIcon, LUCIDE_ICON_NAMES } from "@/lib/iconLibrary/lucideDynamicIcon";
import { getFinalSpinAngle } from "../wheelSvgUtils";

const NUM_GEMS = 24;
const GEM_COLORS = ["#FCD34D", "#F9A8D4", "#93C5FD", "#6EE7B7", "#FCA5A5", "#C4B5FD"];

function darkenHex(hex, amount = 25) {
    const clean = (hex || "#888888").replace("#", "");
    const num = parseInt(clean.padEnd(6, "0"), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
    const b = Math.max(0, (num & 0xFF) - amount);
    return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function WheelSegmentIcon({ type }) {
    if (!type || !LUCIDE_ICON_NAMES.includes(type)) return null;

    return (
        <LucideIcon
            name={type}
            x={-6}
            y={-6}
            width={12}
            height={12}
            color="rgba(255,255,255,0.9)"
            strokeWidth={2.2}
        />
    );
}

const FancyWheel = ({
    segments = [],
    mustStartSpinning = false,
    prizeNumber = 0,
    onStopSpinning,
    onSpinClick,
    spinning = false,
    disabled = false,
    size = 300,
}) => {
    const sz = size;
    const { t } = useTranslation();
    const [wheelAngle, setWheelAngle] = useState(0);
    const [shockwave, setShockwave] = useState(false);
    const [glow, setGlow] = useState(false);
    const [hasWon, setHasWon] = useState(false);

    const rafRef = useRef();
    const angle = useRef(0);
    const prevSeg = useRef(0);
    const ptrRef = useRef();

    const displaySegs = segments.length === 1 ? [segments[0], segments[0]] : segments;
    const N = Math.max(displaySegs.length, 1);
    const segDeg = 360 / N;

    function polar(d, r) {
        const rad = ((d - 90) * Math.PI) / 180;
        return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
    }

    function segPath(i) {
        const s = polar(i * segDeg, 48);
        const e = polar((i + 1) * segDeg, 48);
        return `M50,50 L${s.x},${s.y} A48,48 0 ${segDeg > 180 ? 1 : 0},1 ${e.x},${e.y} Z`;
    }

    function glossPath(i) {
        const s = polar(i * segDeg, 48);
        const e = polar((i + 1) * segDeg, 48);
        const si = polar(i * segDeg, 22);
        const ei = polar((i + 1) * segDeg, 22);
        return `M${si.x},${si.y} L${s.x},${s.y} A48,48 0 ${segDeg > 180 ? 1 : 0},1 ${e.x},${e.y} L${ei.x},${ei.y} A22,22 0 ${segDeg > 180 ? 1 : 0},0 ${si.x},${si.y} Z`;
    }

    useEffect(() => {
        if (!mustStartSpinning || segments.length === 0) return undefined;
        setShockwave(false);
        setGlow(false);
        setHasWon(false);

        const targetAngle = getFinalSpinAngle({
            currentAngle: angle.current,
            selectedIndex: prizeNumber,
            segmentCount: N,
            extraTurns: 5,
        });
        const startAngle = angle.current;
        const startTime = performance.now();
        const duration = 4000;

        function easeOut(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function step(now) {
            const t = Math.min((now - startTime) / duration, 1);
            const cur = startAngle + (targetAngle - startAngle) * easeOut(t);
            angle.current = cur;
            setWheelAngle(cur);

            const cs = Math.floor(Math.abs(cur / 15)) % NUM_GEMS;
            if (cs !== prevSeg.current) {
                prevSeg.current = cs;
                const el = ptrRef.current;
                if (el) {
                    el.style.animation = "none";
                    void el.offsetWidth;
                    el.style.animation = "fwPtrBounce 0.22s ease-out forwards";
                }
            }

            if (t < 1) {
                rafRef.current = requestAnimationFrame(step);
            } else {
                setShockwave(true);
                setGlow(true);
                setHasWon(true);
                setTimeout(() => onStopSpinning?.(), 700);
            }
        }

        rafRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafRef.current);
    }, [mustStartSpinning, prizeNumber, segments.length, N, onStopSpinning]);

    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    const isAnimating = mustStartSpinning;
    const chaseIdx = isAnimating ? Math.abs(Math.floor(wheelAngle / 15)) % NUM_GEMS : -1;
    const gems = Array.from({ length: NUM_GEMS }, (_, i) => {
        const p = polar((i / NUM_GEMS) * 360, 49.5);
        const dist = chaseIdx >= 0 ? Math.min(Math.abs(i - chaseIdx), NUM_GEMS - Math.abs(i - chaseIdx)) : 99;
        return {
            ...p,
            big: i % 4 === 0,
            col: GEM_COLORS[i % GEM_COLORS.length],
            lit: dist <= 3 ? (4 - dist) / 4 : 0,
        };
    });

    const wonSegment = hasWon && segments[prizeNumber] ? segments[prizeNumber] : null;
    const btnDisabled = spinning || isAnimating || disabled;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <style>{`
                @keyframes fwPtrBounce { 0%{transform:rotate(0deg)} 18%{transform:rotate(-16deg)} 42%{transform:rotate(6deg)} 65%{transform:rotate(-3deg)} 82%{transform:rotate(1deg)} 100%{transform:rotate(0deg)} }
                @keyframes fwShockwave { 0%{transform:scale(0.85);opacity:1;border-width:7px} 100%{transform:scale(1.55);opacity:0;border-width:1px} }
                @keyframes fwGemBlink { 0%{opacity:0.45} 100%{opacity:0.9} }
                @keyframes fwSpin360 { to{transform:rotate(360deg)} }
            `}</style>

            <div style={{ position: "relative", width: sz + 10, height: sz + 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                    position: "absolute",
                    borderRadius: "50%",
                    width: sz + 50,
                    height: sz + 50,
                    top: -20,
                    left: -20,
                    pointerEvents: "none",
                    transition: "background 0.5s",
                    background: glow
                        ? "radial-gradient(circle,rgba(251,191,36,0.3) 0%,transparent 65%)"
                        : isAnimating
                            ? "radial-gradient(circle,rgba(139,92,246,0.18) 0%,transparent 65%)"
                            : "none",
                }} />

                {shockwave && (
                    <div style={{
                        position: "absolute",
                        borderRadius: "50%",
                        width: sz,
                        height: sz,
                        top: 5,
                        left: 5,
                        pointerEvents: "none",
                        border: "5px solid rgba(251,191,36,0.9)",
                        animation: "fwShockwave 1s cubic-bezier(0.25,1,0.5,1) forwards",
                    }} />
                )}

                <div style={{
                    position: "absolute",
                    borderRadius: "50%",
                    width: sz,
                    height: sz,
                    background: "linear-gradient(135deg,#1e293b 0%,#0f172a 60%,#1e293b 100%)",
                    boxShadow: "0 0 0 3px #334155,0 8px 40px rgba(0,0,0,0.5)",
                }} />

                <div style={{ position: "absolute", width: sz - 20, height: sz - 20, transform: `rotate(${wheelAngle}deg)`, willChange: "transform" }}>
                    <svg viewBox="0 0 100 100" width={sz - 20} height={sz - 20}>
                        <defs>
                            {displaySegs.map((seg, i) => (
                                <linearGradient key={i} id={`fwsg${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={seg.color || "#7C3AED"} />
                                    <stop offset="100%" stopColor={darkenHex(seg.color || "#7C3AED")} />
                                </linearGradient>
                            ))}
                            <linearGradient id="fwgls" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                            </linearGradient>
                            <radialGradient id="fwcap" cx="38%" cy="32%">
                                <stop offset="0%" stopColor="#475569" />
                                <stop offset="100%" stopColor="#1e293b" />
                            </radialGradient>
                        </defs>

                        {displaySegs.map((_, i) => (
                            <path key={i} d={segPath(i)} fill={`url(#fwsg${i})`} stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
                        ))}
                        {displaySegs.map((_, i) => (
                            <path key={`g${i}`} d={glossPath(i)} fill="url(#fwgls)" opacity="0.65" />
                        ))}
                        {displaySegs.map((_, i) => {
                            const pt = polar(i * segDeg, 48);
                            return <line key={`dv${i}`} x1="50" y1="50" x2={pt.x} y2={pt.y} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />;
                        })}
                        {displaySegs.map((seg, i) => {
                            const mid = i * segDeg + segDeg / 2;
                            const rad = ((mid - 90) * Math.PI) / 180;
                            const cx = 50 + 33 * Math.cos(rad);
                            const cy = 50 + 33 * Math.sin(rad);
                            const rawLabel = seg.label || "";
                            const label = rawLabel.length > 9 ? `${rawLabel.slice(0, 9)}...` : rawLabel;
                            const iconType = seg.icon || seg.iconType;
                            const hasIcon = Boolean(iconType && LUCIDE_ICON_NAMES.includes(iconType));
                            const rawTag = seg.tag || seg.badge || "";
                            const tag = typeof rawTag === "string" ? rawTag.slice(0, 8).toUpperCase() : "";

                            return (
                                <g key={`lb${i}`} transform={`translate(${cx},${cy}) rotate(${mid})`}>
                                    {hasIcon ? (
                                        <>
                                            {tag && (
                                                <text textAnchor="middle" dominantBaseline="middle" fontSize="3.1" fontWeight="900" letterSpacing="0.5" fill="rgba(255,255,255,0.9)" y="-12">
                                                    {tag}
                                                </text>
                                            )}
                                            <g transform={`translate(0,${tag ? -2 : -4})`}>
                                                <WheelSegmentIcon type={iconType} />
                                            </g>
                                            <text textAnchor="middle" dominantBaseline="middle" fontSize="3.4" fontWeight="700" fill="rgba(255,255,255,0.92)" y={tag ? "10.5" : "9.5"}>
                                                {label}
                                            </text>
                                        </>
                                    ) : (
                                        <text textAnchor="middle" dominantBaseline="middle" fontSize="3.8" fontWeight="700" fill="rgba(255,255,255,0.92)">{label}</text>
                                    )}
                                </g>
                            );
                        })}

                        <circle cx="50" cy="50" r="13" fill="#0f172a" />
                        <circle cx="50" cy="50" r="12" fill="url(#fwcap)" />
                    </svg>
                </div>

                <div style={{ position: "absolute", borderRadius: "50%", width: sz, height: sz, pointerEvents: "none" }}>
                    {gems.map((g, i) => (
                        <div key={i} style={{
                            position: "absolute",
                            borderRadius: "50%",
                            width: g.big ? 8 : 4.5,
                            height: g.big ? 8 : 4.5,
                            background: g.lit > 0.5 ? "#fff" : g.col,
                            left: `${g.x}%`,
                            top: `${g.y}%`,
                            transform: "translate(-50%,-50%)",
                            boxShadow: g.lit > 0
                                ? `0 0 ${12 + g.lit * 18}px ${5 + g.lit * 9}px ${g.col},0 0 ${4 + g.lit * 6}px 2px #fff`
                                : g.big ? `0 0 6px 2px ${g.col}88` : `0 0 3px 1px ${g.col}55`,
                            opacity: g.lit > 0 ? 1 : isAnimating ? 0.75 : 0.5,
                            transition: "box-shadow 0.04s,opacity 0.04s,background 0.04s",
                            animation: g.lit === 0 && !isAnimating
                                ? `fwGemBlink ${1.2 + (i % 5) * 0.3}s ease-in-out ${(i % 7) * 0.2}s infinite alternate`
                                : "none",
                        }} />
                    ))}
                </div>

                <div ref={ptrRef} style={{ position: "absolute", top: -6, left: "calc(50% - 14px)", zIndex: 20, transformOrigin: "14px 6px", filter: "drop-shadow(0 2px 10px rgba(251,191,36,1))" }}>
                    <svg width="28" height="40" viewBox="0 0 28 40">
                        <defs>
                            <linearGradient id="fwpg" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#FDE68A" />
                                <stop offset="100%" stopColor="#F59E0B" />
                            </linearGradient>
                        </defs>
                        <circle cx="14" cy="6" r="5" fill="#FDE68A" stroke="#92400E" strokeWidth="1" />
                        <circle cx="14" cy="6" r="2.5" fill="#78350F" />
                        <polygon points="14,11 20,36 14,30 8,36" fill="url(#fwpg)" stroke="#92400E" strokeWidth="1.2" strokeLinejoin="round" />
                    </svg>
                </div>

                <button
                    onClick={onSpinClick}
                    disabled={btnDisabled}
                    style={{
                        position: "absolute",
                        zIndex: 30,
                        borderRadius: "50%",
                        width: 82,
                        height: 82,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: btnDisabled
                            ? "radial-gradient(circle at 35% 35%,#475569,#1e293b)"
                            : "radial-gradient(circle at 35% 35%,#FFFDE7,#FCD34D)",
                        boxShadow: btnDisabled
                            ? "0 0 0 3px #334155,0 4px 12px rgba(0,0,0,0.5)"
                            : "0 0 0 4px #F59E0B,0 0 28px rgba(251,191,36,0.65),0 4px 16px rgba(0,0,0,0.4)",
                        cursor: btnDisabled ? "not-allowed" : "pointer",
                        border: "none",
                        transition: "all 0.2s",
                    }}
                >
                    {(spinning || isAnimating)
                        ? <span style={{ fontSize: 26, display: "inline-block", animation: "fwSpin360 0.7s linear infinite" }}>...</span>
                        : (
                            <>
                                <span style={{ fontSize: 13, fontWeight: 900, color: "#78350F", letterSpacing: 1.5, textTransform: "uppercase" }}>{t("spin", sourceKey.user)}</span>
                                <Sparkles style={{ width: 14, height: 14, color: "#D97706", marginTop: 2 }} />
                                <span style={{ fontSize: 9, fontWeight: 700, color: "#92400E", marginTop: 2, textTransform: "uppercase" }}>{t("tap", sourceKey.user)}</span>
                            </>
                        )
                    }
                </button>
            </div>

            <div style={{
                marginTop: 16,
                width: "100%",
                maxWidth: 340,
                borderRadius: 14,
                padding: "11px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                minHeight: 50,
                transition: "all 0.5s",
                backdropFilter: "blur(4px)",
                background: wonSegment ? `${wonSegment.color}18` : "rgba(255,255,255,0.6)",
                border: wonSegment ? `1.5px solid ${wonSegment.color}44` : "1.5px solid rgba(255,255,255,0.4)",
            }}>
                {wonSegment
                    ? (
                        <>
                            <div style={{ padding: 7, borderRadius: 9, background: `${wonSegment.color}22` }}>
                                <Gift style={{ width: 16, height: 16, color: wonSegment.color }} aria-hidden="true" />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: 9, fontWeight: 900, letterSpacing: 1.5, textTransform: "uppercase", color: wonSegment.color }}>{t("youWon", sourceKey.user)}</p>
                                <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#1E293B" }}>{wonSegment.label}</p>
                            </div>
                        </>
                    )
                    : (
                        <p style={{ margin: 0, fontSize: 12, color: "#94A3B8" }}>
                            {isAnimating ? t("spinning", sourceKey.user) : disabled ? t("alreadyPlayed", sourceKey.user) : t("tapSpinToPlay", sourceKey.user)}
                        </p>
                    )
                }
            </div>
        </div>
    );
};

export default FancyWheel;
