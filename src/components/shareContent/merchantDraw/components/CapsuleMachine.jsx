import { useId } from "react";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";

const CAPSULE_KEYFRAMES = `
@keyframes cmShake { 0%,100% { transform: rotate(0deg); } 12% { transform: rotate(-1.5deg); } 24% { transform: rotate(1.5deg); } 36% { transform: rotate(-1deg); } 48% { transform: rotate(1deg); } 60% { transform: rotate(0deg); } }
@keyframes cmFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes cmSparkle { 0%,100% { opacity: 0; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1); } }
@keyframes cmPrizeBounce { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-3px) scale(1.04); } }
@media (prefers-reduced-motion: reduce) { .cmMotion, .cmMotion * { animation: none !important; } }
`;

const CAPSULES = [
    { cx: 75, cy: 62, r: 16, fill: "#60a5fa", hx: 75, hy: 58, hrx: 7, hry: 3.5, duration: "2.5s" },
    { cx: 122, cy: 56, r: 16, fill: "#34d399", hx: 122, hy: 52, hrx: 7, hry: 3.5, duration: "3s", delay: "-1s" },
    { cx: 98, cy: 84, r: 16, fill: "#f472b6", hx: 98, hy: 80, hrx: 7, hry: 3.5, duration: "2.8s", delay: "-0.5s" },
    { cx: 138, cy: 82, r: 12, fill: "#fbbf24", hx: 138, hy: 79, hrx: 5, hry: 2.5, duration: "3.2s", delay: "-1.8s" },
    { cx: 64, cy: 92, r: 12, fill: "#a78bfa", hx: 64, hy: 89, hrx: 5, hry: 2.5, duration: "2.6s", delay: "-2.2s" },
];

const IDLE_SPARKLES = [
    { top: 10, left: -6, size: 13, fill: "rgba(34,197,94,0.7)", duration: "2.2s" },
    { bottom: 26, right: -6, size: 11, fill: "rgba(239,68,68,0.6)", duration: "2.8s", delay: "-1.5s" },
];

const COMPLETED_CONFETTI = [
    { top: -12, left: -14, width: 6, height: 3, background: "#EF4444", duration: "2s", rotation: "0deg" },
    { top: -8, right: -16, width: 7, height: 3, background: "#22C55E", duration: "2.3s", rotation: "25deg", delay: "-0.3s" },
    { top: -16, left: 8, width: 4, height: 4, background: "#3B82F6", duration: "1.8s", rotation: "0deg", delay: "-0.5s" },
    { top: -14, right: 4, width: 4, height: 4, background: "#FBBF24", duration: "2.1s", rotation: "45deg", delay: "-1s" },
    { top: -6, left: -8, width: 5, height: 3, background: "#A78BFA", duration: "2.5s", rotation: "-15deg", delay: "-1.5s" },
];

const SparkleStar = ({ size, fill }) => (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" focusable="false">
        <path d="M8 0l1.5 5.5L16 8l-6.5 2.5L8 16l-1.5-5.5L0 8l6.5-2.5z" fill={fill} />
    </svg>
);

const CapsuleBall = ({ capsule, animate }) => (
    <g
        style={{
            animation: animate ? `cmFloat ${capsule.duration} ease-in-out infinite` : "none",
            animationDelay: capsule.delay,
        }}
    >
        <circle cx={capsule.cx} cy={capsule.cy} r={capsule.r} fill={capsule.fill} />
        <ellipse
            cx={capsule.hx}
            cy={capsule.hy}
            rx={capsule.hrx}
            ry={capsule.hry}
            fill="rgba(255,255,255,0.3)"
        />
    </g>
);

