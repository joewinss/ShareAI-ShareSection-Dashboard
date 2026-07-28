import { LeftOutlined, RightOutlined, CloseOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { detectOS } from "@/utility/detectOS";
import { PLATFORM_NAME } from "@/constant/template";
import { MEDIA_TYPE } from "@/constants/data";
import { AUTO_COPY_TEXT_OS, getProxiedImageUrl } from "@/utility/shareFlow";
import {
  getGuideCopy,
  getGuideLanguageName,
  getGuideStepName,
  ReferenceGuideOverlay,
  useReferenceGuidePosition,
} from "@/components/shareContent/component/ReferenceGuideCursor";

const normalizeImages = (images = []) =>
  (images || [])
    .map((img) => (typeof img === "string" ? img : img?.url))
    .filter(Boolean);

const isImageReady = (src) => {
  if (!src || typeof window === "undefined") return false;
  const probe = new window.Image();
  probe.src = src;
  return probe.complete;
};

const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "avi", "mkv"]);
const isVideoUrl = (url = "") => {
  const ext = String(url || "").split("?")[0].split(".").pop().toLowerCase();
  return VIDEO_EXTENSIONS.has(ext);
};

const DESKTOP_GUIDED_MODAL_HEIGHT = "h-[760px]";

const getStepLabel = (stepKey, t) => {
  switch (stepKey) {
    case "platform":
      return t("nTplatform", sourceKey.user) || "Platform";
    case "language":
      return t("language", sourceKey.user) || "Language";
    case "category":
      return t("category", sourceKey.user) || "Category";
    case "image":
      return t("image", sourceKey.user) || "Image";
    case "content":
      return t("content", sourceKey.user) || "Content";
    case "publish":
      return t("nTpublish", sourceKey.user) || "Publish";
    default:
      return stepKey;
  }
};

const LoadingOverlay = ({ tone = "dark" }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-[1px] z-10">
    <div
      className={`w-8 h-8 rounded-full border-4 border-t-transparent animate-spin ${tone === "dark" ? "border-slate-700" : "border-white"
        }`}
    />
  </div>
);

const ImageFallback = ({ text }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-center px-3 z-10">
    <span className="small-text-size second-grey-text">{text}</span>
  </div>
);

