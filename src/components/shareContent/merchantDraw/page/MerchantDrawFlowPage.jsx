import React, { useState, useEffect } from "react";
import { Spin } from "antd";
import { useRouter } from "next/router";
import { Store, Gift, ShieldCheck, HelpCircle, Info, Calendar, Award, CheckCircle2, ChevronRight, ChevronDown, Trophy, Zap, Sparkles } from "lucide-react";
import useIsCollapsed from "@/components/useIsCollapsed";
import MerchantDrawWheel from "../components/MerchantDrawWheel";
import GiftIcon from "../components/GiftIcon";
import CapsuleMachine from "../components/CapsuleMachine";
import EntryBurst from "../components/EntryBurst";
import MerchantDrawHeader from "../components/MerchantDrawHeader";
import MerchantDrawBackground from "../components/MerchantDrawBackground";
import FlowBottomNavbar from "../components/FlowBottomNavbar";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { MONTHLY_DRAW_STATUS, VOUCHER_DRAW_STATUS } from "@/constants/user";
import { useMerchantDrawInit } from "../useMerchantDrawInit";

const MerchantDrawFlowPage = ({ token, userId, phone, platform }) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [activeNav, setActiveNav] = useState("home");
    const [isTncOpen, setIsTncOpen] = useState(false);
    const [isFaqOpen, setIsFaqOpen] = useState(false);

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
    const hasPrizesAvailable =
        !settings?.segments ||
        settings.isRecurring === 1 ||
        settings.segments.some((s) => s.itemCount == null || s.itemCount > 0);

    const prizesList = settings?.segments && settings.segments.length > 0
        ? settings.segments.map((s, idx) => ({
            name: s.label || s.text || `Prize #${idx + 1}`,
            type: s.prizeType || "Voucher",
        }))
        : [
            { name: "RM0.05 Universal Cashback Voucher", type: "Cashback" },
            { name: "RM0.30 Universal Cashback Voucher", type: "Cashback" },
            { name: "PinDuoDuo RM0.50 Cashback Voucher", type: "Cashback" },
            { name: "Guardian RM2 off Voucher", type: "Discount" },
            { name: "Kind Kones 15% Off Promo Code Voucher", type: "Promo Code" },
            { name: "Lucky Draw Entry to win RM2,888", type: "Lucky Draw Entry" },
        ];

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
        <div className="luckydraw-page-wrapper pb-24">
            <EntryBurst />
            <MerchantDrawBackground />

            <div style={{ position: "relative", zIndex: 1 }}>
                <MerchantDrawHeader
                    title={t("luckyDraw", sourceKey.user)}
                    subtitle={settings?.businessName || ""}
                    showBack={false}
                />
            </div>

            <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "24px 16px 32px" }}>
                {activeNav === "home" ? (
                    <div className="space-y-6 animate-fade-in">
                        {/* Welcome Header */}
                        <div style={{ textAlign: "center", padding: "4px 0 12px" }}>
                            <h1 style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.5px", color: "#111827", margin: "0 0 6px" }}>
                                {t("welcomeTo", sourceKey.user)}
                                <span className="luckydraw-fire-gradient ml-1.5">
                                    {settings?.businessName || ""}
                                </span>
                            </h1>
                            <p style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, margin: 0 }}>
                                Complete missions & spin for instant rewards!
                            </p>
                        </div>

                        {/* SECTION 1: MONTHLY MEGA DRAW (Missions Card Container) */}
                        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 overflow-hidden relative">
                            {/* Mission Badge Header */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-r-full -ml-5 font-black text-sm tracking-wide shadow-sm">
                                    <Trophy className="w-4 h-4 text-amber-300" />
                                    <span>1. Monthly Mega Draw</span>
                                </div>
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
                                    Grand Prize: RM2,888
                                </span>
                            </div>

                            {/* Cute Floating Gift Icon Banner */}
                            <div
                                onClick={handleMonthlyDrawAction}
                                className="py-4 px-3 flex flex-col items-center justify-center bg-gradient-to-b from-amber-50/80 via-orange-50/40 to-yellow-50/20 rounded-2xl border border-amber-100 my-3 relative overflow-hidden cursor-pointer hover:border-amber-300 transition-all group shadow-inner"
                            >
                                <div className="transform group-hover:scale-105 transition-transform duration-300 py-1">
                                    <GiftIcon size={128} completed={hasJoinedMonthlyDraw} />
                                </div>
                                <div className="text-center mt-1">
                                    <div className="text-sm font-extrabold text-slate-900 flex items-center justify-center gap-1">
                                        <span>Monthly Grand Prize Draw</span>
                                        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                    </div>
                                    <div className="text-[11px] font-semibold text-amber-600 mt-0.5">
                                        {hasJoinedMonthlyDraw ? "✓ You have successfully joined this month's draw!" : "Tap to complete missions & earn your entry token!"}
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 font-medium mb-3 mt-2">
                                1 Mission = 1 Spin per week. Spins refresh every Monday.
                            </p>

                            {/* Missions List */}
                            <div className="space-y-2.5">
                                {/* Mission 1: Upload Purchase Proof / Join Grand Draw */}
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 text-lg shrink-0">
                                            🧾
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-slate-800 truncate">
                                                Submit spending proof for Grand Draw
                                            </h4>
                                            <p className="text-[11px] text-slate-500 truncate">
                                                {hasJoinedMonthlyDraw ? "You have entered this month's draw" : "Upload receipt to earn entry token"}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleMonthlyDrawAction}
                                        className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
                                            hasJoinedMonthlyDraw
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                        }`}
                                    >
                                        {hasJoinedMonthlyDraw ? "Joined ✓" : "Start"}
                                    </button>
                                </div>

                                {/* Mission 2: Play Merchant Lucky Wheel */}
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 text-lg shrink-0">
                                            🎡
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-slate-800 truncate">
                                                Spin the Merchant Wheel
                                            </h4>
                                            <p className="text-[11px] text-slate-500 truncate">
                                                Win instant store discounts & free gifts
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleEnterMerchant}
                                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all shrink-0"
                                    >
                                        Spin
                                    </button>
                                </div>

                                {/* Mission 3: Draw Capsule Voucher */}
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 text-lg shrink-0">
                                            🎰
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-slate-800 truncate">
                                                Pull Voucher Capsule Machine
                                            </h4>
                                            <p className="text-[11px] text-slate-500 truncate">
                                                Unlock cashback & rebate vouchers
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleEnterVoucher}
                                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all shrink-0"
                                    >
                                        Draw
                                    </button>
                                </div>

                                {/* Mission 4: View My Prizes & Wallet */}
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 text-lg shrink-0">
                                            🏆
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-slate-800 truncate">
                                                Check your active Prize Wallet
                                            </h4>
                                            <p className="text-[11px] text-slate-500 truncate">
                                                View & redeem won vouchers at store
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleViewDashboard}
                                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-sm transition-all shrink-0"
                                    >
                                        View
                                    </button>
                                </div>
                            </div>

                            {/* Full Prize List Pill Link */}
                            <div className="mt-4 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveNav("details")}
                                    className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-full border border-blue-200/80 transition-all flex items-center justify-center gap-1.5 group"
                                >
                                    <span>Click here to view full Campaign Details & Prize List</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* SECTION 2: INSTANT WIN REWARDS (Games & Flash Deals) */}
                        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                            {/* Section Badge Header */}
                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-r-full -ml-5 font-black text-sm tracking-wide shadow-sm">
                                    <Zap className="w-4 h-4 text-yellow-200 fill-yellow-200" />
                                    <span>2. Instant Win Rewards</span>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                    100% Win Rate
                                </span>
                            </div>

                            {/* Interactive Games Cards */}
                            <div style={isMobile
                                ? { display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }
                                : { display: "flex", justifyContent: "center", gap: 16, alignItems: "flex-start", marginTop: 12 }
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

                                {isVoucherEnabled && (
                                    <CapsuleMachine
                                        isCompleted={entryStatus.voucherDrawStatus === VOUCHER_DRAW_STATUS.COMPLETED}
                                        onEnter={handleEnterVoucher}
                                        compact={isMobile}
                                    />
                                )}
                            </div>

                            {/* Crazy Flash Deals / Voucher Cards Row */}
                            <div className="pt-3 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
                                    <span>🏷️ Flash Voucher Highlights</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-3 rounded-2xl border border-rose-100 flex flex-col justify-between">
                                        <div>
                                            <span className="bg-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                                                Hot Deal
                                            </span>
                                            <p className="text-xs font-bold text-slate-900 mt-1.5">
                                                RM5 Off Rebate Voucher
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                Min spend RM30
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleEnterVoucher}
                                            className="mt-2.5 w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[11px] transition-colors"
                                        >
                                            Draw Now
                                        </button>
                                    </div>

                                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-3 rounded-2xl border border-amber-100 flex flex-col justify-between">
                                        <div>
                                            <span className="bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                                                Top Prize
                                            </span>
                                            <p className="text-xs font-bold text-slate-900 mt-1.5">
                                                15% Storewide Promo
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                No min spend
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleEnterMerchant}
                                            className="mt-2.5 w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-[11px] transition-colors"
                                        >
                                            Spin Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Details Tab Content (UX based on Reference design) */
                    <div className="space-y-4 animate-fade-in">
                        {/* Campaign Hero Banner */}
                        <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-900">
                            <img
                                src="/campaign-hero.png"
                                alt="Campaign Banner"
                                className="w-full h-48 sm:h-56 object-cover"
                            />
                        </div>

                        {/* Title & Description Box */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
                            <h2 className="text-xl font-black text-slate-900 leading-snug">
                                {settings?.businessName || "Turbo Mission Hunt"} Campaign Prize List
                            </h2>
                            
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span>30 Jun 2026 – 31 Jul 2026</span>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                Hey TNG eWallet users, don't miss out on this mid-year upsized special! Unlock more rewards, complete missions, earn spins, and stand a chance to win exciting prizes up to RM2,888!
                            </p>

                            <div className="text-xs font-bold text-slate-900 pt-1">
                                Duration: <span className="font-semibold text-slate-700">1–31 July 2026</span>
                            </div>
                        </div>

                        {/* Prize List Table */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <h3 className="text-base font-bold text-slate-900 mb-3">
                                Prize List
                            </h3>
                            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                                        <tr>
                                            <th className="py-2.5 px-3 border-r border-slate-200 w-12 text-center">No.</th>
                                            <th className="py-2.5 px-3 border-r border-slate-200">Prize</th>
                                            <th className="py-2.5 px-3">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {prizesList.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-2.5 px-3 border-r border-slate-100 text-center font-medium text-slate-500">
                                                    {index + 1}
                                                </td>
                                                <td className="py-2.5 px-3 border-r border-slate-100 font-semibold text-slate-800">
                                                    {item.name}
                                                </td>
                                                <td className="py-2.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                                                    {item.type}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Terms & Conditions Accordion */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setIsTncOpen(!isTncOpen)}
                                className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-900 hover:bg-slate-50 transition-colors"
                            >
                                <span>Terms & Conditions</span>
                                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isTncOpen ? "rotate-90" : ""}`} />
                            </button>
                            {isTncOpen && (
                                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-slate-100 leading-relaxed space-y-2 bg-slate-50/50">
                                    <p>1. Campaign runs from 1 July 2026 until 31 July 2026, inclusive of both dates.</p>
                                    <p>2. Universal Cashback Vouchers & Discount Vouchers will be automatically credited to eligible wallets upon successful spin.</p>
                                    <p>3. Each registered user is entitled to a maximum of 3 spin opportunities per campaign cycle.</p>
                                    <p>4. Organizers reserve the right to modify or terminate the campaign without prior notice.</p>
                                </div>
                            )}
                        </div>

                        {/* FAQ Accordion */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setIsFaqOpen(!isFaqOpen)}
                                className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-900 hover:bg-slate-50 transition-colors"
                            >
                                <span>FAQ</span>
                                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isFaqOpen ? "rotate-90" : ""}`} />
                            </button>
                            {isFaqOpen && (
                                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-slate-100 leading-relaxed space-y-3 bg-slate-50/50">
                                    <div>
                                        <p className="font-bold text-slate-800">Q: How do I claim my prize?</p>
                                        <p className="text-slate-500 mt-0.5">A: Prizes are credited instantly to your eWallet or stored in your Voucher Wallet for outlet redemption.</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">Q: Can I transfer my vouchers to another account?</p>
                                        <p className="text-slate-500 mt-0.5">A: Vouchers are tied directly to your verified phone number and account and cannot be transferred.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Join Now Primary Action Button */}
                        <div className="pt-2 pb-4">
                            <button
                                type="button"
                                onClick={() => setActiveNav("home")}
                                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                            >
                                <span>Join Now</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Navbar Component */}
            <FlowBottomNavbar activeNav={activeNav} onChangeNav={setActiveNav} />
        </div>
    );
};

export default MerchantDrawFlowPage;


