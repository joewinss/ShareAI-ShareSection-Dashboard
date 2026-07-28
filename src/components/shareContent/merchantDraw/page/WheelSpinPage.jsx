import React, { useEffect, useState } from "react";
import { message } from "antd";
import getMerchantDrawPublicSpin from "@/pages/api/merchantDraw/public/spin";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { replaceStringPattern } from "@/utility/common-functions";
import FancyWheel from "../components/FancyWheel";
import MerchantDrawHeader from "../components/MerchantDrawHeader";
import useIsCollapsed from "@/components/useIsCollapsed";


function WheelBackground() {
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, left: -60, width: 260, height: 260, borderRadius: "50%", filter: "blur(65px)", background: "rgba(220,38,38,0.12)" }} />
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 300, height: 300, borderRadius: "50%", filter: "blur(65px)", background: "rgba(251,191,36,0.13)" }} />
            <div style={{ position: "absolute", top: "42%", left: "58%", transform: "translate(-50%,-50%)", width: 200, height: 200, borderRadius: "50%", filter: "blur(65px)", background: "rgba(249,115,22,0.07)" }} />
            <div className="luckydraw-inset-overlay" style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.10) 1.2px, transparent 1.2px)", backgroundSize: "20px 20px" }} />
            <div className="luckydraw-inset-overlay" style={{ backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 28px, rgba(220,38,38,0.025) 28px, rgba(220,38,38,0.025) 29px)" }} />
            <svg style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400 }} viewBox="0 0 400 400" fill="none">
                <circle cx="400" cy="0" r="110" stroke="rgba(220,38,38,0.12)" strokeWidth="1.5" />
                <circle cx="400" cy="0" r="185" stroke="rgba(220,38,38,0.07)" strokeWidth="1" />
                <circle cx="400" cy="0" r="260" stroke="rgba(251,191,36,0.05)" strokeWidth="1" />
            </svg>
            <svg style={{ position: "absolute", bottom: -80, left: -80, width: 360, height: 360 }} viewBox="0 0 360 360" fill="none">
                <circle cx="0" cy="360" r="100" stroke="rgba(251,191,36,0.13)" strokeWidth="1.5" />
                <circle cx="0" cy="360" r="170" stroke="rgba(251,191,36,0.07)" strokeWidth="1" />
                <circle cx="0" cy="360" r="245" stroke="rgba(249,115,22,0.04)" strokeWidth="1" />
            </svg>
            <div style={{ position: "absolute", top: "3%", right: "-6%", width: 140, height: 140, borderRadius: "50%", background: "rgba(220,38,38,0.07)", animation: "ldOrbPulse 4.5s ease-in-out infinite" }} />
            <div style={{ position: "absolute", top: "36%", left: "-5%", width: 120, height: 120, borderRadius: "50%", background: "rgba(249,115,22,0.06)", animation: "ldOrbPulse 5.5s ease-in-out 0.8s infinite" }} />
            <div style={{ position: "absolute", bottom: "8%", right: "-4%", width: 150, height: 150, borderRadius: "50%", background: "rgba(251,191,36,0.08)", animation: "ldOrbPulse 4s ease-in-out 0.3s infinite" }} />
            {[
                { left: "9%", top: "12%", delay: 0, dur: 3.8, color: "rgba(220,38,38,0.38)", size: 11 },
                { left: "91%", top: "6%", delay: 0.8, dur: 4.4, color: "rgba(251,191,36,0.42)", size: 9 },
                { left: "4%", top: "28%", delay: 1.2, dur: 5, color: "rgba(249,115,22,0.32)", size: 8 },
                { left: "94%", top: "20%", delay: 0.4, dur: 3.5, color: "rgba(220,38,38,0.28)", size: 8 },
                { left: "8%", top: "76%", delay: 0.9, dur: 4.6, color: "rgba(251,191,36,0.38)", size: 10 },
                { left: "93%", top: "68%", delay: 1.5, dur: 3.9, color: "rgba(220,38,38,0.32)", size: 7 },
            ].map((s, i) => (
                <div key={`wps${i}`} style={{ position: "absolute", top: s.top, left: s.left, animation: `ldFloat ${s.dur}s ease-in-out ${s.delay}s infinite` }}>
                    <svg viewBox="0 0 20 20" width={s.size} height={s.size}><path d="M10,0 L11.8,8.2 L20,10 L11.8,11.8 L10,20 L8.2,11.8 L0,10 L8.2,8.2 Z" fill={s.color} /></svg>
                </div>
            ))}
            {[
                { left: "20%", top: "15%", delay: 0.5, dur: 5.2, color: "rgba(220,38,38,0.32)", size: 12 },
                { left: "86%", top: "33%", delay: 1.8, dur: 4.1, color: "rgba(251,191,36,0.38)", size: 10 },
                { left: "16%", top: "40%", delay: 0.2, dur: 4.8, color: "rgba(249,115,22,0.28)", size: 11 },
                { left: "22%", top: "75%", delay: 1, dur: 5.5, color: "rgba(251,191,36,0.30)", size: 9 },
            ].map((c, i) => (
                <div key={`wpc${i}`} style={{ position: "absolute", top: c.top, left: c.left, animation: `ldFloat ${c.dur}s ease-in-out ${c.delay}s infinite` }}>
                    <svg viewBox="0 0 14 14" width={c.size} height={c.size}><circle cx="7" cy="7" r="5.5" fill="none" stroke={c.color} strokeWidth="1.5" /></svg>
                </div>
            ))}
            {[
                { left: "95%", top: "46%", delay: 0.6, dur: 4.3, color: "rgba(251,191,36,0.33)", size: 10 },
                { left: "5%", top: "53%", delay: 1.1, dur: 3.7, color: "rgba(220,38,38,0.28)", size: 8 },
                { left: "83%", top: "86%", delay: 0.4, dur: 5.1, color: "rgba(249,115,22,0.30)", size: 9 },
            ].map((d, i) => (
                <div key={`wpd${i}`} style={{ position: "absolute", top: d.top, left: d.left, animation: `ldFloat ${d.dur}s ease-in-out ${d.delay}s infinite` }}>
                    <svg viewBox="0 0 16 16" width={d.size} height={d.size}><rect x="3" y="3" width="10" height="10" rx="1" transform="rotate(45 8 8)" fill={d.color} /></svg>
                </div>
            ))}
        </div>
    );
}

