import React from "react";

const STARS = [
    { left: "9%", top: "12%", delay: 0, dur: 3.8, color: "rgba(220,38,38,0.38)", size: 11 },
    { left: "91%", top: "6%", delay: 0.8, dur: 4.4, color: "rgba(251,191,36,0.42)", size: 9 },
    { left: "4%", top: "28%", delay: 1.2, dur: 5, color: "rgba(249,115,22,0.32)", size: 8 },
    { left: "94%", top: "20%", delay: 0.4, dur: 3.5, color: "rgba(220,38,38,0.28)", size: 8 },
    { left: "8%", top: "76%", delay: 0.9, dur: 4.6, color: "rgba(251,191,36,0.38)", size: 10 },
    { left: "93%", top: "68%", delay: 1.5, dur: 3.9, color: "rgba(220,38,38,0.32)", size: 7 },
];

const CIRCLES = [
    { left: "20%", top: "15%", delay: 0.5, dur: 5.2, color: "rgba(220,38,38,0.32)", size: 12 },
    { left: "86%", top: "33%", delay: 1.8, dur: 4.1, color: "rgba(251,191,36,0.38)", size: 10 },
    { left: "16%", top: "40%", delay: 0.2, dur: 4.8, color: "rgba(249,115,22,0.28)", size: 11 },
    { left: "22%", top: "75%", delay: 1, dur: 5.5, color: "rgba(251,191,36,0.30)", size: 9 },
];

const DIAMONDS = [
    { left: "95%", top: "46%", delay: 0.6, dur: 4.3, color: "rgba(251,191,36,0.33)", size: 10 },
    { left: "5%", top: "53%", delay: 1.1, dur: 3.7, color: "rgba(220,38,38,0.28)", size: 8 },
    { left: "83%", top: "86%", delay: 0.4, dur: 5.1, color: "rgba(249,115,22,0.30)", size: 9 },
];

const GEO_OUTLINES = [
    { left: "3%", top: "5%", dur: 6, delay: 0, shape: "circle", size: 38, color: "rgba(220,38,38,0.14)" },
    { left: "88%", top: "3%", dur: 7, delay: 1, shape: "square", size: 32, color: "rgba(251,191,36,0.16)" },
    { left: "88%", top: "26%", dur: 5.5, delay: 0.5, shape: "circle", size: 28, color: "rgba(249,115,22,0.14)" },
    { left: "3%", top: "60%", dur: 6.5, delay: 0.3, shape: "square", size: 32, color: "rgba(220,38,38,0.12)" },
    { left: "88%", top: "68%", dur: 5.8, delay: 0.8, shape: "tri", size: 26, color: "rgba(251,191,36,0.16)" },
    { left: "6%", top: "82%", dur: 6.2, delay: 1.3, shape: "circle", size: 24, color: "rgba(251,191,36,0.13)" },
];

