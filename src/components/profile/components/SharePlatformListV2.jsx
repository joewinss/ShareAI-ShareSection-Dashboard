import React from "react";
import { Button } from "antd";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";

const SharePlatformListV2 = ({ platformList = [], onShare }) => {
    const { t } = useTranslation();

    // Platform icon mapping
    const getPlatformIcon = (platformName) => {
        const name = String(platformName).toLowerCase();
        if (name.includes("rednote") || name.includes("red note")) {
            return "/assets/icon/RedNoteIcon.svg";
        } else if (name.includes("facebook")) {
            return "/assets/icon/FacebookIcon.svg";
        } else if (name.includes("twitter")) {
            return "/assets/icon/TwitterIcon.svg";
        } else if (name.includes("instagram")) {
            return "/assets/icon/InstagramIcon.svg";
        }
        return "/assets/icon/OthersIcon.svg";
    };

    return (
        <div className="grid grid-cols-2 gap-4 px-3">
            {platformList.map((platform) => {
                const iconSrc = getPlatformIcon(platform.name);

                return (
                    <div
                        key={platform.id}
                        className="flex flex-col items-center bg-white rounded-2xl p-4 shadow-sm"
                        style={{
                            border: "1px solid #F0F0F0",
                        }}
                    >
                        <div
                            className="flex items-center justify-center mb-3"
                            style={{
                                width: 64,
                                height: 64,
                            }}
                        >
                            <img
                                src={iconSrc}
                                alt={platform.title}
                                style={{
                                    width: 64,
                                    height: 64,
                                    objectFit: "contain",
                                }}
                            />
                        </div>
                        <div
                            className="font-medium text-center mb-3"
                            style={{
                                fontSize: 14,
                                color: "#262626",
                                minHeight: 20,
                            }}
                        >
                            {platform.title}
                        </div>
                        <Button
                            type="primary"
                            className="w-full"
                            style={{
                                height: 40,
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 500,
                                backgroundColor: "#1877F2",
                                borderColor: "#1877F2",
                            }}
                            onClick={() => onShare && onShare(platform.name)}
                        >
                            {t("share", sourceKey.user)}
                        </Button>
                    </div>
                );
            })}
        </div>
    );
};

export default SharePlatformListV2;
