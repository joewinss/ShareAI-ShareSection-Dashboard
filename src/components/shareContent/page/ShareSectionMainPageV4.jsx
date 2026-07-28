import { useEffect, useRef, useState } from "react";
import { message, Spin } from "antd";
import { isEmpty } from "lodash";
import { Share2 } from "lucide-react";
import { useRouter } from "next/router";
import { Background, ShareAi } from "../../../../public/assets";
import SinglePopUpModal from "@/components/general/popUp/SinglePopUpModal";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import getUserPlatforms from "@/pages/api/platforms/getUserPlatforms";
import getPictureByUserId from "@/pages/api/user/getPictureByUserId";
import getLanguages from "@/pages/api/content/getLanguages";
import getCategoryList from "@/pages/api/content/getCategoryList";
import getProductListByCategory from "@/pages/api/content/getProductListByCategory";
import getRandomBusinessContent from "@/pages/api/content/getRandomeBusinessContent";
import shareContent from "@/pages/api/content/shareContent";
import createMerchantDrawEntry from "@/pages/api/merchantDraw/public/createMerchantDrawEntry";
import { isMerchantDrawAvailable } from "@/components/shareContent/utils/merchantDrawAvailability";
import { CONTENT_STATUS, PLATFORM_NAME, PLATFORM_STATUS } from "@/constant/template";
import { MEDIA_TYPE } from "@/constants/data";
import { getPlatformIcon } from "@/utility/ImagesFunction";
import { parseShareFields } from "@/utility/content-function";
import { detectOS } from "@/utility/detectOS";
import client from "../../../../env";
import {
    getGuideCopy,
    ReferenceGuideOverlay,
    useReferenceGuidePosition,
} from "@/components/shareContent/component/ReferenceGuideCursor";
import {
    AUTO_COPY_TEXT_OS,
    SHARE_IMAGE_MODE,
    buildShareDescription,
    createShareFlow,
    executeShare,
    isFilesOnlySharePlatform,
    normalizeImageUrls,
    prepareImagesForSharing,
    resolveImageUrlsForShareMode,
} from "@/utility/shareFlow";

const SHARE_RESULT_STATUS = {
    SHARED: "shared",
    CANCELLED: "cancelled",
    FAILED: "failed",
    IMAGES_NOT_READY: "images_not_ready",
    FALLBACK_DOWNLOAD: "fallback_download",
    TEXT_ONLY_FALLBACK: "text_only_fallback",
};

const normalizeGuidedCategory = (category = {}) => ({
    ...category,
    productId: category.productId || category.categoryId || category.id,
    productName:
        category.productName ||
        category.categoryName ||
        category.name ||
        category.title ||
        "",
});

const buildEditableShareText = (content) => {
    const parsed = parseShareFields(buildShareDescription(content));
    return parsed?.shareText || content?.contentText || "";
};

const resolveContentMediaUrls = (content = {}) => {
    const imageUrls = content.imageUrls || [];
    const videoUrls = content.videoUrls || [];
    if (content.mediaType === MEDIA_TYPE.VIDEO) {
        return videoUrls.length > 0 ? videoUrls : imageUrls;
    }
    return imageUrls;
};

const { consiChatPhoneNumber } = client.uri;

