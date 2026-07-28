import React, { useState, useEffect, useRef, useId, useCallback } from "react";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { replaceStringPattern } from "@/utility/common-functions";

const CAPSULE_KEYFRAMES = `
  @keyframes cmBallBounce { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} 60%{transform:translateY(-2px)} }
  @keyframes cmMachineSway { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-1deg)} 50%{transform:rotate(0deg)} 75%{transform:rotate(1deg)} }
  @keyframes cmMachineRattle { 0%,100%{transform:translate(0,0) rotate(0deg)} 12%{transform:translate(-3px,1px) rotate(-2deg)} 24%{transform:translate(3px,-1px) rotate(2deg)} 36%{transform:translate(-2px,1px) rotate(-1.4deg)} 48%{transform:translate(2px,0) rotate(1.4deg)} 60%{transform:translate(-1px,0) rotate(-0.8deg)} }
  @keyframes cmDomeJiggle { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-3px,2px)} 40%{transform:translate(2px,-3px)} 60%{transform:translate(-1px,3px)} 80%{transform:translate(3px,-1px)} }
  @keyframes cmSpin { to{transform:rotate(360deg)} }
  @keyframes cmWobble { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-8deg)} 50%{transform:rotate(7deg)} 75%{transform:rotate(-4deg)} }
  @keyframes cmTwinkle { 0%,100%{opacity:0; transform:scale(.3) rotate(0deg)} 50%{opacity:1; transform:scale(1) rotate(45deg)} }
  @keyframes cmFloatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
  @keyframes cmSoftPulse { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-2px) scale(1.03)} }
  @keyframes cmSparkle { 0%,100%{opacity:0; transform:scale(.5)} 50%{opacity:1; transform:scale(1)} }
`;

