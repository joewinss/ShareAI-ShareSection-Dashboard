import React from "react";
import { Home, Ticket, Store, User } from "lucide-react";

/**
 * BottomNavbar Component - SBANK Floating Style
 */
const BottomNavbar = ({ activeNav = "voucher", onChangeNav, voucherBadgeCount = 0 }) => {
    const navItems = [
        {
            key: "home",
            label: "Home",
            icon: Home,
        },
        {
            key: "voucher",
            label: "Voucher",
            icon: Ticket,
            badge: voucherBadgeCount > 0 ? voucherBadgeCount : null,
        },
        {
            key: "merchant",
            label: "Merchant",
            icon: Store,
        },
        {
            key: "profile",
            label: "Profile",
            icon: User,
        },
    ];

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[9999] max-w-md mx-auto">
            <div className="bg-white/90 backdrop-blur-xl border border-slate-100/90 rounded-3xl shadow-[0_16px_40px_rgba(15,23,42,0.12)] p-1.5 flex items-center justify-between">
                {navItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeNav === item.key;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => onChangeNav && onChangeNav(item.key)}
                            className={`relative flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all duration-200 ${
                                isActive
                                    ? "bg-teal-600 text-white font-bold shadow-md scale-[1.02]"
                                    : "text-slate-400 hover:text-slate-600 font-medium"
                            }`}
                        >
                            {/* Icon with optional badge */}
                            <div className="relative mb-1">
                                <IconComponent
                                    className={`w-5 h-5 transition-transform duration-200 ${
                                        isActive ? "stroke-[2.2px]" : "stroke-[1.8px]"
                                    }`}
                                />
                                {item.badge != null && (
                                    <span className={`absolute -top-1 -right-2.5 text-[10px] font-extrabold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border-2 shadow-sm ${
                                        isActive
                                            ? "bg-amber-400 text-slate-950 border-slate-900"
                                            : "bg-red-500 text-white border-white"
                                    }`}>
                                        {item.badge}
                                    </span>
                                )}
                            </div>

                            {/* Label */}
                            <span className="text-[10px] leading-none tracking-tight">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNavbar;