const MachineSvg = ({ ids, animate, voucherLabel }) => {
    const urlFor = (id) => `url(#${id})`;

    return (
        <svg
            width="184"
            height="190"
            viewBox="0 0 200 210"
            fill="none"
            style={{ filter: "drop-shadow(0 4px 12px rgba(185,28,28,0.25))" }}
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <linearGradient id={ids.redBody} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#B91C1C" />
                </linearGradient>
                <linearGradient id={ids.redCap} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F87171" />
                    <stop offset="100%" stopColor="#DC2626" />
                </linearGradient>
                <radialGradient id={ids.knobGold} cx="35%" cy="30%">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="100%" stopColor="#D97706" />
                </radialGradient>
                <radialGradient id={ids.domeShine} cx="30%" cy="25%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
            </defs>

            <rect x="45" y="8" width="110" height="24" rx="12" fill={urlFor(ids.redCap)} />
            <rect x="55" y="12" width="50" height="5" rx="2.5" fill="rgba(255,255,255,0.2)" />

            <path
                d="M45 30 h110 a16 16 0 0 1 16 16 v50 a72 72 0 0 1 -142 0 v-50 a16 16 0 0 1 16 -16 z"
                fill="#ffffff"
                stroke="#d9d2c4"
                strokeWidth="3.5"
            />
            <ellipse
                cx="75"
                cy="58"
                rx="16"
                ry="30"
                fill={urlFor(ids.domeShine)}
                transform="rotate(-10, 75, 58)"
            />

            {CAPSULES.map((capsule) => (
                <CapsuleBall key={`${capsule.cx}-${capsule.cy}`} capsule={capsule} animate={animate} />
            ))}

            <rect x="38" y="120" width="124" height="56" rx="14" fill={urlFor(ids.redBody)} />
            <rect x="38" y="120" width="124" height="7" rx="3.5" fill="rgba(255,255,255,0.08)" />

            <rect x="56" y="132" width="60" height="18" rx="5" fill="#FFE9C4" stroke="#E8D5A8" strokeWidth="1" />
            <text
                x="86"
                y="145"
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill="#92400E"
                fontFamily="Plus Jakarta Sans, sans-serif"
                letterSpacing="0.5"
            >
                {voucherLabel}
            </text>

            <circle cx="140" cy="143" r="12" fill={urlFor(ids.knobGold)} stroke="#B45309" strokeWidth="2" />
            <circle cx="140" cy="143" r="5" fill="#92400E" />
            <rect x="138.5" y="139" width="3" height="8" rx="1.2" fill="#78350F" opacity="0.4" />

            <rect x="72" y="172" width="56" height="14" rx="6" fill="#7F1D1D" stroke="#991B1B" strokeWidth="1.5" />
            <rect x="80" y="176" width="40" height="6" rx="3" fill="#581C1C" />

            <rect x="60" y="184" width="12" height="12" rx="3" fill="#991B1B" />
            <rect x="128" y="184" width="12" height="12" rx="3" fill="#991B1B" />
            <rect x="56" y="194" width="20" height="5" rx="2.5" fill="#7F1D1D" />
            <rect x="124" y="194" width="20" height="5" rx="2.5" fill="#7F1D1D" />
        </svg>
    );
};

