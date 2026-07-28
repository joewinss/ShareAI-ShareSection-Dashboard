import { formatDate } from "@/utility/common-functions";
import React from "react";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { Trophy } from "lucide-react";

/**
 * PrizeCard - SBANK Modern Mobile Card Style
 */
const PrizeCard = ({ reward, drawType, outletName, createdAt }) => {
    const { t } = useTranslation();
    const isGlobal = drawType === "global";

    return (
        <div className="bg-white rounded-3xl shadow-[0_10px_30px_rgba(15,23,42,0.04)] border border-slate-100 p-4 flex items-center gap-3.5 transition-all hover:border-slate-200">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-lg shrink-0 shadow-inner ${
                isGlobal ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600 border border-blue-100"
            }`}>
                {isGlobal ? "🌐" : <Trophy className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-extrabold text-slate-900 text-sm truncate">{reward}</p>
                <div className="flex items-center gap-2 mt-1 justify-between">
                    <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${isGlobal
                            ? "bg-amber-50 text-amber-700 border-amber-200/80"
                            : "bg-blue-50 text-blue-700 border-blue-200/80"
                            }`}
                    >
                        {isGlobal ? t("monthlyMegaDraw", sourceKey.user) || "Monthly Mega" : outletName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{formatDate(createdAt, "DD MMM YYYY")}</span>
                </div>
            </div>
        </div>
    );
};

export default PrizeCard;
