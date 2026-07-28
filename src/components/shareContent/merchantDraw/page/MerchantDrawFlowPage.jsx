import React, { useState, useEffect } from "react";
import { Spin } from "antd";
import { useRouter } from "next/router";
import useIsCollapsed from "@/components/useIsCollapsed";
import MerchantDrawWheel from "../components/MerchantDrawWheel";
import GiftIcon from "../components/GiftIcon";
import CapsuleMachine from "../components/CapsuleMachine";
import EntryBurst from "../components/EntryBurst";
import MerchantDrawHeader from "../components/MerchantDrawHeader";
import MerchantDrawBackground from "../components/MerchantDrawBackground";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { MONTHLY_DRAW_STATUS, VOUCHER_DRAW_STATUS } from "@/constants/user";
import { useMerchantDrawInit } from "../useMerchantDrawInit";

const MerchantDrawFlowPage = ({ token, userId, phone, platform }) => {
    const router = useRouter();
    const { t } = useTranslation();
    const {
        step,
        settings,
        entryStatus,
        phone: resolvedPhone,
        userId: resolvedUserId,
        entryToken,
        platform: resolvedPlatform,
        isMerchantEnabled,
        isGlobalEnabled,
        isVoucherEnabled,
    } = useMerchantDrawInit({ token, userId, phone, platform, resolvedStep: "entry" });
    const isMobile = useIsCollapsed();

    const hasJoinedMonthlyDraw = entryStatus.monthlyDrawStatus === MONTHLY_DRAW_STATUS.JOINED;
    const canOpenMonthlyDraw = hasJoinedMonthlyDraw || Boolean(entryToken);

    // Hide the merchant draw wheel when all segments are depleted (stock = 0) and recurring is off.
    // If settings haven't loaded yet (null), default to showing — no premature hiding.
    const hasPrizesAvailable =
        !settings?.segments ||
        settings.isRecurring === 1 ||
        settings.segments.some((s) => s.itemCount == null || s.itemCount > 0);

    const handleEnterMerchant = () => {
        const query = {
            token: entryToken || "",
            userId: resolvedUserId || "",
            platform: resolvedPlatform || "",
        };

        if (resolvedPhone) {
            query.phone = resolvedPhone;
        }

        router.push({
            pathname: "/shareSection/luckyDraw/entry",
            query,
        });
    };

    const handleViewDashboard = () => {
        router.push({
            pathname: "/shareSection/luckyDraw/dashboard",
            query: { phone: resolvedPhone || "" },
        });
    };

    const handleEnterVoucher = () => {
        const query = {
            token: entryToken || "",
            userId: resolvedUserId || "",
            platform: resolvedPlatform || "",
        };
        if (resolvedPhone) {
            query.phone = resolvedPhone;
        }
        router.push({
            pathname: "/shareSection/luckyDraw/voucherSpin",
            query,
        });
    };

    const handleGoToUploadProof = () => {
        if (!entryToken) {
            return;
        }

        const params = new URLSearchParams({
            token: entryToken || "",
            outletUserId: resolvedUserId || "",
            phone: resolvedPhone || "",
            platform: resolvedPlatform || "",
            businessName: settings?.businessName || "",
        });
        router.push(`/shareSection/luckyDraw/uploadShareProof?${params.toString()}`);
    };

    const handleMonthlyDrawAction = () => {
        if (hasJoinedMonthlyDraw) {
            handleViewDashboard();
            return;
        }

        handleGoToUploadProof();
    };

    const handleMonthlyDrawKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleMonthlyDrawAction();
        }
    };

    const handleDashboardKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleViewDashboard();
        }
    };

    const monthlyDrawInteractiveProps = canOpenMonthlyDraw
        ? {
            onClick: handleMonthlyDrawAction,
            onKeyDown: handleMonthlyDrawKeyDown,
            role: "button",
            tabIndex: 0,
            "aria-label": hasJoinedMonthlyDraw
                ? `${t("monthlyDraw", sourceKey.user)} - ${t("viewEntries", sourceKey.user)}`
                : `${t("monthlyDraw", sourceKey.user)} - ${t("joinDraw", sourceKey.user)}`,
        }
        : {};

    if (step === "loading") {
        return (
            <div className="luckydraw-screen-center">
                <Spin size="large" />
            </div>
        );
    }

    if (step === "invalid") {
        return (
            <div className="luckydraw-state-screen">
                <div className="text-5xl mb-4">🔗</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{t("invalidEntryLink", sourceKey.user)}</h2>
                <p className="text-sm text-gray-500 max-w-xs">
                    {t("invalidEntryLinkDesc", sourceKey.user)}
                </p>
            </div>
        );
    }

    if (step === "unavailable") {
        return (
            <div className="luckydraw-state-screen">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{t("luckyDrawNotAvailable", sourceKey.user)}</h2>
                <p className="text-sm text-gray-500 max-w-xs">
                    {t("luckyDrawNotAvailableDesc", sourceKey.user)}
                </p>
            </div>
        );
    }

    return (
        <div className="luckydraw-page-wrapper">
            <EntryBurst />
            <MerchantDrawBackground />

            <div style={{ position: "relative", zIndex: 1 }}>
                <MerchantDrawHeader
                    title={t("luckyDraw", sourceKey.user)}
                    subtitle={settings?.businessName || ""}
                    showBack={false}
                />
            </div>

            <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "24px 16px 48px" }}>
                <div style={{ textAlign: "center", padding: "4px 0 28px" }}>
                    <h1 style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.5px", color: "#111827", margin: "0 0 8px" }}>
                        {t("welcomeTo", sourceKey.user)}
                        <span className="luckydraw-fire-gradient">
                            {settings?.businessName || ""}
                        </span>
                    </h1>
                    <p style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500, margin: 0 }}>
                        {t("pickAGameAndTryYourLuck", sourceKey.user)}
                    </p>
                </div>

                <div style={isMobile
                    ? { display: "flex", flexDirection: "column", gap: 14, marginTop: 20, padding: "0 0" }
                    : { display: "flex", justifyContent: "center", gap: 16, alignItems: "flex-start", marginTop: 20 }
                }>
                    {isMerchantEnabled && hasPrizesAvailable && (
                        <MerchantDrawWheel
                            merchantDrawStatus={entryStatus.merchantDrawStatus}
                            reward={entryStatus.reward}
                            businessName={settings?.businessName || ""}
                            onEnter={handleEnterMerchant}
                            compact={isMobile}
                        />
                    )}

                    {isGlobalEnabled && !isMobile && (
                        <div
                            style={{ cursor: canOpenMonthlyDraw ? "pointer" : "default", textAlign: "center", width: 200 }}
                            {...monthlyDrawInteractiveProps}
                        >
                            <div style={{ width: 195, height: 195, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 20 }}>
                                <GiftIcon
                                    size={172}
                                    completed={hasJoinedMonthlyDraw}
                                />
                            </div>
                            <div style={{ marginTop: 20 }}>
                                <div style={{ fontSize: 17, fontWeight: 800, color: "#1a1a1a" }}>
                                    {t("monthlyDraw", sourceKey.user)}
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        marginTop: 3,
                                        color: hasJoinedMonthlyDraw ? "#16a34a" : "#a08060",
                                        fontWeight: hasJoinedMonthlyDraw ? 600 : 400,
                                    }}
                                >
                                    {hasJoinedMonthlyDraw
                                        ? t("joinedDraw", sourceKey.user)
                                        : t("grandPrizeDraw", sourceKey.user)}
                                </div>
                            </div>
                            <div style={{ marginTop: 16 }}>
                                {hasJoinedMonthlyDraw ? (
                                    <div style={{ display: "inline-block", background: "#fff", color: "#6b5740", padding: "12px 28px", borderRadius: 13, fontSize: 14, fontWeight: 700, border: "1.5px solid #e5e0d8", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                                        {t("viewEntries", sourceKey.user)}
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            style={{
                                                display: "inline-block",
                                                background: "linear-gradient(135deg,#D97706,#B45309)",
                                                color: "#fff",
                                                padding: "12px 28px",
                                                borderRadius: 13,
                                                fontSize: 14,
                                                fontWeight: 800,
                                                boxShadow: canOpenMonthlyDraw ? "0 4px 16px rgba(180,83,9,0.3),0 0 0 3px rgba(180,83,9,0.12)" : "none",
                                                opacity: canOpenMonthlyDraw ? 1 : 0.55,
                                                cursor: canOpenMonthlyDraw ? "pointer" : "not-allowed",
                                            }}
                                        >
                                            {t("joinDraw", sourceKey.user)} →
                                        </div>
                                        {!canOpenMonthlyDraw && (
                                            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, marginTop: 8, lineHeight: 1.35 }}>
                                                {t("joinGlobalLuckyDrawNoToken", sourceKey.user)}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {isGlobalEnabled && isMobile && (
                        <div
                            style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)", borderRadius: 18, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", cursor: canOpenMonthlyDraw ? "pointer" : "default", transition: "transform 0.15s ease-out" }}
                            {...monthlyDrawInteractiveProps}
                        >
                            <div style={{ flexShrink: 0, width: 72, height: 72, borderRadius: 16, background: hasJoinedMonthlyDraw ? "linear-gradient(145deg,#f3f4f6,#e5e7eb)" : "linear-gradient(145deg,#FEF3C7,#FDE68A)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", boxShadow: hasJoinedMonthlyDraw ? "none" : "0 4px 14px rgba(217,119,6,0.2)" }}>
                                <div style={{ filter: hasJoinedMonthlyDraw ? "saturate(0.35)" : "none", opacity: hasJoinedMonthlyDraw ? 0.45 : 1 }}>
                                    <GiftIcon size={48} completed={hasJoinedMonthlyDraw} />
                                </div>
                                {hasJoinedMonthlyDraw && (
                                    <div style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(145deg,#FEF3C7,#FDE68A)", border: "2.5px solid #D97706", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(217,119,6,0.3)", zIndex: 2 }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", lineHeight: 1.25 }}>
                                    {t("monthlyDraw", sourceKey.user)}
                                </div>
                                <div style={{ fontSize: 12, color: hasJoinedMonthlyDraw ? "#16a34a" : "#a08060", marginTop: 3, fontWeight: hasJoinedMonthlyDraw ? 600 : 400 }}>
                                    {hasJoinedMonthlyDraw ? t("joinedDraw", sourceKey.user) : t("grandPrizeDraw", sourceKey.user)}
                                </div>
                                <div style={{ marginTop: 10 }}>
                                    {hasJoinedMonthlyDraw ? (
                                        <div style={{ display: "inline-block", background: "#fff", color: "#6b5740", padding: "9px 22px", borderRadius: 11, fontSize: 13, fontWeight: 700, border: "1.5px solid #e5e0d8", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                                            {t("viewEntries", sourceKey.user)}
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: "inline-block",
                                            background: "linear-gradient(135deg,#D97706,#B45309)",
                                            color: "#fffbf0",
                                            padding: "9px 22px",
                                            borderRadius: 11,
                                            fontSize: 13,
                                            fontWeight: 800,
                                            boxShadow: canOpenMonthlyDraw ? "0 4px 14px rgba(180,83,9,0.25),0 0 0 2px rgba(180,83,9,0.08)" : "none",
                                            opacity: canOpenMonthlyDraw ? 1 : 0.55,
                                            cursor: canOpenMonthlyDraw ? "pointer" : "not-allowed",
                                        }}>
                                            {t("joinDraw", sourceKey.user)} →
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {isVoucherEnabled && (
                        <CapsuleMachine
                            isCompleted={entryStatus.voucherDrawStatus === VOUCHER_DRAW_STATUS.COMPLETED}
                            onEnter={handleEnterVoucher}
                            compact={isMobile}
                        />
                    )}
                </div>

                <div style={{ marginTop: 40, textAlign: "center" }}>
                    <div
                        onClick={handleViewDashboard}
                        onKeyDown={handleDashboardKeyDown}
                        role="button"
                        tabIndex={0}
                        aria-label={t("myPrizes", sourceKey.user)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.08)", padding: "12px 24px", borderRadius: 14, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", fontSize: 14, color: "#6b5740", fontWeight: 600 }}
                    >
                        🏆 {t("myPrizes", sourceKey.user)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MerchantDrawFlowPage;