const CheckBadge = () => (
    <div style={{ position: "absolute", top: "36%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 4 }}>
        <div
            style={{
                width: 52,
                height: 52,
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
                width="24"
                height="24"
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
);

const OpenedCapsule = () => (
    <div
        style={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%) scale(0.88)",
            transformOrigin: "50% 100%",
            zIndex: 3,
        }}
    >
        <div style={{ position: "relative", animation: "cmPrizeBounce 2.5s ease-in-out infinite" }}>
            <div style={{ position: "relative", width: 56, height: 56 }}>
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 4,
                        right: 4,
                        height: 26,
                        borderRadius: "0 0 50% 50%",
                        background: "linear-gradient(180deg,#FDE68A,#F59E0B)",
                        border: "2px solid rgba(255,255,255,0.4)",
                        boxShadow: "0 3px 12px rgba(245,158,11,0.4)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: -2,
                        right: -8,
                        width: 42,
                        height: 22,
                        borderRadius: "50% 50% 0 0",
                        background: "linear-gradient(180deg,#FEF3C7,#FDE68A)",
                        border: "2px solid rgba(255,255,255,0.4)",
                        transform: "rotate(25deg)",
                        boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: 4,
                            left: 8,
                            width: 10,
                            height: 5,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.4)",
                        }}
                    />
                </div>
                <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)" }}>
                    <svg width="22" height="18" viewBox="0 0 28 22" fill="none" aria-hidden="true" focusable="false">
                        <rect x="2" y="2" width="24" height="18" rx="4" fill="#fff" stroke="#D97706" strokeWidth="2" />
                        <circle cx="14" cy="11" r="3" fill="#F59E0B" />
                        <path d="M9 2v18M19 2v18" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="3 2" />
                    </svg>
                </div>
            </div>
            <div
                style={{
                    position: "absolute",
                    inset: -4,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(251,191,36,0.3), transparent 70%)",
                    filter: "blur(6px)",
                    zIndex: -1,
                }}
            />
        </div>

        {COMPLETED_CONFETTI.map((confetti) => (
            <div
                key={`${confetti.background}-${confetti.top}-${confetti.left || confetti.right}`}
                style={{
                    position: "absolute",
                    top: confetti.top,
                    left: confetti.left,
                    right: confetti.right,
                    animation: `cmFloat ${confetti.duration} ease-in-out infinite`,
                    animationDelay: confetti.delay,
                }}
            >
                <div
                    style={{
                        width: confetti.width,
                        height: confetti.height,
                        background: confetti.background,
                        borderRadius: 1,
                        transform: `rotate(${confetti.rotation})`,
                    }}
                />
            </div>
        ))}

        <div style={{ position: "absolute", top: -18, left: 0, animation: "cmSparkle 1.5s ease-in-out infinite" }}>
            <SparkleStar size={11} fill="rgba(251,191,36,0.8)" />
        </div>
        <div
            style={{
                position: "absolute",
                top: -10,
                right: -12,
                animation: "cmSparkle 2s ease-in-out infinite",
                animationDelay: "-0.7s",
            }}
        >
            <SparkleStar size={9} fill="rgba(253,224,71,0.7)" />
        </div>
    </div>
);

