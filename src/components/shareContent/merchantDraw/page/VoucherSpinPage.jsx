import React, { useState, useEffect, useCallback } from "react";
import { Spin, message } from "antd";
import { useRouter } from "next/router";
import FancyCapsuleMachine from "@/components/shareContent/merchantDraw/components/FancyCapsuleMachine";
import MerchantDrawHeader from "@/components/shareContent/merchantDraw/components/MerchantDrawHeader";
import MerchantDrawBackground from "@/components/shareContent/merchantDraw/components/MerchantDrawBackground";
import { useMerchantDrawInit } from "@/components/shareContent/merchantDraw/useMerchantDrawInit";
import getVoucherDrawPublicSpin from "@/pages/api/voucherDraw/public/spin";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { replaceStringPattern } from "@/utility/common-functions";

const VoucherSpinPage = ({ token, userId, phone, platform }) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [mustStart, setMustStart] = useState(false);
    const [prize, setPrize] = useState(null);
    const [spinning, setSpinning] = useState(false);
    const [alreadySpun, setAlreadySpun] = useState(false);

    const {
        step,
        settings,
        phone: resolvedPhone,
        userId: resolvedUserId,
        entryToken,
        isVoucherEnabled,
    } = useMerchantDrawInit({ token, userId, phone, platform, resolvedStep: "spin" });

    const spinStorageKey = entryToken
        ? "voucherDraw_spun_" + entryToken
        : resolvedUserId
            ? "voucherDraw_spun_" + resolvedUserId
            : null;

    useEffect(() => {
        if (spinStorageKey && typeof window !== "undefined" && sessionStorage.getItem(spinStorageKey) === "1") {
            setAlreadySpun(true);
            return;
        }

        setAlreadySpun(false);
    }, [spinStorageKey]);

    const handleSpin = useCallback(async () => {
        if (spinning || alreadySpun || mustStart) return;
        setSpinning(true);
        try {
            const res = await getVoucherDrawPublicSpin({
                phone: resolvedPhone || "",
                token: entryToken || "",
                outletUserId: resolvedUserId || "",
            });
            const data = res?.data?.data || {};
            const ok = res?.data?.status === true;

            if (!ok) {
                message.error(res?.data?.message || t("spinFailedTryAgain", sourceKey.user));
                setSpinning(false);
                return;
            }

            const won = !!data.voucherWon;
            const h = Math.floor(Math.random() * 360);
            setPrize({
                won,
                title: data.voucherTitle || "",
                brand: won ? (settings?.businessName || "") : "",
                color: won ? `hsl(${h}, 84%, 55%)` : "#9aa1ad",
                light: won ? `hsl(${h}, 84%, 72%)` : "#c3c8d1",
            });
            setMustStart(true);
        } catch (err) {
            message.error(err.message || t("networkErrorTryAgain", sourceKey.user));
            setSpinning(false);
        }
    }, [spinning, alreadySpun, mustStart, resolvedPhone, entryToken, resolvedUserId, settings, t]);

    const handleComplete = useCallback(() => {
        if (spinStorageKey && typeof window !== "undefined") {
            sessionStorage.setItem(spinStorageKey, "1");
        }
        setAlreadySpun(true);
        setSpinning(false);
    }, [spinStorageKey]);

    const handleViewDashboard = useCallback(() => {
        router.push("/shareSection/luckyDraw/dashboard?phone=" + encodeURIComponent(resolvedPhone || ""));
    }, [router, resolvedPhone]);

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

    if (alreadySpun && !mustStart) {
        return (
            <div className="luckydraw-page-wrapper">
                <MerchantDrawBackground />
                <div style={{ position: "relative", zIndex: 1 }}>
                    <MerchantDrawHeader title={t("instantWinReward", sourceKey.user)} subtitle={settings?.businessName || ""} />
                </div>
                <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "48px 16px" }}>
                    <div style={{ background: "#fff", borderRadius: 22, boxShadow: "0 8px 32px rgba(220,38,38,0.10), 0 2px 8px rgba(0,0,0,0.06)", padding: "36px 24px", textAlign: "center" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🎫</div>
                        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1E293B", margin: "0 0 8px" }}>{t("alreadyClaimed", sourceKey.user)}</h2>
                        <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.6, maxWidth: 280, marginInline: "auto" }}>
                            {replaceStringPattern(t("alreadyClaimedDesc", sourceKey.user), { businessName: settings?.businessName || "" })}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="luckydraw-page-wrapper">
            <MerchantDrawBackground />

            <div style={{ position: "relative", zIndex: 1 }}>
                <MerchantDrawHeader
                    title={t("instantWinReward", sourceKey.user)}
                    subtitle={settings?.businessName || ""}
                    showBack={true}
                />
            </div>

            <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "20px 16px 48px" }}>
                <div style={{ textAlign: "center", padding: "4px 0 20px" }}>
                    <h1 style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.5px", margin: "0 0 6px" }}>
                        <span className="luckydraw-fire-gradient">
                            {t("tryYourLuck", sourceKey.user)}
                        </span>
                    </h1>
                    <p style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500, margin: 0 }}>
                        {t("getACapsuleAndSeeWhatsInside", sourceKey.user)}
                    </p>
                </div>

                <div style={{ background: "#fff", borderRadius: 22, boxShadow: "0 8px 32px rgba(220,38,38,0.10), 0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                    <div style={{ padding: "20px 16px 28px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#FEF3C7,#FDE68A)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 900, color: "#92400E", marginBottom: 20, letterSpacing: 0.3 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px rgba(34,197,94,0.7)", display: "inline-block" }} />
                            {t("oneDrawAvailable", sourceKey.user)}
                        </div>

                        <FancyCapsuleMachine
                            mustStart={mustStart}
                            prize={prize}
                            onSpin={handleSpin}
                            onComplete={handleComplete}
                            onViewDashboard={handleViewDashboard}
                            disabled={spinning || !isVoucherEnabled}
                            alreadySpun={alreadySpun}
                            machineLabel={t("voucher", sourceKey.user).toUpperCase()}
                            businessName={settings?.businessName || ""}
                        />
                    </div>
                </div>

                <div style={{ marginTop: 16, background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.06)", borderRadius: 14, padding: "12px 16px", fontSize: 12, color: "#6b5740", fontWeight: 500, textAlign: "center" }}>
                    {"🎁 "}{t("prizeRevealedAfterCapsuleOpens", sourceKey.user)}
                </div>
            </div>
        </div>
    );
};

export default VoucherSpinPage;
