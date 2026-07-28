import { useEffect, useState } from "react";
import { Typography, Dropdown, Menu, message, Spin, Form } from "antd";
import {
    facebook,
    instagram,
    redNote,
    LogoGoodnite,
    TransalationIcon2,
    GoogleReview,
    OthersIcon,
    ShareAi,
    Background,
} from "../../../../public/assets";
import { Button } from "@/components/ui/button";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import SharePlatformListV2 from "../component/SharePlatformListV2";
import SinglePopUpModal from "@/components/general/popUp/SinglePopUpModal";
import { createVideoFromImages } from "@/utility/videoGenerator";
import { isEmpty, set } from "lodash";
import { useRouter } from "next/router";
import getUserPlatforms from "@/pages/api/platforms/getUserPlatforms";
import {
    parseShareFields,
    formatShareContent,
} from "@/utility/common-functions";
import getRandomBusinessContent from "@/pages/api/content/getRandomeBusinessContent";
import { MEDIA_TYPE, isVideoMedia } from "@/constants/mediaType";
import shareContent from "@/pages/api/content/shareContent";
import getContentProductList from "@/pages/api/content/getContentProductList";
import getLanguages from "@/pages/api/content/getLanguages";
import getBusinessContentById from "@/pages/api/content/getBusinessContentById";
import { CONTENT_STATUS, PLATFORM_NAME, PLATFORM_STATUS, PLATFORM_TYPE } from "@/constant/template";
import getPictureByUserId from "@/pages/api/user/getPictureByUserId";
import { getPlatformIcon } from "@/utility/ImagesFunction";
import getCategoryList from "@/pages/api/content/getCategoryList";
import getProductListByCategory from "@/pages/api/content/getProductListByCategory";
import { detectOS } from "@/utility/detectOS";

const FILES_ONLY_PLATFORM_MATCHERS = ["rednote", "tiktok", "lemon", "yelp"];