const CompactCheckBadge = () => (
    <div style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(145deg,#FEF3C7,#FDE68A)", border: "2.5px solid #D97706", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(217,119,6,0.3)", zIndex: 2 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M5 12l5 5L20 7" /></svg>
    </div>
);

const CapsuleMachine = ({ isCompleted = false, onEnter, compact = false }) => {
    const { t } = useTranslation();
    const rawSvgId = useId();
    const svgIdSuffix = rawSvgId.replace(/[^a-zA-Z0-9_-]/g, "");
    const svgIds = {
        redBody: `cm-${svgIdSuffix}-redBody`,
        redCap: `cm-${svgIdSuffix}-redCap`,
        knobGold: `cm-${svgIdSuffix}-knobGold`,
        domeShine: `cm-${svgIdSuffix}-domeShine`,
    };
    const isInteractive = typeof onEnter === "function";
    const voucherTitle = t("voucherDraw", sourceKey.user);
    const voucherLabel = String(t("voucher", sourceKey.user)).toUpperCase();
    const newBadgeLabel = String(t("new", sourceKey.user)).toUpperCase();
    const actionLabel = isCompleted ? t("viewVoucher", sourceKey.user) : t("getACapsule", sourceKey.user);
    const ariaLabel = isCompleted
        ? `${voucherTitle} - ${t("youWonAVoucher", sourceKey.user)}`
        : `${voucherTitle} - ${actionLabel}`;

    const handleClick = () => {
        if (isInteractive) {
            onEnter?.();
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            onEnter?.();
        }
    };
    const interactiveProps = isInteractive
        ? { onClick: handleClick, onKeyDown: handleKeyDown, role: "button", tabIndex: 0, "aria-label": ariaLabel }
        : {};

    if (compact) {
        return (
            <div
                style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)", borderRadius: 18, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", cursor: isInteractive ? "pointer" : "default", transition: "transform 0.15s ease-out" }}
                {...interactiveProps}
            >
                <style>{CAPSULE_KEYFRAMES}</style>
                <div style={{ flexShrink: 0, width: 72, height: 72, borderRadius: 16, background: isCompleted ? "linear-gradient(145deg,#f3f4f6,#e5e7eb)" : "linear-gradient(145deg,#FEE2E2,#FECACA)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", boxShadow: isCompleted ? "none" : "0 4px 14px rgba(239,68,68,0.15)" }}>
                    <div style={{ filter: isCompleted ? "saturate(0.35)" : "none", opacity: isCompleted ? 0.45 : 1, transform: "scale(0.38)", transformOrigin: "center center" }}>
                        <MachineSvg ids={svgIds} animate={!isCompleted} voucherLabel={voucherLabel} />
                    </div>
                    {isCompleted && <CompactCheckBadge />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", lineHeight: 1.25 }}>
                        {voucherTitle}
                    </div>
                    <div style={{ fontSize: 12, color: isCompleted ? "#16a34a" : "#a08060", marginTop: 3, fontWeight: isCompleted ? 600 : 400 }}>
                        {isCompleted ? t("youWonAVoucher", sourceKey.user) : t("winVouchersToUseAnywhere", sourceKey.user)}
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <div style={isCompleted
                            ? { display: "inline-block", background: "#fff", color: "#6b5740", padding: "9px 22px", borderRadius: 11, fontSize: 13, fontWeight: 700, border: "1.5px solid #e5e0d8", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }
                            : { display: "inline-block", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#fffbf0", padding: "9px 22px", borderRadius: 11, fontSize: 13, fontWeight: 800, boxShadow: "0 4px 14px rgba(245,158,11,0.3),0 0 0 2px rgba(245,158,11,0.1)" }
                        }>
                            {isCompleted ? t("viewVoucher", sourceKey.user) : `${actionLabel} →`}
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
            <style>{CAPSULE_KEYFRAMES}</style>
            <div style={{ height: 195, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 4 }}>
            <div
                className="cmMotion"
                style={{
                    width: 184,
                    height: 190,
                    position: "relative",
                    animation: isCompleted ? "none" : "cmShake 5s ease-in-out infinite",
                }}
            >
                {isCompleted ? (
                    <>
                        <div style={{ filter: "saturate(0.35)", opacity: 0.45 }}>
                            <MachineSvg ids={svgIds} animate={false} voucherLabel={voucherLabel} />
                        </div>
                        <CheckBadge />
                        <OpenedCapsule />
                    </>
                ) : (
                    <>
                        <MachineSvg ids={svgIds} animate voucherLabel={voucherLabel} />
                        {IDLE_SPARKLES.map((sparkle) => (
                            <div
                                key={`${sparkle.fill}-${sparkle.size}`}
                                style={{
                                    position: "absolute",
                                    top: sparkle.top,
                                    bottom: sparkle.bottom,
                                    left: sparkle.left,
                                    right: sparkle.right,
                                    animation: `cmSparkle ${sparkle.duration} ease-in-out infinite`,
                                    animationDelay: sparkle.delay,
                                }}
                            >
                                <SparkleStar size={sparkle.size} fill={sparkle.fill} />
                            </div>
                        ))}
                    </>
                )}
            </div>
            </div>

            <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#1a1a1a" }}>
                    {voucherTitle}
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
                        ? t("youWonAVoucher", sourceKey.user)
                        : t("winVouchersToUseAnywhere", sourceKey.user)}
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
                        ? t("viewVoucher", sourceKey.user)
                        : `${actionLabel} \u2192`}
                </div>
            </div>
        </div>
    );
};

export default CapsuleMachine;
