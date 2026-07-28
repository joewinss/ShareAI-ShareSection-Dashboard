import React from "react";
import { Ticket, Trophy, HelpCircle, FileText, ChevronRight, Phone, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/locales/useTranslation";

const ProfileTab = ({
    phone,
    totalCount = 0,
    merchantCount = 0,
    totalGlobalEntryCount = 0,
    existingVoucherCount = 0,
    onNavigateNav,
}) => {
    const { t } = useTranslation();

    const initial = phone ? phone.slice(-2) : "AI";

    const menuSections = [
        {
            title: "My Activity",
            items: [
                {
                    icon: Ticket,
                    iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
                    label: "My Vouchers",
                    subLabel: `${existingVoucherCount} ${existingVoucherCount === 1 ? "voucher available" : "vouchers available"}`,
                    onClick: () => onNavigateNav && onNavigateNav("voucher"),
                },
                {
                    icon: Trophy,
                    iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
                    label: "Merchant Draw History",
                    subLabel: `${merchantCount} ${merchantCount === 1 ? "draw completed" : "draws completed"}`,
                    onClick: () => onNavigateNav && onNavigateNav("merchant"),
                },
            ],
        },
        {
            title: "Support & Legal",
            items: [
                {
                    icon: HelpCircle,
                    iconBg: "bg-teal-50 text-teal-600 border border-teal-100",
                    label: "Customer Support",
                    subLabel: "Get help with your prizes & vouchers",
                    onClick: () => {
                        window.open("https://wa.me/60133699834", "_blank");
                    },
                },
                {
                    icon: FileText,
                    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
                    label: "Terms & Conditions",
                    subLabel: "Lucky Draw & Campaign rules",
                    onClick: () => {},
                },
            ],
        },
    ];

    return (
        <div className="space-y-4 animate-fade-in">
            {/* User Profile Card (SBANK Style) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-sm shrink-0">
                        <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-slate-900 font-extrabold text-lg">
                            {initial}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-extrabold text-slate-900 truncate">
                                {phone ? phone : "User Portal"}
                            </h2>
                            <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" /> VIP
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {phone || "Connected account"}
                        </p>
                    </div>
                </div>

                {/* Metrics Summary Row */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                    <div className="bg-slate-50/80 rounded-2xl p-2">
                        <p className="text-xs font-extrabold text-slate-900">{totalCount}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">Total</p>
                    </div>
                    <div className="bg-slate-50/80 rounded-2xl p-2">
                        <p className="text-xs font-extrabold text-slate-900">{merchantCount}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">Merchant</p>
                    </div>
                    <div className="bg-slate-50/80 rounded-2xl p-2">
                        <p className="text-xs font-extrabold text-slate-900">{totalGlobalEntryCount}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">Global</p>
                    </div>
                    <div className="bg-slate-50/80 rounded-2xl p-2">
                        <p className="text-xs font-extrabold text-slate-900">{existingVoucherCount}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">Vouchers</p>
                    </div>
                </div>
            </div>

            {/* Menu Options Grouped Cards */}
            {menuSections.map((section, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        {section.title}
                    </h3>
                    <div className="space-y-1.5">
                        {section.items.map((item, itemIdx) => {
                            const ItemIcon = item.icon;
                            return (
                                <button
                                    key={itemIdx}
                                    type="button"
                                    onClick={item.onClick}
                                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors text-left group"
                                >
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                                            <ItemIcon className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-extrabold text-slate-900 group-hover:text-teal-600 transition-colors truncate">
                                                {item.label}
                                            </p>
                                            {item.subLabel && (
                                                <p className="text-xs text-slate-400 font-medium truncate">
                                                    {item.subLabel}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors shrink-0 ml-2" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* App Footer */}
            <div className="text-center py-2 text-xs text-slate-400 font-medium">
                <p>Share AI Rewards • v1.0</p>
            </div>
        </div>
    );
};

export default ProfileTab;
