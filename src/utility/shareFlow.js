import { isEmpty } from "lodash";
import { PLATFORM_TYPE } from "@/constant/template";

export const SHARE_IMAGE_MODE = {
    CURRENT: "current",
    ALL: "all",
    NONE: "none",
};

export const AUTO_COPY_TEXT_OS = ["ios", "harmonyos", "magicos"];

const FILES_ONLY_PLATFORM_MATCHERS = ["rednote", "tiktok", "lemon", "yelp"];

export const normalizeImageUrl = (url) => {
    if (typeof url !== "string") return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;
    if (trimmed.startsWith("/")) return trimmed;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    return `https://${trimmed}`;
};

export const getProxiedImageUrl = (url) => {
    const normalized = normalizeImageUrl(url);
    if (!normalized) return "";
    if (
        normalized.startsWith("data:") ||
        normalized.startsWith("blob:") ||
        normalized.startsWith("/")
    ) {
        return normalized;
    }
    if (typeof window !== "undefined" && normalized.startsWith(window.location.origin)) {
        return normalized;
    }
    return `/api/images/proxy-image?url=${encodeURIComponent(normalized)}`;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const buildShareDescription = (content) => {
    if (!isEmpty(content?.title) && !isEmpty(content?.hashtags)) {
        const hashtagValue = Array.isArray(content?.hashtags)
            ? content?.hashtags.join(" ")
            : content?.hashtags;

        return [
            `TITLE: ${content?.title}`,
            `CONTENT: ${content?.contentText}`,
            `LOCATION: ${content?.location}`,
            `HASHTAG: ${hashtagValue}`,
            "",
        ]
            .filter(Boolean)
            .join("\n");
    }

    return content?.contentText;
};

export const endShareSession = ({
    sessionKey = "",
    redirectUrl = "",
    logShareFlow,
} = {}) => {
    try {
        if (sessionKey) {
            sessionStorage.setItem(sessionKey, Date.now().toString());
            logShareFlow?.("session_timestamp_refreshed", { sessionKey });
        }
    } catch (error) {
        console.error("Failed to update session storage key", error);
        logShareFlow?.("session_timestamp_refresh_failed", { error: error?.message || "unknown_error" });
    }

    if (redirectUrl) {
        window.location.replace(redirectUrl);
    }
};

export const isFilesOnlySharePlatform = (platformName = "") => {
    const normalizedPlatformName = String(platformName || "")
        .toLowerCase()
        .replace(/\s+/g, "");
    console.log("Checking if platform requires files-only share:", platformName, normalizedPlatformName);
    return FILES_ONLY_PLATFORM_MATCHERS.some((matcher) => normalizedPlatformName.includes(matcher));
};

export const normalizeImageUrls = (images = []) => {
    return (images || [])
        .map((img) => (typeof img === "string" ? img : img?.url))
        .filter(Boolean);
};

export const copyTextFirst = async (textToCopy = "", { logShareFlow } = {}) => {
    logShareFlow?.("copy_text_start", { textLength: (textToCopy || "").length });
    try {
        await navigator.clipboard.writeText(textToCopy || "");
        logShareFlow?.("copy_text_success", { textLength: (textToCopy || "").length });
        return true;
    } catch (error) {
        logShareFlow?.("copy_text_failed", { error: error?.message || "unknown_error" });
        return false;
    }
};

export const detectShareSupport = (files = [], { logShareFlow } = {}) => {
    const hasShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
    let canShareFiles = false;

    if (hasShare && files.length > 0 && typeof navigator.canShare === "function") {
        try {
            canShareFiles = navigator.canShare({ files });
        } catch (error) {
            logShareFlow?.("can_share_files_check_failed", { error: error?.message || "unknown_error" });
        }
    }

    logShareFlow?.("detect_share_support", {
        hasShare,
        hasCanShare: typeof navigator !== "undefined" && typeof navigator.canShare === "function",
        canShareFiles,
        cachedFileCount: files.length,
    });

    return { hasShare, canShareFiles };
};

export const triggerImageDownloadFallback = async (
    imageUrls = [],
    { logShareFlow, downloadDelayMs = 250 } = {}
) => {
    const normalizedUrls = normalizeImageUrls(imageUrls);
    let startedDownloads = 0;
    logShareFlow?.("fallback_download_start", { totalImages: normalizedUrls.length });

    for (let index = 0; index < normalizedUrls.length; index += 1) {
        const url = normalizedUrls[index];
        try {
            const fileExtension = url.split(".").pop()?.split("?")[0] || "jpg";
            const fileName = `image_${index + 1}.${fileExtension}`;
            const proxyUrl = `/api/images/download-image?imageUrl=${encodeURIComponent(url)}&filename=${encodeURIComponent(fileName)}`;
            const link = document.createElement("a");

            link.href = proxyUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            startedDownloads += 1;
            logShareFlow?.("fallback_download_success", { index, fileName });
            await new Promise((resolve) => setTimeout(resolve, downloadDelayMs));
        } catch (error) {
            logShareFlow?.("fallback_download_failed", { index, error: error?.message || "unknown_error" });
        }
    }

    logShareFlow?.("fallback_download_complete", {
        startedDownloads,
        totalImages: normalizedUrls.length,
    });
    return startedDownloads;
};

export const prepareImagesForSharing = async (
    imageUrls = [],
    { setPreparedImageFiles, logShareFlow } = {}
) => {
    const updatePreparedImageFiles = typeof setPreparedImageFiles === "function"
        ? setPreparedImageFiles
        : () => { };

    if (!imageUrls || imageUrls.length === 0) {
        logShareFlow?.("prepare_images_skipped", { reason: "no_images" });
        updatePreparedImageFiles([]);
        return;
    }

    try {
        logShareFlow?.("prepare_images_start", { totalImages: imageUrls.length });
        updatePreparedImageFiles([]);

        const results = new Array(imageUrls.length).fill(null);

        const fetchPromises = imageUrls.map(async (imageUrl, index) => {
            try {
                const url = typeof imageUrl === "string" ? imageUrl : imageUrl?.url || imageUrl;
                if (!url) {
                    return null;
                }

                const fetchUrl = `/api/images/proxy-image?url=${encodeURIComponent(url)}`;
                const response = await fetch(fetchUrl);

                if (!response.ok) {
                    console.error(`Failed to fetch image ${index}: ${response.status}`, url);
                    return null;
                }

                const blob = await response.blob();
                const urlParts = url.split("/");
                const fileName = urlParts[urlParts.length - 1].split("?")[0] || `image_${index + 1}.jpg`;

                let mimeType = blob.type;
                if (!mimeType || mimeType === "application/octet-stream") {
                    const fileExtension = fileName.split(".").pop().toLowerCase();
                    const mimeTypes = {
                        jpg: "image/jpeg",
                        jpeg: "image/jpeg",
                        png: "image/png",
                        gif: "image/gif",
                        webp: "image/webp",
                        mp4: "video/mp4",
                        webm: "video/webm",
                        mov: "video/quicktime",
                        avi: "video/x-msvideo",
                        mkv: "video/x-matroska",
                    };
                    mimeType = mimeTypes[fileExtension] || "image/jpeg";
                }

                const file = new File([blob], fileName, { type: mimeType });
                results[index] = file;

                if (index === 0) {
                    updatePreparedImageFiles(results.filter(Boolean));
                }
                logShareFlow?.("prepare_image_success", { index, fileName });
                return file;
            } catch (error) {
                console.error(`Failed to prepare image ${index}:`, error);
                logShareFlow?.("prepare_image_failed", { index, error: error?.message || "unknown_error" });
                return null;
            }
        });

        await Promise.all(fetchPromises);
        const finalPrepared = results.filter(Boolean);
        updatePreparedImageFiles(finalPrepared);
        logShareFlow?.("prepare_images_complete", {
            totalImages: imageUrls.length,
            preparedImages: finalPrepared.length,
        });
    } catch (error) {
        console.error("Failed to prepare images for sharing:", error);
        logShareFlow?.("prepare_images_failed", { error: error?.message || "unknown_error" });
        updatePreparedImageFiles([]);
    }
};

export const executeShare = async ({
    textToShare = "",
    imageUrls = [],
    skipCopy = false,
    includeTextInNativeShare = true,
    allowTextOnlyNativeShare = true,
    preparedImageFiles = [],
    logShareFlow,
    SHARE_RESULT_STATUS = {},
    copyTextFirstFn = (text) => copyTextFirst(text, { logShareFlow }),
    detectShareSupportFn = (files) => detectShareSupport(files, { logShareFlow }),
    triggerImageDownloadFallbackFn = (urls) => triggerImageDownloadFallback(urls, { logShareFlow }),
    normalizeImageUrlsFn = normalizeImageUrls,
    onImagesStillPreparing = () => { },
    onNativeShareUnsupportedDownloadStarted = () => { },
    onNativeShareUnsupportedTextCopied = () => { },
    onShareCancelled = () => { },
    onShareFailed = () => { },
}) => {
    const sharedStatus = SHARE_RESULT_STATUS?.SHARED || "shared";
    const cancelledStatus = SHARE_RESULT_STATUS?.CANCELLED || "cancelled";
    const failedStatus = SHARE_RESULT_STATUS?.FAILED || "failed";
    const imagesNotReadyStatus = SHARE_RESULT_STATUS?.IMAGES_NOT_READY || "images_not_ready";
    const fallbackDownloadStatus = SHARE_RESULT_STATUS?.FALLBACK_DOWNLOAD || "fallback_download";
    const textOnlyFallbackStatus = SHARE_RESULT_STATUS?.TEXT_ONLY_FALLBACK || "text_only_fallback";

    const normalizedImageUrls = normalizeImageUrlsFn(imageUrls);
    const cachedFiles = (preparedImageFiles || []).filter(Boolean);
    const hasImages = normalizedImageUrls.length > 0;

    logShareFlow?.("execute_share_start", {
        textLength: textToShare.length,
        hasImages,
        totalImageUrls: normalizedImageUrls.length,
        cachedFiles: cachedFiles.length,
        skipCopy,
        includeTextInNativeShare,
        allowTextOnlyNativeShare,
    });

    let copied = true;
    if (!skipCopy) {
        copied = await copyTextFirstFn(textToShare || "");
        if (!copied) {
            logShareFlow?.("execute_share_copy_failed_continue", {});
        }
    }

    if (hasImages && cachedFiles.length === 0) {
        onImagesStillPreparing?.();
        logShareFlow?.("execute_share_images_not_ready", { totalImageUrls: normalizedImageUrls.length });
        return {
            status: imagesNotReadyStatus,
            copied,
        };
    }

    const { hasShare = false, canShareFiles = false } = detectShareSupportFn(cachedFiles) || {};

    if (!hasShare) {
        if (hasImages) {
            const startedDownloads = await triggerImageDownloadFallbackFn(normalizedImageUrls);
            onNativeShareUnsupportedDownloadStarted?.();
            logShareFlow?.("execute_share_fallback_download_used", { startedDownloads });
            return {
                status: fallbackDownloadStatus,
                copied,
                startedDownloads,
            };
        }

        onNativeShareUnsupportedTextCopied?.();
        logShareFlow?.("execute_share_text_only_fallback", {});
        return {
            status: textOnlyFallbackStatus,
            copied,
        };
    }

    try {
        if (canShareFiles && cachedFiles.length > 0) {
            const nativeSharePayload = includeTextInNativeShare
                ? { text: textToShare || "", files: cachedFiles }
                : { files: cachedFiles };

            logShareFlow?.("native_share_with_files_start", { cachedFiles: cachedFiles.length });
            await navigator.share(nativeSharePayload);
            logShareFlow?.("native_share_with_files_success", { cachedFiles: cachedFiles.length });
            return {
                status: sharedStatus,
                copied,
                mode: "files",
                sharedFiles: cachedFiles.length,
            };
        }

        if (hasImages && cachedFiles.length > 0 && !canShareFiles) {
            if (!allowTextOnlyNativeShare) {
                const startedDownloads = await triggerImageDownloadFallbackFn(normalizedImageUrls);
                onNativeShareUnsupportedDownloadStarted?.();
                logShareFlow?.("native_share_files_not_supported_download_fallback", {
                    cachedFiles: cachedFiles.length,
                    startedDownloads,
                });
                return {
                    status: fallbackDownloadStatus,
                    copied,
                    startedDownloads,
                };
            }

            logShareFlow?.("native_share_files_not_supported_use_text", { cachedFiles: cachedFiles.length });
        }

        if (!allowTextOnlyNativeShare) {
            logShareFlow?.("native_share_text_blocked", {
                reason: "text_share_disabled",
                hasImages,
                cachedFiles: cachedFiles.length,
            });
            return {
                status: failedStatus,
                copied,
                reason: "text_share_disabled",
            };
        }

        logShareFlow?.("native_share_text_start", { textLength: textToShare.length });
        await navigator.share({ text: textToShare || "" });
        logShareFlow?.("native_share_text_success", { textLength: textToShare.length });
        return {
            status: sharedStatus,
            copied,
            mode: "text",
        };
    } catch (error) {
        if (error?.name === "AbortError") {
            onShareCancelled?.();
            logShareFlow?.("native_share_cancelled", {});
            return {
                status: cancelledStatus,
                copied,
            };
        }

        onShareFailed?.();
        logShareFlow?.("native_share_failed", { error: error?.message || "unknown_error" });
        return {
            status: failedStatus,
            copied,
            error: error?.message || "unknown_error",
        };
    }
};

// ============================================
// SHARE FLOW FUNCTIONS
// ============================================

export const resolveImageUrlsForShareMode = ({
    imageUrls = [],
    selectedImageIndex = 0,
    shareMode = SHARE_IMAGE_MODE.CURRENT,
}) => {
    const normalizedImageUrls = normalizeImageUrls(imageUrls);

    if (shareMode === SHARE_IMAGE_MODE.ALL) {
        return normalizedImageUrls;
    }

    if (shareMode === SHARE_IMAGE_MODE.CURRENT) {
        const selectedImageUrl = normalizedImageUrls[selectedImageIndex] || normalizedImageUrls[0];
        return selectedImageUrl ? [selectedImageUrl] : [];
    }

    return [];
};

export const createImageStepShareHelper = ({
    executeShare,
    logShareFlow,
}) => {
    const handleImageStepShare = async ({
        imageUrls = [],
        selectedImageIndex = 0,
        shareMode = SHARE_IMAGE_MODE.CURRENT,
    }) => {
        const resolvedImageUrls = resolveImageUrlsForShareMode({
            imageUrls,
            selectedImageIndex,
            shareMode,
        });

        logShareFlow?.("image_step_share_start", {
            shareMode,
            selectedImageIndex,
            totalSelectedImages: resolvedImageUrls.length,
        });

        return executeShare({
            textToShare: "",
            imageUrls: resolvedImageUrls,
            skipCopy: true,
        });
    };

    return {
        handleImageStepShare,
    };
};

export const createShareFlow = ({
    executeShare,
    writeClipboardText,
    openExternalUrl,
    logShareFlow,
    onCopySuccess,
    onCopyFailed,
    SHARE_RESULT_STATUS,
}) => {
    const sharedStatus = SHARE_RESULT_STATUS?.SHARED || "shared";
    const failedStatus = SHARE_RESULT_STATUS?.FAILED || "failed";

    const normalizeUrl = (url = "") => {
        if (!url) return "";
        if (/^https?:\/\//i.test(url)) return url;
        return `https://${url}`;
    };

    const handleOtherPlatformShare = async ({
        textToShare = "",
        imageUrls = [],
        skipCopy = false,
        includeTextInNativeShare = true,
        allowTextOnlyNativeShare = true,
    }) => {
        return executeShare({
            textToShare,
            imageUrls,
            skipCopy,
            includeTextInNativeShare,
            allowTextOnlyNativeShare,
        });
    };

    const handleUrlPlatformShare = async ({ copyText = "", platformUrl = "" }) => {
        try {
            logShareFlow?.("platform_url_copy_start", { textLength: (copyText || "").length });
            await writeClipboardText(copyText || "");
            onCopySuccess?.();
            logShareFlow?.("platform_url_copy_success", {});
        } catch (error) {
            onCopyFailed?.(error);
            logShareFlow?.("platform_url_copy_failed", { error: error?.message || "unknown_error" });
        }

        const finalUrl = normalizeUrl(platformUrl);
        if (finalUrl) {
            openExternalUrl(finalUrl);
            logShareFlow?.("platform_url_opened", { finalUrl });
        }

        return { status: sharedStatus, mode: "url" };
    };

    const handlePlatformShare = async ({
        platformType,
        platformTitle = "",
        textToShare = "",
        copyText = "",
        imageUrls = [],
        platformUrl = "",
        shareOptions = {},
    }) => {
        const useFilesOnlyShare = shareOptions?.filesOnly || isFilesOnlySharePlatform(platformTitle);
        if (useFilesOnlyShare) {
            return handleOtherPlatformShare({
                textToShare,
                imageUrls,
                skipCopy: !shareOptions?.autoCopyText,
                includeTextInNativeShare: false,
                allowTextOnlyNativeShare: shareOptions?.autoCopyText ?? false,
            });
        }

        if (platformType === PLATFORM_TYPE.OTHER) {
            return handleOtherPlatformShare({ textToShare, imageUrls });
        }

        if (platformType === PLATFORM_TYPE.URL) {
            return handleUrlPlatformShare({ copyText, platformUrl });
        }

        return { status: failedStatus, reason: "unsupported_platform_type" };
    };

    return {
        handlePlatformShare,
    };
};
