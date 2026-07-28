import { CONTENT_STATUS } from "@/constant/template";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { Tag } from "antd";

// Utility helpers for parsing share content
export function parseShareFields(rawDescription = "") {
    const cleaned = String(rawDescription)
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const extract = (label, nextLabels) => {
        const next = nextLabels.map((l) => `${l}:`).join("|");
        const re = new RegExp(`${label}:\\s*(.*?)(?=${next}|$)`, "i");
        const m = cleaned.match(re);
        return m ? m[1].trim() : "";
    };

    const title = extract("TITLE", ["CONTENT", "LOCATION", "HASHTAG"]);
    const contentT = extract("CONTENT", ["TITLE", "LOCATION", "HASHTAG"]);
    const location = extract("LOCATION", ["TITLE", "CONTENT", "HASHTAG"]);
    const hashtagS = extract("HASHTAG", ["TITLE", "CONTENT", "LOCATION"]);

    const hashtags = hashtagS
        ? hashtagS
            .split(/[, ]+/)
            .map((t) => t.trim())
            .filter(Boolean)
            .map((t) => (t.startsWith("#") ? t : `#${t}`))
        : [];

    const hashtagsString = hashtags.join(" ");

    const shareText = [
        //  title,
        contentT,
        location,
        hashtags.length > 0 ? hashtagsString : null,
    ]
        .filter(Boolean)
        .join("\n\n");

    return { title, contentT, location, hashtags, hashtagsString, shareText };
}
export function renderStatusTag(status) {
    const { t } = useTranslation();
    let color = 'default';
    let text = 'Unknown';
    switch (status) {
        case CONTENT_STATUS.PENDING_REVIEW:
            color = 'yellow';
            text = t('pendingReview', sourceKey.user);
            break;
        case CONTENT_STATUS.ACTIVE:
            color = 'green';
            text = t('approved', sourceKey.user);
            break;
        case CONTENT_STATUS.DELETED:
            color = 'red';
            text = t('rejected', sourceKey.user);
            break;
        case CONTENT_STATUS.ARCHIVED:
            color = 'red';
            text = t('archived', sourceKey.user);
            break;
        case CONTENT_STATUS.EXPIRED:
            color = 'red';
            text = t('expired', sourceKey.user);
            break;
        default:
            color = 'blue';
            text = 'Unknown';
    }
    return <Tag color={color}>{text}</Tag>;
}
export function renderOutletTag(name) {
    const { t } = useTranslation();
    if (!name || name === '') {
        return null
    }
    return <Tag color="#2db7f5">{name}</Tag>;
}

export function renderNameTag(name) {
    const { t } = useTranslation();
    if (!name || name === '') {
        return null
    }
    return <Tag color="green">{name}</Tag>;
}

export default {
    parseShareFields,
    renderStatusTag,
    renderOutletTag,
};
