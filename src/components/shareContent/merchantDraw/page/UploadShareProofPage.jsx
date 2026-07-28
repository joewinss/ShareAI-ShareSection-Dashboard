import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import { Form, message } from "antd";
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Gift,
    Monitor,
    X,
} from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { formatDate } from "@/utility/common-functions";
import ImageInput from "@/components/general/input/ImageInput";
import joinGlobal from "@/pages/api/merchantDraw/public/joinGlobal";
import getGlobalCampaign from "@/pages/api/merchantDraw/public/globalCampaign";
import { PLATFORM_NAME } from "@/constant/template";
import publicImages from "@/pages/api/upload/publicImages";
import { ShareAiBigIcon } from "../../../../../public/assets";
import client from "../../../../../env";
import { getPlatformIcon } from "@/utility/ImagesFunction";
import GiftIcon from "../components/GiftIcon";
import useIsCollapsed from "@/components/useIsCollapsed";

const PLATFORM_OPTIONS = Object.values(PLATFORM_NAME).map((name) => ({
    title: name,
    value: name,
}));

// API origin (scheme + host) used to warm the connection before upload.
const API_ORIGIN = (() => {
    try {
        return new URL(client.uri.apiLink).origin;
    } catch {
        return "";
    }
})();

function UploadBackground() {
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, left: -60, width: 260, height: 260, borderRadius: "50%", filter: "blur(65px)", background: "rgba(245,158,11,0.14)" }} />
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 300, height: 300, borderRadius: "50%", filter: "blur(65px)", background: "rgba(217,119,6,0.16)" }} />
            <div style={{ position: "absolute", top: "42%", left: "58%", transform: "translate(-50%,-50%)", width: 200, height: 200, borderRadius: "50%", filter: "blur(65px)", background: "rgba(251,191,36,0.09)" }} />
            <div className="luckydraw-inset-overlay" style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.08) 1.2px, transparent 1.2px)", backgroundSize: "20px 20px" }} />
            <div className="luckydraw-inset-overlay" style={{ backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 28px, rgba(245,158,11,0.025) 28px, rgba(245,158,11,0.025) 29px)" }} />
            <svg style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400 }} viewBox="0 0 400 400" fill="none">
                <circle cx="400" cy="0" r="110" stroke="rgba(245,158,11,0.14)" strokeWidth="1.5" />
                <circle cx="400" cy="0" r="185" stroke="rgba(245,158,11,0.08)" strokeWidth="1" />
                <circle cx="400" cy="0" r="260" stroke="rgba(251,191,36,0.06)" strokeWidth="1" />
            </svg>
            <svg style={{ position: "absolute", bottom: -80, left: -80, width: 360, height: 360 }} viewBox="0 0 360 360" fill="none">
                <circle cx="0" cy="360" r="100" stroke="rgba(251,191,36,0.15)" strokeWidth="1.5" />
                <circle cx="0" cy="360" r="170" stroke="rgba(245,158,11,0.08)" strokeWidth="1" />
                <circle cx="0" cy="360" r="245" stroke="rgba(217,119,6,0.05)" strokeWidth="1" />
            </svg>
            <div style={{ position: "absolute", top: "3%", right: "-6%", width: 140, height: 140, borderRadius: "50%", background: "rgba(245,158,11,0.08)", animation: "ldOrbPulse 4.5s ease-in-out infinite" }} />
            <div style={{ position: "absolute", top: "36%", left: "-5%", width: 120, height: 120, borderRadius: "50%", background: "rgba(217,119,6,0.07)", animation: "ldOrbPulse 5.5s ease-in-out 0.8s infinite" }} />
            <div style={{ position: "absolute", bottom: "8%", right: "-4%", width: 150, height: 150, borderRadius: "50%", background: "rgba(251,191,36,0.09)", animation: "ldOrbPulse 4s ease-in-out 0.3s infinite" }} />
            {[
                { left: "9%", top: "12%", delay: 0, dur: 3.8, color: "rgba(245,158,11,0.40)", size: 11 },
                { left: "91%", top: "6%", delay: 0.8, dur: 4.4, color: "rgba(251,191,36,0.44)", size: 9 },
                { left: "4%", top: "28%", delay: 1.2, dur: 5, color: "rgba(217,119,6,0.32)", size: 8 },
                { left: "94%", top: "20%", delay: 0.4, dur: 3.5, color: "rgba(245,158,11,0.30)", size: 8 },
                { left: "8%", top: "76%", delay: 0.9, dur: 4.6, color: "rgba(251,191,36,0.38)", size: 10 },
                { left: "93%", top: "68%", delay: 1.5, dur: 3.9, color: "rgba(245,158,11,0.32)", size: 7 },
            ].map((s, i) => (
                <div key={`ups${i}`} style={{ position: "absolute", top: s.top, left: s.left, animation: `ldFloat ${s.dur}s ease-in-out ${s.delay}s infinite` }}>
                    <svg viewBox="0 0 20 20" width={s.size} height={s.size}><path d="M10,0 L11.8,8.2 L20,10 L11.8,11.8 L10,20 L8.2,11.8 L0,10 L8.2,8.2 Z" fill={s.color} /></svg>
                </div>
            ))}
            {[
                { left: "20%", top: "15%", delay: 0.5, dur: 5.2, color: "rgba(245,158,11,0.32)", size: 12 },
                { left: "86%", top: "33%", delay: 1.8, dur: 4.1, color: "rgba(251,191,36,0.38)", size: 10 },
                { left: "16%", top: "40%", delay: 0.2, dur: 4.8, color: "rgba(217,119,6,0.28)", size: 11 },
                { left: "22%", top: "75%", delay: 1, dur: 5.5, color: "rgba(251,191,36,0.30)", size: 9 },
            ].map((c, i) => (
                <div key={`upc${i}`} style={{ position: "absolute", top: c.top, left: c.left, animation: `ldFloat ${c.dur}s ease-in-out ${c.delay}s infinite` }}>
                    <svg viewBox="0 0 14 14" width={c.size} height={c.size}><circle cx="7" cy="7" r="5.5" fill="none" stroke={c.color} strokeWidth="1.5" /></svg>
                </div>
            ))}
            {[
                { left: "95%", top: "46%", delay: 0.6, dur: 4.3, color: "rgba(251,191,36,0.33)", size: 10 },
                { left: "5%", top: "53%", delay: 1.1, dur: 3.7, color: "rgba(245,158,11,0.28)", size: 8 },
                { left: "83%", top: "86%", delay: 0.4, dur: 5.1, color: "rgba(217,119,6,0.30)", size: 9 },
            ].map((d, i) => (
                <div key={`upd${i}`} style={{ position: "absolute", top: d.top, left: d.left, animation: `ldFloat ${d.dur}s ease-in-out ${d.delay}s infinite` }}>
                    <svg viewBox="0 0 16 16" width={d.size} height={d.size}><rect x="3" y="3" width="10" height="10" rx="1" transform="rotate(45 8 8)" fill={d.color} /></svg>
                </div>
            ))}
        </div>
    );
}


