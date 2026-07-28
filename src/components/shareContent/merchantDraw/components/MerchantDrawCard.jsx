import React, { useState } from "react";
import { BadgePercent, Gift, Sparkles, Ticket } from "lucide-react";
import { useTranslation } from "@/locales/useTranslation";
import { replaceStringPattern } from "@/utility/common-functions";
import { sourceKey } from "@/locales/config";
import { MERCHANT_DRAW_STATUS } from "@/constants/user";

const SPARKLES_CFG = [
    { top: "10%", left: "7%", size: 10, delay: 0, duration: 2.2 },
    { top: "18%", left: "88%", size: 7, delay: 0.6, duration: 1.8 },
    { top: "45%", left: "93%", size: 9, delay: 1.1, duration: 2.5 },
    { top: "65%", left: "5%", size: 6, delay: 0.3, duration: 2 },
    { top: "80%", left: "80%", size: 8, delay: 1.4, duration: 1.9 },
    { top: "88%", left: "20%", size: 6, delay: 0.8, duration: 2.3 },
    { top: "30%", left: "55%", size: 5, delay: 1.7, duration: 1.7 },
    { top: "55%", left: "65%", size: 7, delay: 0.2, duration: 2.1 },
];

const prizePillConfig = [
    { key: "giftVoucher", icon: Gift },
    { key: "prize", icon: Ticket },
    { key: "instantReward", icon: BadgePercent },
];

const styles = {
    outer: {
        width: "100%",
        maxWidth: 384,
        margin: "0 auto",
        borderRadius: 22,
        overflow: "hidden",
        cursor: "pointer",
        userSelect: "none",
        transition: "transform 0.28s cubic-bezier(0.23,1,0.32,1), box-shadow 0.28s cubic-bezier(0.23,1,0.32,1)",
    },
    body: {
        position: "relative",
        minHeight: 214,
        overflow: "hidden",
        background: "linear-gradient(145deg,#FF5252 0%,#DC2626 50%,#9F1239 100%)",
    },
    content: {
        position: "relative",
        zIndex: 2,
        padding: "24px 22px",
        display: "flex",
        flexDirection: "column",
        minHeight: 214,
    },
    headerRow: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 12,
    },
    title: {
        margin: 0,
        color: "#fff",
        fontSize: 28,
        fontWeight: 900,
        lineHeight: 1.08,
    },
    subtitle: {
        margin: "5px 0 0",
        color: "rgba(255,255,255,0.74)",
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.35,
    },
    circleButton: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    pillRow: {
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        marginBottom: 18,
    },
    pill: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 20,
        padding: "5px 10px",
    },
    pillText: {
        color: "rgba(255,255,255,0.92)",
        fontSize: 10,
        fontWeight: 800,
        lineHeight: 1,
    },
    cta: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        width: "100%",
        background: "rgba(255,255,255,0.95)",
        border: 0,
        borderRadius: 11,
        padding: "10px 18px",
        color: "#DC2626",
        fontSize: 13,
        fontWeight: 900,
        lineHeight: 1.2,
        boxShadow: "0 4px 14px rgba(0,0,0,0.16)",
        cursor: "pointer",
    },
    claimedPanel: {
        marginTop: 4,
        padding: "13px 14px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.16)",
        border: "1px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(5px)",
    },
    rewardLabel: {
        margin: "0 0 4px",
        color: "rgba(255,255,255,0.7)",
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    rewardText: {
        margin: 0,
        color: "#fff",
        fontSize: 14,
        fontWeight: 900,
        lineHeight: 1.4,
    },
    footerNote: {
        margin: "12px 0 0",
        color: "rgba(255,255,255,0.7)",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.45,
    },
};

function MerchantSparkles() {
    return (
        <>
            {SPARKLES_CFG.map((sparkle, index) => (
                <div
                    key={index}
                    style={{
                        position: "absolute",
                        top: sparkle.top,
                        left: sparkle.left,
                        width: sparkle.size,
                        height: sparkle.size,
                        pointerEvents: "none",
                        animation: `mcTwinkle ${sparkle.duration}s ease-in-out ${sparkle.delay}s infinite`,
                    }}
                >
                    <svg viewBox="0 0 20 20" width={sparkle.size} height={sparkle.size}>
                        <path
                            d="M10,0 L11.8,8.2 L20,10 L11.8,11.8 L10,20 L8.2,11.8 L0,10 L8.2,8.2 Z"
                            fill="rgba(255,255,255,0.7)"
                        />
                    </svg>
                </div>
            ))}
        </>
    );
}

