import React from "react";
import { ArrowLeft, Gift } from "lucide-react";
import { useRouter } from "next/router";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";

const styles = {
    header: {
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderBottom: "1px solid #E2E8F0",
        background: "#fff",
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
    divider: {
        width: 1,
        height: 16,
        background: "#E2E8F0",
    },
    titleWrap: {
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: 7,
        color: "#1E293B",
        fontSize: 12,
        fontWeight: 900,
    },
    titleText: {
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 1,
    },
    title: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    subtitle: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        color: "#64748B",
        fontSize: 11,
        fontWeight: 700,
    },
};

const MerchantDrawHeader = ({ title, subtitle, showBack = true }) => {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <div style={styles.header}>
            {showBack && (
                <>
                    <button type="button" onClick={() => router.back()} style={styles.backButton}>
                        <ArrowLeft style={{ width: 13, height: 13 }} />
                        <span>{t("back", sourceKey.user)}</span>
                    </button>
                    <div style={styles.divider} />
                </>
            )}
            <div style={styles.titleWrap}>
                <Gift style={{ width: 14, height: 14, color: "#D97706", flexShrink: 0 }} />
                <div style={styles.titleText}>
                    <span style={styles.title}>{title}</span>
                    {subtitle ? <span style={styles.subtitle}>{subtitle}</span> : null}
                </div>
            </div>
        </div>
    );
};

export default MerchantDrawHeader;
