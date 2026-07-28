import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { replace } from "lodash";
import { replaceStringPattern } from "@/utility/common-functions";

const PARTICLES = ["🌟", "⭐", "✨", "🎊", "🎉", "💫"];

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * PrizeAnimation
 * Full-screen celebration overlay shown after a successful spin.
 *
 * Props:
 *   reward          – Prize label won
 *   color           – Segment colour (hex)
 *   businessName    – Outlet name
 *   onDashboard     – Navigate to dashboard callback (legacy alias)
 *   onViewDashboard – Navigate to dashboard callback
 *   onGlobalDraw    – Navigate to global draw card callback
 *   onClose         – Dismiss callback
 *   hasJoinedGlobal – If true, hide "Join Global Lucky Draw" button
 */
const PrizeAnimation = ({ reward, color, businessName, onDashboard, onViewDashboard, onGlobalDraw, onClose, hasJoinedGlobal }) => {
    const toDashboard = onViewDashboard || onDashboard;
    const particles = Array.from({ length: 16 }, (_, i) => ({
        id: i,
        icon: PARTICLES[i % PARTICLES.length],
        left: `${randomBetween(5, 95)}%`,
        top: `${randomBetween(5, 90)}%`,
        delay: randomBetween(0, 0.8),
    }));
    const { t } = useTranslation();
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Floating particles */}
                {particles.map((p) => (
                    <motion.span
                        key={p.id}
                        className="absolute text-2xl pointer-events-none select-none"
                        style={{ left: p.left, top: p.top }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.2, 1, 0.5] }}
                        transition={{ duration: 2, delay: p.delay, repeat: Infinity, repeatDelay: randomBetween(1, 3) }}
                    >
                        {p.icon}
                    </motion.span>
                ))}

                {/* Prize card */}
                <motion.div
                    className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 mx-4 flex flex-col items-center text-center max-w-sm w-full"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                >
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg leading-none"
                        >
                            <CloseOutlined />
                        </button>
                    )}
                    <div className="text-5xl mb-3">🎉</div>
                    <p className="text-gray-500 text-sm mb-1">{t("congratulations", sourceKey.user)}</p>
                    <p className="text-gray-700 text-sm mb-4">
                        {replaceStringPattern(t("youWonFrom", sourceKey.user), { merchant: businessName })}
                    </p>

                    {/* Prize name with colour accent */}
                    <div
                        className="rounded-2xl px-6 py-4 mb-6 w-full"
                        style={{ backgroundColor: color || "#3b82f6" }}
                    >
                        <p className="text-white font-bold text-xl leading-tight break-words">
                            {reward}
                        </p>
                    </div>

                    <p className="text-xs text-gray-400 mb-5">
                        {t("showToMerchantClaim", sourceKey.user)}
                    </p>

                    <div className="flex flex-col gap-2 w-full">
                        {!hasJoinedGlobal && onGlobalDraw && (
                            <Button
                                type="primary"
                                className="w-full rounded-xl border-0 font-semibold h-8 md:h-11"
                                style={{ backgroundColor: "#AB73FC" }}
                                onClick={onGlobalDraw}
                            >
                                {t("joinGlobalLuckyDraw", sourceKey.user)}
                            </Button>
                        )}
                        {/* <Button
                            type={hasJoinedGlobal ? "primary" : "default"}
                            className={`w-full rounded-xl font-semibold h-8 md:h-11 ${hasJoinedGlobal ? "border-0" : ""}`}
                            style={hasJoinedGlobal ? { backgroundColor: "#AB73FC" } : { backgroundColor: "#f5f5f5", color: "#000", borderColor: "#e5e7eb" }}
                            onClick={toDashboard}
                        >
                            {t("viewDashboard", sourceKey.user)}
                        </Button> */}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PrizeAnimation;
