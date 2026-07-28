import React from "react";
import { Sparkles, Gift, Trophy, ArrowRight, Zap, ChevronRight, Store, HelpCircle, Ticket, Coins } from "lucide-react";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { formatDate } from "@/utility/common-functions";
import { useRouter } from "next/router";

const HomeTab = ({
    phone,
    totalCount = 0,
    merchantCount = 0,
    totalGlobalEntryCount = 0,
    existingVoucherCount = 0,
    activeCampaign,
    globalEntryCount = 0,
    onNavigateNav,
}) => {
    const { t } = useTranslation();
    const router = useRouter();

    const handleSpinNow = () => {
        const queryStr = phone ? `?phone=${encodeURIComponent(phone)}` : "";
        router.push(`/shareSection/luckyDraw${queryStr}`);
    };

    const activeCampaignTitle =
        typeof activeCampaign?.name === "string" && activeCampaign.name.trim()
            ? activeCampaign.name.trim()
            : t("globalRewardsCampaign", sourceKey.user) || "Monthly Mega Rewards";

    return (
        <div className="space-y-4 animate-fade-in">
            {/* SBANK Style Hero Card */}
            <div className="bg-gradient-to-br from-teal-700 via-emerald-600 to-teal-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                {/* Decorative Soft Glowing Circles */}
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full border border-white/10">
                            <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
                            Live Event
                        </span>
                        <span className="text-xs text-slate-200 font-bold">
                            {existingVoucherCount} Vouchers Available
                        </span>
                    </div>

                    <h2 className="text-2xl font-black tracking-tight leading-snug mb-2">
                        Spin the wheel & win rewards.
                    </h2>
                    <p className="text-xs text-slate-200 leading-relaxed mb-5 max-w-xs font-medium">
                        Participate in merchant lucky draws and collect mega campaign reward entries.
                    </p>

                    <button
                        type="button"
                        onClick={handleSpinNow}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm py-3.5 px-6 rounded-2xl shadow-lg transition-all duration-200 active:scale-[0.98]"
                    >
                        <Zap className="w-4 h-4 fill-slate-950" />
                        Spin Wheel Now
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Simple Guide: How to Join Lucky Draw */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between mb-3.5">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Quick Guide
                        </span>
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                            <HelpCircle className="w-4 h-4 text-teal-600" />
                            How to Join Lucky Draw
                        </h3>
                    </div>
                    <span className="text-[10px] font-black text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full">
                        3 Simple Steps
                    </span>
                </div>

                <div className="space-y-3">
                    {/* Step 1 */}
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-100/80">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 border border-blue-200/60 shadow-xs">
                            1
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-extrabold text-slate-900">
                                Visit & Share Store Content
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium leading-normal mt-0.5">
                                Visit any partner store & share their social media content to unlock your lucky draw chance!
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-100/80">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center shrink-0 border border-amber-200/60 shadow-xs">
                            2
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-extrabold text-slate-900">
                                Spin the Wheel for Vouchers
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium leading-normal mt-0.5">
                                Tap "Spin Wheel Now" to win instant store discount vouchers & Monthly Mega Reward entries.
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-100/80">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-xs">
                            3
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-extrabold text-slate-900">
                                Redeem Instant Cash Rebates
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium leading-normal mt-0.5">
                                Show your active vouchers in your Voucher Wallet at the store counter to enjoy instant savings.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Mega Campaign Section (SBANK Subscription Card Style) */}
            {activeCampaign && (
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Active Campaign
                        </span>
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100/80">
                            {globalEntryCount} {globalEntryCount === 1 ? "Entry" : "Entries"}
                        </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-black text-xl shrink-0 shadow-inner">
                            🏆
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-extrabold text-slate-900 text-base leading-tight truncate">
                                {activeCampaignTitle}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5 font-medium">
                                Ends {formatDate(activeCampaign.endDate, "DD MMM YYYY")}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions List (SBANK Subscriptions / Last Actions Row Style) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Quick Shortcuts
                    </h3>
                </div>

                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => onNavigateNav && onNavigateNav("voucher")}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 transition-colors text-left group"
                    >
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                <Gift className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                                    My Voucher Wallet
                                </p>
                                <p className="text-xs text-slate-400 font-medium truncate">
                                    {existingVoucherCount} active vouchers available
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition-colors shrink-0 ml-2" />
                    </button>

                    <button
                        type="button"
                        onClick={() => onNavigateNav && onNavigateNav("merchant")}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 transition-colors text-left group"
                    >
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <Store className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                    Merchant Draw History
                                </p>
                                <p className="text-xs text-slate-400 font-medium truncate">
                                    {merchantCount} merchant prizes won
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0 ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeTab;