const styles = {
    page: {
        minHeight: "100vh",
        background: "#f8f7f5",
        display: "flex",
        flexDirection: "column",
        position: "relative",
    },
    header: {
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderBottom: "1px solid rgba(226,232,240,0.7)",
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(8px)",
        position: "relative",
        zIndex: 10,
    },
    backButton: {
        background: "#F1F5F9",
        border: "none",
        borderRadius: 9,
        padding: "7px 11px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 5,
        color: "#475569",
        fontSize: 11,
        fontWeight: 800,
    },
    headerTitle: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: "#1E293B",
        fontSize: 12,
        fontWeight: 900,
    },
    main: {
        flex: 1,
        width: "100%",
        maxWidth: 680,
        margin: "0 auto",
        padding: "20px 16px 30px",
        position: "relative",
        zIndex: 1,
    },
    infoBox: {
        marginBottom: 16,
        borderRadius: 12,
        background: "rgba(255,251,235,0.92)",
        border: "1px solid #FDE68A",
        padding: "12px 14px",
        backdropFilter: "blur(4px)",
    },
    infoText: {
        margin: 0,
        fontSize: 12,
        fontWeight: 700,
        color: "#92400E",
        lineHeight: 1.7,
    },
    prizeBanner: {
        marginBottom: 16,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 4px 14px rgba(217,119,6,0.18)",
        padding: "13px 16px",
        display: "flex",
        gap: 12,
        alignItems: "center",
        color: "#fff",
    },
    prizeIcon: {
        width: 46,
        height: 46,
        borderRadius: 14,
        background: "rgba(255,255,255,0.16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    overline: {
        margin: "0 0 2px",
        color: "rgba(255,255,255,0.7)",
        fontSize: 9,
        fontWeight: 900,
        letterSpacing: 1,
        lineHeight: 1,
        textTransform: "uppercase",
    },
    prizeTitle: {
        margin: "0 0 2px",
        color: "#fff",
        fontSize: 15,
        fontWeight: 900,
        lineHeight: 1.25,
    },
    prizeValue: {
        margin: 0,
        color: "#FDE68A",
        fontSize: 13,
        fontWeight: 900,
    },
    card: {
        marginBottom: 16,
        borderRadius: 14,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(6px)",
        border: "1px solid rgba(226,232,240,0.8)",
        padding: "14px 14px 16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    },
    sectionHeader: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    stepNumber: {
        width: 23,
        height: 23,
        borderRadius: "50%",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 900,
        flexShrink: 0,
    },
    sectionTitle: {
        margin: 0,
        color: "#1E293B",
        fontSize: 16,
        fontWeight: 900,
    },
    sectionDesc: {
        margin: "0 0 12px 31px",
        fontSize: 14,
        color: "#64748B",
        fontWeight: 700,
        lineHeight: 1.6,
    },
    platformGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 7,
    },
    platformButton: {
        padding: "10px 6px",
        borderRadius: 10,
        border: "2px solid #E2E8F0",
        background: "#fff",
        color: "#475569",
        fontSize: 13,
        fontWeight: 800,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        transition: "all 0.2s ease",
    },
    platformActive: {
        borderColor: "#F59E0B",
        background: "#FFFBEB",
        color: "#92400E",
        boxShadow: "0 4px 12px rgba(245,158,11,0.18)",
    },
    statusPanel: {
        marginTop: 10,
        borderRadius: 13,
        padding: "13px 14px",
        display: "flex",
        alignItems: "center",
        gap: 11,
        textAlign: "left",
    },
    verifyingPanel: {
        border: "1px solid #FDE68A",
        background: "#FFFBEB",
        color: "#92400E",
        justifyContent: "center",
        textAlign: "center",
        flexDirection: "column",
        gap: 8,
    },
    verifiedPanel: {
        border: "1px solid #BBF7D0",
        background: "#F0FDF4",
    },
    noteBox: {
        borderRadius: 12,
        background: "rgba(255,251,235,0.92)",
        border: "1px solid #FDE68A",
        color: "#92400E",
        padding: "11px 13px",
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1.6,
        backdropFilter: "blur(4px)",
    },
    submitButton: {
        width: "100%",
        minHeight: 44,
        border: "none",
        borderRadius: 12,
        background: "linear-gradient(135deg,#F59E0B,#D97706)",
        color: "#fff",
        fontSize: 16,
        fontWeight: 900,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 18,
        boxShadow: "0 4px 14px rgba(217,119,6,0.28)",
    },
    disabledButton: {
        cursor: "not-allowed",
        opacity: 0.68,
    },
    successPanel: {
        marginTop: 20,
        borderRadius: 18,
        background: "rgba(255,251,235,0.95)",
        border: "1px solid #FDE68A",
        padding: "30px 18px",
        textAlign: "center",
        backdropFilter: "blur(6px)",
    },
    successIcon: {
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#FBBF24,#F59E0B)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 13px",
        boxShadow: "0 0 20px rgba(251,191,36,0.4)",
    },
    successTitle: {
        margin: "0 0 6px",
        color: "#D97706",
        fontSize: 20,
        fontWeight: 900,
    },
    successText: {
        margin: "0 0 18px",
        color: "#B45309",
        fontSize: 14,
        fontWeight: 700,
        lineHeight: 1.7,
    },
    heroOuter: {
        position: "relative",
    },
    consiStrip: { marginTop: 8, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(90deg, #f0f4f8, #e8eef4)", border: "1px solid #dce6f0", borderRadius: 24, padding: "4px 14px" },
    heroSection: {
        position: "relative",
    },
    heroLeft: {
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingRight: 10,
    },
    heroGiftWrap: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    heroGiftGlow: {
        position: "absolute",
        bottom: -2,
        left: "50%",
        transform: "translateX(-50%)",
        width: 68,
        height: 20,
        borderRadius: "50%",
        background: "rgba(245,158,11,0.45)",
        filter: "blur(9px)",
        pointerEvents: "none",
        animation: "ldGlowBeat 3s ease-in-out infinite",
    },
    heroSparkCluster: {
        position: "relative",
        height: 16,
        width: "100%",
        marginTop: 2,
    },
    heroRight: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 6,
    },
    heroZone1: {
        background: "rgba(255,251,235,0.7)",
        border: "1px solid rgba(253,230,138,0.7)",
        borderRadius: 10,
        padding: "8px 10px",
    },
    heroZone2: {
        background: "#FFFBEB",
        border: "1px solid #FDE68A",
        borderRadius: 10,
        padding: "8px 10px",
    },
    heroZone3: {
        background: "rgba(255,251,235,0.5)",
        border: "1px solid rgba(253,230,138,0.5)",
        borderRadius: 10,
        padding: "8px 10px",
        display: "flex",
        alignItems: "flex-start",
        gap: 5,
    },
    heroPrizeRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    mobileHeroTopZone: {
        padding: "14px 12px 11px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        borderBottom: "1px solid rgba(253,230,138,0.6)",
    },
    mobileHeroBottomZone: {
        padding: "10px 12px 10px",
        display: "flex",
        flexDirection: "column",
    },
    mobileHeroTitle: {
        fontSize: 13,
        fontWeight: 900,
        color: "#D97706",
        margin: "0",
        lineHeight: 1.2,
    },
    mobileHeroPrizeName: {
        fontSize: 22,
        fontWeight: 900,
        color: "#1E293B",
        lineHeight: 1.1,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        display: "block",
    },
    mobileHeroDateRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px dashed rgba(253,230,138,0.8)",
        borderBottom: "1px dashed rgba(253,230,138,0.8)",
        padding: "5px 0",
    },
    mobileHeroReminder: {
        display: "flex",
        alignItems: "flex-start",
        gap: 5,
        paddingTop: 7,
        marginTop: 7,
        borderTop: "1px solid rgba(253,230,138,0.5)",
    },
    remindersSection: {
        marginBottom: 16,
        borderRadius: 14,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(6px)",
        border: "1px solid rgba(245,158,11,0.3)",
        padding: "14px 14px 16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    },
    remindersHeader: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        paddingBottom: 10,
        borderBottom: "1px solid rgba(245,158,11,0.2)",
    },
    remindersHeaderIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    remindersGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
    },
    reminderItem: {
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        background: "rgba(255,251,235,0.7)",
        border: "1px solid rgba(253,230,138,0.5)",
        borderRadius: 10,
        padding: 10,
    },
    reminderIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        background: "rgba(245,158,11,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    reminderText: {
        fontSize: 13,
        color: "#78350F",
        fontWeight: 700,
        lineHeight: 1.55,
        margin: 0,
    },
};

