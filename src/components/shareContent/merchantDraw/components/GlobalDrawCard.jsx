import React, { useEffect, useState } from "react";
import {
    CalendarDays,
    Ticket,
    Trophy,
    Upload,
} from "lucide-react";
import { useRouter } from "next/router";
import getGlobalCampaign from "@/pages/api/merchantDraw/public/globalCampaign";
import getGlobalEntryCount from "@/pages/api/merchantDraw/public/globalEntryCount";

import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { MONTHLY_DRAW_STATUS } from "@/constants/user";
import { formatDate, replaceStringPattern } from "@/utility/common-functions";

const FLOAT_ORBS_CFG = [
    { left: "8%", size: 90, delay: 0, duration: 5.5, opacity: 0.14 },
    { left: "72%", size: 65, delay: 1.2, duration: 4.8, opacity: 0.11 },
    { left: "38%", size: 110, delay: 2.1, duration: 6.2, opacity: 0.09 },
    { left: "58%", size: 50, delay: 0.7, duration: 4.2, opacity: 0.16 },
    { left: "22%", size: 60, delay: 1.8, duration: 5, opacity: 0.12 },
];

const styles = {
    card: {
        width: "100%",
        maxWidth: 384,
        minHeight: 246,
        margin: "0 auto",
        borderRadius: 22,
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(145deg,#FBBF24 0%,#F59E0B 50%,#92400E 100%)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.07), 0 4px 10px rgba(146,64,14,0.20), 0 14px 28px rgba(146,64,14,0.16), 0 36px 60px rgba(146,64,14,0.10), inset 0 1px 0 rgba(255,255,255,0.16)",
        color: "#fff",
        userSelect: "none",
    },
    disabledCard: {
        background: "linear-gradient(145deg,#E5E7EB 0%,#CBD5E1 54%,#64748B 100%)",
        boxShadow: "0 10px 28px rgba(15,23,42,0.12)",
        opacity: 0.78,
    },
    content: {
        position: "relative",
        zIndex: 2,
        minHeight: 246,
        padding: "24px 22px",
        display: "flex",
        flexDirection: "column",
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
        lineHeight: 1.4,
    },
    circleButton: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    prizePanel: {
        background: "rgba(0,0,0,0.14)",
        borderRadius: 13,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 14,
        border: "1px solid rgba(255,255,255,0.14)",
    },
    prizeIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        background: "rgba(255,255,255,0.14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    prizeLabel: {
        margin: "0 0 2px",
        color: "rgba(255,255,255,0.66)",
        fontSize: 9,
        fontWeight: 900,
        letterSpacing: 1,
        lineHeight: 1,
        textTransform: "uppercase",
    },
    prizeTitle: {
        margin: "0 0 2px",
        color: "#fff",
        fontSize: 14,
        fontWeight: 900,
        lineHeight: 1.25,
    },
    prizeValue: {
        margin: 0,
        color: "#FDE68A",
        fontSize: 13,
        fontWeight: 900,
        lineHeight: 1.2,
    },
    dateRow: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: "rgba(255,255,255,0.76)",
        fontSize: 11,
        fontWeight: 800,
        marginBottom: 14,
    },
    actionRow: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginTop: "auto",
        flexWrap: "wrap",
    },
    ctaWrapper: {
        position: "relative",
        width: "100%",
    },
    ctaPulseRing: {
        position: "absolute",
        inset: -4,
        borderRadius: 15,
        border: "2px solid rgba(251,191,36,0.65)",
        animation: "gcBtnPulseRing 2s ease-out infinite",
        pointerEvents: "none",
    },
    cta: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        width: "100%",
        padding: "10px 18px",
        border: 0,
        borderRadius: 11,
        background: "rgba(255,255,255,0.95)",
        color: "#92400E",
        fontSize: 13,
        fontWeight: 900,
        lineHeight: 1.2,
        boxShadow: "0 4px 14px rgba(0,0,0,0.16)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.12s, box-shadow 0.12s",
    },
    ctaDisabled: {
        opacity: 0.52,
        cursor: "not-allowed",
    },
    ctaShimmer: {
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "55%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(146,64,14,0.07), transparent)",
        animation: "gcBtnShimmer 2.2s ease-in-out 0.8s infinite",
        pointerEvents: "none",
    },
    ctaArrow: {
        display: "inline-block",
        animation: "gcBtnArrow 1.1s ease-in-out infinite",
    },
    dashboardButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        minHeight: 42,
        border: 0,
        borderRadius: 11,
        padding: "10px 18px",
        color: "#92400E",
        background: "rgba(255,255,255,0.92)",
        fontSize: 13,
        fontWeight: 900,
        lineHeight: 1.2,
        boxShadow: "0 4px 14px rgba(0,0,0,0.16)",
        cursor: "pointer",
    },
    entryBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        borderRadius: 999,
        background: "rgba(255,255,255,0.16)",
        border: "1px solid rgba(255,255,255,0.24)",
        padding: "8px 11px",
        color: "#fff",
        fontSize: 12,
        fontWeight: 900,
    },
    notice: {
        margin: "8px 0 0",
        color: "rgba(255,255,255,0.78)",
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1.4,
    },
    skeletonLine: {
        height: 12,
        borderRadius: 999,
        background: "rgba(255,255,255,0.24)",
        overflow: "hidden",
        position: "relative",
    },
};