const ShareSectionMainPageV4 = () => {
    const router = useRouter();
    const { t } = useTranslation();

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
    const [selectedLanguage, setSelectedLanguage] = useState(null);

    const [loading, setLoading] = useState(false);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [waitingForApp, setWaitingForApp] = useState(false);
    const [platformsFetchState, setPlatformsFetchState] = useState("loading");

    const [platformList, setPlatformList] = useState([]);
    const [selectedPlatform, setSelectedPlatform] = useState(null);

    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedImage, setSelectedImage] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [productOptions, setProductOptions] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [contentValue, setContentValue] = useState("");

    const preparedImageFilesRef = useRef([]);
    const prepGenRef = useRef(0);

    const [backgroundPicture, setBackgroundPicture] = useState(Background);
    const [profilePicture, setProfilePicture] = useState(ShareAi);

    const [deviceOS, setDeviceOS] = useState("Other");

    const [guidedFlowOpen, setGuidedFlowOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [steps, setSteps] = useState(["platform", "language", "category", "content", "publish"]);

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [shareImageMode, setShareImageMode] = useState(SHARE_IMAGE_MODE.CURRENT);
    const [imageActionLoadingMode, setImageActionLoadingMode] = useState(null);
    const [imageActionClicked, setImageActionClicked] = useState(false);
    const [imagesPreparing, setImagesPreparing] = useState(false);
    const [hasSelectedThumbnail, setHasSelectedThumbnail] = useState(false);
    const [hasDownloaded, setHasDownloaded] = useState(false);
    const [hasEditedMessage, setHasEditedMessage] = useState(false);
    const [publishPreviewIndex, setPublishPreviewIndex] = useState(0);

    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
    const [merchantDrawEntry, setMerchantDrawEntry] = useState(null); // { token, logId }
    const [showEnterMerchantDrawButton, setShowEnterMerchantDrawButton] = useState(false);
    const [connectionIssueOpen, setConnectionIssueOpen] = useState(false);
    const [guidedReplayOpen, setGuidedReplayOpen] = useState(false);
    const [contentNotFoundOpen, setContentNotFoundOpen] = useState(false);
    const [expiredModalOpen, setExpiredModalOpen] = useState(false);

    const hasAutoOpenedGuidedFlowRef = useRef(false);

    const resetGuidedProgress = () => {
        prepGenRef.current++;
        preparedImageFilesRef.current = [];
        setImagesPreparing(false);
        setCurrentStepIndex(0);
        setSelectedImageIndex(0);
        setSelectedImage([]);
        setShareImageMode(SHARE_IMAGE_MODE.CURRENT);
        setImageActionLoadingMode(null);
        setImageActionClicked(false);
        setHasSelectedThumbnail(false);
        setHasDownloaded(false);
        setHasEditedMessage(false);
        setPublishPreviewIndex(0);
    };

    const triggerBackgroundImagePrep = (imageUrls) => {
        preparedImageFilesRef.current = [];
        if (!imageUrls || imageUrls.length === 0) {
            setImagesPreparing(false);
            return;
        }
        const gen = ++prepGenRef.current;
        setImagesPreparing(true);
        prepareImagesForSharing(imageUrls, {
            setPreparedImageFiles: (files) => {
                if (prepGenRef.current === gen) {
                    preparedImageFilesRef.current = files;
                }
            },
        }).finally(() => {
            if (prepGenRef.current === gen) {
                setImagesPreparing(false);
            }
        });
    };

    const fetchCategories = async (language) => {
        try {
            setCategoryLoading(true);
            const res = await getCategoryList("all", 0, {
                outletUserId: queryUserId,
                language,
                isShared: 0,
                status: CONTENT_STATUS.ACTIVE,
            });

            const categories = (res?.data || []).map(normalizeGuidedCategory);
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
                categoryId,
                isShared: 0,
                outletUserId,
                status: CONTENT_STATUS.ACTIVE,
                language,
                sort: JSON.stringify({ createdAt: 1 }),
            });

            const products = resProduct?.data || [];
            if (!products || isEmpty(products)) {
                setContentNotFoundOpen(true);
                return null;
            }

            const options = products.map((product) => ({
                title: product?.officialProductName,
                value: product.productId,
            }));
            const firstProductId = products[0]?.productId;
            if (firstProductId) setSelectedProductId(firstProductId);
            setProductOptions(options);
            return products;
        } catch (err) {
            console.error("fetchProductListByCategory failed", err);
            setContentNotFoundOpen(true);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchContentForProduct = async (productId, language) => {
        try {
            setLoading(true);
            const res = await getRandomBusinessContent(1, 0, {
                userId: queryUserId,
                language,
                productId,
            });

            const content = res?.data?.content || "";
            if (!content || isEmpty(content)) {
                setContentNotFoundOpen(true);
                return null;
            }

            const mediaUrls = resolveContentMediaUrls(content);
            setSelectedImage(mediaUrls);
            setSelectedRecord(content);
            setContentValue(buildEditableShareText(content));
            return content;
        } catch (e) {
            console.error("fetchContentForProduct failed", e);
            setContentNotFoundOpen(true);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchLanguageOptions = async () => {
        try {
            const res = await getLanguages(10, 0, { userId: queryUserId });
            const available = res?.data?.languagesAvailable || [];
            if (isEmpty(available)) {
                setLanguageOptions(defaultLanguageOptions);
                setSelectedLanguage("english");
                setContentNotFoundOpen(true);
                return;
            }

            const lower = available.map((s) => String(s).toLowerCase());
            const options = [];
            if (lower.some((s) => s.includes("eng"))) {
                options.push(defaultLanguageOptions.find((o) => o.key === "english"));
            }
            if (lower.some((s) => s.includes("chi") || s.includes("zh"))) {
                options.push(defaultLanguageOptions.find((o) => o.key === "chinese"));
            }
            if (lower.some((s) => s.includes("mal") || s.includes("ms"))) {
                options.push(defaultLanguageOptions.find((o) => o.key === "malay"));
            }

            const finalOptions = options.filter(Boolean);
            const resolved = finalOptions.length === 0 ? defaultLanguageOptions : finalOptions;
            setLanguageOptions(resolved);
            setSelectedLanguage(resolved[0]?.key || "english");
        } catch (err) {
            console.error("fetchLanguageOptions failed", err);
            setLanguageOptions(defaultLanguageOptions);
            setSelectedLanguage("english");
        }
    };

    const waitForAppOpen = (timeoutMs = 10000) =>
        new Promise((resolve) => {
            setTimeout(() => {
                if (document.hidden) {
                    resolve(true);
                    return;
                }

                let resolved = false;
                let timer = null;
                const done = (opened) => {
                    if (resolved) return;
                    resolved = true;
                    clearTimeout(timer);
                    document.removeEventListener("visibilitychange", onVisibility);
                    window.removeEventListener("blur", onBlur);
                    resolve(opened);
                };
                const onBlur = () => done(true);
                const onVisibility = () => {
                    if (document.hidden) done(true);
                };

                window.addEventListener("blur", onBlur, { once: true });
                document.addEventListener("visibilitychange", onVisibility);
                timer = setTimeout(() => done(false), timeoutMs);
            }, 500);
        });

    const handleShareClick = async () => {
        try {
            setLoading(true);
            await shareContent({
                contentId: selectedRecord?._id,
                platform: selectedPlatform?.title,
                platformId: selectedPlatform?.platformId,
                language: selectedLanguage,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = async (categoryId) => {
        setSelectedCategoryId(categoryId);
        setPublishPreviewIndex(0);
        const products = await fetchProductListByCategory(categoryId, queryUserId, selectedLanguage);
        if (products && products.length > 0) {
            const firstProductId = products[0]?.productId;
            setSelectedProductId(firstProductId);
            await fetchContentForProduct(firstProductId, selectedLanguage);
        }
    };

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

            const mediaUrls = resolveContentMediaUrls(content);
            setSelectedImage(mediaUrls);
            setSelectedRecord(content);
            setContentValue(buildEditableShareText(content));
            setPublishPreviewIndex(0);
            triggerBackgroundImagePrep(mediaUrls);
        } catch (e) {
            console.error("Shuffle failed", e);
        } finally {
            setLoading(false);
        }
    };

    const handleContentNotFoundClose = () => {
        setContentNotFoundOpen(false);
        window.location.href = "https://itscreative.biz/ishare";
    };

    const buildSteps = (platform, os, hasImages = false, isVideoContent = false) => {
        const base = ["platform", "language", "category"];
        const isGoogleReview = platform?.title === PLATFORM_NAME.GOOGLE_REVIEW;
        const isAutoCopyOS = AUTO_COPY_TEXT_OS.includes((os || "").toLowerCase());
        if (hasImages && (isGoogleReview || isAutoCopyOS || isVideoContent)) base.push("image");
        base.push("content", "publish");
        return base;
    };

    const handleNext = async () => {
        const step = steps[currentStepIndex];

        if (step === "platform") {
            if (!selectedPlatform) {
                message.warning(t("nTpleaseSelectPlatform", sourceKey.user) || "Please select a platform");
                return;
            }
            setSteps(buildSteps(selectedPlatform, deviceOS));
            setCurrentStepIndex((i) => i + 1);
            return;
        }

        if (step === "language") {
            if (!selectedLanguage) return;
            setLoading(true);
            const categories = await fetchCategories(selectedLanguage);
            if (!categories) {
                setLoading(false);
                return;
            }

            const firstCategoryId = categories[0]?.productId;
            setSelectedCategoryId(firstCategoryId);
            const products = await fetchProductListByCategory(firstCategoryId, queryUserId, selectedLanguage);
            if (!products) {
                setLoading(false);
                return;
            }

            const firstProductId = products[0]?.productId;
            setSelectedProductId(firstProductId);
            const content = await fetchContentForProduct(firstProductId, selectedLanguage);
            setLoading(false);
            if (!content) return;
            setCurrentStepIndex((i) => i + 1);
            return;
        }

        if (step === "category") {
            triggerBackgroundImagePrep(selectedImage);
            setCurrentStepIndex((i) => i + 1);
            return;
        }

        setCurrentStepIndex((i) => i + 1);
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) setCurrentStepIndex((i) => i - 1);
    };

    const handleStepJump = (idx) => {
        if (idx < currentStepIndex) setCurrentStepIndex(idx);
    };

    const handleSaveCurrent = async () => {
        if (imagesPreparing) return;
        setImageActionClicked(true);
        setImageActionLoadingMode("current");
        setShareImageMode(SHARE_IMAGE_MODE.CURRENT);
        try {
            const currentUrl = selectedImage?.[selectedImageIndex];
            const urls = currentUrl ? [currentUrl] : [];
            const allPrepared = preparedImageFilesRef.current || [];
            const currentPrepared = allPrepared.length === (selectedImage || []).length
                ? [allPrepared[selectedImageIndex]].filter(Boolean)
                : allPrepared.slice(0, 1);
            const result = await executeShare({
                textToShare: "",
                imageUrls: normalizeImageUrls(urls),
                skipCopy: true,
                preparedImageFiles: currentPrepared,
                SHARE_RESULT_STATUS,
            });
            const passed = [SHARE_RESULT_STATUS.SHARED, SHARE_RESULT_STATUS.FALLBACK_DOWNLOAD].includes(result?.status);
            if (passed) setHasDownloaded(true);
        } finally {
            setImageActionLoadingMode(null);
        }
    };

    const handleSaveAll = async () => {
        if (imagesPreparing) return;
        setImageActionClicked(true);
        setImageActionLoadingMode("all");
        setShareImageMode(SHARE_IMAGE_MODE.ALL);
        try {
            const result = await executeShare({
                textToShare: "",
                imageUrls: normalizeImageUrls(selectedImage || []),
                skipCopy: true,
                preparedImageFiles: (preparedImageFilesRef.current || []).filter(Boolean),
                SHARE_RESULT_STATUS,
            });
            const passed = [SHARE_RESULT_STATUS.SHARED, SHARE_RESULT_STATUS.FALLBACK_DOWNLOAD].includes(result?.status);
            if (passed) setHasDownloaded(true);
        } finally {
            setImageActionLoadingMode(null);
        }
    };

    const runShare = (platform, text, imageUrls) => {
        const isAutoCopyOS = AUTO_COPY_TEXT_OS.includes((deviceOS || "").toLowerCase());
        const platformName = (platform?.name || platform?.title || "").toLowerCase();
        const shareFlowInstance = createShareFlow({
            executeShare: (params) =>
                executeShare({
                    ...params,
                    preparedImageFiles: preparedImageFilesRef.current,
                    SHARE_RESULT_STATUS,
                }),
            writeClipboardText: (textToCopy) => navigator.clipboard.writeText(textToCopy),
            openExternalUrl: (url) => window.open(url, "_blank"),
            logShareFlow: (event, data) => console.log("[shareFlow]", event, data),
            onCopySuccess: () => { },
            onCopyFailed: () => { },
            SHARE_RESULT_STATUS,
        });

        return shareFlowInstance.handlePlatformShare({
            platformType: platform?.type,
            platformTitle: platform?.title || "",
            textToShare: text,
            copyText: text,
            imageUrls,
            platformUrl: platform?.url || "",
            shareOptions: {
                filesOnly: isFilesOnlySharePlatform(platformName),
                autoCopyText: isAutoCopyOS,
            },
        });
    };

    const createShareMerchantDrawEntry = async (platform) => {
        try {
            const entryRes = await createMerchantDrawEntry({
                outletUserId: queryUserId,
                platform: platform?.title || selectedPlatform?.title || "",
            });
            if (entryRes?.data?.data?.token) {
                const entry = {
                    token: entryRes.data.data.token,
                    logId: entryRes.data.data.logId,
                    merchantDrawLink: entryRes.data.data.merchantDrawLink || null,
                };
                setMerchantDrawEntry(entry);
                return entry;
            }
            return null;
        } catch (e) {
            console.error("[LuckyDraw] createMerchantDrawEntry failed", e);
            return null;
        }
    };

    const openMerchantDrawWhatsApp = () => {
        setShowSuccessOverlay(false);
        const token = merchantDrawEntry?.token || "";
        const messageBody =
            "Hello!\n\n" +
            "I’m interested in participating in the lucky draw campaign\n\n" +
            "Here is my Share Ai campaign code: :" + token;
        const waText = encodeURIComponent(messageBody);
        const link = `https://wa.me/${consiChatPhoneNumber}?text=${waText}`;
        window.open(link, "_blank");
    };

    const completeShareResult = async (result, { reopenReplayOnIssue = false } = {}) => {
        const usedNavigator = result?.mode === "files" || result?.mode === "text";
        const isOthersPlatform = selectedPlatform?.title === PLATFORM_NAME.OTHERS;
        if (usedNavigator && !isOthersPlatform) {
            setWaitingForApp(true);
            const appOpened = await waitForAppOpen(10000);
            setWaitingForApp(false);
            if (appOpened) {
                await createShareMerchantDrawEntry(selectedPlatform || platformList?.[0]);
                setShowSuccessOverlay(true);
            } else {
                if (reopenReplayOnIssue) setGuidedReplayOpen(true);
                setConnectionIssueOpen(true);
            }
            return;
        }

        await createShareMerchantDrawEntry(selectedPlatform || platformList?.[0]);
        setShowSuccessOverlay(true);
    };

    const handlePublish = async () => {
        if (imagesPreparing) return;
        const platform = selectedPlatform || platformList?.[0];
        if (!platform) return;

        const resolvedUrls = resolveImageUrlsForShareMode({
            imageUrls: selectedImage,
            selectedImageIndex,
            shareMode: shareImageMode,
        });

        const result = await runShare(platform, contentValue, resolvedUrls);
        if (result?.status !== SHARE_RESULT_STATUS.SHARED) return;
        await handleShareClick();
        setGuidedFlowOpen(false);
        await completeShareResult(result);
    };

    const handleReplayShare = async () => {
        if (imagesPreparing) return;
        const platform = selectedPlatform || platformList?.[0];
        if (!platform) return;

        const resolvedUrls = resolveImageUrlsForShareMode({
            imageUrls: selectedImage,
            selectedImageIndex,
            shareMode: shareImageMode,
        });

        const result = await runShare(platform, contentValue, resolvedUrls);
        if (result?.status !== SHARE_RESULT_STATUS.SHARED) return;
        await handleShareClick();
        setGuidedReplayOpen(false);
        await completeShareResult(result, { reopenReplayOnIssue: true });
    };

    const handleSuccessEndSession = () => {
        setShowSuccessOverlay(false);
        window.location.href = "https://itscreative.biz/ishare";
    };

    const openShareAgainModal = () => {
        setShowSuccessOverlay(false);
        setImageActionClicked(false);
        setHasDownloaded(false);
        setHasEditedMessage(false);
        setPublishPreviewIndex(0);
        setGuidedReplayOpen(true);
    };

    useEffect(() => {
        setDeviceOS(detectOS());
    }, []);

    useEffect(() => {
        let ignore = false;
        if (!queryUserId) {
            setShowEnterMerchantDrawButton(false);
            return () => { ignore = true; };
        }
        const loadAvailability = async () => {
            setShowEnterMerchantDrawButton(false);
            const available = await isMerchantDrawAvailable({ outletUserId: queryUserId });
            if (!ignore) setShowEnterMerchantDrawButton(available);
        };
        loadAvailability();
        return () => { ignore = true; };
    }, [queryUserId]);

    // Rebuild steps reactively whenever platform, OS, or image availability changes.
    // Locked once the user advances past the category step (index > 2) so mid-flow
    // content shuffles don't unexpectedly mutate the step list.
    useEffect(() => {
        if (currentStepIndex > 2) return;
        setSteps(buildSteps(
            selectedPlatform,
            deviceOS,
            selectedImage.length > 0,
            selectedRecord?.mediaType === MEDIA_TYPE.VIDEO,
        ));
    }, [currentStepIndex, selectedImage.length, selectedPlatform?.title, deviceOS, selectedRecord?.mediaType]);

    useEffect(() => {
        const handlePageShow = (event) => {
            const isBackForward =
                event.persisted ||
                window.performance?.getEntriesByType("navigation")[0]?.type === "back_forward";

            if (isBackForward) window.location.reload();
        };

        window.addEventListener("pageshow", handlePageShow);
        return () => window.removeEventListener("pageshow", handlePageShow);
    }, []);

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

        fetchLanguageOptions();
        getPictureByUserId(0, 0, { userId: queryUserId })
            .then((res) => {
                setBackgroundPicture(res?.data?.businessInfo?.backgroundImageUrl || Background);
                setProfilePicture(res?.data?.businessInfo?.profilePictureUrl || ShareAi);
            })
            .catch(() => {
                setBackgroundPicture(Background);
                setProfilePicture(ShareAi);
            });

        setPlatformsFetchState("loading");
        setPlatformList([]);
        getUserPlatforms(100, 0, { userId: queryUserId })
            .then((res) => {
                const activePlatforms = (res?.userPlatforms || []).filter(
                    (platform) => platform.status === PLATFORM_STATUS.ACTIVE
                );

                if (activePlatforms.length === 0) {
                    setContentNotFoundOpen(true);
                    setPlatformList([]);
                    return;
                }

                const list = activePlatforms.map((platform, idx) => ({
                    id: idx,
                    platformId: platform.platformId,
                    title: platform.title,
                    name: String(platform.title).toLowerCase().replace(/\s+/g, ""),
                    url: platform.url || "",
                    status: platform.status,
                    icon: getPlatformIcon(platform.title),
                    type: platform.type,
                }));

                const sortedList = list.sort((a, b) => {
                    if (a.title === PLATFORM_NAME.GOOGLE_REVIEW) return -1;
                    if (b.title === PLATFORM_NAME.GOOGLE_REVIEW) return 1;
                    if (a.title === PLATFORM_NAME.OTHERS) return 1;
                    if (b.title === PLATFORM_NAME.OTHERS) return -1;
                    return 0;
                });

                setPlatformList(sortedList);
                if (sortedList.length === 1) setSelectedPlatform(sortedList[0]);
            })
            .catch(() => setContentNotFoundOpen(true))
            .finally(() => setPlatformsFetchState("ready"));
    }, [queryUserId, router.isReady]);

    useEffect(() => {
        if (platformsFetchState !== "ready") return;
        if (isEmpty(platformList)) return;
        if (hasAutoOpenedGuidedFlowRef.current) return;
        if (contentNotFoundOpen) return;
        hasAutoOpenedGuidedFlowRef.current = true;
        resetGuidedProgress();
        setGuidedFlowOpen(true);
    }, [platformsFetchState, platformList, contentNotFoundOpen]);

    const showLandingGuide =
        platformsFetchState === "ready" &&
        !isEmpty(platformList) &&
        !guidedFlowOpen &&
        !guidedReplayOpen &&
        !showSuccessOverlay &&
        !connectionIssueOpen &&
        !contentNotFoundOpen &&
        !expiredModalOpen &&
        !waitingForApp &&
        !loading &&
        !categoryLoading;

    const landingGuide = useReferenceGuidePosition({
        active: showLandingGuide,
        targetId: "btn-start",
        watch: [showLandingGuide],
    });

    return (
        <>
            <ReferenceGuideOverlay
                active={showLandingGuide}
                bubbleDir={landingGuide.bubbleDir}
                guidePos={landingGuide.guidePos}
                gradientId="landing-guide-gradient"
                isFlying={landingGuide.isFlying}
                text={getGuideCopy(t, "nTguideStartHere", "START HERE!")}
                zIndex={950}
            />

            <SinglePopUpModal
                type="guidedShareFlow"
                open={guidedFlowOpen}
                closeable={false}
                loading={loading}
                extraData={{
                    isOpen: guidedFlowOpen,
                    steps,
                    currentStepIndex,
                    platformList,
                    selectedPlatform,
                    onPlatformSelect: (platform) => setSelectedPlatform(platform),
                    languageOptions,
                    selectedLanguage,
                    onLanguageChange: (lang) => setSelectedLanguage(lang),
                    categoryList,
                    selectedCategoryId,
                    onCategoryChange: handleCategoryChange,
                    categoryLoading,
                    productOptions,
                    selectedProductId,
                    previewImage: selectedImage,
                    mediaType: selectedRecord?.mediaType,
                    selectedImageIndex,
                    onSelectImage: (idx) => {
                        setSelectedImageIndex(idx);
                        setHasSelectedThumbnail(true);
                        setShareImageMode(SHARE_IMAGE_MODE.CURRENT);
                    },
                    contentValue,
                    onContentChange: (val) => {
                        setContentValue(val);
                        setHasEditedMessage(true);
                    },
                    onShuffle: handleShuffle,
                    onSaveCurrent: handleSaveCurrent,
                    onSaveAll: handleSaveAll,
                    shareImageMode,
                    imageActionLoadingMode,
                    imageActionClicked,
                    imagesPreparing,
                    hasSelectedThumbnail,
                    hasDownloaded,
                    hasEditedMessage,
                    publishPreviewIndex,
                    onPublishPreviewPrevious: () =>
                        setPublishPreviewIndex((i) => Math.max(0, i - 1)),
                    onPublishPreviewNext: () =>
                        setPublishPreviewIndex((i) =>
                            Math.min((selectedImage?.length || 1) - 1, i + 1)
                        ),
                    onNext: handleNext,
                    onPrev: handlePrev,
                    onStepJump: handleStepJump,
                    onPublish: handlePublish,
                    onClose: () => setGuidedFlowOpen(false),
                }}
            />

            <SinglePopUpModal
                type="guidedReplayFinal"
                open={guidedReplayOpen}
                closeable={false}
                loading={loading}
                extraData={{
                    previewImage: selectedImage,
                    selectedImageIndex,
                    shareImageMode,
                    shareText: contentValue,
                    selectedPlatform,
                    onPreviewPrevious: () =>
                        setPublishPreviewIndex((i) => Math.max(0, i - 1)),
                    onPreviewNext: () =>
                        setPublishPreviewIndex((i) =>
                            Math.min((selectedImage?.length || 1) - 1, i + 1)
                        ),
                    previewImageIndex: publishPreviewIndex,
                }}
                confirmBtn1={handleReplayShare}
                confirmBtn2={() => {
                    setGuidedReplayOpen(false);
                    window.location.href = "https://itscreative.biz/ishare";
                }}
                onClose={() => setGuidedReplayOpen(false)}
            />

            <SinglePopUpModal
                type="connectionIssue"
                open={connectionIssueOpen}
                closeable={true}
                height="auto"
                onClose={() => setConnectionIssueOpen(false)}
                confirmBtn1={() => setConnectionIssueOpen(false)}
            />

            <SinglePopUpModal
                type="contentNotFound"
                open={contentNotFoundOpen}
                closeable={true}
                height="auto"
                onClose={() => handleContentNotFoundClose(false)}
                confirmBtn1={() => handleContentNotFoundClose(false)}
            />

            <SinglePopUpModal
                type="expiredShare"
                open={expiredModalOpen}
                closeable={false}
                onClose={() => setExpiredModalOpen(false)}
                confirmBtn1={() => {
                    setExpiredModalOpen(false);
                    if (window.opener) window.close();
                }}
            />

            <SinglePopUpModal
                type="successfulShare"
                open={showSuccessOverlay && !waitingForApp}
                height="auto"
                closeable={true}
                onClose={() => setShowSuccessOverlay(false)}
                confirmBtn1Label={
                    showEnterMerchantDrawButton
                        ? t("nTyesEnterLuckyDraw", sourceKey.user) || "Yes, Enter Lucky Draw"
                        : t("nTendSession", sourceKey.user) || "End Session"
                }
                confirmBtn1Color="G"
                confirmBtn1={showEnterMerchantDrawButton ? openMerchantDrawWhatsApp : handleSuccessEndSession}
                confirmBtn2Label={t("nTshareAgain", sourceKey.user) || "Share Again"}
                confirmBtn2Color="B"
                confirmBtn2={openShareAgainModal}
            />

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
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 1,
                        background: "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.35) 100%)",
                    }}
                />

                {/* Language pill hidden per request.
                <div style={{ position: "absolute", top: 16, right: 16, zIndex: 3 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            background: "rgba(0,0,0,0.15)",
                            borderRadius: 9999,
                            padding: "3px 4px",
                        }}
                    >
                        {languageOptions.map((opt) => (
                            <button
                                key={opt.key}
                                type="button"
                                onClick={() => setSelectedLanguage(opt.key)}
                                style={{
                                    padding: "3px 10px",
                                    borderRadius: 9999,
                                    border: "none",
                                    fontWeight: 700,
                                    fontSize: 11,
                                    cursor: "pointer",
                                    transition: "all 0.3s",
                                    whiteSpace: "nowrap",
                                    background:
                                        selectedLanguage === opt.key
                                            ? "linear-gradient(90deg, var(--primary-color, #7c3aed), #a855f7)"
                                            : "transparent",
                                    color: selectedLanguage === opt.key ? "#fff" : "rgba(255,255,255,0.7)",
                                    boxShadow:
                                        selectedLanguage === opt.key
                                            ? "0 2px 8px rgba(124,58,237,0.35)"
                                            : "none",
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                */}

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

            {waitingForApp && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        background: "rgba(255,255,255,0.92)",
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
                    transform: "translate(-50%,-50%)",
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
                                <div
                                    style={{
                                        minHeight: "calc(100vh - 260px)",
                                        padding: "32px 20px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[var(--border-secondary)] p-6 sm:p-8 text-center">
                                        <div className="w-16 h-16 bg-[var(--primary-light)] purple-text rounded-full flex items-center justify-center mx-auto mb-5">
                                            <Share2 size={30} />
                                        </div>
                                        <h2 className="text-2xl font-bold primary-text mb-3">
                                            {t("nTwelcomeToShareAi", sourceKey.user) || "Welcome to ShareAi"}
                                        </h2>
                                        <p className="second-grey-text mb-7">
                                            {t("nTwelcomeToShareAiDesc", sourceKey.user) ||
                                                "Create your AI-powered content in a few simple steps"}
                                        </p>
                                        <button
                                            id="btn-start"
                                            type="button"
                                            onClick={() => {
                                                resetGuidedProgress();
                                                setSelectedPlatform(null);
                                                setSteps(buildSteps(null, deviceOS));
                                                setGuidedFlowOpen(true);
                                            }}
                                            className="w-full rounded-xl py-3.5 px-4 text-white font-semibold transition-all purple-btn border border-[var(--primary-color)]"
                                        >
                                            {t("nTstartSharing", sourceKey.user) || "Start Sharing"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Spin>
        </>
    );
};

export default ShareSectionMainPageV4;