const MerchantDrawBackground = () => (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Color blobs */}
        <div style={{ position: "absolute", top: -60, left: -60, width: 260, height: 260, borderRadius: "50%", filter: "blur(65px)", background: "rgba(220,38,38,0.12)" }} />
        <div style={{ position: "absolute", bottom: -80, right: -60, width: 300, height: 300, borderRadius: "50%", filter: "blur(65px)", background: "rgba(251,191,36,0.13)" }} />
        <div style={{ position: "absolute", top: "42%", left: "58%", transform: "translate(-50%,-50%)", width: 200, height: 200, borderRadius: "50%", filter: "blur(65px)", background: "rgba(249,115,22,0.07)" }} />
        {/* Dot grid */}
        <div className="luckydraw-inset-overlay" style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.10) 1.2px, transparent 1.2px)", backgroundSize: "20px 20px" }} />
        {/* Diagonal stripe */}
        <div className="luckydraw-inset-overlay" style={{ backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 28px, rgba(220,38,38,0.025) 28px, rgba(220,38,38,0.025) 29px)" }} />
        {/* Corner arcs — top right */}
        <svg style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400 }} viewBox="0 0 400 400" fill="none">
            <circle cx="400" cy="0" r="110" stroke="rgba(220,38,38,0.12)" strokeWidth="1.5" />
            <circle cx="400" cy="0" r="185" stroke="rgba(220,38,38,0.07)" strokeWidth="1" />
            <circle cx="400" cy="0" r="260" stroke="rgba(251,191,36,0.05)" strokeWidth="1" />
        </svg>
        {/* Corner arcs — bottom left */}
        <svg style={{ position: "absolute", bottom: -80, left: -80, width: 360, height: 360 }} viewBox="0 0 360 360" fill="none">
            <circle cx="0" cy="360" r="100" stroke="rgba(251,191,36,0.13)" strokeWidth="1.5" />
            <circle cx="0" cy="360" r="170" stroke="rgba(251,191,36,0.07)" strokeWidth="1" />
            <circle cx="0" cy="360" r="245" stroke="rgba(249,115,22,0.04)" strokeWidth="1" />
        </svg>
        {/* Edge orbs */}
        <div style={{ position: "absolute", top: "3%", right: "-6%", width: 140, height: 140, borderRadius: "50%", background: "rgba(220,38,38,0.07)", animation: "ldOrbPulse 4.5s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "36%", left: "-5%", width: 120, height: 120, borderRadius: "50%", background: "rgba(249,115,22,0.06)", animation: "ldOrbPulse 5.5s ease-in-out 0.8s infinite" }} />
        <div style={{ position: "absolute", bottom: "8%", right: "-4%", width: 150, height: 150, borderRadius: "50%", background: "rgba(251,191,36,0.08)", animation: "ldOrbPulse 4s ease-in-out 0.3s infinite" }} />
        {/* Floating stars */}
        {STARS.map((s, i) => (
            <div key={`star${i}`} style={{ position: "absolute", top: s.top, left: s.left, animation: `ldFloat ${s.dur}s ease-in-out ${s.delay}s infinite` }}>
                <svg viewBox="0 0 20 20" width={s.size} height={s.size}><path d="M10,0 L11.8,8.2 L20,10 L11.8,11.8 L10,20 L8.2,11.8 L0,10 L8.2,8.2 Z" fill={s.color} /></svg>
            </div>
        ))}
        {/* Floating hollow circles */}
        {CIRCLES.map((c, i) => (
            <div key={`circ${i}`} style={{ position: "absolute", top: c.top, left: c.left, animation: `ldFloat ${c.dur}s ease-in-out ${c.delay}s infinite` }}>
                <svg viewBox="0 0 14 14" width={c.size} height={c.size}><circle cx="7" cy="7" r="5.5" fill="none" stroke={c.color} strokeWidth="1.5" /></svg>
            </div>
        ))}
        {/* Floating diamonds */}
        {DIAMONDS.map((d, i) => (
            <div key={`dia${i}`} style={{ position: "absolute", top: d.top, left: d.left, animation: `ldFloat ${d.dur}s ease-in-out ${d.delay}s infinite` }}>
                <svg viewBox="0 0 16 16" width={d.size} height={d.size}><rect x="3" y="3" width="10" height="10" rx="1" transform="rotate(45 8 8)" fill={d.color} /></svg>
            </div>
        ))}
        {/* Geo outlines */}
        {GEO_OUTLINES.map((g, i) => (
            <div key={`geo${i}`} style={{ position: "absolute", top: g.top, left: g.left, animation: `ldFloat ${g.dur}s ease-in-out ${g.delay}s infinite` }}>
                {g.shape === "circle" && <svg viewBox="0 0 44 44" width={g.size} height={g.size}><circle cx="22" cy="22" r="18" fill="none" stroke={g.color} strokeWidth="1.5" /></svg>}
                {g.shape === "square" && <svg viewBox="0 0 40 40" width={g.size} height={g.size}><rect x="5" y="5" width="30" height="30" rx="8" fill="none" stroke={g.color} strokeWidth="1.5" /></svg>}
                {g.shape === "tri" && <svg viewBox="0 0 34 34" width={g.size} height={g.size}><polygon points="17,2 32,30 2,30" fill="none" stroke={g.color} strokeWidth="1.5" strokeLinejoin="round" /></svg>}
            </div>
        ))}
    </div>
);

export default MerchantDrawBackground;
