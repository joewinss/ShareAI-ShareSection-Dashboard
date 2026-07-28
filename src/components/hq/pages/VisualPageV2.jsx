import React, { useEffect, useId, useMemo, useState } from "react";
import { ArrowRight, RefreshCcw, Trash2 } from "lucide-react";
import { connect } from "react-redux";
import { useRouter } from "next/router";
import { Button } from "antd";
import VisualImageCard from "@/components/hq/components/VisualImageCard";
import TagToImagePool from "@/components/hq/components/TagToImagePool";
import DonwloadAiVisual from "@/components/hq/components/DonwloadAiVisual";
import ViewSelectedVisual from "@/components/hq/components/ViewSelectedVisual";
import getGeneratedVisualContent from "@/pages/api/visualCategory/getGeneratedVisualContent";
import getVisualCategoryListings from "@/pages/api/visualCategory/getVisualCategoryListings";
import getVisualQueueByUserId from "@/pages/api/visualCategory/getVisualQueueByUserId";
import { IMAGE_PROCESSING_STATUS, VISUAL_CATEGORY_STATUS } from "@/constants/image";
import { VISUAL_INDUSTRY_CODE } from "@/constants/visualMode";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { replaceStringPattern } from "@/utility/common-functions";
import { buildSimilarUploadPath, getLastSelectedProductUrl, getSingleSelectedProductUrl } from "@/components/hq/components/ImageListSimilar";
import { getVisualIndustryBadgeLabel, getVisualIndustryCodeValue } from "@/components/hq/components/visualIndustryBadge";

const INDUSTRY_DOT_COLOR = {
    [VISUAL_INDUSTRY_CODE.PRODUCT]: "bg-blue-400",
    [VISUAL_INDUSTRY_CODE.FURNITURE]: "bg-emerald-400",
    [VISUAL_INDUSTRY_CODE.FASHION]: "bg-purple-400",
    [VISUAL_INDUSTRY_CODE.BUSINESS_PORTRAIT]: "bg-orange-400",
    [VISUAL_INDUSTRY_CODE.DESIGN]: "bg-cyan-400",
    [VISUAL_INDUSTRY_CODE.BEAUTY]: "bg-pink-400",
    [VISUAL_INDUSTRY_CODE.ELECTRONICS]: "bg-indigo-400",
    [VISUAL_INDUSTRY_CODE.BASIC_INTERIOR]: "bg-amber-400",
};

const INDUSTRY_TAG_CODES = Object.keys(INDUSTRY_DOT_COLOR);