function ShadowCard({ children, onClick }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onClick={onClick}
            onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && onClick) {
                    event.preventDefault();
                    onClick();
                }
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            role="button"
            tabIndex={0}
            style={{
                ...styles.outer,
                transform: hovered ? "translateY(-5px)" : "translateY(0)",
                boxShadow: hovered
                    ? "0 2px 4px rgba(0,0,0,0.08), 0 10px 24px rgba(185,28,28,0.34), 0 28px 52px rgba(185,28,28,0.24), 0 52px 84px rgba(185,28,28,0.14), inset 0 1px 0 rgba(255,255,255,0.22)"
                    : "0 1px 2px rgba(0,0,0,0.07), 0 4px 10px rgba(185,28,28,0.20), 0 14px 28px rgba(185,28,28,0.16), 0 36px 60px rgba(185,28,28,0.10), inset 0 1px 0 rgba(255,255,255,0.16)",
            }}
        >
            {children}
        </div>
    );
}

/**
 * MerchantDrawCard
 * Props: { businessName, merchantDrawStatus, reward, onEnter }
 * merchantDrawStatus: 0 = pending (can spin), 1 = completed (already spun)
 */
const MerchantDrawCard = ({ businessName, merchantDrawStatus, reward, onEnter }) => {
    const { t } = useTranslation();
    const isCompleted = merchantDrawStatus === MERCHANT_DRAW_STATUS.COMPLETED;
    const rewardText = reward
        ? replaceStringPattern(t("youWonReward", sourceKey.user), {
            reward,
            merchant: businessName,
        })
        : "";
    const handleCtaClick = (event) => {
        event.stopPropagation();
        onEnter?.();
    };

    return (
        <ShadowCard onClick={onEnter}>
                <div style={styles.body}>
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            pointerEvents: "none",
                            background: "linear-gradient(105deg,transparent 28%,rgba(255,255,255,0.13) 46%,rgba(255,255,255,0.05) 54%,transparent 70%)",
                            animation: "mcShimmerSweep 4s ease-in-out infinite",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: "-25%",
                            left: "-8%",
                            width: "50%",
                            height: "90%",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.06)",
                            pointerEvents: "none",
                        }}
                    />
                    <MerchantSparkles />

                    <div style={styles.content}>
                        <div style={styles.headerRow}>
                            <div>
                                <h2 style={styles.title}>
                                    {isCompleted
                                        ? t("prizeClaimed", sourceKey.user)
                                        : t("merchantLuckyDraw", sourceKey.user)}
                                </h2>
                                <p style={styles.subtitle}>
                                    {isCompleted
                                        ? t("shareMoreToEarnEntry", sourceKey.user)
                                        : t("spinToWin", sourceKey.user)}
                                </p>
                            </div>
                        </div>

                        {isCompleted ? (
                            <div style={styles.claimedPanel}>
                                <p style={styles.rewardLabel}>{t("prize", sourceKey.user)}</p>
                                <p style={styles.rewardText}>
                                    {rewardText || reward || t("prizeClaimed", sourceKey.user)}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div style={styles.pillRow}>
                                    {prizePillConfig.map(({ key, icon: Icon }) => (
                                        <div key={key} data-merchant-prize-pill style={styles.pill}>
                                            <Icon style={{ width: 11, height: 11, color: "rgba(255,255,255,0.9)" }} />
                                            <span style={styles.pillText}>{t(key, sourceKey.user)}</span>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={handleCtaClick} style={styles.cta}>
                                    <Sparkles style={{ width: 14, height: 14 }} />
                                    <span>{t("enterMerchantDraw", sourceKey.user)}</span>
                                </button>
                            </>
                        )}

                        {isCompleted && (
                            <p style={styles.footerNote}>{t("shareMoreToEarnEntry", sourceKey.user)}</p>
                        )}
                    </div>
                </div>
            </ShadowCard>
    );
};

export default MerchantDrawCard;
