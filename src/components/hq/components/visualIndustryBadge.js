export const UNKNOWN_VISUAL_INDUSTRY_LABEL = "unknown industry";

export const getVisualIndustryCodeValue = (industryCode) => {
    if (typeof industryCode !== "string") return "";
    return industryCode.trim();
};

export const getVisualIndustryBadgeLabel = (industryCode, knownIndustryCodes = []) => {
    const industryCodeValue = getVisualIndustryCodeValue(industryCode);
    if (!industryCodeValue) return UNKNOWN_VISUAL_INDUSTRY_LABEL;

    const normalizedIndustryCode = industryCodeValue.toLowerCase();
    if (knownIndustryCodes.includes(normalizedIndustryCode)) {
        return normalizedIndustryCode.replace(/_/g, " ");
    }

    return industryCodeValue;
};