const ShareSectionMainPageV3 = () => {
    const [form] = Form.useForm();
    const [langOpen, setLangOpen] = useState(false);
    const { t } = useTranslation();
    const [languageModalOpen, setLanguageModalOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [tempSelectedLanguage, setTempSelectedLanguage] = useState("english");
    const PAGE_SIZE = 10;
    const [loading, setLoading] = useState(false);
    const [shareContentModalOpen, setShareContentModalOpen] = useState(false);
    const [succesfulShareOpen, setsuccessfulShareOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedImage, setSelectedImage] = useState([]);
    const [selectedMediaType, setSelectedMediaType] = useState(MEDIA_TYPE.IMAGE);

    // Pull the active media (image or video) out of a content row returned by the API.
    const pickPreviewMedia = (content) => {
        if (!content) return { mediaType: MEDIA_TYPE.IMAGE, urls: [] };
        const mediaType = isVideoMedia(content.mediaType)
            ? MEDIA_TYPE.VIDEO
            : MEDIA_TYPE.IMAGE;
        const raw =
            mediaType === MEDIA_TYPE.VIDEO
                ? content.videoUrls || []
                : content.imageUrls || [];
        return { mediaType, urls: raw };
    };
    const [categoryList, setCategoryList] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [preparedImageFiles, setPreparedImageFiles] = useState([]);
    const [selectedContent, setSelectedContent] = useState(null);
    const [viewContentAgainOpen, setViewContentAgainOpen] = useState(false);
    const [formatContent, setFormatContent] = useState("");
    const [parsedContentText, setParsedContentText] = useState("");
    const [backgroundPicture, setBackgroundPicture] = useState(Background);
    const [profilePicture, setProfilePicture] = useState(ShareAi);
    const [productOptions, setProductOptions] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const router = useRouter();

    // router query values
    const queryUserId =
        router.isReady && router.query?.userId
            ? String(router.query.userId)
            : null;

    const defaultLanguageOptions = [
        { key: "english", label: "EN" },
        { key: "chinese", label: "中" },
        { key: "malay", label: "Melayu" },
    ];
    const [languageOptions, setLanguageOptions] = useState(defaultLanguageOptions);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [contentNotFoundOpen, setContentNotFoundOpen] = useState(false);
    const [platformList, setPlatformList] = useState([]);
    const [platformsFetchState, setPlatformsFetchState] = useState("loading");
    const [expiredModalOpen, setExpiredModalOpen] = useState(false);
    const [waitingForApp, setWaitingForApp] = useState(false);
    // const [sessionTimeoutOpen, setSessionTimeoutOpen] = useState(false);
    // const SESSION_LIMIT = 2 * 60 * 1000;

    // const endSessionNow = () => {
    //     try {
    //         // Build the session storage key scoped to the current URL path
    //         const sessionKey = `share_session_v2_${router.asPath || ""}`;
    //         // Back-date the start time so the session appears already expired on next load
    //         const expiredStartTime = Date.now() - SESSION_LIMIT;
    //         sessionStorage.setItem(sessionKey, expiredStartTime.toString());
    //     } catch (error) {
    //         console.error("End session error:", error);
    //     }
    //
    //     // Show the session timeout modal and clear the platform list
    //     setSessionTimeoutOpen(true);
    //     setPlatformList([]);
    //     setPlatformsFetchState("ready");
    // };

    const fetchCategories = async (language) => {
        try {
            setCategoryLoading(true);
            const res = await getCategoryList("all", 0, {
                outletUserId: queryUserId,
                language: language,
                isShared: 0,
                status: CONTENT_STATUS.ACTIVE,
            });

            const categories = res?.data || [];

            if (categories.length === 0) {
                setContentNotFoundOpen(true);
                setCategoryList([]);
                setSelectedCategoryId(null);
                return null;
            }

            setCategoryList(categories);
            return categories;
        } catch (err) {
            console.error("fetchCategories failed", err);
            setContentNotFoundOpen(true);
            setCategoryList([]);
            setSelectedCategoryId(null);
            return null;
        } finally {
            setCategoryLoading(false);
        }
    };

    const fetchProductListByCategory = async (categoryId, outletUserId, language) => {
        try {
            setLoading(true);
            const resProduct = await getProductListByCategory("all", 0, {
                categoryId: categoryId,
                isShared: 0,
                outletUserId: outletUserId,
                status: CONTENT_STATUS.ACTIVE,
                language: language,
                sort: JSON.stringify({ "createdAt": 1 }),
            });

            const products = resProduct?.data || [];
            if (!products || isEmpty(products)) {
                setContentNotFoundOpen(true);
                return null;
            }
            if (products) {
                const options = products.map((product) => ({
                    title: product?.officialProductName,
                    value: product.productId,
                }));
                // Set options and default selection
                const firstProductId = products[0]?.productId;
                if (firstProductId) {
                    setSelectedProductId(firstProductId);
                }
                setProductOptions(options);
            }
            setLoading(false);
            return products;
        } catch (err) {
            console.error("fetchProductListByCategory failed", err);
            setContentNotFoundOpen(true);
            setLoading(false);
            return null;
        }
    }

    const fetchContentForProduct = async (productId, language) => {
        try {
            setLoading(true);
            const res = await getRandomBusinessContent(1, 0, {
                userId: queryUserId,
                language: language,
                productId: productId,
            });

            const content = res?.data?.content || "";

            if (!content || isEmpty(content)) {
                setContentNotFoundOpen(true);
                return null;
            }

            const { mediaType, urls } = pickPreviewMedia(res?.data?.content);
            setSelectedMediaType(mediaType);
            setSelectedImage(urls);
            setSelectedRecord(res?.data?.content);

            await prepareImagesForSharing(urls);
            return res?.data?.content;
        } catch (e) {
            console.error("fetchContentForProduct failed", e);
            setContentNotFoundOpen(true);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageSelectionFlow = async (language, shouldOpenModal = true) => {
        // For multiple platforms, wait for user to select platform first
        if (platformList && platformList.length > 1) {
            return;
        }

        // Single platform - proceed with content fetch
        setSelectedCategoryId(null);

        const categories = await fetchCategories(language);
        if (!categories || categories.length === 0) {
            return;
        }

        const firstCategoryId = categories[0].categoryId;
        setSelectedCategoryId(firstCategoryId);

        const products = await fetchProductListByCategory(firstCategoryId, queryUserId, language);
        if (!products || products.length === 0) {
            return;
        }
        const firstProductId = products[0].productId;
        setSelectedProductId(firstProductId);

        const content = await fetchContentForProduct(firstProductId, language);
        if (!content) {
            return;
        }
        setShareContentModalOpen(true);

        // Open share modal for single platform
        if (shouldOpenModal) {
            setShareContentModalOpen(true);
        }
    };

    const fetchContentById = async (outletUserId, language, contentId, imageUrls) => {
        try {
            const formattedImageUrls = Array.isArray(imageUrls)
                ? imageUrls.map((url) =>
                    typeof url === "string" ? url : url?.url || url
                )
                : [];

            const res = await getBusinessContentById(1, 0, {
                outletUserId,
                language,
                contentId,
                imageUrls: formattedImageUrls,
            });

            setSelectedContent(res?.data?.content);
            const { mediaType, urls } = pickPreviewMedia(res?.data?.content);
            const mediaToPrepare = urls.length > 0 ? urls : formattedImageUrls;
            setSelectedMediaType(mediaType);
            await prepareImagesForSharing(mediaToPrepare);
        } catch (err) {
            console.error("fetchContentById failed", err);
        }
    };

    const prepareImagesForSharing = async (imageUrls) => {
        if (!imageUrls || imageUrls.length === 0) {
            setPreparedImageFiles([]);
            return;
        }

        try {
            setLoading(true);

            const fetchPromises = imageUrls.map(async (imageUrl, index) => {
                try {
                    const url =
                        typeof imageUrl === "string" ? imageUrl : imageUrl?.url || imageUrl;

                    const proxyUrl = `/api/images/proxy-image?url=${encodeURIComponent(url)}`;
                    const response = await fetch(proxyUrl);

                    if (!response.ok) {
                        console.error(`Failed to fetch image ${index}: ${response.status}`, url);
                        return null;
                    }

                    const blob = await response.blob();
                    const urlParts = url.split("/");
                    const fileName =
                        urlParts[urlParts.length - 1].split("?")[0] || `image_${index + 1}.jpg`;

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
                            mov: "video/quicktime",
                            webm: "video/webm",
                            m4v: "video/x-m4v",
                            avi: "video/x-msvideo",
                        };
                        mimeType = mimeTypes[fileExtension] || "image/jpeg";
                    }

                    return new File([blob], fileName, { type: mimeType });
                } catch (error) {
                    console.error(`Failed to prepare image ${index}:`, error);
                    return null;
                }
            });

            const files = (await Promise.all(fetchPromises)).filter(Boolean);

            // // If more than 1 file and all are images, generate a video
            // if (files.length > 1) {
            //     const isAllImages = files.every((f) => f.type.startsWith("image"));
            //     if (isAllImages) {
            //         try {
            //             const videoFile = await createVideoFromImages(files);
            //             if (videoFile) {
            //                 setPreparedImageFiles([videoFile]);
            //                 return;
            //             }
            //         } catch (videoError) {
            //             console.error("Failed to generate video from images", videoError);
            //         }
            //     }
            // }

            setPreparedImageFiles(files);
        } catch (error) {
            console.error("Failed to prepare images for sharing:", error);
            setPreparedImageFiles([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePlatformShare = async (platformName, selectedLanguage) => {
        setLoading(true);
        try {
            const platformMeta = (platformList || []).find(
                (p) => p.name === platformName
            ) || { name: platformName, title: platformName };

            setSelectedPlatform(platformMeta);
            setSelectedCategoryId(null);

            // Fetch categories
            const categories = await fetchCategories(selectedLanguage);
            if (!categories || categories.length === 0) {
                return;
            }

            // Always use the first category
            const categoryIdToUse = categories[0]?.categoryId;
            setSelectedCategoryId(categoryIdToUse);

            // Fetch products for this category
            const products = await fetchProductListByCategory(categoryIdToUse, queryUserId, selectedLanguage);
            if (!products || products.length === 0) {
                return;
            }

            const productIdToUse = products[0]?.productId;
            setSelectedProductId(productIdToUse);
            // Fetch content
            const content = await fetchContentForProduct(productIdToUse, selectedLanguage);
            if (!content) {
                return;
            }

            setShareContentModalOpen(true);
        } catch (e) {
            console.error("handlePlatformShare error:", e);
            setContentNotFoundOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = async (categoryId) => {
        setSelectedCategoryId(categoryId);

        // Fetch products for the new category
        const products = await fetchProductListByCategory(categoryId, queryUserId, selectedLanguage);

        if (products && products.length > 0) {
            // Automatically select the first product
            const firstProductId = products[0]?.productId;
            setSelectedProductId(firstProductId);

            await fetchContentForProduct(firstProductId, selectedLanguage);
        }
    };

    const handleProductChange = async (productId) => {
        setSelectedProductId(productId);
        await fetchContentForProduct(productId, selectedLanguage);
    };

    //Handle shuffle (get another random content for same productId)

    const handleShuffle = async () => {
        setLoading(true);
        try {
            const res = await getRandomBusinessContent(1, 0, {
                userId: queryUserId,
                language: selectedLanguage,
                productId: selectedProductId,
            });

            const content = res?.data?.content || "";

            if (!content || isEmpty(content)) {
                message.warning(t("noMoreContent", sourceKey.user) || "No more content available");
                return;
            }

            const { mediaType, urls } = pickPreviewMedia(res?.data?.content);
            setSelectedMediaType(mediaType);
            setSelectedImage(urls);
            setSelectedRecord(res?.data?.content);
            await prepareImagesForSharing(urls);
        } catch (e) {
            console.error("Shuffle failed", e);
            message.error(e?.message || t("failedToLoadContent", sourceKey.user) || "Failed to load content");
        } finally {
            setLoading(false);
        }
    };

    // Fetch available languages for user
    const fetchLanguageOptions = async () => {
        try {
            const res = await getLanguages(10, 0, {
                userId: queryUserId,
            });

            const available = res?.data?.languagesAvailable || [];

            if (isEmpty(available)) {
                setLanguageOptions(defaultLanguageOptions);
                setContentNotFoundOpen(true);
                setLanguageModalOpen(false);
                return;
            }

            const lower = available.map((s) => String(s).toLowerCase());
            const options = [];

            if (lower.some((s) => s.includes("eng"))) {
                const opt = defaultLanguageOptions.find((o) => o.key === "english");
                if (opt) options.push(opt);
            }
            if (lower.some((s) => s.includes("chi") || s.includes("zh"))) {
                const opt = defaultLanguageOptions.find((o) => o.key === "chinese");
                if (opt) options.push(opt);
            }
            if (lower.some((s) => s.includes("mal") || s.includes("ms"))) {
                const opt = defaultLanguageOptions.find((o) => o.key === "malay");
                if (opt) options.push(opt);
            }

            const finalOptions = options.length === 0 ? defaultLanguageOptions : options;

            setLanguageOptions(finalOptions);
            setTempSelectedLanguage(finalOptions[0]?.key || "english");
            setContentNotFoundOpen(false);

            // Open language modal after processing
            setLanguageModalOpen(false);
            setTimeout(() => setLanguageModalOpen(true), 50);
        } catch (err) {
            setLanguageOptions(defaultLanguageOptions);
            setContentNotFoundOpen(true);
            setLanguageModalOpen(false);
            console.error("fetchLanguageOptions failed", err);
        }
    };

    // Handle share action and track it
    const handleShareClick = async () => {
        try {
            setLoading(true);
            await shareContent({
                contentId: selectedRecord?._id,
                platform: selectedPlatform?.title,
                platformId: selectedPlatform?.platformId,
            });
        } finally {
            setLoading(false);
        }
    };

    // Resolves true if the browser goes to background (app opened) within timeoutMs, false otherwise.
    // The 500ms settle delay lets transient blur/visibility events from the share sheet closing pass before we listen.
    const waitForAppOpen = (timeoutMs = 10000) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (document.hidden) {
                    resolve(true);
                    return;
                }

                let timer = null;
                let resolved = false;

                const done = (opened) => {
                    if (resolved) return;
                    resolved = true;
                    clearTimeout(timer);
                    document.removeEventListener("visibilitychange", onVisibilityChange);
                    window.removeEventListener("blur", onBlur);
                    resolve(opened);
                };

                const onBlur = () => done(true);
                const onVisibilityChange = () => {
                    if (document.hidden) done(true);
                };

                window.addEventListener("blur", onBlur, { once: true });
                document.addEventListener("visibilitychange", onVisibilityChange);
                timer = setTimeout(() => done(false), timeoutMs);
            }, 500);
        });
    };

    // Handle share flow based on platform type
    const executeShare = async (content, isViewAgain = false) => {
        const platform = selectedPlatform || (platformList && platformList[0]);
        const type = platform?.type || "";
        const contentToShare = isViewAgain ? selectedContent : content;
        const textToShare = isViewAgain ? parsedContentText : formatContent;

        // iOS-specific handling for files-only platforms (rednote, tiktok, lemon, yelp, etc.)
        const os = detectOS();
        const isIOS = os === "iOS";
        const platformName = (platform?.name || "").toLowerCase();
        const isFilesOnlyPlatform = FILES_ONLY_PLATFORM_MATCHERS.some((matcher) =>
            platformName.includes(matcher)
        );

        if (isIOS && isFilesOnlyPlatform) {
            const formattedContent = formatShareContent(contentToShare);
            if (isViewAgain) {
                setParsedContentText(formattedContent);
            } else {
                setFormatContent(formattedContent);
            }

            // Auto-copy text to clipboard
            try {
                await navigator.clipboard.writeText(formattedContent);
            } catch (clipErr) {
                console.error("Clipboard write failed:", clipErr);
            }

            let navigatorShareResolved = false;
            let userCancelled = false;
            if (navigator.share) {
                try {
                    const hasFiles = preparedImageFiles && preparedImageFiles.length > 0;
                    const filesShareable = hasFiles && navigator.canShare?.({ files: preparedImageFiles });
                    if (filesShareable) {
                        await navigator.share({ files: preparedImageFiles });
                    } else {
                        await navigator.share({ text: formattedContent });
                    }
                    navigatorShareResolved = true;
                } catch (shareErr) {
                    if (shareErr.name === "AbortError") {
                        userCancelled = true;
                    } else {
                        console.error("Files-only share failed:", shareErr);
                    }
                }
            }

            return { usedNavigator: navigatorShareResolved, cancelled: userCancelled };
        }

        if (type === PLATFORM_TYPE.OTHER) {
            const formattedContent = formatShareContent(contentToShare);
            if (isViewAgain) {
                setParsedContentText(formattedContent);
            } else {
                setFormatContent(formattedContent);
            }

            let navigatorShareResolved = false;
            let userCancelled = false;
            if (navigator.share) {
                try {
                    await navigator.clipboard.writeText(formattedContent);
                    const hasFiles = preparedImageFiles && preparedImageFiles.length > 0;
                    const filesShareable = hasFiles && navigator.canShare?.({ files: preparedImageFiles });

                    if (filesShareable) {
                        try {
                            await navigator.share({ files: preparedImageFiles, text: formattedContent });
                            navigatorShareResolved = true;
                        } catch (fileShareErr) {
                            if (fileShareErr.name === "AbortError") {
                                userCancelled = true;
                            } else {
                                // File share failed — fall back to text-only
                                await navigator.share({ text: formattedContent });
                                navigatorShareResolved = true;
                            }
                        }
                    } else if (!userCancelled) {
                        await navigator.share({ text: formattedContent });
                        navigatorShareResolved = true;
                    }
                } catch (err) {
                    if (err.name === "AbortError") {
                        userCancelled = true;
                    } else {
                        try {
                            await navigator.clipboard.writeText(formattedContent);
                        } catch (clipErr) {
                            console.error("Clipboard fallback failed:", clipErr);
                        }
                    }
                }
            } else {
                // Desktop: copy text and download media files
                try {
                    await navigator.clipboard.writeText(formattedContent);
                    message.success(t("copiedToClipboard", sourceKey.user) || "Copied");
                } catch (clipErr) {
                    console.error("Clipboard fallback failed:", clipErr);
                }
                if (preparedImageFiles && preparedImageFiles.length > 0) {
                    preparedImageFiles.forEach((file) => {
                        const blobUrl = URL.createObjectURL(file);
                        const a = document.createElement("a");
                        a.href = blobUrl;
                        a.download = file.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                    });
                }
            }
            return { usedNavigator: navigatorShareResolved, cancelled: userCancelled };
        } else if (type === PLATFORM_TYPE.URL) {
            try {
                await navigator.clipboard.writeText(contentToShare?.contentText || "");
                message.success(t("copiedToClipboard", sourceKey.user) || "Copied");
            } catch (e) {
                console.error("clipboard write failed", e);
                message.error(t("copyFailed", sourceKey.user) || "Copy failed");
            }

            const url = platform?.url;
            if (url) {
                try {
                    let finalUrl = url;
                    if (!/^https?:\/\//i.test(finalUrl)) {
                        finalUrl = "https://" + finalUrl;
                    }
                    window.open(finalUrl, "_blank");
                } catch (e) {
                    console.error("open url failed", e);
                }
            }
        }

        return { usedNavigator: false };
    };

    // ============================================
    // LANGUAGE MENU
    // ============================================

    const languageMenu = (
        <Menu
            style={{ background: "rgba(255,255,255,0.8)" }}
            selectedKeys={[selectedLanguage]}
        >
            {languageOptions.map((opt) => (
                <Menu.Item
                    key={opt.key}
                    onClick={async () => {
                        setLangOpen(false);
                        setSelectedLanguage(opt.key);
                        await handleLanguageSelectionFlow(opt.key);
                    }}
                    className={
                        selectedLanguage === opt.key ? "ant-menu-item-selected" : ""
                    }
                >
                    {opt.label}
                </Menu.Item>
            ))}
        </Menu>
    );

    // Sync form field with selectedProductId when it changes
    useEffect(() => {
        if (selectedProductId) {
            form.setFieldsValue({ productId: selectedProductId });
        }
    }, [selectedProductId, form]);

    // iOS Safari bfcache fix: force a clean reload when Safari restores the page from cache
    useEffect(() => {
        const handlePageShow = (event) => {
            const isBackForward =
                event.persisted ||
                window.performance?.getEntriesByType("navigation")[0]?.type === "back_forward";

            if (isBackForward) {
                window.location.reload();
            }
        };

        window.addEventListener("pageshow", handlePageShow);
        return () => {
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, []);

    // // Detect iOS Safari tab reuse via URL timestamp and force a fresh session when needed
    // useEffect(() => {
    //     if (!router.isReady) return;
    //
    //     const detectTabReuse = () => {
    //         const urlParams = new URLSearchParams(window.location.search);
    //         const urlTimestamp = urlParams.get("t"); // optional timestamp embedded in QR URL
    //         const sessionKey = `share_session_v2_${router.asPath}`;
    //         const tabIdKey = `share_tab_id_${router.asPath}`;
    //
    //         const currentTabId = Math.random().toString(36).substring(2, 15);
    //         const storedTabId = sessionStorage.getItem(tabIdKey);
    //         const storedSessionStart = sessionStorage.getItem(sessionKey);
    //
    //         // Case 1: URL carries a timestamp — treat as a fresh scan
    //         if (urlTimestamp) {
    //             const urlTime = parseInt(urlTimestamp, 10);
    //             const now = Date.now();
    //             if (storedSessionStart && now - urlTime > 5000) {
    //                 sessionStorage.clear();
    //                 sessionStorage.setItem(tabIdKey, currentTabId);
    //                 sessionStorage.setItem(sessionKey, now.toString());
    //                 return;
    //             }
    //         }
    //
    //         // Case 2: Existing session but no tab ID — first time this fix runs
    //         if (storedSessionStart && !storedTabId) {
    //             sessionStorage.setItem(tabIdKey, currentTabId);
    //             return;
    //         }
    //
    //         // Case 3: Tab ID mismatch indicates a reused tab; reset the session
    //         if (
    //             storedTabId &&
    //             storedTabId !== currentTabId &&
    //             !sessionStorage.getItem(`tab_id_set_${router.asPath}`)
    //         ) {
    //             sessionStorage.clear();
    //             sessionStorage.setItem(tabIdKey, currentTabId);
    //             sessionStorage.setItem(sessionKey, Date.now().toString());
    //             return;
    //         }
    //
    //         // Case 4: Fresh tab — initialise tab tracking
    //         if (!storedTabId) {
    //             sessionStorage.setItem(tabIdKey, currentTabId);
    //             sessionStorage.setItem(`tab_id_set_${router.asPath}`, "true");
    //         }
    //     };
    //
    //     try {
    //         detectTabReuse();
    //     } catch (error) {
    //         console.error("Tab reuse detection failed:", error);
    //     }
    // }, [router.isReady, router.asPath]);

    useEffect(() => {
        if (!queryUserId) {
            if (router.isReady) {
                setPlatformList([]);
                setPlatformsFetchState("ready");
            }
            return;
        }

        const expiredDateParam = router.query?.expiredDate;
        if (expiredDateParam) {
            const parsed = Date.parse(expiredDateParam);
            if (!isNaN(parsed) && parsed < Date.now()) {
                setExpiredModalOpen(true);
                setPlatformList([]);
                setPlatformsFetchState("ready");
                return;
            }
        }

        // // 2 Minutes Session Countdown Logic
        // let timerId;
        // try {
        //     const now = Date.now();
        //
        //     // This ensures that each unique QR code (with distinct timestamp/ID) gets its own fresh 2-minute window
        //     const sessionKey = `share_session_v2_${router.asPath}`;
        //     let startTime = sessionStorage.getItem(sessionKey);
        //
        //     if (!startTime) {
        //         startTime = now.toString();
        //         sessionStorage.setItem(sessionKey, startTime);
        //     }
        //
        //     const elapsed = now - parseInt(startTime, 10);
        //
        //     if (elapsed >= SESSION_LIMIT) {
        //         setSessionTimeoutOpen(true);
        //         setPlatformList([]);
        //         setPlatformsFetchState("ready");
        //         return;
        //     } else {
        //         timerId = setTimeout(() => {
        //             setSessionTimeoutOpen(true);
        //             setPlatformList([]);
        //             setPlatformsFetchState("ready");
        //         }, SESSION_LIMIT - elapsed);
        //     }
        // } catch (error) {
        //     console.error("Session timer error:", error);
        // }

        // Get language options
        fetchLanguageOptions();

        // Fetch profile and background pictures
        getPictureByUserId(0, 0, { userId: queryUserId })
            .then((res) => {
                const background = res?.data?.businessInfo?.backgroundImageUrl || Background;
                setBackgroundPicture(background);
                const profile = res?.data?.businessInfo?.profilePictureUrl || ShareAi;
                setProfilePicture(profile);
            })
            .catch((err) => {
                console.error("getPictureByUserId failed", err);
                setBackgroundPicture(Background);
                setProfilePicture(ShareAi);
            });

        // Fetch user platforms
        setPlatformsFetchState("loading");
        setPlatformList([]);
        getUserPlatforms(100, 0, { userId: queryUserId })
            .then((res) => {
                const userPlatforms = res?.userPlatforms || [];
                const activePlatforms = userPlatforms.filter(
                    (p) => p.status === PLATFORM_STATUS.ACTIVE
                );

                if (activePlatforms.length === 0) {
                    setContentNotFoundOpen(true);
                    setPlatformList([]);
                    return;
                }

                const list = activePlatforms.map((p, idx) => ({
                    id: idx,
                    platformId: p.platformId,
                    title: p.title,
                    name: String(p.title).toLowerCase().replace(/\s+/g, ""),
                    url: p.url || "",
                    status: p.status,
                    icon: getPlatformIcon(p.title),
                    type: p.type,
                }));

                const sortedList = list.sort((a, b) => {
                    const titleA = a.title;
                    const titleB = b.title;

                    if (titleA === PLATFORM_NAME.GOOGLE_REVIEW) return -1;
                    if (titleB === PLATFORM_NAME.GOOGLE_REVIEW) return 1;

                    if (titleA === PLATFORM_NAME.OTHERS) return 1;
                    if (titleB === PLATFORM_NAME.OTHERS) return -1;

                    return 0;
                });

                setPlatformList(sortedList);

                if (sortedList.length === 1) {
                    setSelectedPlatform(sortedList[0]);
                }
            })
            .catch((err) => {
                console.error("getUserPlatforms failed", err);
                setContentNotFoundOpen(true);
            })
            .finally(() => {
                setPlatformsFetchState("ready");
            });

        // return () => {
        //     if (timerId) clearTimeout(timerId);
        // };
    }, [queryUserId, router.isReady]);

    return (
        <>
            {/* Language Modal */}
            <SinglePopUpModal
                type="chooseLanguage"
                open={languageModalOpen}
                height={"auto"}
                closeable={false}
                onClose={() => setLanguageModalOpen(false)}
                extraData={{
                    selected: tempSelectedLanguage,
                    onSelect: setTempSelectedLanguage,
                    languageOptions,
                }}
                confirmBtn1={async () => {
                    setSelectedLanguage(tempSelectedLanguage);
                    setLanguageModalOpen(false);
                    await handleLanguageSelectionFlow(tempSelectedLanguage);
                }}
            />

            {/* Share Content Modal */}
            <SinglePopUpModal
                type="shareContent"
                open={shareContentModalOpen}
                onClose={() => setShareContentModalOpen(false)}
                closeable={true}
                height={"auto"}
                modalLoading={loading}
                form={form}
                extraData={{
                    selectedRecord: selectedRecord,
                    previewImage: selectedImage,
                    mediaType: selectedMediaType,
                    categoryList: categoryList,
                    selectedCategoryId: selectedCategoryId,
                    onCategoryChange: handleCategoryChange,
                    categoryLoading: categoryLoading,
                    onProductChange: handleProductChange,
                    selectedProductId: selectedProductId,
                    productOptions: productOptions,
                }}
                onShuffle={handleShuffle}
                confirmBtn1={async () => {
                    const result = await executeShare(selectedRecord, false);
                    if (result?.cancelled) return;
                    handleShareClick();
                    setShareContentModalOpen(false);
                    if (result?.usedNavigator) {
                        setWaitingForApp(true);
                        const appOpened = await waitForAppOpen(10000);
                        setWaitingForApp(false);
                        if (appOpened) {
                            setsuccessfulShareOpen(true);
                        } else {
                            message.warning(
                                t("connectionIssueRetry", sourceKey.user) ||
                                "Internet may be unstable. Please try sharing again."
                            );
                            setSelectedContent(selectedRecord);
                            setViewContentAgainOpen(true);
                        }
                    } else {
                        setsuccessfulShareOpen(true);
                    }
                }}
            />

            {/* Successful Share Modal */}
            <SinglePopUpModal
                type="successfulShare"
                open={succesfulShareOpen && !waitingForApp}
                height={"auto"}
                closeable={false}
                confirmBtn1={() => {
                    setsuccessfulShareOpen(false);
                    // window.location.href = "https://itscreative.biz/ishare";
                    // endSessionNow();
                }}
                confirmBtn2={() => {
                    fetchContentById(
                        queryUserId,
                        selectedLanguage,
                        selectedRecord?._id,
                        selectedImage
                    );
                    setViewContentAgainOpen(true);
                    setsuccessfulShareOpen(false);
                }}
            />

            {/* Content Not Found Modal */}
            <SinglePopUpModal
                type="contentNotFound"
                open={contentNotFoundOpen}
                height={"auto"}
                onClose={() => setContentNotFoundOpen(false)}
                closeable={true}
                confirmBtn1={() => {
                    setContentNotFoundOpen(false);
                    // window.location.href = "https://itscreative.biz/ishare";
                }}
            />

            {/* Expired Modal */}
            <SinglePopUpModal
                type="expiredShare"
                open={expiredModalOpen}
                closeable={false}
                onClose={() => setExpiredModalOpen(false)}
                confirmBtn1={() => {
                    setExpiredModalOpen(false);
                    if (window.opener) {
                        window.close();
                    } else {
                        // window.location.href = "https://itscreative.biz/ishare";
                    }
                }}
            />

            {/* Session Timeout Modal */}
            {/* <SinglePopUpModal
                type="sessionTimeout"
                open={sessionTimeoutOpen}
                closeable={false}
                confirmBtn1={() => {
                    setSessionTimeoutOpen(false);
                    // window.location.href = "https://itscreative.biz/ishare";
                }}
            /> */}

            {/* View Content Again Modal */}
            <SinglePopUpModal
                type="viewContentAgain"
                open={viewContentAgainOpen}
                height={"auto"}
                closeable={false}
                extraData={{
                    selectedRecord: selectedContent,
                    previewImage: isVideoMedia(selectedContent?.mediaType)
                        ? selectedContent?.videoUrls
                        : selectedContent?.imageUrls,
                    mediaType: isVideoMedia(selectedContent?.mediaType)
                        ? MEDIA_TYPE.VIDEO
                        : MEDIA_TYPE.IMAGE,
                }}
                confirmBtn1={async () => {
                    const result = await executeShare(selectedContent, true);
                    if (result?.cancelled) return;
                    setViewContentAgainOpen(false);
                    if (result?.usedNavigator) {
                        setLoading(true);
                        setWaitingForApp(true);
                        const appOpened = await waitForAppOpen(10000);
                        setLoading(false);
                        setWaitingForApp(false);
                        if (appOpened) {
                            setsuccessfulShareOpen(true);
                        } else {
                            message.warning(
                                t("connectionIssueRetry", sourceKey.user) ||
                                "Internet may be unstable. Please try sharing again."
                            );
                            setViewContentAgainOpen(true);
                        }
                    } else {
                        setsuccessfulShareOpen(true);
                    }
                }}
            />

            {/* Header Section with Logo */}
            <div
                style={{
                    height: 150,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "visible",
                }}
            >
                {/* Background Picture */}
                <img
                    src={backgroundPicture || Background}
                    alt="Header background"
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        zIndex: 0,
                    }}
                />
                {/* Darken Background Picture */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.35) 100%)",
                        zIndex: 1,
                    }}
                />
                {/* Language Dropdown */}
                <div style={{ position: "absolute", top: 16, right: 16, zIndex: 3 }}>
                    <Dropdown
                        overlay={languageMenu}
                        trigger={["click"]}
                        open={langOpen}
                        onOpenChange={setLangOpen}
                        placement="bottomRight"
                    >
                        <Button variant="white" width={32} height={32}>
                            <img src={TransalationIcon2} alt="Language" />
                        </Button>
                    </Dropdown>
                </div>

                <div>
                    {/* Logo */}
                    <img
                        src={profilePicture || ShareAi}
                        alt="Profile"
                        style={{
                            height: 120,
                            width: 120,
                            borderRadius: "100%",
                            position: "absolute",
                            left: "50%",
                            top: "100%",
                            transform: "translate(-50%, -50%)",
                            zIndex: 3,
                        }}
                    />
                </div>
            </div>

            {waitingForApp && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(255,255,255,0.92)",
                        zIndex: 9999,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 16,
                    }}
                >
                    <Spin size="large" />
                    <span style={{ color: "#555", fontSize: 15 }}>
                        {t("waitingToOpenApp", sourceKey.user) || "Waiting to open the app..."}
                    </span>
                </div>
            )}

            <Spin
                spinning={loading || platformsFetchState === "loading"}
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1000,
                }}
            >
                <div className="py-10 px-3 flex flex-col items-center w-full">
                    <div className="w-screen max-w-full px-0 flex flex-col items-center">
                        <div className="pt-5 w-full">
                            {platformsFetchState !== "ready" ? (
                                <div className="text-center text-gray-500 py-10">
                                    {t("loading", sourceKey.user) || "Loading..."}
                                </div>
                            ) : isEmpty(platformList) ? (
                                <div className="text-center text-gray-500 py-10">
                                    {t("noAvailableContent", sourceKey.user)}
                                </div>
                            ) : (
                                <SharePlatformListV2
                                    platforms={platformList}
                                    onShareClick={(platform) =>
                                        handlePlatformShare(platform.name, selectedLanguage)
                                    }
                                    loading={loading}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </Spin>
        </>
    );
};

export default ShareSectionMainPageV3;