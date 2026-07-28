import React from "react";
import { Tag } from "antd";
import { formatDate, formatDecimalNumber } from "@/utility/common-functions";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { MONTHLY_DRAW_STATUS } from "@/constants/user";

const GlobalHistoryList = ({ history }) => {
    const { t } = useTranslation();
    if (!history || history.length === 0) {
        return (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                <p className="text-gray-400">{t("noGlobalCampaignsJoinedYet", sourceKey.user)}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {history.map((item) => (
                <div key={item.campaignId} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center transition-all hover:border-teal-200">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                        </div>
                        <p className="text-xs text-gray-500">
                            {t("prize", sourceKey.user)}: <span className="font-semibold text-teal-600">{item.prize || t("giftVoucher", sourceKey.user)}</span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                            {t("ended", sourceKey.user)}: {formatDate(item.endDate, "DD MMM YYYY")}
                        </p>
                    </div>
                    <div className="text-right pl-4">
                        <Tag color="cyan" className="rounded-lg px-2 py-1 text-sm font-semibold tracking-tighter">
                            {item.entryCount} {item.entryCount === 1 ? t("entry", sourceKey.user) : t("entries", sourceKey.user)}
                        </Tag>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GlobalHistoryList;
