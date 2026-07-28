import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import getMerchantDrawPublicSettings from "@/pages/api/merchantDraw/public/getSettings";
import getMerchantDrawEntry from "@/pages/api/merchantDraw/public/getMerchantDrawEntry";
import getGlobalCampaign from "@/pages/api/merchantDraw/public/globalCampaign";
import getVoucherDrawSettings from "@/pages/api/voucherDraw/public/getDrawSettings";
import { isMerchantDrawSettingsActive, isGlobalCampaignActive, isVoucherDrawSettingsActive } from "@/components/shareContent/utils/merchantDrawAvailability";
import { MERCHANT_DRAW_STATUS, MONTHLY_DRAW_STATUS, VOUCHER_DRAW_STATUS } from "@/constants/user";

export function useMerchantDrawInit({
    token: tokenProp,
    userId: userIdProp,
    phone: phoneProp,
    platform: platformProp,
    resolvedStep = "entry",
}) {
    const router = useRouter();
    const [step, setStep] = useState("loading");
    const [settings, setSettings] = useState(null);
    const [entryStatus, setEntryStatus] = useState({
        merchantDrawStatus: MERCHANT_DRAW_STATUS.PENDING,
        monthlyDrawStatus: MONTHLY_DRAW_STATUS.PENDING,
        voucherDrawStatus: VOUCHER_DRAW_STATUS.PENDING,
        reward: null,
    });
    const [hasJoinedGlobal, setHasJoinedGlobal] = useState(false);
    const [resolvedPhone, setResolvedPhone] = useState(phoneProp || null);
    const [isMerchantEnabled, setIsMerchantEnabled] = useState(false);
    const [isGlobalEnabled, setIsGlobalEnabled] = useState(false);
    const [isVoucherEnabled, setIsVoucherEnabled] = useState(false);

    const phone = resolvedPhone || phoneProp;
    const userId = userIdProp;
    const entryToken = tokenProp;
    const platform = platformProp;

    useEffect(() => {
        if (!router.isReady) return;

        const validateAndLoad = async () => {
            setStep("loading");
            setSettings(null);
            setIsMerchantEnabled(false);
            setIsGlobalEnabled(false);
            setIsVoucherEnabled(false);
            let phoneForVoucher = phoneProp;
            let nextEntryStatus = {
                merchantDrawStatus: MERCHANT_DRAW_STATUS.PENDING,
                monthlyDrawStatus: MONTHLY_DRAW_STATUS.PENDING,
                voucherDrawStatus: VOUCHER_DRAW_STATUS.PENDING,
                reward: null,
            };

            if (entryToken) {
                try {
                    const entryRes = await getMerchantDrawEntry(1, 0, { token: entryToken });
                    const entryData = entryRes?.data;

                    phoneForVoucher = entryData?.phone || phoneForVoucher;
                    setResolvedPhone(entryData?.phone || null);

                    if (!entryRes?.status || !entryData?.valid) {
                        setStep("invalid");
                        return;
                    }

                    nextEntryStatus = {
                        merchantDrawStatus: entryData.merchantDrawStatus ?? MERCHANT_DRAW_STATUS.PENDING,
                        monthlyDrawStatus: entryData.monthlyDrawStatus ?? MONTHLY_DRAW_STATUS.PENDING,
                        voucherDrawStatus: entryData.voucherDrawStatus ?? VOUCHER_DRAW_STATUS.PENDING,
                        reward: entryData.reward || null,
                    };
                    setEntryStatus(nextEntryStatus);
                    setHasJoinedGlobal(entryData.monthlyDrawStatus === MONTHLY_DRAW_STATUS.JOINED);

                    if (typeof window !== "undefined" && userIdProp) {
                        sessionStorage.setItem("luckyDraw_eligible_" + userIdProp, "1");
                    }
                } catch {
                    setStep("invalid");
                    return;
                }
            }

            if (!userIdProp) {
                console.warn("[LuckyDraw] No userId found in query");
                setStep("unavailable");
                return;
            }

            try {
                const [settingsResult, campaignResult, voucherResult] = await Promise.allSettled([
                    getMerchantDrawPublicSettings(1, 0, { outletUserId: userIdProp }),
                    getGlobalCampaign(1, 0, {}),
                    getVoucherDrawSettings(1, 0, { outletUserId: userIdProp, phone: phoneForVoucher }),
                ]);

                const settingsRes = settingsResult.status === "fulfilled" ? settingsResult.value : null;
                const campaignRes = campaignResult.status === "fulfilled" ? campaignResult.value : null;
                const voucherRes = voucherResult.status === "fulfilled" ? voucherResult.value : null;

                const merchantEnabled = isMerchantDrawSettingsActive(settingsRes);
                const globalEnabled = isGlobalCampaignActive(campaignRes);
                const voucherEnabled = isVoucherDrawSettingsActive(voucherRes);

                setIsMerchantEnabled(merchantEnabled);
                setIsGlobalEnabled(globalEnabled);
                setIsVoucherEnabled(voucherEnabled);

                if (!merchantEnabled && !globalEnabled && !voucherEnabled) {
                    setStep("unavailable");
                    return;
                }

                if (merchantEnabled) {
                    setSettings(settingsRes?.data?.data ?? settingsRes?.data ?? null);
                }

                setStep(resolvedStep);
            } catch {
                setStep("unavailable");
            }
        };

        validateAndLoad();
    }, [entryToken, phoneProp, platformProp, resolvedStep, router.isReady, userIdProp]);

    return {
        step,
        setStep,
        settings,
        entryStatus,
        setEntryStatus,
        hasJoinedGlobal,
        setHasJoinedGlobal,
        phone,
        userId,
        entryToken,
        platform,
        isMerchantEnabled,
        isGlobalEnabled,
        isVoucherEnabled,
    };
}
