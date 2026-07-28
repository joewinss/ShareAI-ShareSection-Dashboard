import { PLATFORM_NAME } from "@/constant/template";
import { facebook, GoogleReview, instagram, Lemon8, OthersIcon, redNote, tiktok, Yelp } from "../../public/assets";

export const createImagePreviews = (files) => {
    if (!files || files.length === 0) return [];

    return Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size
    }));
};

export const validateImages = (files) => {
    const errors = [];

    if (!files || files.length === 0) {
        errors.push('No files selected');
        return { valid: false, errors };
    }

    // if (files.length > 4) {
    //     errors.push('Maximum 4 images allowed');
    // }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 3 * 1024 * 1024; // 3MB

    Array.from(files).forEach((file, index) => {
        if (!allowedTypes.includes(file.type)) {
            errors.push(`File ${index + 1}: Only JPEG, JPG, PNG, and GIF images are allowed`);
        }

        if (file.size > maxSize) {
            errors.push(`File ${index + 1}: Maximum file size is 3MB`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
};

export const getPlatformIcon = (platformTitle) => {
    switch (platformTitle) {
        case PLATFORM_NAME.FACEBOOK:
            return facebook;
        case PLATFORM_NAME.LEMON8:
            return Lemon8;
        case PLATFORM_NAME.TIKTOK:
            return tiktok;
        case PLATFORM_NAME.RED_NOTE:
            return redNote;
        case PLATFORM_NAME.INSTAGRAM:
            return instagram;
        case PLATFORM_NAME.YELP:
            return Yelp;
        case PLATFORM_NAME.GOOGLE_REVIEW:
            return GoogleReview;
        default:
            return OthersIcon;
    }
};