const WheelSpinPage = ({
    outletUserId,
    token,
    segments = [],
    businessName,
    onPrize,
    showAlreadyClaimed = true,
    initialAlreadySpun = false,
}) => {
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeIndex, setPrizeIndex] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [alreadySpun, setAlreadySpun] = useState(initialAlreadySpun);
    const [pendingPrize, setPendingPrize] = useState(null);
    const { t } = useTranslation();
    const isCollapsed = useIsCollapsed();
    const w = isCollapsed ? window.innerWidth : null;
    const wheelSize =
        w >= 390 ? 316
      : w >= 375 ? 301
      : w >= 360 ? 286
      : w ? 246
      : 320;

    const validSegments = segments.filter((s) => s.label);
    const spinStorageKey = token
        ? "luckyDraw_spun_" + token
        : outletUserId
            ? "luckyDraw_spun_" + outletUserId
            : null;

    useEffect(() => {
        if (initialAlreadySpun) {
            setAlreadySpun(true);
            return;
        }

        if (spinStorageKey && sessionStorage.getItem(spinStorageKey) === "1") {
            setAlreadySpun(true);
            return;
        }

        setAlreadySpun(false);
    }, [spinStorageKey, initialAlreadySpun]);

    const handleSpin = async () => {
        if (spinning || mustSpin || alreadySpun || validSegments.length === 0) return;
        setSpinning(true);
        try {
            const res = await getMerchantDrawPublicSpin({ outletUserId, token });
            const data = res?.data?.data || {};
            const ok = res?.data?.status === true;

            if (!ok) {
                message.error(res?.data?.message || t("spinFailedTryAgain", sourceKey.user));
                setSpinning(false);
                return;
            }

            const { reward, color, prizeType } = data;
            const matchIdx = validSegments.findIndex((s) => s.label === reward);
            const spinToIdx = matchIdx >= 0 ? matchIdx : 0;
            setPrizeIndex(validSegments.length === 1 ? 0 : spinToIdx);
            setPendingPrize({ reward, color: validSegments[matchIdx >= 0 ? matchIdx : 0]?.color || color, prizeType: prizeType ?? 1 });
            setMustSpin(true);
        } catch (err) {
            message.error(err.message || t("networkErrorTryAgain", sourceKey.user));
            setSpinning(false);
        }
    };

    const handleStopSpin = () => {
        setMustSpin(false);
        setSpinning(false);
        if (spinStorageKey) {
            sessionStorage.setItem(spinStorageKey, "1");
        }
        setAlreadySpun(true);
        if (pendingPrize) {
            onPrize(pendingPrize.reward, pendingPrize.color, pendingPrize.prizeType);
        }
    };

    if (showAlreadyClaimed && alreadySpun && !mustSpin) {
        return (
            <div className="luckydraw-page-wrapper">
                <WheelBackground />
                <div style={{ position: "relative", zIndex: 1 }}>
                    <MerchantDrawHeader title={t("luckyDraw", sourceKey.user)} subtitle={businessName} />
                </div>
                <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "48px 16px" }}>
                    <div style={{ background: "#fff", borderRadius: 22, boxShadow: "0 8px 32px rgba(220,38,38,0.10), 0 2px 8px rgba(0,0,0,0.06)", padding: "36px 24px", textAlign: "center" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🎫</div>
                        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1E293B", margin: "0 0 8px" }}>{t("alreadyClaimed", sourceKey.user)}</h2>
                        <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.6, maxWidth: 280, marginInline: "auto" }}>
                            {replaceStringPattern(t("alreadyClaimedDesc", sourceKey.user), { businessName })}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="luckydraw-page-wrapper">
            <WheelBackground />

            <div style={{ position: "relative", zIndex: 1 }}>
                <MerchantDrawHeader title={t("luckyDraw", sourceKey.user)} subtitle={businessName} showBack={true} />
            </div>

            <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "20px 16px 48px" }}>
                {/* Hero */}
                <div style={{ textAlign: "center", padding: "4px 0 20px" }}>
                    <h1 style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.5px", color: "#111827", margin: "0 0 6px" }}>
                        {t("spinToWinTitle", sourceKey.user)}
                        <span className="luckydraw-fire-gradient">
                            {businessName || ""}
                        </span>
                    </h1>
                    <p style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500, margin: 0 }}>
                        {t("luckyDrawReadySpinDesc", sourceKey.user)}
                    </p>
                </div>

                {/* Wheel card */}
                <div style={{ background: "#fff", borderRadius: 22, boxShadow: "0 8px 32px rgba(220,38,38,0.10), 0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                    <div style={{ padding: "20px 16px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        {/* Spin available badge */}
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#FEF3C7,#FDE68A)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 900, color: "#92400E", marginBottom: 20, letterSpacing: 0.3 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px rgba(34,197,94,0.7)", display: "inline-block", animation: "ldBadgePulse 1.4s ease-in-out infinite" }} />
                            {t("oneSpinAvailable", sourceKey.user)}
                        </div>

                        <FancyWheel
                            segments={validSegments}
                            mustStartSpinning={mustSpin}
                            prizeNumber={prizeIndex}
                            onStopSpinning={handleStopSpin}
                            onSpinClick={handleSpin}
                            spinning={spinning}
                            disabled={alreadySpun}
                            size={wheelSize}
                        />
                    </div>
                </div>

                {/* Prize note */}
                <div className="luckydraw-info-box">
                    {"🎁 "}{t("prizeRevealAfterWheelStops", sourceKey.user)}
                </div>
            </div>
        </div>
    );
};

export default WheelSpinPage;
