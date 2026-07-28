import getGlobalCampaign from "@/pages/api/merchantDraw/public/globalCampaign";
import getMerchantDrawPublicSettings from "@/pages/api/merchantDraw/public/getSettings";

const getResponseData = (response) => response?.data?.data ?? response?.data ?? null;

export const isMerchantDrawSettingsActive = (response) => {
    const data = getResponseData(response);
    return data?.isMerchantDraw === 1 || data?.isMerchantDraw === "1" || data?.isMerchantDraw === true;
};

export const isGlobalCampaignActive = (response) => {
    const data = getResponseData(response);
    return Boolean(data?._id);
};

export const isVoucherDrawSettingsActive = (response) => {
    const data = getResponseData(response);
    return data?.isEnabled === true || data?.isEnabled === 1 || data?.isEnabled === "1";
};

export const shouldShowEnterMerchantDrawButton = ({
    settingsResponse,
    globalCampaignResponse,
} = {}) => isMerchantDrawSettingsActive(settingsResponse) || isGlobalCampaignActive(globalCampaignResponse);

export const isMerchantDrawAvailable = async ({ outletUserId } = {}) => {
    const [settingsResult, campaignResult] = await Promise.allSettled([
        outletUserId
            ? getMerchantDrawPublicSettings(1, 0, { outletUserId })
            : Promise.resolve(null),
        getGlobalCampaign(1, 0, {}),
    ]);

    return shouldShowEnterMerchantDrawButton({
        settingsResponse: settingsResult.status === "fulfilled" ? settingsResult.value : null,
        globalCampaignResponse: campaignResult.status === "fulfilled" ? campaignResult.value : null,
    });
};