let _audioCtx = null;
function ensureAudio() {
    if (typeof window === "undefined") return;
    if (!_audioCtx) {
        try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { }
    }
    if (_audioCtx && _audioCtx.state === "suspended") _audioCtx.resume();
}
function tone(freq, dur, type, gain, when) {
    if (!_audioCtx) return;
    const t = _audioCtx.currentTime + (when || 0);
    const o = _audioCtx.createOscillator();
    const g = _audioCtx.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    o.connect(g);
    g.connect(_audioCtx.destination);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.2, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.03);
}
function noise(dur, gain, when) {
    if (!_audioCtx) return;
    const t = _audioCtx.currentTime + (when || 0);
    const b = _audioCtx.createBuffer(1, Math.floor(_audioCtx.sampleRate * dur), _audioCtx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = _audioCtx.createBufferSource();
    s.buffer = b;
    const g = _audioCtx.createGain();
    const f = _audioCtx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1100;
    f.Q.value = 0.8;
    s.connect(f);
    f.connect(g);
    g.connect(_audioCtx.destination);
    g.gain.setValueAtTime(gain || 0.14, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.start(t);
    s.stop(t + dur);
}
function sfx(name) {
    ensureAudio();
    if (!_audioCtx) return;
    if (name === "rattle") { for (let i = 0; i < 8; i++) noise(0.06, 0.11, i * 0.135); }
    else if (name === "thunk") { tone(170, 0.16, "sine", 0.3, 0); tone(85, 0.26, "sine", 0.26, 0.02); }
    else if (name === "pop") { tone(520, 0.07, "triangle", 0.26, 0); tone(900, 0.12, "triangle", 0.2, 0.05); }
    else if (name === "win") { [523, 659, 784, 1046].forEach((freq, i) => tone(freq, 0.18, "triangle", 0.22, i * 0.085)); }
    else if (name === "click") { tone(300, 0.05, "square", 0.14, 0); }
}

function generateDomeBalls(count = 20) {
    const balls = [];
    for (let i = 0; i < count; i++) {
        const sz = 14 + Math.random() * 10;
        const left = 6 + Math.random() * 72;
        const top = 4 + Math.random() * 62;
        const h = Math.floor(Math.random() * 360);
        const rot = Math.round(180 + (Math.random() * 50 - 25));
        const hx = (28 + Math.random() * 16).toFixed(0);
        const dur = (2.0 + Math.random() * 1.2).toFixed(2);
        const delay = (-Math.random() * 2).toFixed(1);
        balls.push({ sz, left, top, h, rot, hx, dur, delay });
    }
    return balls;
}

const CUBIC = "cubic-bezier(.34,1.56,.64,1)";
const SPARKLES = [
    { x: "8%", y: "18%", s: 18, d: "0s" },
    { x: "86%", y: "24%", s: 14, d: ".4s" },
    { x: "14%", y: "70%", s: 12, d: ".8s" },
    { x: "90%", y: "66%", s: 20, d: ".2s" },
    { x: "50%", y: "8%", s: 16, d: ".6s" },
    { x: "72%", y: "88%", s: 13, d: "1s" },
];

const FancyCapsuleMachine = ({
    mustStart = false,
    prize = null,
    onSpin,
    onComplete,
    onViewDashboard,
    disabled = false,
    alreadySpun = false,
    machineLabel = "VOUCHER DRAW",
    businessName = "",
}) => {
    const { t } = useTranslation();
    const [phase, setPhase] = useState("idle");
    const [domeBalls] = useState(() => generateDomeBalls(20));
    const seqRef = useRef(0);
    const hasRunRef = useRef(false);
    const timeoutRef = useRef(null);
    const rawSvgId = useId();
    const svgIdSuffix = rawSvgId.replace(/[^a-zA-Z0-9_-]/g, "");

    const sleep = useCallback((ms) => new Promise((resolve) => {
        timeoutRef.current = setTimeout(resolve, ms);
    }), []);

    useEffect(() => {
        return () => {
            clearTimeout(timeoutRef.current);
            seqRef.current++;
        };
    }, []);

    useEffect(() => {
        if (!mustStart) {
            hasRunRef.current = false;
            return;
        }

        if (hasRunRef.current || !prize) return;
        hasRunRef.current = true;

        const run = async () => {
            seqRef.current++;
            const my = seqRef.current;
            const alive = () => my === seqRef.current;

            sfx("rattle");
            setPhase("shaking");
            await sleep(1300); if (!alive()) return;

            sfx("thunk");
            setPhase("dropping");
            await sleep(880); if (!alive()) return;

            setPhase("landed");
            await sleep(560); if (!alive()) return;

            setPhase("fade");
            await sleep(150); if (!alive()) return;

            setPhase("zoom");
            await sleep(720); if (!alive()) return;

            setPhase("open");
            sfx("pop");
            if (prize.won) sfx("win");
            await sleep(950); if (!alive()) return;

            setPhase("result");
            onComplete?.();
        };

        run();
    }, [mustStart, prize, sleep, onComplete]);

    const handleDraw = () => {
        if (disabled || alreadySpun || phase !== "idle") return;
        ensureAudio();
        sfx("click");
        onSpin?.();
    };

    const showReveal = phase === "zoom" || phase === "open" || phase === "result";
    const opened = phase === "open" || phase === "result";
    const showDispensedCapsule = phase === "dropping" || phase === "landed" || phase === "fade";
    const overlayWon = !!prize?.won;
    const buttonLabel = `${t("getACapsule", sourceKey.user)} \u2192`;
    const prizeColor = prize?.color || "#9aa1ad";
    const prizeLight = prize?.light || "#c3c8d1";
    const tierLabel = overlayWon ? t("youWonLabel", sourceKey.user) : t("noPrizeLabel", sourceKey.user);
    const bannerText = overlayWon ? t("youWonBanner", sourceKey.user) : t("noLuckBanner", sourceKey.user);
    const cardBrand = prize?.brand || businessName || "";
    const cardTitle = prize?.title || "";
    const drawDisabled = phase !== "idle" || disabled || alreadySpun;
    const alreadyClaimedDesc = replaceStringPattern(t("alreadyClaimedDesc", sourceKey.user), { businessName });
    const topGradientId = `cm-${svgIdSuffix}-capTopGrad`;
    const bottomGradientId = `cm-${svgIdSuffix}-capBotGrad`;

    if (alreadySpun && phase === "idle") {
        return (
            <div style={{ position: "relative", maxWidth: 420, margin: "0 auto", padding: "48px 16px 32px", zIndex: 1 }}>
                <style>{CAPSULE_KEYFRAMES}</style>
                <div style={{ background: "#fff", borderRadius: 22, boxShadow: "0 8px 32px rgba(220,38,38,0.10), 0 2px 8px rgba(0,0,0,0.06)", padding: "36px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🎫</div>
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1E293B", margin: "0 0 8px" }}>{t("alreadyClaimed", sourceKey.user)}</h2>
                    <p style={{ fontSize: 13, color: "#64748B", margin: "0 auto", lineHeight: 1.6, maxWidth: 280 }}>
                        {alreadyClaimedDesc}
                    </p>
                    <button
                        type="button"
                        onClick={() => onViewDashboard?.()}
                        style={{
                            marginTop: 20,
                            padding: "13px 28px",
                            fontFamily: "inherit",
                            fontSize: 15,
                            fontWeight: 800,
                            color: "#fff",
                            border: "none",
                            borderRadius: 15,
                            background: "linear-gradient(135deg,#F59E0B,#D97706)",
                            boxShadow: "0 4px 16px rgba(245,158,11,.35)",
                            cursor: "pointer",
                        }}
                    >
                        {t("viewDashboard", sourceKey.user)}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: "relative", width: "100%", maxWidth: 420, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px 40px", zIndex: 1 }}>
            <style>{CAPSULE_KEYFRAMES}</style>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                <div
                    style={{
                        width: 210,
                        height: 226,
                        position: "relative",
                        margin: "0 auto",
                        transformOrigin: "center bottom",
                        animation: phase === "shaking" ? "cmMachineRattle .25s ease-in-out infinite" : "cmMachineSway 5s ease-in-out infinite",
                    }}
                >
                    <div style={{ position: "absolute", top: 0, left: 10, right: 10, height: 22, background: "linear-gradient(180deg,#ef4444,#dc2626)", borderRadius: "12px 12px 0 0" }} />

                    <div style={{ position: "absolute", top: 18, left: 14, right: 14, height: 128, background: "rgba(255,255,255,0.16)", borderRadius: "50% 50% 12px 12px", border: "4px solid rgba(200,200,200,0.32)", overflow: "hidden", boxShadow: "inset 0 -14px 26px rgba(0,0,0,0.07)" }}>
                        <div style={{ position: "absolute", inset: 0, animation: phase === "shaking" ? "cmDomeJiggle .15s ease-in-out infinite" : "none" }}>
                            {domeBalls.map((ball, index) => {
                                const top1 = `hsl(${ball.h},88%,66%)`;
                                const top2 = `hsl(${ball.h},85%,52%)`;
                                return (
                                    <div
                                        key={`${ball.left}-${ball.top}-${index}`}
                                        style={{
                                            position: "absolute",
                                            left: `${ball.left}%`,
                                            top: `${ball.top}%`,
                                            width: ball.sz,
                                            height: ball.sz,
                                            borderRadius: "50%",
                                            background: `radial-gradient(circle at ${ball.hx}% 26%, rgba(255,255,255,.8), rgba(255,255,255,0) 42%),linear-gradient(${ball.rot}deg,${top1} 0%,${top2} 49%,#fdfdff 51%,#eef0f4 100%)`,
                                            boxShadow: "0 1px 4px rgba(0,0,0,.2), inset 0 0 0 1px rgba(0,0,0,.05)",
                                            animation: `cmBallBounce ${ball.dur}s ease-in-out ${ball.delay}s infinite`,
                                        }}
                                    />
                                );
                            })}
                        </div>
                        <div style={{ position: "absolute", top: 10, left: 12, width: 26, height: 42, background: "rgba(255,255,255,0.22)", borderRadius: "50%", transform: "rotate(-20deg)" }} />
                    </div>

                    <div style={{ position: "absolute", top: 142, left: 30, right: 30, height: 62, background: "linear-gradient(180deg,#dc2626,#b91c1c)", borderRadius: "0 0 12px 12px", boxShadow: "0 6px 16px rgba(185,28,28,0.22)" }} />
                    <div style={{ position: "absolute", top: 142, left: 30, right: 30, height: 7, background: "rgba(255,255,255,0.08)" }} />

                    <div style={{ position: "absolute", top: 152, left: 38, width: 98, height: 18, background: "linear-gradient(180deg,#fffaf0,#ffe9c4)", borderRadius: 5, border: "1.5px solid #e0a800", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, letterSpacing: 1, color: "#dc2626", whiteSpace: "nowrap" }}>
                        {machineLabel}
                    </div>

                    <div
                        style={{
                            position: "absolute",
                            top: 156,
                            right: 26,
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "radial-gradient(circle at 40% 35%, #fde68a, #d97706)",
                            border: "2px solid #b45309",
                            boxShadow: "0 0 6px rgba(217,119,6,0.3)",
                            transition: `transform 1.3s ${CUBIC}`,
                            transform: phase === "shaking" ? "rotate(720deg)" : "rotate(0deg)",
                        }}
                    >
                        <div style={{ position: "absolute", top: "50%", left: "50%", width: 9, height: 2.5, background: "#7c4a02", borderRadius: 2, transform: "translate(-50%,-50%)" }} />
                    </div>

                    <div style={{ position: "absolute", top: 188, left: "50%", transform: "translateX(-50%)", width: 42, height: 16, background: "#7f1d1d", borderRadius: "0 0 8px 8px", border: "1px solid #991b1b" }} />
                    <div style={{ position: "absolute", top: 202, left: 44, width: 11, height: 14, background: "#991b1b", borderRadius: "0 0 4px 4px" }} />
                    <div style={{ position: "absolute", top: 202, right: 44, width: 11, height: 14, background: "#991b1b", borderRadius: "0 0 4px 4px" }} />
                    <div style={{ position: "absolute", top: 214, left: 40, width: 20, height: 6, background: "#7f1d1d", borderRadius: "0 0 4px 4px" }} />
                    <div style={{ position: "absolute", top: 214, right: 40, width: 20, height: 6, background: "#7f1d1d", borderRadius: "0 0 4px 4px" }} />

                    <div style={{ position: "absolute", top: 196, left: "50%", transform: "translateX(-50%)", zIndex: 4 }}>
                        <div
                            style={{
                                position: "relative",
                                transition: `transform .85s ${CUBIC}, opacity .15s ease`,
                                transform: showDispensedCapsule ? "translateY(22px)" : "translateY(-18px)",
                                opacity: phase === "fade" ? 0 : showDispensedCapsule ? 1 : 0,
                                animation: phase === "landed" ? "cmSoftPulse 1.6s ease-in-out infinite" : "none",
                            }}
                        >
                            <div style={{ position: "absolute", inset: -8, borderRadius: "50%", background: `radial-gradient(circle, ${prizeColor}55, transparent 70%)`, filter: "blur(5px)", opacity: showDispensedCapsule ? 1 : 0, transition: "opacity .3s ease" }} />
                            <div style={{ position: "relative", width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(145deg, ${prizeLight}, ${prizeColor})`, border: "2px solid rgba(255,255,255,0.45)", boxShadow: "0 4px 12px rgba(0,0,0,0.22)" }}>
                                <div style={{ position: "absolute", top: 6, left: 8, width: 11, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.45)" }} />
                                <div style={{ position: "absolute", left: 3, right: 3, top: "50%", height: 2, background: "rgba(0,0,0,0.12)", transform: "translateY(-50%)" }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ position: "absolute", top: 14, left: -10, animation: "cmSparkle 2.2s ease-in-out infinite" }}>
                        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
                            <path d="M8 0l1.5 5.5L16 8l-6.5 2.5L8 16l-1.5-5.5L0 8l6.5-2.5z" fill="rgba(34,197,94,0.65)" />
                        </svg>
                    </div>
                    <div style={{ position: "absolute", top: 120, right: -8, animation: "cmSparkle 2.8s ease-in-out infinite", animationDelay: "-1.5s" }}>
                        <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true" focusable="false">
                            <path d="M8 0l1.5 5.5L16 8l-6.5 2.5L8 16l-1.5-5.5L0 8l6.5-2.5z" fill="rgba(239,68,68,0.55)" />
                        </svg>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleDraw}
                    disabled={drawDisabled}
                    style={{
                        marginTop: 20,
                        padding: "14px 34px",
                        fontFamily: "inherit",
                        fontSize: 16,
                        fontWeight: 800,
                        letterSpacing: ".2px",
                        color: "#fff",
                        border: "none",
                        borderRadius: 15,
                        background: drawDisabled ? "linear-gradient(135deg,#b6b1a6,#928d82)" : "linear-gradient(135deg,#F59E0B,#D97706)",
                        boxShadow: drawDisabled ? "none" : "0 4px 16px rgba(245,158,11,.35), 0 0 0 3px rgba(245,158,11,.15)",
                        cursor: drawDisabled ? "default" : "pointer",
                        animation: phase === "idle" && !disabled && !alreadySpun ? "cmSoftPulse 1.8s ease-in-out infinite" : "none",
                    }}
                >
                    {phase === "idle" ? buttonLabel : t("opening", sourceKey.user)}
                </button>
            </div>

            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(40,28,12,.66)",
                    backdropFilter: "blur(3px)",
                    WebkitBackdropFilter: "blur(3px)",
                    opacity: showReveal ? 1 : 0,
                    transition: "opacity .35s ease",
                    pointerEvents: showReveal ? "auto" : "none",
                }}
            >
                <div style={{ position: "relative", width: 400, maxWidth: "92vw", height: 620, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div
                        style={{
                            fontWeight: 800,
                            fontSize: 32,
                            color: overlayWon ? "#ffe14d" : "#e6dccb",
                            textShadow: "0 4px 0 rgba(0,0,0,.22)",
                            marginBottom: 18,
                            opacity: opened ? 1 : 0,
                            transform: opened ? "translateY(0)" : "translateY(12px)",
                            transition: "opacity .4s ease .1s, transform .4s ease .1s",
                            position: "relative",
                            zIndex: 10,
                            animation: opened && overlayWon ? "cmFloatY 2.2s ease-in-out infinite" : "none",
                        }}
                    >
                        {bannerText}
                    </div>

                    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: opened && overlayWon ? 1 : 0, transition: "opacity .3s ease" }}>
                        {SPARKLES.map((sparkle) => (
                            <div
                                key={`${sparkle.x}-${sparkle.y}-${sparkle.s}`}
                                style={{
                                    position: "absolute",
                                    left: sparkle.x,
                                    top: sparkle.y,
                                    width: sparkle.s,
                                    height: sparkle.s,
                                    background: "#ffe14d",
                                    borderRadius: 3,
                                    animation: `cmTwinkle 1.6s ease-in-out ${sparkle.d} infinite`,
                                }}
                            />
                        ))}
                    </div>

                    <div style={{ transition: `transform .55s ${CUBIC}`, transform: showReveal ? "scale(1)" : "scale(.2)" }}>
                        <svg viewBox="0 0 400 420" width="280" style={{ display: "block", overflow: "visible", transformBox: "fill-box", transformOrigin: "center", animation: phase === "zoom" ? "cmWobble .55s ease-in-out" : "none" }} aria-hidden="true" focusable="false">
                            <defs>
                                <linearGradient id={bottomGradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0" stopColor="#ffffff" />
                                    <stop offset="1" stopColor="#dfe5ee" />
                                </linearGradient>
                                <linearGradient id={topGradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0" stopColor={prizeLight} />
                                    <stop offset="1" stopColor={prizeColor} />
                                </linearGradient>
                            </defs>

                            <g style={{ transformBox: "fill-box", transformOrigin: "200px 210px", opacity: opened && overlayWon ? 1 : 0, transition: "opacity .45s ease", animation: opened && overlayWon ? "cmSpin 9s linear infinite" : "none" }}>
                                <circle cx="200" cy="210" r="120" fill={overlayWon ? "rgba(255,236,150,.30)" : "rgba(255,255,255,0)"} />
                                {Array.from({ length: 12 }, (_, index) => (
                                    <polygon
                                        key={index}
                                        points="200,86 189,210 211,210"
                                        fill={index % 2 ? "rgba(255,255,255,.5)" : "rgba(255,221,87,.92)"}
                                        transform={`rotate(${index * 30} 200 210)`}
                                    />
                                ))}
                            </g>

                            <g style={{ transformBox: "fill-box", transformOrigin: "center", transition: `transform .6s cubic-bezier(.34,1.7,.5,1)`, transform: opened ? "translate(0,120px)" : "translate(0,0)" }}>
                                <path d="M 108 210 A 92 92 0 0 0 292 210 Z" fill={`url(#${bottomGradientId})`} stroke="rgba(0,0,0,.08)" strokeWidth="2" />
                                <ellipse cx="200" cy="210" rx="92" ry="13" fill="rgba(0,0,0,.07)" />
                                <ellipse cx="160" cy="250" rx="22" ry="34" fill="rgba(255,255,255,.6)" transform="rotate(-20 160 250)" />
                            </g>

                            <g style={{ transformBox: "fill-box", transformOrigin: "center", transition: `transform .6s cubic-bezier(.34,1.7,.5,1)`, transform: opened ? "translate(0,-140px) rotate(-16deg)" : "translate(0,0)" }}>
                                <path d="M 108 210 A 92 92 0 0 1 292 210 Z" fill={`url(#${topGradientId})`} />
                                <path d="M 108 210 A 92 92 0 0 1 292 210" fill="none" stroke="rgba(0,0,0,.12)" strokeWidth="2" />
                                <ellipse cx="166" cy="158" rx="34" ry="18" fill="rgba(255,255,255,.5)" transform="rotate(-22 166 158)" />
                            </g>
                        </svg>
                    </div>

                    <div
                        style={{
                            position: "absolute",
                            zIndex: 5,
                            width: 238,
                            background: "#fffdf8",
                            borderRadius: 20,
                            overflow: "hidden",
                            boxShadow: "0 18px 40px rgba(0,0,0,.32)",
                            opacity: opened ? 1 : 0,
                            transform: opened ? "translateY(0) scale(1)" : "translateY(24px) scale(.6)",
                            transition: "transform .5s cubic-bezier(.34,1.7,.5,1) .12s, opacity .4s ease .12s",
                        }}
                    >
                        <div style={{ padding: 10, textAlign: "center", fontWeight: 800, fontSize: 13, letterSpacing: 2, color: "#fff", background: overlayWon ? prizeColor : "#9aa1ad", textShadow: "0 1px 1px rgba(0,0,0,.2)" }}>
                            {tierLabel}
                        </div>
                        <div style={{ padding: "18px 20px 22px", textAlign: "center" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#a08060", textTransform: "uppercase" }}>
                                {overlayWon ? t("voucher", sourceKey.user) : ""}
                            </div>
                            <div style={{ fontSize: 25, fontWeight: 800, color: "#1a1a1a", margin: "4px 0 2px", lineHeight: 1.1, wordBreak: "break-word" }}>
                                {cardBrand}
                            </div>
                            <div style={{ fontSize: 17, fontWeight: 700, color: overlayWon ? "#16a34a" : "#9aa1ad", marginTop: 2, lineHeight: 1.35, wordBreak: "break-word" }}>
                                {cardTitle}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => onViewDashboard?.()}
                        style={{
                            position: "absolute",
                            bottom: -30,
                            padding: "13px 36px",
                            fontFamily: "inherit",
                            fontSize: 16,
                            fontWeight: 800,
                            letterSpacing: ".2px",
                            color: "#fff",
                            border: "none",
                            borderRadius: 15,
                            background: "linear-gradient(135deg,#F59E0B,#D97706)",
                            boxShadow: "0 4px 16px rgba(245,158,11,.35)",
                            cursor: "pointer",
                            opacity: phase === "result" ? 1 : 0,
                            pointerEvents: phase === "result" ? "auto" : "none",
                            transition: "opacity .4s ease .25s",
                        }}
                    >
                        {t("viewDashboard", sourceKey.user)}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FancyCapsuleMachine;
