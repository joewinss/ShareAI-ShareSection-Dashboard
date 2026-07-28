import React from "react";
import { Home, FileText } from "lucide-react";

/**
 * FlowBottomNavbar Component - SBANK Floating Style for LuckyDraw Flow Page
 */
const FlowBottomNavbar = ({ activeNav = "home", onChangeNav }) => {
    const navItems = [
        {
            key: "home",
            label: "Home",
            icon: Home,
        },
        {
            key: "details",
            label: "Details",
            icon: FileText,
        },
    ];

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[9999] max-w-xs mx-auto">
            <div className="bg-white/90 backdrop-blur-xl border border-slate-100/90 rounded-3xl shadow-[0_16px_40px_rgba(15,23,42,0.12)] p-1.5 flex items-center justify-between gap-1">
                {navItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeNav === item.key;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => onChangeNav && onChangeNav(item.key)}
                            className={`relative flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-200 ${
                                isActive
                                    ? "bg-teal-600 text-white font-bold shadow-md scale-[1.02]"
                                    : "text-slate-400 hover:text-slate-600 font-medium"
                            }`}
                        >
                            <div className="relative mb-1">
                                <IconComponent
                                    className={`w-5 h-5 transition-transform duration-200 ${
                                        isActive ? "stroke-[2.2px]" : "stroke-[1.8px]"
                                    }`}
                                />
                            </div>

                            <span className="text-[11px] leading-none tracking-tight">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default FlowBottomNavbar;