const renderPublishPreview = ({
  images,
  selectedImageIndex,
  shareImageMode,
  previewIndex,
  onPreviewPrevious,
  onPreviewNext,
  selectedPlatform,
  content,
  t,
  imageLoadState,
  onImageLoad,
  onImageError,
  imageErrorText,
}) => {
  const hasImages = images.length > 0;
  const currentSingleImage = images[selectedImageIndex] || images[0] || "";
  const currentCarouselImage = images[previewIndex] || images[0] || "";
  const showCarousel = shareImageMode === "all" && images.length > 1;
  const currentSrc = showCarousel ? currentCarouselImage : currentSingleImage;

  return (
    <div className="w-full max-w-xl mx-auto border border-slate-200 rounded-xl bg-white shadow-sm p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
          {selectedPlatform?.icon ? (
            <img src={selectedPlatform.icon} alt={selectedPlatform?.title || "platform"} className="w-6 h-6 object-contain" />
          ) : (
            <span className="xsmall-text-size second-grey-text">P</span>
          )}
        </div>
        <div>
          <p className="medium-text-size font-bold text-slate-900 leading-tight">{selectedPlatform?.title || "-"}</p>
          <p className="small-text-size second-grey-text">{t("nThowProfileLook", sourceKey.user)}</p>
        </div>
      </div>

      <p className="large-text-size text-slate-800 mb-3 whitespace-pre-wrap leading-snug">{content || ""}</p>

      {!hasImages && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 py-8 text-center">
          <span className="medium-text-size second-grey-text">{t("noImage", sourceKey.user) || "No image"}</span>
        </div>
      )}

      {hasImages && (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white">
          {imageLoadState?.error && !isVideoUrl(currentSrc) && <ImageFallback text={imageErrorText} />}

          {currentSrc ? (
            isVideoUrl(currentSrc) ? (
              <video
                key={currentSrc}
                src={currentSrc}
                controls
                playsInline
                preload="metadata"
                className="w-full h-48 sm:h-56 object-contain bg-black"
              />
            ) : (
              <img
                src={getProxiedImageUrl(currentSrc)}
                alt="Preview"
                onLoad={onImageLoad}
                onError={onImageError}
                className={`w-full h-48 sm:h-56 object-cover transition-opacity duration-200 ${imageLoadState?.loading ? "opacity-0" : "opacity-100"
                  }`}
              />
            )
          ) : null}

          {imageLoadState?.loading && !imageLoadState?.error && !isVideoUrl(currentSrc) && <LoadingOverlay tone="dark" />}

          {showCarousel && (
            <>
              <button
                type="button"
                onClick={onPreviewPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-white z-20 bg-[rgba(171,115,252,0.65)] hover:bg-[rgba(155,99,236,0.85)] transition-colors"
              >
                <LeftOutlined />
              </button>
              <button
                type="button"
                onClick={onPreviewNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-white z-20 bg-[rgba(171,115,252,0.65)] hover:bg-[rgba(155,99,236,0.85)] transition-colors"
              >
                <RightOutlined />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/40 px-2 py-1.5 rounded-full z-20">
                {images.map((_, idx) => (
                  <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === previewIndex ? "bg-white" : "bg-white/50"}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const GuidedShareFlowModal = ({ data = {}, loading = false }) => {
  const { t } = useTranslation();

  const isMobile = !!data?.isMobileViewport;
  const steps = data?.steps || [];
  const currentStepIndex = data?.currentStepIndex || 0;
  const currentStep = steps[currentStepIndex] || "platform";

  const images = useMemo(() => normalizeImages(data?.previewImage), [data?.previewImage]);
  const selectedImageIndex = data?.selectedImageIndex || 0;
  const contentValue = data?.contentValue || "";
  const imageErrorText = t("nTimageFailedToLoad", sourceKey.user) || "Image failed to load";

  const [mainPreviewLoadState, setMainPreviewLoadState] = useState({ loading: false, error: false });
  const [publishPreviewLoadState, setPublishPreviewLoadState] = useState({ loading: false, error: false });
  const [thumbnailLoadState, setThumbnailLoadState] = useState({});
  const [hoveredTargetId, setHoveredTargetId] = useState(null);
  const [lastHoveredPlatformId, setLastHoveredPlatformId] = useState("btn-platform-0");
  const [lastHoveredLanguageId, setLastHoveredLanguageId] = useState("btn-language-0");
  const [lastHoveredCategoryId, setLastHoveredCategoryId] = useState("btn-category-0");
  const [hasManuallySelectedLanguage, setHasManuallySelectedLanguage] = useState(false);
  const [hasManuallySelectedCategory, setHasManuallySelectedCategory] = useState(false);
  const [lastHoveredImageId, setLastHoveredImageId] = useState("img-thumbnail-0");
  const [lastHoveredSaveId, setLastHoveredSaveId] = useState("btn-save-all");
  const isImageActionLoading = !!data?.imageActionLoadingMode || !!data?.imagesPreparing;
  const hasSelectedThumbnail = !!data?.hasSelectedThumbnail;
  const hasDownloaded = !!data?.hasDownloaded;
  const hasEditedMessage = !!data?.hasEditedMessage;
  const languageOptions = data?.languageOptions || [];
  const selectedLanguage = data?.selectedLanguage;
  const [devicePlatform, setDevicePlatform] = useState("Other");
  const isAutoCopyTextOS = AUTO_COPY_TEXT_OS.includes((devicePlatform || "").toLowerCase());
  const isGoogleReviewPlatform = data?.selectedPlatform?.title === PLATFORM_NAME.GOOGLE_REVIEW;
  const shouldShowDownloadButtons = isAutoCopyTextOS || isGoogleReviewPlatform;

  const currentMainPreviewSrc = useMemo(
    () => images[selectedImageIndex] || images[0] || "",
    [images, selectedImageIndex]
  );

  const showPublishCarousel = data?.shareImageMode === "all" && images.length > 1;
  const currentPublishSrc = useMemo(() => {
    if (!images.length) return "";
    if (showPublishCarousel) {
      const idx = data?.publishPreviewIndex || 0;
      return images[idx] || images[0] || "";
    }
    return images[selectedImageIndex] || images[0] || "";
  }, [data?.publishPreviewIndex, images, selectedImageIndex, showPublishCarousel]);

  useEffect(() => {
    setDevicePlatform(detectOS());
  }, []);

  useEffect(() => {
    setMainPreviewLoadState({
      loading: !!currentMainPreviewSrc && !isVideoUrl(currentMainPreviewSrc) && !isImageReady(currentMainPreviewSrc),
      error: false,
    });
  }, [currentMainPreviewSrc]);

  useEffect(() => {
    setPublishPreviewLoadState({
      loading: !!currentPublishSrc && !isVideoUrl(currentPublishSrc) && !isImageReady(currentPublishSrc),
      error: false,
    });
  }, [currentPublishSrc]);

  useEffect(() => {
    const nextState = {};
    images.forEach((src, idx) => {
      nextState[idx] = { loading: !isVideoUrl(src) && !isImageReady(src), error: false };
    });
    setThumbnailLoadState(nextState);
  }, [images, currentStep]);

  useEffect(() => {
    if (!data?.isOpen) return;
    setHoveredTargetId(null);
    setLastHoveredPlatformId("btn-platform-0");
    setLastHoveredSaveId("btn-save-all");
    setLastHoveredLanguageId("btn-language-0");
    setLastHoveredCategoryId("btn-category-0");
    setLastHoveredImageId("img-thumbnail-0");
  }, [data?.isOpen]);

  useEffect(() => {
    if (!data?.isOpen) return;
    setHoveredTargetId(null);
  }, [currentStep, data?.isOpen]);

  useEffect(() => {
    if (!data?.isOpen || currentStep !== "language") return;
    setHasManuallySelectedLanguage(false);
  }, [currentStep, data?.isOpen]);

  useEffect(() => {
    if (!data?.isOpen || currentStep !== "image") return;
    if (!!data?.imageActionClicked && hasDownloaded) {
      setHoveredTargetId(null);
    }
  }, [currentStep, data?.isOpen, data?.imageActionClicked, hasDownloaded]);

  useEffect(() => {
    if (!data?.isOpen || currentStep !== "category") return;
    setHasManuallySelectedCategory(false);
  }, [currentStep, data?.isOpen]);

  const selectedPlatformIndex = useMemo(
    () =>
      (data?.platformList || []).findIndex(
        (platform) => (data?.selectedPlatform?.platformId || data?.selectedPlatform?.id) === (platform.platformId || platform.id)
      ),
    [data?.platformList, data?.selectedPlatform]
  );

  const selectedCategoryIndex = useMemo(
    () => (data?.categoryList || []).findIndex((category) => data?.selectedCategoryId === category.productId),
    [data?.categoryList, data?.selectedCategoryId]
  );

  const selectedLanguageIndex = useMemo(
    () =>
      languageOptions.findIndex((languageOption) => {
        const languageKey = typeof languageOption === "string" ? languageOption : languageOption?.key;
        return selectedLanguage === languageKey;
      }),
    [languageOptions, selectedLanguage]
  );

  useEffect(() => {
    if (!data?.isOpen || currentStep !== "language") return;
    if (!languageOptions.length) return;

    const languageIndex = selectedLanguageIndex >= 0 ? selectedLanguageIndex : 0;
    setLastHoveredLanguageId(`btn-language-${languageIndex}`);
  }, [currentStep, data?.isOpen, languageOptions.length, selectedLanguageIndex]);

  useEffect(() => {
    if (!data?.isOpen || currentStep !== "platform") return;
    if (!(data?.platformList || []).length) return;

    const platformIndex = selectedPlatformIndex >= 0 ? selectedPlatformIndex : 0;
    setLastHoveredPlatformId(`btn-platform-${platformIndex}`);
  }, [currentStep, data?.isOpen, selectedPlatformIndex, data?.platformList]);

  useEffect(() => {
    if (!data?.isOpen || currentStep !== "category") return;
    if (!(data?.categoryList || []).length) return;

    const categoryIndex = selectedCategoryIndex >= 0 ? selectedCategoryIndex : 0;
    setLastHoveredCategoryId(`btn-category-${categoryIndex}`);
  }, [currentStep, data?.isOpen, selectedCategoryIndex, data?.categoryList]);

  const getTargetInfo = () => {
    if (!data?.isOpen) {
      return { id: null, text: "" };
    }

    if (hoveredTargetId) {
      if (hoveredTargetId === "btn-prev") {
        return { id: hoveredTargetId, text: getGuideCopy(t, "nTguideGoBack", "GO BACK?") };
      }

      if (hoveredTargetId.startsWith("step-")) {
        const stepIndex = Number(hoveredTargetId.split("-")[1]);
        const stepKey = steps[stepIndex];
        return {
          id: hoveredTargetId,
          text: getGuideCopy(t, "nTguideBackToStep", "BACK TO ${step}?", {
            step: getGuideStepName(t, stepKey),
          }),
        };
      }

      if (hoveredTargetId.startsWith("btn-platform-")) {
        const platformIndex = Number(hoveredTargetId.split("-")[2]);
        const platformName = String(data?.platformList?.[platformIndex]?.title || "").toUpperCase();
        return {
          id: hoveredTargetId,
          text: data?.selectedPlatform
            ? getGuideCopy(t, "nTguideChangeToPlatform", "CHANGE TO ${platform}?", { platform: platformName })
            : getGuideCopy(t, "nTguideShareOnPlatform", "SHARE ON ${platform}?", { platform: platformName }),
        };
      }

      if (hoveredTargetId.startsWith("btn-language-")) {
        const languageIndex = Number(hoveredTargetId.split("-")[2]);
        const languageOption = languageOptions[languageIndex];
        const languageKey = typeof languageOption === "string" ? languageOption : languageOption?.key;
        return {
          id: hoveredTargetId,
          text: selectedLanguage === languageKey
            ? getGuideCopy(t, "nTguidePickLanguage", "PICK A LANGUAGE!")
            : getGuideCopy(t, "nTguideSwitchLanguage", "SWITCH TO ${language}?", {
              language: getGuideLanguageName(t, languageKey),
            }),
        };
      }

      if (hoveredTargetId.startsWith("btn-category-")) {
        if (currentStep === "category" && hasManuallySelectedCategory) {
          return { id: "btn-next", text: getGuideCopy(t, "nTguideClickNext", "CLICK NEXT!") };
        }

        const categoryIndex = Number(hoveredTargetId.split("-")[2]);
        const categoryName = String(data?.categoryList?.[categoryIndex]?.productName || "").toUpperCase();
        return {
          id: hoveredTargetId,
          text: !!data?.selectedCategoryId
            ? getGuideCopy(t, "nTguideChangeToCategory", "CHANGE TO ${category}?", { category: categoryName })
            : getGuideCopy(t, "nTguideSelectThis", "SELECT THIS?"),
        };
      }

      if (
        hoveredTargetId.startsWith("img-thumbnail-") &&
        !(currentStep === "image" && shouldShowDownloadButtons)
      ) {
        return { id: hoveredTargetId, text: getGuideCopy(t, "nTguidePickThisImage", "PICK THIS IMAGE?") };
      }

      if (shouldShowDownloadButtons && hoveredTargetId === "btn-save-current") {
        return { id: hoveredTargetId, text: getGuideCopy(t, "nTguideSaveThisOne", "SAVE THIS ONE?") };
      }

      if (shouldShowDownloadButtons && hoveredTargetId === "btn-save-all") {
        return {
          id: hoveredTargetId,
          text: getGuideCopy(t, "nTguideSaveAllCount", "SAVE ALL ${count}?", { count: images.length }),
        };
      }
    }

    if (currentStep === "platform") {
      if (data?.selectedPlatform) {
        return { id: "btn-next", text: getGuideCopy(t, "nTguideClickNext", "CLICK NEXT!") };
      }

      return {
        id: (data?.platformList || []).length > 0 ? lastHoveredPlatformId : null,
        text: getGuideCopy(t, "nTguidePickPlatform", "PICK A PLATFORM!"),
      };
    }

    if (currentStep === "language") {
      if (hasManuallySelectedLanguage) {
        return { id: "btn-next", text: getGuideCopy(t, "nTguideClickNext", "CLICK NEXT!") };
      }

      return {
        id: languageOptions.length > 0 ? lastHoveredLanguageId : null,
        text: getGuideCopy(t, "nTguidePickLanguage", "PICK A LANGUAGE!"),
      };
    }

    if (currentStep === "category") {
      if (hasManuallySelectedCategory) {
        return { id: "btn-next", text: getGuideCopy(t, "nTguideClickNext", "CLICK NEXT!") };
      }

      return {
        id: (data?.categoryList || []).length > 0 ? lastHoveredCategoryId : null,
        text: getGuideCopy(t, "nTguidePickCategory", "PICK A CATEGORY!"),
      };
    }

    if (currentStep === "image") {
      if (shouldShowDownloadButtons) {
        if (!data?.imageActionClicked) {
          return {
            id: lastHoveredSaveId,
            text:
              lastHoveredSaveId === "btn-save-all"
                ? getGuideCopy(t, "nTguideSaveAllCount", "SAVE ALL ${count}?", { count: images.length })
                : getGuideCopy(t, "nTguideSaveThisOne", "SAVE THIS ONE?"),
          };
        }

        if (!!data?.imageActionClicked && !hasDownloaded) {
          return {
            id: lastHoveredSaveId,
            text:
              lastHoveredSaveId === "btn-save-all"
                ? getGuideCopy(t, "nTguideSaveAllCount", "SAVE ALL ${count}?", { count: images.length })
                : getGuideCopy(t, "nTguideNowDownloadIt", "NOW DOWNLOAD IT!"),
          };
        }

        return {
          id: "btn-next",
          text: !!data?.imageActionClicked
            ? getGuideCopy(t, "nTguideGreatClickNext", "GREAT! CLICK NEXT!")
            : getGuideCopy(t, "nTguideClickNext", "CLICK NEXT!"),
        };
      }

      if (!hasSelectedThumbnail) {
        return {
          id: images.length > 0 ? lastHoveredImageId : null,
          text: getGuideCopy(t, "nTguidePickImage", "PICK AN IMAGE!"),
        };
      }

      return {
        id: "btn-next",
        text: getGuideCopy(t, "nTguideClickNext", "CLICK NEXT!"),
      };
    }

    if (currentStep === "content") {
      if (!hasEditedMessage) {
        return { id: "btn-shuffle", text: getGuideCopy(t, "nTguideTryShuffling", "TRY SHUFFLING!") };
      }

      return { id: "btn-next", text: getGuideCopy(t, "nTguideClickNext", "CLICK NEXT!") };
    }

    if (currentStep === "publish") {
      return { id: "btn-next", text: getGuideCopy(t, "nTguidePublishIt", "PUBLISH IT!") };
    }

    return { id: null, text: "" };
  };

  const targetInfo = getTargetInfo();
  const getForcedBubbleDir = () => {
    if (targetInfo.id === "btn-save-current") {
      return isMobile ? "bottom" : "left";
    }

    if (targetInfo.id === "btn-save-all") {
      return isMobile ? "top" : "right";
    }

    if (targetInfo.id === "btn-shuffle") {
      return "bottom";
    }

    return null;
  };
  const forcedBubbleDir = getForcedBubbleDir();
  const guideActive = !!data?.isOpen && !!targetInfo.id && !loading;

  const guidePosition = useReferenceGuidePosition({
    active: guideActive,
    targetId: targetInfo.id,
    forceBubbleDir: forcedBubbleDir,
    scrollContainerId: "modal-scroll-area",
    resetOnInactive: false,
    watch: [
      currentStep,
      currentStepIndex,
      hoveredTargetId,
      selectedPlatformIndex,
      lastHoveredPlatformId,
      selectedLanguageIndex,
      selectedCategoryIndex,
      lastHoveredCategoryId,
      selectedImageIndex,
      lastHoveredImageId,
      hasSelectedThumbnail,
      hasDownloaded,
      hasEditedMessage,
      selectedLanguage,
      hasManuallySelectedLanguage,
      shouldShowDownloadButtons,
      languageOptions.length,
      lastHoveredLanguageId,
      data?.imageActionClicked,
      data?.shareImageMode,
      data?.publishPreviewIndex,
      images.length,
      loading,
    ],
  });

  return (
    <div className="relative">
      <div
        className={`bg-white flex flex-col overflow-hidden ${isMobile ? "h-[100dvh] rounded-none" : `${DESKTOP_GUIDED_MODAL_HEIGHT} rounded-2xl`
          }`}
      >
        <ReferenceGuideOverlay
          active={guideActive}
          bubbleDir={guidePosition.bubbleDir}
          guidePos={guidePosition.guidePos}
          gradientId="guided-share-guide-gradient"
          isFlying={guidePosition.isFlying}
          text={targetInfo.text}
          zIndex={1060}
        />
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg">{t("nTshareWithNetwork", sourceKey.user)}</h2>
          <button
            type="button"
            onClick={data?.onClose}
            className="w-8 h-8 rounded-lg second-grey-text hover:bg-[var(--secondary-color)] flex items-center justify-center transition-colors"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="px-3 sm:px-6 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {steps.map((stepKey, idx) => {
              const isActive = idx === currentStepIndex;
              const isCompleted = idx < currentStepIndex;
              const isClickable = idx < currentStepIndex;

              return (
                <button
                  key={stepKey}
                  id={`step-${idx}`}
                  type="button"
                  onClick={() => isClickable && data?.onStepJump?.(idx)}
                  onMouseEnter={() => {
                    if (isClickable) setHoveredTargetId(`step-${idx}`);
                  }}
                  onMouseLeave={() => {
                    if (isClickable) setHoveredTargetId(null);
                  }}
                  className={`flex flex-col items-center gap-1 px-1.5 focus:outline-none focus-visible:outline-none ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${isActive
                      ? "gradient-fill text-white"
                      : isCompleted
                        ? "border-2 bg-green-500 text-white border-green-500"
                        : "border-2 bg-white text-slate-400 border-slate-300"
                      }`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <span className={`small-text-size font-semibold ${isActive ? "purple-text" : "second-grey-text"}`}>
                    {getStepLabel(stepKey, t)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div id="modal-scroll-area" className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
          {currentStep === "platform" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-1">{t("nTchoosePlatform", sourceKey.user)}</h3>
                <p className="large-text-size second-grey-text">{t("nTwherePost", sourceKey.user)}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
                {(data?.platformList || []).map((platform, idx) => {
                  const selected = (data?.selectedPlatform?.platformId || data?.selectedPlatform?.id) === (platform.platformId || platform.id);
                  return (
                    <button
                      key={platform.id || platform.platformId || platform.name}
                      id={`btn-platform-${idx}`}
                      type="button"
                      onClick={() => {
                        setHoveredTargetId(null);
                        data?.onPlatformSelect?.(platform);
                      }}
                      onMouseEnter={() => {
                        const targetId = `btn-platform-${idx}`;
                        setHoveredTargetId(targetId);
                        setLastHoveredPlatformId(targetId);
                      }}
                      onMouseLeave={() => setHoveredTargetId(null)}
                      className={`rounded-xl border-2 p-3 sm:p-4 sm:min-h-[170px] flex flex-col items-center justify-center gap-2.5 sm:gap-3 transition-all ${selected
                        ? "gradient-border bg-white shadow-lg shadow-blue-500/10"
                        : "gradient-border-hover bg-white"
                        }`}
                    >
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center ${selected ? "bg-white shadow-sm" : "bg-slate-100"}`}>
                        {platform.icon ? (
                          <img src={platform.icon} alt={platform.title} className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                        ) : (
                          <span className="small-text-size second-grey-text">P</span>
                        )}
                      </div>
                      <span className={`text-center font-semibold small-text-size sm:large-text-size ${selected ? "purple-text" : "text-slate-700"}`}>{platform.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === "language" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {t("nTchooseContentLanguage", sourceKey.user)}
                </h3>
              </div>

              <div className="max-w-md mx-auto space-y-3">
                {languageOptions.map((languageOption, index) => {
                  const languageKey = typeof languageOption === "string" ? languageOption : languageOption?.key;
                  const languageLabel = typeof languageOption === "string" ? languageOption : languageOption?.label;
                  const selected = selectedLanguage === languageKey;

                  return (
                    <button
                      key={languageKey || index}
                      id={`btn-language-${index}`}
                      type="button"
                      onClick={() => {
                        setHasManuallySelectedLanguage(true);
                        setHoveredTargetId(null);
                        data?.onLanguageChange?.(languageKey);
                      }}
                      onMouseEnter={() => {
                        const targetId = `btn-language-${index}`;
                        setHoveredTargetId(targetId);
                        setLastHoveredLanguageId(targetId);
                      }}
                      onMouseLeave={() => setHoveredTargetId(null)}
                      className={`w-full rounded-xl border-2 p-4 flex items-center justify-between transition-all ${selected
                        ? "gradient-border bg-white shadow-lg shadow-blue-500/10"
                        : "gradient-border-hover bg-white"
                        }`}
                    >
                      <span className={`font-semibold large-text-size ${selected ? "purple-text" : "text-slate-700"}`}>
                        {languageLabel}
                      </span>
                      <span
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${selected
                          ? "border-[var(--primary-color)] bg-[var(--primary-color)] text-white"
                          : "border-slate-300 text-slate-400"
                          }`}
                      >
                        {selected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === "category" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-1">{t("nTselectCategory", sourceKey.user)}</h3>
                <p className="large-text-size second-grey-text">{t("nTachievementType", sourceKey.user)}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                {(data?.categoryList || []).map((category, index) => {
                  const selected = data?.selectedCategoryId === category.productId;
                  return (
                    <button
                      key={category._id || category.id || category.productId}
                      id={`btn-category-${index}`}
                      type="button"
                      onClick={() => {
                        setHasManuallySelectedCategory(true);
                        setHoveredTargetId(null);
                        data?.onCategoryChange?.(category.productId);
                      }}
                      onMouseEnter={() => {
                        const targetId = `btn-category-${index}`;
                        setHoveredTargetId(targetId);
                        setLastHoveredCategoryId(targetId);
                      }}
                      onMouseLeave={() => setHoveredTargetId(null)}
                      disabled={data?.categoryLoading}
                      className={`rounded-full h-10 px-4 sm:px-6 border-2 medium-text-size font-semibold transition-all ${selected
                        ? "gradient-fill text-white shadow-sm"
                        : "gradient-border-hover bg-white text-slate-700"
                        } ${data?.categoryLoading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                    >
                      {category.productName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === "image" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-1">{t("nTyourImage", sourceKey.user)}</h3>
                <p className="large-text-size second-grey-text">{t("nTselectImageAttach", sourceKey.user)}</p>
              </div>

              <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 max-w-lg mx-auto">
                <div className="relative aspect-video rounded-lg overflow-hidden mb-3 border border-slate-200 shadow-sm bg-white">
                  {mainPreviewLoadState.error && <ImageFallback text={imageErrorText} />}

                  {currentMainPreviewSrc ? (
                    isVideoUrl(currentMainPreviewSrc) ? (
                      <video
                        key={currentMainPreviewSrc}
                        src={currentMainPreviewSrc}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-contain bg-black"
                      />
                    ) : (
                      <img
                        src={getProxiedImageUrl(currentMainPreviewSrc)}
                        alt="selected"
                        onLoad={() => setMainPreviewLoadState({ loading: false, error: false })}
                        onError={() => setMainPreviewLoadState({ loading: false, error: true })}
                        className={`w-full h-full object-cover transition-opacity duration-200 ${mainPreviewLoadState.loading ? "opacity-0" : "opacity-100"
                          }`}
                      />
                    )
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="medium-text-size second-grey-text">{t("noImage", sourceKey.user)}</span>
                    </div>
                  )}

                  {mainPreviewLoadState.loading && !mainPreviewLoadState.error && <LoadingOverlay tone="dark" />}
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  {images.map((img, idx) => {
                    const thumbState = thumbnailLoadState[idx] || { loading: false, error: false };
                    return (
                      <button
                        key={`${img}-${idx}`}
                        id={`img-thumbnail-${idx}`}
                        type="button"
                        onClick={() => {
                          setHoveredTargetId(null);
                          data?.onSelectImage?.(idx);
                        }}
                        onMouseEnter={() => {
                          const targetId = `img-thumbnail-${idx}`;
                          setHoveredTargetId(targetId);
                          setLastHoveredImageId(targetId);
                        }}
                        onMouseLeave={() => setHoveredTargetId(null)}
                        className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? "border-[var(--primary-color)]" : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                      >
                        {thumbState.loading && <div className="absolute inset-0 bg-slate-200 animate-pulse z-10" />}
                        {thumbState.error ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-20">
                            <span className="xxsmall-text-size second-grey-text">!</span>
                          </div>
                        ) : isVideoUrl(img) ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10">
                            <span className="text-white text-xl">▶</span>
                          </div>
                        ) : (
                          <img
                            src={getProxiedImageUrl(img)}
                            alt={`Option ${idx + 1}`}
                            onLoad={() => {
                              setThumbnailLoadState((prev) => ({
                                ...prev,
                                [idx]: { loading: false, error: false },
                              }));
                            }}
                            onError={() => {
                              setThumbnailLoadState((prev) => ({
                                ...prev,
                                [idx]: { loading: false, error: true },
                              }));
                            }}
                            className={`w-full h-full object-cover transition-opacity duration-200 ${thumbState.loading ? "opacity-0" : "opacity-100"}`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {shouldShowDownloadButtons && (() => {
                  const isVideoContent = data?.mediaType === MEDIA_TYPE.VIDEO;
                  const singleButton = isVideoContent && images.length <= 1;
                  return (
                    <div className={`grid ${singleButton ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"} gap-2 sm:gap-3`}>
                      {!singleButton && (
                        <button
                          id="btn-save-current"
                          type="button"
                          onClick={data?.onSaveCurrent}
                          onMouseEnter={() => {
                            setHoveredTargetId("btn-save-current");
                            setLastHoveredSaveId("btn-save-current");
                          }}
                          onMouseLeave={() => setHoveredTargetId(null)}
                          disabled={isImageActionLoading}
                          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold medium-text-size border transition-colors ${isImageActionLoading
                            ? "bg-[var(--primary-light)] text-[var(--text-primary)] border-[var(--border-secondary)] opacity-60 cursor-not-allowed pointer-events-none"
                            : "light-purple-btn border-[var(--border-secondary)]"
                            }`}
                        >
                          {(data?.imagesPreparing || data?.imageActionLoadingMode === "current") ? <div className="w-4 h-4 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" /> : null}
                          {isVideoContent
                            ? (t("nTsaveVideo", sourceKey.user) || "Save Video")
                            : t("nTsaveCurrent", sourceKey.user)}
                        </button>
                      )}

                      <button
                        id="btn-save-all"
                        type="button"
                        onClick={data?.onSaveAll}
                        onMouseEnter={() => {
                          setHoveredTargetId("btn-save-all");
                          setLastHoveredSaveId("btn-save-all");
                        }}
                        onMouseLeave={() => setHoveredTargetId(null)}
                        disabled={isImageActionLoading}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold medium-text-size border transition-colors ${isImageActionLoading
                          ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)] opacity-60 cursor-not-allowed pointer-events-none"
                          : "purple-btn border-[var(--primary-color)]"
                          }`}
                      >
                        {(data?.imagesPreparing || data?.imageActionLoadingMode === "all") ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                        {isVideoContent
                          ? (singleButton
                            ? (t("nTsaveVideo", sourceKey.user) || "Save Video")
                            : (t("nTsaveAllVideos", sourceKey.user) || "Save All Videos"))
                          : t("nTsaveAllImages", sourceKey.user)}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {currentStep === "content" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-1">{t("nTyourContent", sourceKey.user)}</h3>
                <p className="large-text-size second-grey-text">{t("nTeditOrShuffle", sourceKey.user)}</p>
              </div>

              <div className="relative max-w-lg mx-auto">
                <textarea
                  value={contentValue}
                  onChange={(e) => data?.onContentChange?.(e.target.value)}
                  className="w-full h-80 sm:h-100 p-4 pb-14 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-light)] focus:border-[var(--primary-color)] outline-none resize-none large-text-size text-slate-800 leading-relaxed"
                />
                <div className="absolute bottom-3 right-3">
                  <button
                    id="btn-shuffle"
                    type="button"
                    onClick={data?.onShuffle}
                    onMouseEnter={() => setHoveredTargetId("btn-shuffle")}
                    onMouseLeave={() => setHoveredTargetId(null)}
                    className="flex items-center gap-2 light-purple-btn border border-[var(--border-secondary)] px-3 py-1.5 rounded-lg font-semibold medium-text-size transition-colors"
                  >
                    {t("nTtryNewText", sourceKey.user)}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === "publish" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-1">{t("nTreviewPublish", sourceKey.user)}</h3>
                <p className="large-text-size second-grey-text">{t("nThowProfileLook", sourceKey.user)}</p>
              </div>

              {renderPublishPreview({
                images,
                selectedImageIndex,
                shareImageMode: data?.shareImageMode,
                previewIndex: data?.publishPreviewIndex || 0,
                onPreviewPrevious: data?.onPublishPreviewPrevious,
                onPreviewNext: data?.onPublishPreviewNext,
                selectedPlatform: data?.selectedPlatform,
                content: contentValue,
                t,
                imageLoadState: publishPreviewLoadState,
                onImageLoad: () => setPublishPreviewLoadState({ loading: false, error: false }),
                onImageError: () => setPublishPreviewLoadState({ loading: false, error: true }),
                imageErrorText,
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--border-secondary)] bg-[var(--background-secondary)] px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <button
            id="btn-prev"
            type="button"
            onClick={data?.onPrev}
            onMouseEnter={() => setHoveredTargetId("btn-prev")}
            onMouseLeave={() => setHoveredTargetId(null)}
            disabled={currentStepIndex === 0}
            className={`rounded-lg px-4 sm:px-6 py-2.5 medium-text-size font-semibold transition-all ${currentStepIndex === 0
              ? "text-slate-400 bg-white border border-[var(--border-secondary)] opacity-60 cursor-not-allowed pointer-events-none"
              : "second-grey-btn bg-white border border-[var(--border-secondary)]"
              }`}
          >
            {t("nTgoBack", sourceKey.user)}
          </button>

          <button
            id="btn-next"
            type="button"
            disabled={currentStep === "publish" && !!data?.imagesPreparing}
            onClick={currentStep === "publish" ? data?.onPublish : data?.onNext}
            className={`rounded-lg px-5 sm:px-8 py-2.5 medium-text-size font-semibold purple-btn focus:outline-none focus-visible:outline-none flex items-center gap-2 ${currentStep === "publish" && !!data?.imagesPreparing ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
          >
            {currentStep === "publish" && !!data?.imagesPreparing && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {currentStep === "publish"
              ? data?.imagesPreparing
                ? "Preparing..."
                : t("nTpublishNow", sourceKey.user)
              : t("nTnextStep", sourceKey.user)}
          </button>
        </div>
      </div>
      {loading && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-white z-[1070] ${isMobile ? "rounded-none" : "rounded-2xl"}`}
        >
          <div className="w-10 h-10 rounded-full border-4 border-slate-300 border-t-[var(--primary-color)] animate-spin" />
        </div>
      )}
    </div>
  );
};

export const GuidedReplayFinalModal = ({ data = {}, loading = false, onShareAgain, onEndSession, onClose }) => {
  const { t } = useTranslation();

  const isMobile = !!data?.isMobileViewport;
  const images = useMemo(() => normalizeImages(data?.previewImage), [data?.previewImage]);
  const previewIndex = data?.previewImageIndex || 0;
  const selectedImageIndex = data?.selectedImageIndex || 0;
  const imageErrorText = t("nTimageFailedToLoad", sourceKey.user) || "Image failed to load";

  const showPublishCarousel = data?.shareImageMode === "all" && images.length > 1;
  const currentReplaySrc = useMemo(() => {
    if (!images.length) return "";
    if (showPublishCarousel) {
      return images[previewIndex] || images[0] || "";
    }
    return images[selectedImageIndex] || images[0] || "";
  }, [images, previewIndex, selectedImageIndex, showPublishCarousel]);

  const [replayPreviewLoadState, setReplayPreviewLoadState] = useState({ loading: false, error: false });

  useEffect(() => {
    setReplayPreviewLoadState({
      loading: !!currentReplaySrc && !isImageReady(currentReplaySrc),
      error: false,
    });
  }, [currentReplaySrc]);

  return (
    <Spin spinning={loading}>
      <div
        className={`bg-white flex flex-col overflow-hidden ${isMobile ? "h-[100dvh] rounded-none" : `${DESKTOP_GUIDED_MODAL_HEIGHT} rounded-2xl`
          }`}
      >
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg">{t("nTreplayFinalTitle", sourceKey.user)}</h2>
          <button
            type="button"
            onClick={onClose || onEndSession}
            className="w-8 h-8 rounded-lg second-grey-text hover:bg-[var(--secondary-color)] flex items-center justify-center transition-colors"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-slate-900 mb-1">{t("nTreviewPublish", sourceKey.user)}</h3>
            <p className="large-text-size second-grey-text">{t("nTreplayFinalDesc", sourceKey.user)}</p>
          </div>

          {renderPublishPreview({
            images,
            selectedImageIndex,
            shareImageMode: data?.shareImageMode,
            previewIndex,
            onPreviewPrevious: data?.onPreviewPrevious,
            onPreviewNext: data?.onPreviewNext,
            selectedPlatform: data?.selectedPlatform,
            content: data?.shareText || "",
            t,
            imageLoadState: replayPreviewLoadState,
            onImageLoad: () => setReplayPreviewLoadState({ loading: false, error: false }),
            onImageError: () => setReplayPreviewLoadState({ loading: false, error: true }),
            imageErrorText,
          })}
        </div>

        <div className="shrink-0 border-t border-[var(--border-secondary)] bg-[var(--background-secondary)] px-4 sm:px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onShareAgain}
            className="rounded-lg px-5 sm:px-8 py-2.5 medium-text-size font-semibold purple-btn border border-[var(--primary-color)]"
          >
            {t("share?", sourceKey.user)}
          </button>
        </div>
      </div>
    </Spin>
  );
};