const SPARKLES = [
    { size: 9, color: "rgba(251,191,36,0.9)", anim: "ldSp1 3.6s ease-in-out infinite", ml: -24, bottom: 0 },
    { size: 6, color: "rgba(245,158,11,0.7)", anim: "ldSp2 4.1s ease-in-out 0.5s infinite", ml: -9, bottom: 3 },
    { size: 8, color: "rgba(251,191,36,0.85)", anim: "ldSp3 3.9s ease-in-out 1s infinite", ml: 7, bottom: 0 },
    { size: 5, color: "rgba(217,119,6,0.65)", anim: "ldSp4 4.4s ease-in-out 0.3s infinite", ml: 18, bottom: 3 },
    { size: 7, color: "rgba(245,158,11,0.5)", anim: "ldSp5 3.7s ease-in-out 0.8s infinite", ml: -38, bottom: 1 },
];

const HERO_SPARKS = [
    { top: "-7px", left: "10%", delay: 0, dur: 3.6, color: "rgba(245,158,11,0.9)", size: 10 },
    { top: "-5px", right: "15%", delay: 0.8, dur: 4.2, color: "rgba(251,191,36,0.85)", size: 8 },
    { top: "40%", left: "-7px", delay: 1.2, dur: 5.0, color: "rgba(217,119,6,0.8)", size: 8 },
    { top: "30%", right: "-6px", delay: 0.4, dur: 3.8, color: "rgba(245,158,11,0.75)", size: 7 },
    { bottom: "-6px", left: "20%", delay: 1.0, dur: 4.5, color: "rgba(251,191,36,0.8)", size: 9 },
    { bottom: "-5px", right: "18%", delay: 0.6, dur: 3.9, color: "rgba(245,158,11,0.7)", size: 7 },
    { top: "65%", left: "-5px", delay: 1.5, dur: 4.8, color: "rgba(251,191,36,0.65)", size: 6 },
    { top: "60%", right: "-5px", delay: 0.9, dur: 4.1, color: "rgba(217,119,6,0.7)", size: 8 },
];

