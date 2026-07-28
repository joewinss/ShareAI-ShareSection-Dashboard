import { isNaN, isString, round, toNumber } from "lodash";
import moment2 from "moment-timezone";
let timeZone = "Asia/Kuala_Lumpur"

export function formatDecimalNumber(value, point, formatToString = true) {
    let point_value = 10;
    let pointChanges = point;
    let zero = "0.";
    for (let p = 0; p < pointChanges; p++) {
        zero = zero.concat("0");
    }
    point_value = Math.pow(point_value, pointChanges);
    let formatted_value = (Math.round(value * point_value) / point_value).toFixed(
        pointChanges
    );

    while (formatted_value.toString() === zero && value !== 0) {
        zero = "0.";
        pointChanges = pointChanges + point;
        point_value = Math.pow(point_value, pointChanges);
        formatted_value = (Math.round(value * point_value) / point_value).toFixed(
            pointChanges
        );

        for (let p = 0; p < pointChanges; p++) {
            zero = zero.concat("0");
        }
    }

    return formatToString === true
        ? numberWithCommas(formatted_value)
        : parseFloat(formatted_value);
}

export function numberWithCommas(x) {
    if (isNaN(parseFloat(x))) {
        return "0";
    } else {
        let parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }
}

export function formatDate(value, format = null) {
    if (value) {
        if (!isValidDate(value)) {
            return null;
        } else {
            if (format === null) {
                format = "DD/MM/YYYY";
            }

            return moment2(value).tz(timeZone).format(format);
        }
    } else {
        return null;
    }
}

export function replaceStringPattern(str, obj) {
    return str.replace(/\${(.*?)}/g, (match, key) => {
        return key in obj ? obj[key] : match;
    });
}

export function isValidNumber(value) {
    return !isNaN(parseFloat(value));
}

export function isValidDate(value) {
    if (value !== null) {
        value = new Date(value);
        if (Object.prototype.toString.call(value) === "[object Date]") {
            // it is a date
            if (isNaN(value.valueOf())) {
                // value.valueOf() could also work
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
}

export function getFormatTime(dateInput) {
    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
        return "-";
    }

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${hours}:${formattedMinutes} ${period}`;
}


export function getFormatDate(dateInput) {
    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
        return "-"
    }

    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export function trimIfString(v) {
    if (typeof v !== 'string') return v;
    // Remove control characters like ASCII 0x05 that can be injected from certain keyboards/input methods.
    // Keep line breaks if needed, but strip other non-printable characters.
    const cleaned = v.replace(/\x05/g, "");
    return cleaned.trim();
}

export function formatShareContent(data) {

    const { title = '', contentText = '', location = '', hashtags = '' } = data || {};

    const parts = [];

    // Add title if it exists
    if (title && title.trim()) {
        parts.push(title.trim());
    }

    // Add content text if it exists
    if (contentText && contentText.trim()) {
        parts.push(contentText.trim());
    }

    // Add location if it exists
    if (location && location.trim()) {
        parts.push(location.trim());
    }

    // Add hashtags if they exist
    ///hashtags is array
    if (Array.isArray(hashtags) && hashtags.length > 0) {
        parts.push(...hashtags.map(tag => tag.trim()));
    }

    // Join all parts with line breaks
    return parts.join('\n\n');
}

export const getMaskedCode = (code) => {
    const buildResult = (value) => {
        if (!isString(value) || value.length === 0) {
            return { display: '', original: '', isEmpty: true };
        }
        if (value.length <= 4) {
            return { display: value, original: value, isEmpty: false };
        }
        const visible = value.slice(-4);
        const masked = "xxxxxxxx" + visible;
        return { display: masked, original: value, isEmpty: false };
    };
    if (Array.isArray(code)) {
        return code.map((item) => buildResult(item));
    }

    return buildResult(code);
};

export const getIShareRedirectUrl = () => {
    if (typeof window === "undefined") return "https://ishare.itscreative.biz/";
    const origin = window.location.origin;
    if (origin.includes("stg") || origin.includes("local") || origin.includes("localhost")) {
        return "https://stg-ishare.itscreative.biz/";
    }
    return "https://ishare.itscreative.biz/";
};

export const getIShareRedirectLoginUrl = () => {
    if (typeof window === "undefined") return "https://ishare.itscreative.biz/login";
    const origin = window.location.origin;
    if (origin.includes("stg") || origin.includes("local") || origin.includes("localhost")) {
        return "https://stg-ishare.itscreative.biz/login";
    }
    return "https://ishare.itscreative.biz/login";
};

