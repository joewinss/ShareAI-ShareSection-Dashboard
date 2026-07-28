import React from "react";
import { Bell, Sparkles, User as UserIcon } from "lucide-react";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";

const DashboardHeader = ({
    phone,
    totalCount = 0,
    merchantCount = 0,
    totalGlobalEntryCount = 0,
    existingVoucherCount = 0,
    loading = false,
}) => {
    const { t } = useTranslation();

    // Get initials or display label from phone
    const formattedPhone = phone ? phone : "Guest";
    const initial = phone ? phone.slice(-2) : "AI";

    return (
        <div className="pt-6 pb-2 px-5 max-w-md mx-auto">
            {/* Top Navigation Row (SBANK Style Header) */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-sm tracking-tight">
                        SAI
                    </span>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                        Share AI
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label="Notifications"
                        className="w-9 h-9 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <Bell className="w-4 h-4" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-sm">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-slate-900 font-extrabold text-xs">
                            {initial}
                        </div>
                    </div>
                </div>
            </div>

            {/* Title & Tag */}
            <div className="mb-5">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-100/80 mb-2">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>{phone ? phone : "Member Portal"}</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    {t("myLuckyDrawPrizes", sourceKey.user) || "My Rewards & Prizes"}
                </h1>
            </div>

            {/* Floating Stats / Balance Overview Card (SBANK Style) */}
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {t("existingVouchers", sourceKey.user) || "Active Vouchers"}
                        </p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            {loading ? "—" : `${existingVoucherCount}`} <span className="text-sm font-semibold text-slate-400">vouchers</span>
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg shadow-inner">
                        🎡
                    </div>
                </div>

                {/* 3-Column Metrics Row */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50/80 rounded-2xl p-2.5">
                        <p className="text-xs font-medium text-slate-400">Total Draws</p>
                        <p className="text-base font-extrabold text-slate-900 mt-0.5">{loading ? "—" : totalCount}</p>
                    </div>
                    <div className="bg-slate-50/80 rounded-2xl p-2.5">
                        <p className="text-xs font-medium text-slate-400">Merchant</p>
                        <p className="text-base font-extrabold text-slate-900 mt-0.5">{loading ? "—" : merchantCount}</p>
                    </div>
                    <div className="bg-slate-50/80 rounded-2xl p-2.5">
                        <p className="text-xs font-medium text-slate-400">Global</p>
                        <p className="text-base font-extrabold text-slate-900 mt-0.5">{loading ? "—" : totalGlobalEntryCount}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