function GameRuleHero({ campaignTitle, campaignPrize, campaignDate, t, isCollapsed }) {
    return (
        <div style={styles.heroOuter} className="up-hero-outer">
            {HERO_SPARKS.map((s, i) => (
                <span
                    key={`hs${i}`}
                    style={{
                        position: "absolute",
                        top: s.top,
                        bottom: s.bottom,
                        left: s.left,
                        right: s.right,
                        animation: `ldFloat ${s.dur}s ease-in-out ${s.delay}s infinite`,
                        zIndex: 10,
                        pointerEvents: "none",
                    }}
                >
                    <svg width={s.size} height={s.size} viewBox="0 0 20 20">
                        <path d="M10,0L11.8,8.2L20,10L11.8,11.8L10,20L8.2,11.8L0,10L8.2,8.2Z" fill={s.color} />
                    </svg>
                </span>
            ))}

            <div style={styles.heroSection} className="up-hero-section up-hero-inner">
                <div style={{
                    position: "absolute",
                    top: -18,
                    left: "30%",
                    width: 170,
                    height: 90,
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse, rgba(245,158,11,0.18) 0%, transparent 65%)",
                    filter: "blur(20px)",
                    pointerEvents: "none",
                    animation: "ldOrbPulse 4s ease-in-out infinite",
                }} />

                {isCollapsed ? (
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={styles.mobileHeroTopZone}>
                            <div style={styles.heroGiftWrap}>
                                <div style={styles.heroGiftGlow} />
                                <GiftIcon size={52} />

                                <div style={styles.heroSparkCluster}>
                                    {SPARKLES.map((s, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                display: "inline-block",
                                                position: "absolute",
                                                bottom: s.bottom,
                                                left: "50%",
                                                marginLeft: s.ml,
                                                animation: s.anim,
                                            }}
                                        >
                                            <svg width={s.size} height={s.size} viewBox="0 0 20 20">
                                                <path d="M10,0L11.8,8.2L20,10L11.8,11.8L10,20L8.2,11.8L0,10L8.2,8.2Z" fill={s.color} />
                                            </svg>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <p style={styles.mobileHeroTitle}>
                                {t("uploadProofHeroTitle", sourceKey.user)}
                            </p>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(254,243,199,0.8)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 5, padding: "2px 7px" }}>
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="#D97706">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                                <span style={{ fontSize: 11, color: "#92400E", fontWeight: 800 }}>{campaignTitle}</span>
                            </div>
                        </div>

                        <div style={styles.mobileHeroBottomZone}>
                            <div style={{ width: "100%", marginBottom: 6 }}>
                                <span style={{ fontSize: 8, fontWeight: 900, color: "#D97706", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 2 }}>
                                    {t("grandPrize", sourceKey.user)}
                                </span>
                                <span style={styles.mobileHeroPrizeName}>
                                    {campaignPrize}
                                </span>
                            </div>

                            <div style={styles.mobileHeroDateRow}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "rgba(148,163,184,0.9)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    {t("closeDate", sourceKey.user)}
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 900, color: "#D97706", display: "block", textAlign: "right" }}>
                                    {campaignDate}
                                </span>
                            </div>

                            <div style={styles.mobileHeroReminder}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}>
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span style={{ fontSize: 9, color: "rgba(120,53,15,0.65)", fontWeight: 600, lineHeight: 1.45 }}>
                                    {t("uploadProofVisibilityReminder", sourceKey.user)}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "flex", position: "relative", zIndex: 1, alignItems: "stretch" }}>
                        <div style={styles.heroLeft}>
                            <div style={styles.heroGiftWrap}>
                                <div style={styles.heroGiftGlow} />
                                <GiftIcon size={68} />

                                <div style={styles.heroSparkCluster}>
                                    {SPARKLES.map((s, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                display: "inline-block",
                                                position: "absolute",
                                                bottom: s.bottom,
                                                left: "50%",
                                                marginLeft: s.ml,
                                                animation: s.anim,
                                            }}
                                        >
                                            <svg width={s.size} height={s.size} viewBox="0 0 20 20">
                                                <path d="M10,0L11.8,8.2L20,10L11.8,11.8L10,20L8.2,11.8L0,10L8.2,8.2Z" fill={s.color} />
                                            </svg>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={styles.heroRight}>
                            <div style={styles.heroZone1}>
                                <p style={{ fontSize: 16, fontWeight: 900, color: "#D97706", margin: "0 0 2px", lineHeight: 1.2 }}>
                                    {t("uploadProofHeroTitle", sourceKey.user)}
                                </p>
                                <p style={{ fontSize: 12, color: "rgba(180,83,9,0.65)", fontWeight: 600, margin: "0 0 5px", lineHeight: 1.5 }}>
                                    {t("uploadProofHeroSubtitleLine1", sourceKey.user)}
                                </p>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(254,243,199,0.8)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 5, padding: "2px 7px" }}>
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="#D97706">
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                    </svg>
                                    <span style={{ fontSize: 11, color: "#92400E", fontWeight: 800 }}>{campaignTitle}</span>
                                </div>
                            </div>

                            <div style={styles.heroZone2}>
                                <div style={styles.heroPrizeRow}>
                                    <div>
                                        <span style={{ fontSize: 11, fontWeight: 900, color: "#D97706", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 1 }}>
                                            {t("grandPrize", sourceKey.user)}
                                        </span>
                                        <span style={{ fontSize: 18, fontWeight: 900, color: "#1E293B", lineHeight: 1 }}>
                                            {campaignPrize}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span style={{ fontSize: 11, color: "rgba(148,163,184,0.8)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 1 }}>
                                            {t("closeDate", sourceKey.user)}
                                        </span>
                                        <span style={{ fontSize: 13, fontWeight: 900, color: "#D97706", display: "block" }}>
                                            {campaignDate}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.heroZone3}>
                                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#F59E0B", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <span style={{ fontSize: 12, color: "rgba(120,53,15,0.75)", fontWeight: 600, lineHeight: 1.5 }}>
                                    {t("uploadProofVisibilityReminder", sourceKey.user)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ImportantReminders({ t }) {
    const isCollapsed = useIsCollapsed();
    const highlightStyle = { color: "#92400E" };
    const reminders = [
        {
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
            ),
            text: <>
                {t("keepSharedPostPrefix", sourceKey.user)}{" "}
                <strong style={highlightStyle}>{t("publiclyVisible", sourceKey.user)}</strong>{" "}
                {t("keepSharedPostSuffix", sourceKey.user)}
            </>,
        },
        {
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            ),
            text: <>
                {t("winnerContactPrefix", sourceKey.user)}{" "}
                <strong style={highlightStyle}>{t("officialWhatsappAccount", sourceKey.user)}</strong>
                {t("winnerContactSuffix", sourceKey.user)}
            </>,
        },
        {
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            ),
            text: <>
                {t("winnerAnnouncementPrefix", sourceKey.user)}{" "}
                <strong style={highlightStyle}>{t("winnerAnnouncementPeriod", sourceKey.user)}</strong>{" "}
                {t("winnerAnnouncementSuffix", sourceKey.user)}
            </>,
        },
        {
            icon: <Gift style={{ width: 14, height: 14, color: "#D97706" }} />,
            text: <>
                {t("organiserDecisionPrefix", sourceKey.user)}{" "}
                <strong style={highlightStyle}>{t("finalDecision", sourceKey.user)}</strong>
                {t("organiserDecisionSuffix", sourceKey.user)}
            </>,
        },
    ];

    return (
        <div style={styles.remindersSection}>
            <div style={styles.remindersHeader}>
                <div className="luckydraw-gold-gradient" style={styles.remindersHeaderIcon}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                </div>
                <span style={{ fontSize: 16, fontWeight: 900, color: "#1E293B" }}>
                    {t("importantReminders", sourceKey.user)}
                </span>
            </div>
            <div style={{ ...styles.remindersGrid, gridTemplateColumns: isCollapsed ? "1fr" : "1fr 1fr" }}>
                {reminders.map((r, i) => (
                    <div key={i} style={styles.reminderItem}>
                        <div style={styles.reminderIcon}>{r.icon}</div>
                        <p style={styles.reminderText}>{r.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * UploadShareProofPage
 * Query params: token, phone, outletUserId, platform, businessName
 */
const UploadShareProofPage = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadDone, setUploadDone] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [file, setFile] = useState([]);
    const [campaign, setCampaign] = useState(null);
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const isCollapsed = useIsCollapsed();

    const token = router.query?.token || "";
    const phone = router.query?.phone || "";
    const outletUserId = router.query?.outletUserId || "";
    const platform = router.query?.platform || "";

    useEffect(() => {
        const initialPlatform = platform || PLATFORM_OPTIONS[0]?.value || "";
        setSelectedPlatform(initialPlatform);
        form.setFieldsValue({ platform: initialPlatform });
    }, [platform, form]);

    useEffect(() => {
        const loadCampaign = async () => {
            try {
                const res = await getGlobalCampaign(1, 0, {});
                if (res?.data?._id) {
                    setCampaign(res.data);
                }
            } catch { }
        };
        loadCampaign();
    }, []);

    // Warm DNS + TCP + TLS to the API before the user submits, so the upload
    // POST reuses an already-open connection instead of paying the fragile cold
    // first round-trip. Plain GET to "/" = CORS simple request (no preflight);
    // failures are ignored — this is best-effort priming, the upload retry is
    // the real backstop.
    useEffect(() => {
        if (!API_ORIGIN) return;
        let cancelled = false;
        (async () => {
            for (let attempt = 0; attempt < 3 && !cancelled; attempt++) {
                try {
                    await axios.get(client.uri.apiLink, { timeout: 8000 });
                    return;
                } catch {
                    await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const handlePlatformSelect = (value) => {
        setSelectedPlatform(value);
        form.setFieldsValue({ platform: value });
    };

    const handleSubmit = async () => {
        const selected = selectedPlatform || form.getFieldValue("platform");

        if (!selected) {
            message.error(t("platformRequired", sourceKey.user));
            return;
        }

        if (!file || file.length === 0) {
            message.error(t("screenshotRequired", sourceKey.user));
            return;
        }

        setIsUploading(true);
        try {
            const originFile = file[0]?.originFileObj || file[0];
            const uploadRes = await publicImages({ images: [originFile] });

            if (!uploadRes?.data?.success) {
                throw new Error(uploadRes?.data?.message || t("proofSubmitFailed", sourceKey.user));
            }

            const uploadProofLink = uploadRes?.data?.data?.imageUrls?.[0] || null;

            const joinRes = await joinGlobal({
                phone,
                outletUserId,
                token,
                uploadProofLink,
                platform: selected,
            });

            if (!joinRes?.data?.status) {
                throw new Error(joinRes?.data?.message || t("proofSubmitFailed", sourceKey.user));
            }

            setUploadDone(true);
        } catch (err) {
            console.error("[UploadShareProof] submit failed", err);
            message.error(err?.message || t("proofSubmitFailed", sourceKey.user));
        } finally {
            setIsUploading(false);
        }
    };

    const handleGoToDashboard = () => {
        router.push(`/shareSection/luckyDraw/dashboard?phone=${encodeURIComponent(phone || "")}`);
    };

    const campaignTitle =
        typeof campaign?.name === "string" && campaign.name.trim()
            ? campaign.name.trim()
            : t("globalRewardsCampaign", sourceKey.user);
    const campaignPrize = campaign?.prize || t("prize", sourceKey.user);
    const campaignDate = campaign?.endDate ? formatDate(campaign.endDate, "DD MMM YYYY") : "-";
    const selectedFileName = file?.[0]?.name || file?.[0]?.originFileObj?.name || t("screenshotUpload", sourceKey.user);

    return (
        <div style={styles.page}>
            {API_ORIGIN && (
                <Head>
                    <link rel="preconnect" href={API_ORIGIN} crossOrigin="anonymous" />
                    <link rel="dns-prefetch" href={API_ORIGIN} />
                </Head>
            )}
            <UploadBackground />

            <div style={styles.header}>
                <button type="button" onClick={() => router.back()} style={styles.backButton}>
                    <ArrowLeft style={{ width: 13, height: 13 }} />
                    <span>{t("back", sourceKey.user)}</span>
                </button>
                <div style={{ width: 1, height: 16, background: "#E2E8F0" }} />
                <div style={styles.headerTitle}>
                    <Gift style={{ width: 13, height: 13, color: "#D97706" }} />
                    <span>{t("joinGlobalLuckyDrawTitle", sourceKey.user)}</span>
                </div>
            </div>

            <main style={styles.main}>
                <GameRuleHero
                    campaignTitle={campaignTitle}
                    campaignPrize={campaignPrize}
                    campaignDate={campaignDate}
                    t={t}
                    isCollapsed={isCollapsed}
                />

                <div style={styles.consiStrip}>
                    <span style={{ fontSize: 13, color: "#475569", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {t("officialLuckyDrawCampaignBy", sourceKey.user)}
                    </span>
                    <img src={ShareAiBigIcon} alt="CONSi" style={{ width: 60, height: "auto", objectFit: "contain" }} />
                </div>

                {/* <div style={styles.infoBox}>
                    <p style={styles.infoText}>
                        {t("uploadProofInstruction", sourceKey.user)}
                    </p>
                    <p style={{ ...styles.infoText, marginTop: 8, display: "flex", alignItems: "flex-start", gap: 5, fontSize: 10, color: "#B45309", fontWeight: 600 }}>
                        <span>⚠️</span>
                        <span>{t("uploadProofWarning", sourceKey.user)}</span>
                    </p>
                </div> */}

                {/* <div style={styles.prizeBanner}>
                    <div style={styles.prizeIcon}>
                        <Gift style={{ width: 24, height: 24, color: "#FDE68A" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={styles.overline}>{t("youCouldWin", sourceKey.user)}</p>
                        <p style={styles.prizeTitle}>{campaignTitle}</p>
                        <p style={styles.prizeValue}>{campaignPrize}</p>
                    </div>
                    {campaign?.endDate && (
                        <div className="flex items-center" style={{ gap: 5, fontSize: 11, fontWeight: 800 }}>
                            <CalendarDays style={{ width: 13, height: 13 }} />
                            <span>{campaignDate}</span>
                        </div>
                    )}
                </div> */}

                {uploadDone ? (
                    <div style={styles.successPanel}>
                        <div style={styles.successIcon}>
                            <Check style={{ width: 26, height: 26, color: "#fff" }} />
                        </div>
                        <h2 style={styles.successTitle}>{t("ticketActivated", sourceKey.user)}</h2>
                        <p style={styles.successText}>
                            {t("entrySubmittedSuccessfully", sourceKey.user)}
                            <br />
                            <strong>{campaignDate}</strong>
                        </p>
                        <button type="button" onClick={handleGoToDashboard} style={styles.submitButton}>
                            <Monitor style={{ width: 16, height: 16 }} />
                            <span>{t("viewDashboard", sourceKey.user)}</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={styles.card}>
                            <div style={styles.sectionHeader}>
                                <div className="luckydraw-gold-gradient" style={styles.stepNumber}>1</div>
                                <p style={styles.sectionTitle}>{t("sharedOn", sourceKey.user)}</p>
                            </div>
                            <p style={styles.sectionDesc}>
                                {t("selectPlatformDesc", sourceKey.user)}
                            </p>
                            <div style={{ ...styles.platformGrid, gridTemplateColumns: isCollapsed ? "1fr 1fr" : "repeat(4, 1fr)" }}>
                                {PLATFORM_OPTIONS.map((option) => {
                                    const active = option.value === selectedPlatform;
                                    const icon = getPlatformIcon(option.title);
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handlePlatformSelect(option.value)}
                                            style={{
                                                ...styles.platformButton,
                                                ...(active ? styles.platformActive : null),
                                            }}
                                        >
                                            <img
                                                src={icon}
                                                alt={option.title}
                                                style={{ width: 28, height: 28, objectFit: "contain" }}
                                            />
                                            <span>{option.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={styles.card}>
                            <div style={styles.sectionHeader}>
                                <div className="luckydraw-gold-gradient" style={styles.stepNumber}>2</div>
                                <p style={styles.sectionTitle}>{t("screenshotUpload", sourceKey.user)}</p>
                            </div>
                            <p style={styles.sectionDesc}>
                                {t("attachScreenshotDesc", sourceKey.user)}
                            </p>

                            <div className="up-border-outer">
                                <div className="up-border-inner up-upload-zone">
                                    {/* <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, color: "#475569", marginBottom: 12 }}>
                                        <ImagePlus style={{ width: 24, height: 24, color: "#F59E0B" }} />
                                        <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: "#475569" }}>
                                            {t("tapToSelectPhoto", sourceKey.user)}
                                        </p>
                                        <p style={{ margin: 0, fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>
                                            {t("uploadFileRequirements", sourceKey.user)}
                                        </p>
                                    </div> */}
                                    <Form form={form} layout="vertical">
                                        <ImageInput
                                            fieldName="screenshot"
                                            imageUrl={imageUrl}
                                            setImageUrl={setImageUrl}
                                            setFile={setFile}
                                            file={file}
                                            required={true}
                                            acceptTypes={["png", "jpg", "jpeg"]}
                                            form={form}
                                        />
                                    </Form>
                                </div>
                            </div>

                            {isUploading && (
                                <div style={{ ...styles.statusPanel, ...styles.verifyingPanel }}>
                                    <div
                                        style={{
                                            width: 32,
                                            height: 32,
                                            border: "4px solid #FDE68A",
                                            borderTopColor: "#F59E0B",
                                            borderRadius: "50%",
                                            animation: "ldSpin 0.8s linear infinite",
                                        }}
                                    />
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 900 }}>
                                        {t("uploadingProof", sourceKey.user)}
                                    </p>
                                </div>
                            )}

                            {!isUploading && file?.length > 0 && (
                                <div style={{ ...styles.statusPanel, ...styles.verifiedPanel }}>
                                    <div
                                        style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: 10,
                                            background: "#22C55E",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <CheckCircle2 style={{ width: 18, height: 18, color: "#fff" }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "#16A34A", textTransform: "uppercase", letterSpacing: 0.8 }}>
                                            {t("verified", sourceKey.user)}
                                        </p>
                                        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#1E293B" }}>
                                            {selectedFileName}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFile([]);
                                            setImageUrl("");
                                            form.setFieldsValue({ screenshot: [] });
                                        }}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
                                    >
                                        <X style={{ width: 15, height: 15 }} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* <div style={styles.noteBox}>
                            {replaceStringPattern(t("screenshotProofWinnerReminder", sourceKey.user), {
                                date: campaignDate,
                            })}
                        </div> */}

                        <ImportantReminders t={t} />

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isUploading}
                            style={{
                                ...styles.submitButton,
                                ...(isUploading ? styles.disabledButton : null),
                            }}
                        >
                            {/* <Upload style={{ width: 16, height: 16 }} /> */}
                            <span>{isUploading ? t("submittingEntry", sourceKey.user) : t("submitEntry", sourceKey.user)}</span>
                        </button>
                    </>
                )}
            </main>
        </div>
    );
};

export default UploadShareProofPage;
