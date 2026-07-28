import React from "react";
import { Image } from "antd";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";

const formatTncText = (value) => {
    if (!value) return "";

    return String(value)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();
};

// Voucher hero (photo, or a gradient fallback with the title) + title + Terms & Conditions.
// Shared header for the group-level voucher list drawer.
const VoucherDetailsSection = ({ voucherImage, title, tncText }) => {
    const { t } = useTranslation();
    const formattedTnc = formatTncText(tncText);

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {voucherImage ? (
                <Image
                    src={voucherImage}
                    alt={title || t("voucher", sourceKey.user)}
                    className="w-full h-[200px] object-cover"
                    wrapperClassName="block w-full"
                    wrapperStyle={{ height: 200 }}
                    height={200}
                    draggable={false}
                />
            ) : (
                <div className="relative h-[200px] bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white p-6">
                    <h1 className="text-3xl font-black tracking-wide text-center">
                        {title || t("voucher", sourceKey.user)}
                    </h1>
                </div>
            )}

            <div className="p-4 text-gray-600">
                <h2 className="text-base font-bold text-gray-800 leading-tight">
                    {title || t("voucher", sourceKey.user)}
                </h2>

                <hr className="my-3 border-gray-100" />

                <div className="text-[11px] leading-relaxed">
                    <p className="font-bold text-gray-500 mb-1">
                        {t("termsAndConditions", sourceKey.user)}
                    </p>
                    <p className="text-gray-400 whitespace-pre-line">
                        {formattedTnc || "-"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VoucherDetailsSection;