function GoldDecor() {
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    top: "-20%",
                    right: "-5%",
                    width: 180,
                    height: 180,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.11)",
                    animation: "gcGlowPulse 3.5s ease-in-out infinite",
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "-25%",
                    left: "-5%",
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.07)",
                    animation: "gcGlowPulse 4.2s ease-in-out 1.1s infinite",
                    pointerEvents: "none",
                }}
            />
            {FLOAT_ORBS_CFG.map((orb, index) => (
                <div
                    key={index}
                    style={{
                        position: "absolute",
                        bottom: "-8%",
                        left: orb.left,
                        width: orb.size,
                        height: orb.size,
                        borderRadius: "50%",
                        background: `rgba(255,255,255,${orb.opacity})`,
                        animation: `gcFloatUp ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
                        pointerEvents: "none",
                    }}
                />
            ))}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg,rgba(255,255,255,0.08) 0%,transparent 55%)",
                    pointerEvents: "none",
                }}
            />
        </>
    );
}

function SkeletonLine({ width }) {
    return (
        <div style={{ ...styles.skeletonLine, width }}>
            <span
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "40%",
                    background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.34),transparent)",
                    animation: "gcSkeleton 1.4s ease-in-out infinite",
                }}
            />
        </div>
    );
}

function GlobalDrawFrame({ children, muted = false, onClick, onKeyDown, role, tabIndex }) {
    return (
        <div
            onClick={onClick}
            onKeyDown={onKeyDown}
            role={role}
            tabIndex={tabIndex}
            style={{
                ...styles.card,
                ...(muted ? styles.disabledCard : null),
                ...(onClick ? { cursor: "pointer" } : null),
            }}
        >
            <GoldDecor />
            <div style={styles.content}>{children}</div>
        </div>
    );
}

/**
 * GlobalDrawCard
 */
const GlobalDrawCard = ({
    phone,
    outletUserId,
    token,
    platform,
    businessName,
    initialGlobalDrawStatus = 0,
    onMerchantDraw,
    onJoinedGlobal,
    onViewDashboard,
}) => {
    const router = useRouter();
    const [cardState, setCardState] = useState("loading");
    const [campaign, setCampaign] = useState(null);
    const [entryCount, setEntryCount] = useState(0);
    const { t } = useTranslation();

    // Accepted for parent compatibility. Current join flow navigates to upload proof.
    void onMerchantDraw;
    void onJoinedGlobal;

    useEffect(() => {
        const load = async () => {
            setCardState("loading");
            try {
                const campaignRes = await getGlobalCampaign(1, 0, {});
                const activeCampaign = campaignRes?.data;

                if (!activeCampaign?._id) {
                    setCardState("noCampaign");
                    return;
                }

                setCampaign(activeCampaign);

                if (initialGlobalDrawStatus === MONTHLY_DRAW_STATUS.JOINED) {
                    if (phone && activeCampaign._id) {
                        const countRes = await getGlobalEntryCount(1, 0, {
                            phone,
                            campaignId: activeCampaign._id,
                        });
                        setEntryCount(countRes?.data?.entryCount ?? 0);
                    }
                    setCardState("joined");
                } else {
                    setCardState("canJoin");
                }
            } catch {
                setCardState("noCampaign");
            }
        };

        load();
    }, [initialGlobalDrawStatus, phone]);

    const handleGoToUploadProof = () => {
        if (!token) {
            return;
        }

        const params = new URLSearchParams({
            token: token || "",
            outletUserId: outletUserId || "",
            phone: phone || "",
            platform: platform || "",
            businessName: businessName || "",
        });
        router.push(`/shareSection/luckyDraw/uploadShareProof?${params.toString()}`);
    };

    const handleCardAction = () => {
        if (cardState === "joined") {
            onViewDashboard?.();
            return;
        }

        if (cardState === "canJoin" && token) {
            handleGoToUploadProof();
        }
    };

    const handleCardKeyDown = (event) => {
        if (event.currentTarget !== event.target) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        handleCardAction();
    };

    const handleButtonClick = (event) => {
        event.stopPropagation();
        handleCardAction();
    };

    const isCardActionable = cardState === "joined" || (cardState === "canJoin" && Boolean(token));
    const campaignTitle =
        typeof campaign?.name === "string" && campaign.name.trim()
            ? campaign.name.trim()
            : t("globalRewardsCampaign", sourceKey.user);
    const campaignPrize = campaign?.prize || t("prize", sourceKey.user);
    const drawDate = formatDate(campaign?.endDate, "DD MMM YYYY");

    return (
        <>
            {cardState === "loading" && (
                <GlobalDrawFrame>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <SkeletonLine width="78%" />
                        <SkeletonLine width="52%" />
                        <div style={{ ...styles.prizePanel, marginTop: 4 }}>
                            <SkeletonLine width={44} />
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                                <SkeletonLine width="90%" />
                                <SkeletonLine width="58%" />
                            </div>
                        </div>
                        <SkeletonLine width="44%" />
                    </div>
                </GlobalDrawFrame>
            )}

            {cardState === "noCampaign" && (
                <GlobalDrawFrame muted>
                    <div style={styles.headerRow}>
                        <div>
                            <h2 style={styles.title}>{t("globalLuckyDraw", sourceKey.user)}</h2>
                            <p style={styles.subtitle}>{t("noActiveCampaign", sourceKey.user)}</p>
                        </div>
                    </div>
                    <div style={styles.prizePanel}>
                        <div style={styles.prizeIcon}>
                            <Ticket style={{ width: 22, height: 22, color: "#fff" }} />
                        </div>
                        <div>
                            <p style={styles.prizeLabel}>{t("prize", sourceKey.user)}</p>
                            <p style={styles.prizeTitle}>{t("noActiveCampaign", sourceKey.user)}</p>
                        </div>
                    </div>
                </GlobalDrawFrame>
            )}

            {(cardState === "canJoin" || cardState === "joined") && (
                <GlobalDrawFrame
                    onClick={isCardActionable ? handleCardAction : undefined}
                    onKeyDown={isCardActionable ? handleCardKeyDown : undefined}
                    role={isCardActionable ? "button" : undefined}
                    tabIndex={isCardActionable ? 0 : undefined}
                >
                    <div style={styles.headerRow}>
                        <div>
                            <h2 style={styles.title}>{campaignTitle}</h2>
                            <p style={styles.subtitle}>{t("joinGlobalLuckyDrawDesc", sourceKey.user)}</p>
                        </div>
                    </div>

                    <div style={styles.prizePanel}>
                        <div style={styles.prizeIcon}>
                            <Trophy style={{ width: 24, height: 24, color: "#FDE68A" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={styles.prizeLabel}>{t("prize", sourceKey.user)}</p>
                            <p style={styles.prizeTitle}>{campaignTitle}</p>
                            <p style={styles.prizeValue}>{campaignPrize}</p>
                        </div>
                    </div>

                    {drawDate && (
                        <div style={styles.dateRow}>
                            <CalendarDays style={{ width: 13, height: 13 }} />
                            <span>{t("campaignEndsOn", sourceKey.user)} {drawDate}</span>
                        </div>
                    )}

                    {cardState === "joined" && (
                        <div style={{ marginBottom: 14 }}>
                            <div style={styles.entryBadge}>
                                <Ticket style={{ width: 14, height: 14 }} />
                                <span>
                                    {entryCount} {entryCount === 1 ? t("entry", sourceKey.user) : t("entries", sourceKey.user)}
                                </span>
                            </div>
                            <p style={styles.notice}>
                                {replaceStringPattern(t("entryCountDesc", sourceKey.user), { count: entryCount })}
                            </p>
                        </div>
                    )}

                    <div style={styles.actionRow}>
                        {cardState === "joined" ? (
                            <button type="button" style={styles.dashboardButton} onClick={handleButtonClick}>
                                <span>{t("viewDashboard", sourceKey.user)}</span>
                            </button>
                        ) : (
                            <>
                                <div style={styles.ctaWrapper}>
                                    <div style={styles.ctaPulseRing} />
                                    <button
                                        type="button"
                                        style={{
                                            ...styles.cta,
                                            ...(!token ? styles.ctaDisabled : null),
                                        }}
                                        onClick={handleButtonClick}
                                        disabled={!token}
                                    >
                                        <span style={styles.ctaShimmer} />
                                        <Upload style={{ width: 14, height: 14 }} />
                                        <span>{t("joinGlobalLuckyDraw", sourceKey.user)}</span>
                                        <span style={styles.ctaArrow}>→</span>
                                    </button>
                                </div>
                                {!token && (
                                    <p style={styles.notice}>{t("joinGlobalLuckyDrawNoToken", sourceKey.user)}</p>
                                )}
                            </>
                        )}
                    </div>
                </GlobalDrawFrame>
            )}
        </>
    );
};

export default GlobalDrawCard;
