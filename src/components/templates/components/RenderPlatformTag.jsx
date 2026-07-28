import React from "react";
import { useTranslation } from "@/locales/useTranslation";
import { Tag } from "antd";
import { PLATFORM_NAME } from "@/constant/template";

const RenderPlatformTag = ({ status }) => {
    const { t } = useTranslation();
    let text = status;
    let color = "";
    switch (status) {
        case PLATFORM_NAME.FACEBOOK:
            color = "blue";
            break;
        case PLATFORM_NAME.LEMON8:
            color = "yellow";
            break;
        case PLATFORM_NAME.TIKTOK:
            color = "red";
            break;
        case PLATFORM_NAME.RED_NOTE:
            color = "cyan";
            break;
        case PLATFORM_NAME.INSTAGRAM:
            color = "purple";
            break;
        case PLATFORM_NAME.YELP:
            color = "pink";
            break;
        case PLATFORM_NAME.GOOGLE_REVIEW:
            color = "gold";
            break;
        case PLATFORM_NAME.OTHERS:
            color = "lime";
            break;
    }
    return (
        <Tag color={color}>{text} </Tag>
    );
};

export default RenderPlatformTag;