const VisualPageV2 = ({ userId }) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [completedVisuals, setCompletedVisuals] = useState([]);
    const [completedLoading, setCompletedLoading] = useState(false);
    const [processingVisuals, setProcessingVisuals] = useState([]);
    const [processingLoading, setProcessingLoading] = useState(false);
    const [queuedVisuals, setQueuedVisuals] = useState([]);
    const [failedVisual, setFailedVisual] = useState([]);
    const [queuedLoading, setQueuedLoading] = useState(false);
    const [failedLoading, setFailedLoading] = useState(false);
    const [completedTotal, setCompletedTotal] = useState("");
    const [processingTotal, setProcessingTotal] = useState("");
    const [queueTotal, setQueueTotal] = useState("");
    const [failedTotal, setFailedTotal] = useState("");
    const [selectedCompleted, setSelectedCompleted] = useState(() => new Set());
    const [downloadingSelected, setDownloadingSelected] = useState(false);
    const [tagToImagePoolOpen, setTagToImagePoolOpen] = useState(false);
    const [viewSelectedOpen, setViewSelectedOpen] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [isSimilarModeActive, setIsSimilarModeActive] = useState(false);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, imageUrl: "" });
    const selectedImageUrls = useMemo(
        () => completedVisuals
            .map((visual) => visual?.resultImageUrls?.[0])
            .filter((url) => url && selectedCompleted.has(url)),
        [completedVisuals, selectedCompleted]
    );
    const lastSelectedProductUrl = useMemo(
        () => getLastSelectedProductUrl(
            completedVisuals,
            selectedCompleted,
            VISUAL_INDUSTRY_CODE.PRODUCT,
            (visual) => visual?.resultImageUrls?.[0]
        ),
        [selectedCompleted, completedVisuals]
    );
    const singleSelectedProductUrl = useMemo(
        () => getSingleSelectedProductUrl(selectedCompleted, lastSelectedProductUrl),
        [selectedCompleted, lastSelectedProductUrl]
    );
    const sendToSimilarUrl = singleSelectedProductUrl;
    // const sendToSimilarUrl = lastSelectedProductUrl;

    // Classname Constant
    const gridClass = "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    const emptyStateClass = "rounded-xl border border-gray-200 whitebg-color p-8 text-center text-sm text-gray-500";
    const sectionButtonClass = "group inline-flex items-center gap-2 text-left";
    const sectionLabelClass = "text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:bg-gradient-to-r group-hover:from-green-500 group-hover:to-blue-500 group-hover:bg-clip-text group-hover:text-transparent";
    const sectionIconClass = "relative flex h-5 w-5 items-center justify-center";
    const arrowIconClass = "h-4 w-4 text-gray-900 transition-all duration-200 animate-pulse group-hover:animate-none group-hover:opacity-0";
    const arrowHoverClass = "absolute h-4 w-4 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1 group-hover:scale-110";
    const isRefreshing = completedLoading || processingLoading || queuedLoading || failedLoading;
    const hasSelection = selectedCompleted.size > 0;

    const GradientArrow = ({ className }) => {
        const gradientId = useId();
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                </defs>
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
            </svg>
        );
    };

    const handleSectionClick = (type) => {
        router.push({ pathname: "/hq/visual/details", query: { type } });
        document.getElementById("app-scroll-container").scrollTo({ top: 0, behavior: "smooth" })
    };

    const toggleCompletedSelection = (key) => {
        if (!key) return;
        setSelectedCompleted((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const clearCompletedSelection = () => {
        setSelectedCompleted(new Set());
    };

    const handleSendToSimilar = (imageUrl) => {
        if (!imageUrl) return;
        clearCompletedSelection();
        setContextMenu({ visible: false, x: 0, y: 0, imageUrl: "" });
        router.push(buildSimilarUploadPath(imageUrl));
    };

    const handleCloseDownloadModal = () => {
        setShowDownloadModal(false);
    };

    // ==========================
    // |     Get Data           |
    // ==========================
    function getCompletedData() {
        setCompletedLoading(true);
        getGeneratedVisualContent()
            .then((res) => {
                setCompletedTotal(res?.total)
                const list = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res)
                        ? res
                        : [];
                setCompletedVisuals(list.slice(0, 10));
            })
            .catch((err) => {
                console.error("Failed to load completed visuals", err);
            })
            .finally(() => setCompletedLoading(false));
    }

    function getProcessingData() {
        if (!userId) {
            setProcessingVisuals([]);
            return;
        }
        setProcessingLoading(true);
        getVisualQueueByUserId(10, 0, { userId, status: IMAGE_PROCESSING_STATUS.PROCESSING })
            .then((res) => {
                setProcessingTotal(res?.total)
                const list = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res)
                        ? res
                        : [];
                setProcessingVisuals(list);
            })
            .catch((err) => {
                console.error("Failed to load processing visuals", err);
            })
            .finally(() => setProcessingLoading(false));
    }

    function getQueuedData() {
        if (!userId) {
            setQueuedVisuals([]);
            return;
        }
        setQueuedLoading(true);
        getVisualQueueByUserId(10, 0, { userId, status: IMAGE_PROCESSING_STATUS.QUEUED })
            .then((res) => {
                setQueueTotal(res?.total)
                const list = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res)
                        ? res
                        : [];
                setQueuedVisuals(list);
            })
            .catch((err) => {
                console.error("Failed to load queued visuals", err);
            })
            .finally(() => setQueuedLoading(false));
    }

    function getFailedData() {
        if (!userId) {
            setFailedVisual([]);
            return;
        }
        setFailedLoading(true);
        getVisualQueueByUserId(10, 0, { userId, status: IMAGE_PROCESSING_STATUS.FAILED })
            .then((res) => {
                setFailedTotal(res?.total)
                const list = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res)
                        ? res
                        : [];
                setFailedVisual(list);
            })
            .catch((err) => {
                console.error("Failed to load queued visuals", err);
            })
            .finally(() => setFailedLoading(false));
    }

    function checkSimilarModeActive() {
        getVisualCategoryListings(50, 0, { status: VISUAL_CATEGORY_STATUS.ACTIVE })
            .then((res) => {
                const list = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res)
                        ? res
                        : [];
                setIsSimilarModeActive(list.some((item) => item?.title === "Similar"));
            })
            .catch(() => {
                setIsSimilarModeActive(false);
            });
    }

    function getData() {
        getCompletedData();
        getProcessingData();
        getQueuedData();
        getFailedData();
        clearCompletedSelection();
    };

    useEffect(() => {
        getData();
        checkSimilarModeActive();
    }, [userId]);

    useEffect(() => {
        if (!contextMenu.visible) return;
        const closeOnClick = () => setContextMenu({ visible: false, x: 0, y: 0, imageUrl: "" });
        const closeOnContextMenu = (e) => {
            e.preventDefault();
            setContextMenu({ visible: false, x: 0, y: 0, imageUrl: "" });
        };
        document.addEventListener("click", closeOnClick);
        document.addEventListener("contextmenu", closeOnContextMenu, true);
        return () => {
            document.removeEventListener("click", closeOnClick);
            document.removeEventListener("contextmenu", closeOnContextMenu, true);
        };
    }, [contextMenu.visible]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl space-y-10">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900">{t("visualPool", sourceKey.user)}</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {t("imageLibraryDesc", sourceKey.user)}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {hasSelection ? (
                            <>
                                <Button
                                    onClick={() => setViewSelectedOpen(true)}
                                    className="rounded-full border px-4 py-2 text-sm font-medium transition hover:shadow-sm"
                                >
                                    View
                                </Button>
                                <Button
                                    onClick={() => setTagToImagePoolOpen(true)}
                                    className="rounded-full border px-4 py-2 text-sm font-medium transition hover:shadow-sm"
                                >
                                    {t("addImagePool", sourceKey.user)}
                                </Button>
                                <Button
                                    onClick={() => setShowDownloadModal(true)}
                                    loading={downloadingSelected}
                                    className="rounded-full border px-4 py-2 text-sm font-medium transition hover:shadow-sm"
                                >
                                    {t("download", sourceKey.user)}
                                </Button>
                                {isSimilarModeActive && sendToSimilarUrl ? (
                                    <Button
                                        onClick={() => handleSendToSimilar(sendToSimilarUrl)}
                                        className="rounded-full border px-4 py-2 text-sm font-medium transition hover:shadow-sm"
                                    >
                                        Send to Similar
                                    </Button>
                                ) : null}
                            </>
                        ) : null}
                        <Button
                            onClick={getData}
                            loading={isRefreshing}
                            className="rounded-full border px-4 py-2 text-sm font-medium transition hover:shadow-sm"
                            icon={<RefreshCcw size={15} className="mt-1" />}
                        >
                            {t("refresh", sourceKey.user)}
                        </Button>
                    </div>
                </header>


                {/* Complete sector */}
                <section className="space-y-4">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className={sectionButtonClass}
                            onClick={() => handleSectionClick("complete")}
                        >
                            <span className={sectionLabelClass}>{t("complete", sourceKey.user)}</span>
                            <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                {completedTotal}
                            </span>
                            <span className={sectionIconClass}>
                                <ArrowRight className={arrowIconClass} />
                                <GradientArrow className={arrowHoverClass} />
                            </span>
                        </button>
                    </div>
                    {completedLoading ? (
                        <div className={emptyStateClass}>
                            {replaceStringPattern(t("loadingStatus", sourceKey.user), { status: t("complete", sourceKey.user) })}
                        </div>
                    ) : completedVisuals.length ? (
                        <div className={gridClass}>
                            {completedVisuals.map((visual, index) => {
                                const imageUrl = visual?.resultImageUrls?.[0];
                                if (!imageUrl) return null;
                                const visualKey = imageUrl;
                                const industryCode = getVisualIndustryCodeValue(visual?.visualIndustryCode);
                                const normalizedIndustryCode = industryCode.toLowerCase();
                                const industryBadgeLabel = getVisualIndustryBadgeLabel(industryCode, INDUSTRY_TAG_CODES);
                                return (
                                    <div
                                        key={visualKey}
                                        className="relative"
                                        onContextMenu={(event) => {
                                            if (!isSimilarModeActive || normalizedIndustryCode !== VISUAL_INDUSTRY_CODE.PRODUCT) return;
                                            event.preventDefault();
                                            setContextMenu({ visible: true, x: event.clientX, y: event.clientY, imageUrl });
                                        }}
                                    >
                                        <VisualImageCard
                                            src={imageUrl}
                                            alt="Completed visual"
                                            selectable
                                            selected={selectedCompleted.has(visualKey)}
                                            onClick={() => toggleCompletedSelection(visualKey)}
                                        />
                                        <div
                                            className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2.5 py-1 pointer-events-none max-w-[calc(100%-1rem)]"
                                            title={industryBadgeLabel}
                                        >
                                            <span className={`shrink-0 h-2 w-2 rounded-full ${INDUSTRY_DOT_COLOR[normalizedIndustryCode] || "bg-gray-400"}`} />
                                            <span className="text-gray-900 text-[10px] font-medium truncate leading-none capitalize">{industryBadgeLabel}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={emptyStateClass}>
                            {replaceStringPattern(t("noCompleteYet", sourceKey.user), { status: t("complete", sourceKey.user) })}
                        </div>
                    )}
                </section>

                {/* Processing Sector */}
                <section className="space-y-4">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className={sectionButtonClass}
                            onClick={() => handleSectionClick("processing")}
                        >
                            <span className={sectionLabelClass}>{t("processing", sourceKey.user)}</span>
                            <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                {processingTotal}
                            </span>
                            <span className={sectionIconClass}>
                                <ArrowRight className={arrowIconClass} />
                                <GradientArrow className={arrowHoverClass} />
                            </span>
                        </button>
                    </div>
                    {processingLoading ? (
                        <div className={emptyStateClass}>
                            {replaceStringPattern(t("loadingStatus", sourceKey.user), { status: t("processing", sourceKey.user) })}
                        </div>
                    ) : processingVisuals.length ? (
                        <div className={gridClass}>
                            {processingVisuals.map((visual, index) => {
                                const imageUrl = visual.images[0]?.imageUrl;
                                return (
                                    <VisualImageCard
                                        key={visual?._id || imageUrl || index}
                                        src={imageUrl}
                                        alt="Processing visual"
                                        selectable={false}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className={emptyStateClass}>
                            {replaceStringPattern(t("noCompleteYet", sourceKey.user), { status: t("complete", sourceKey.user) })}
                        </div>
                    )}
                </section>

                {/* Waiting Sector */}
                <section className="space-y-4">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className={sectionButtonClass}
                            onClick={() => handleSectionClick("waiting")}
                        >
                            <span className={sectionLabelClass}>{t("waiting", sourceKey.user)}</span>
                            <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                {queueTotal}
                            </span>
                            <span className={sectionIconClass}>
                                <ArrowRight className={arrowIconClass} />
                                <GradientArrow className={arrowHoverClass} />
                            </span>
                        </button>
                    </div>
                    {queuedLoading ? (
                        <div className={emptyStateClass}>
                            {replaceStringPattern(t("loadingStatus", sourceKey.user), { status: t("waiting", sourceKey.user) })}
                        </div>
                    ) : queuedVisuals.length ? (
                        <div className={gridClass}>
                            {queuedVisuals.map((visual, index) => {
                                const imageUrl = visual.images[0]?.imageUrl;
                                return (
                                    <VisualImageCard
                                        key={visual?._id || imageUrl || index}
                                        src={imageUrl}
                                        alt="Waiting visual"
                                        selectable={false}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className={emptyStateClass}>
                            {replaceStringPattern(t("noCompleteYet", sourceKey.user), { status: t("waiting", sourceKey.user) })}
                        </div>
                    )}
                </section>

                {/* Failed Sector */}
                <section className="space-y-4">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className={sectionButtonClass}
                            onClick={() => handleSectionClick("failed")}
                        >
                            <span className={sectionLabelClass}>{t("failed", sourceKey.user)}</span>
                            <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                {failedTotal}
                            </span>
                            <span className={sectionIconClass}>
                                <ArrowRight className={arrowIconClass} />
                                <GradientArrow className={arrowHoverClass} />
                            </span>
                        </button>
                    </div>
                    {failedLoading ? (
                        <div className={emptyStateClass}>
                            {replaceStringPattern(t("loadingStatus", sourceKey.user), { status: t("failed", sourceKey.user) })}
                        </div>
                    ) : failedVisual.length ? (
                        <div className={gridClass}>
                            {failedVisual.map((visual, index) => {
                                const imageUrl = visual.images[0]?.imageUrl;
                                return (
                                    <VisualImageCard
                                        key={visual?._id || imageUrl || index}
                                        src={imageUrl}
                                        alt="Failed visual"
                                        selectable={false}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className={emptyStateClass}>
                            {replaceStringPattern(t("noCompleteYet", sourceKey.user), { status: t("failed", sourceKey.user) })}
                        </div>
                    )}
                </section>
            </div>
            {tagToImagePoolOpen ? (
                <TagToImagePool
                    selectedImage={selectedImageUrls}
                    onClose={() => setTagToImagePoolOpen(false)}
                    onComplete={() => {
                        setTagToImagePoolOpen(false);
                        clearCompletedSelection();
                    }}
                />
            ) : null}
            {showDownloadModal ? (
                <DonwloadAiVisual
                    selectedImage={selectedImageUrls}
                    onClose={handleCloseDownloadModal}
                    onDownloadingChange={setDownloadingSelected}
                />
            ) : null}
            <ViewSelectedVisual
                selectedImage={selectedImageUrls}
                open={viewSelectedOpen}
                onClose={() => setViewSelectedOpen(false)}
            />
            {contextMenu.visible ? (
                <div
                    className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleSendToSimilar(contextMenu.imageUrl)}
                    >
                        Send to Similar
                    </button>
                </div>
            ) : null}
        </div>
    );
};

const mapStateToProps = (state) => ({
    userId: state.user?.user?._id
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(VisualPageV2)