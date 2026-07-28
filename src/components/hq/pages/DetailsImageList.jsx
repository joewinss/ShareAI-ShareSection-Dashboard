import React, { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/router";
import VisualImageCard from "@/components/hq/components/VisualImageCard";
import getGeneratedVisualContent from "@/pages/api/visualCategory/getGeneratedVisualContent";
import TagToImagePool from "@/components/hq/components/TagToImagePool";
import ActionsBar from "@/components/hq/components/ActionsBar";
import DonwloadAiVisual from "@/components/hq/components/DonwloadAiVisual";
import ViewSelectedVisual from "@/components/hq/components/ViewSelectedVisual";
import { Button, Pagination } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import getVisualQueueByUserId from "@/pages/api/visualCategory/getVisualQueueByUserId";
import getVisualCategoryListings from "@/pages/api/visualCategory/getVisualCategoryListings";
import { IMAGE_PROCESSING_STATUS, VISUAL_CATEGORY_STATUS } from "@/constants/image";
import { VISUAL_INDUSTRY_CODE } from "@/constants/visualMode";
import { replaceStringPattern } from "@/utility/common-functions";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { getVisualIndustryBadgeLabel, getVisualIndustryCodeValue } from "@/components/hq/components/visualIndustryBadge";
import { buildSimilarUploadPath, getLastSelectedProductUrl, getSingleSelectedProductUrl } from "@/components/hq/components/ImageListSimilar";

const TYPE_LABELS = {
    complete: "Complete",
    processing: "Processing",
    waiting: "Waiting",
    failed: "Failed"
};
const PAGE_SIZE = 15;
const selectedGradient = "bg-gradient-to-r from-green-500 to-blue-500";
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

const getQueryValue = (value) => (Array.isArray(value) ? value[0] : value);

const parsePageFromQuery = (value) => {
    const raw = getQueryValue(value);
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const getResponseTotal = (res, fallback) => {
    const parsed = Number(res?.total);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const getFirstImageUrl = (imageUrls) => {
    if (Array.isArray(imageUrls)) return imageUrls[0];
    return imageUrls;
};

const DetailsImageList = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const rawType = typeof getQueryValue(router.query.type) === "string" ? getQueryValue(router.query.type) : "complete";
    const type = rawType.toLowerCase();
    const label = TYPE_LABELS[type] || TYPE_LABELS.complete;
    const isComplete = type === "complete";
    const isProcessing = type === "processing";
    const isWaiting = type === "waiting";
    const isFailed = type === "failed";
    const [completedImages, setCompletedImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedCompleted, setSelectedCompleted] = useState(() => new Set());
    const [downloadingSelected, setDownloadingSelected] = useState(false);
    const [tagToImagePoolOpen, setTagToImagePoolOpen] = useState(false);
    const [viewSelectedOpen, setViewSelectedOpen] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [isHeaderVisible, setHeaderVisible] = useState(true);
    const [isSimilarModeActive, setIsSimilarModeActive] = useState(false);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, imageUrl: "" });
    const headerRef = useRef(null);
    const selectedImageUrls = useMemo(() => completedImages.filter((_, index) =>
        selectedCompleted.has(index)).map((image) => image?.imageUrl).filter(Boolean), [completedImages, selectedCompleted]);
    const lastSelectedProductUrl = useMemo(
        () => getLastSelectedProductUrl(completedImages, selectedCompleted, VISUAL_INDUSTRY_CODE.PRODUCT),
        [completedImages, selectedCompleted]
    );
    const singleSelectedProductUrl = useMemo(
        () => getSingleSelectedProductUrl(selectedCompleted, lastSelectedProductUrl),
        [selectedCompleted, lastSelectedProductUrl]
    );
    const sendToSimilarUrl = singleSelectedProductUrl;
    // const sendToSimilarUrl = lastSelectedProductUrl;


    //Classname Constant
    const gridClass = "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    const emptyStateClass = "rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500";
    const actionButtonClass = "inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100";
    const themeDarkButtonClass = `${actionButtonClass} theme-gradient-button`;
    const cancelButtonClass = `${actionButtonClass} theme-danger-button`;
    const hasSelection = selectedCompleted.size > 0;

    // ==========================
    // |     Get Data           |
    // ==========================
    const updateQuery = (nextPage) => {
        if (!router.isReady) return;
        router.replace(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    page: String(nextPage),
                },
            },
            undefined,
            { shallow: true }
        );
    };

    const getCompletedData = (skip) => {
        setLoading(true);
        getGeneratedVisualContent(PAGE_SIZE, skip, {})
            .then((res) => {
                const list = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res)
                        ? res
                        : [];
                const images = list
                    .map((item) => ({
                        imageUrl: getFirstImageUrl(item?.resultImageUrls),
                        visualIndustryCode: item?.visualIndustryCode,
                    }))
                    .filter((item) => item.imageUrl);
                setCompletedImages(images);
                setTotal(getResponseTotal(res, images.length));
                setSelectedCompleted(new Set());
            })
            .catch((err) => {
                console.error("Failed to load completed visuals", err);
            })
            .finally(() => setLoading(false));
    };

    const getStatusData = (status, skip) => {
        setLoading(true);
        getVisualQueueByUserId(PAGE_SIZE, skip, { status })
            .then((res) => {
                const list = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res)
                        ? res
                        : [];
                const images = list
                    .map((item) => ({
                        imageUrl: item?.images?.[0]?.imageUrl,
                    }))
                    .filter((item) => item.imageUrl);
                setCompletedImages(images);
                setTotal(getResponseTotal(res, images.length));
                setSelectedCompleted(new Set());
            })
            .catch((err) => {
                console.error("Failed to load completed visuals", err);
            })
            .finally(() => setLoading(false));
    };

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
        const skip = (page - 1) * PAGE_SIZE;
        if (isComplete) {
            getCompletedData(skip);
        } else if (isProcessing) {
            getStatusData(IMAGE_PROCESSING_STATUS.PROCESSING, skip);
        } else if (isWaiting) {
            getStatusData(IMAGE_PROCESSING_STATUS.QUEUED, skip);
        } else if (isFailed) {
            getStatusData(IMAGE_PROCESSING_STATUS.FAILED, skip);
        } else {
            setCompletedImages([]);
            setTotal(0);
            setSelectedCompleted(new Set());
        }
    }

    useEffect(() => {
        if (!router.isReady) return;
        const nextPage = parsePageFromQuery(router.query.page);
        const currentPage = getQueryValue(router.query.page);
        setPage(nextPage);
        if (String(currentPage) !== String(nextPage)) {
            updateQuery(nextPage);
        }
    }, [router.isReady, router.query.page]);

    useEffect(() => {
        if (!router.isReady) return;
        const queryPage = getQueryValue(router.query.page);
        if (String(queryPage) !== String(page)) return;
        getData();
    }, [router.isReady, isComplete, isProcessing, isWaiting, isFailed, page, router.query.page]);

    useEffect(() => {
        if (!router.isReady) return;
        checkSimilarModeActive();
    }, [router.isReady]);


    // ===============================
    // |   Button Function Define    |
    // ===============================
    const toggleCompletedSelection = (index) => {
        setSelectedCompleted((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        if (!completedImages.length) return;
        setSelectedCompleted(new Set(completedImages.map((_, index) => index)));
    };

    const handleCancelSelection = () => {
        setSelectedCompleted(new Set());
    };

    const handlePageChange = (nextPage) => {
        setSelectedCompleted(new Set());
        updateQuery(nextPage);
    };

    const handleSendToSimilar = (imageUrl) => {
        if (!imageUrl) return;
        handleCancelSelection();
        setContextMenu({ visible: false, x: 0, y: 0, imageUrl: "" });
        router.push(buildSimilarUploadPath(imageUrl));
    };

    const handleCompletedContextMenu = (event, imageUrl, normalizedIndustryCode) => {
        if (!isComplete || !isSimilarModeActive || normalizedIndustryCode !== VISUAL_INDUSTRY_CODE.PRODUCT) return;
        event.preventDefault();
        setContextMenu({ visible: true, x: event.clientX, y: event.clientY, imageUrl });
    };

    //Check is header visible, if not show component Actionsbar
    useEffect(() => {
        if (!headerRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                setHeaderVisible(entry.isIntersecting);
            },
            { threshold: 0 }
        );
        observer.observe(headerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!contextMenu.visible) return;
        const closeOnClick = () => setContextMenu({ visible: false, x: 0, y: 0, imageUrl: "" });
        const closeOnContextMenu = (event) => {
            event.preventDefault();
            setContextMenu({ visible: false, x: 0, y: 0, imageUrl: "" });
        };
        document.addEventListener("click", closeOnClick);
        document.addEventListener("contextmenu", closeOnContextMenu, true);
        return () => {
            document.removeEventListener("click", closeOnClick);
            document.removeEventListener("contextmenu", closeOnContextMenu, true);
        };
    }, [contextMenu.visible]);

    //Define Button constant
    const refreshAction = {
        key: "refresh",
        label: "Refresh",
        className:
            "rounded-lg border px-4 py-2 text-sm font-medium transition hover:shadow-sm",
        onClick: getData,
        icon: <RefreshCcw size={15} className="mt-1" />,
    };
    const actions = isComplete
        ? hasSelection
            ? [
                {
                    key: "view",
                    label: "View",
                    className: themeDarkButtonClass,
                    onClick: () => setViewSelectedOpen(true),
                },
                {
                    key: "add-to-preset",
                    label: "Add to Preset Image Pool",
                    className: themeDarkButtonClass,
                    onClick: () => setTagToImagePoolOpen(true),
                },
                {
                    key: "download",
                    label: "Download",
                    className: themeDarkButtonClass,
                    onClick: () => setShowDownloadModal(true),
                    loading: downloadingSelected,
                },
                ...(isSimilarModeActive && sendToSimilarUrl ? [
                    {
                        key: "send-to-similar",
                        label: "Send to Similar",
                        className: themeDarkButtonClass,
                        onClick: () => handleSendToSimilar(sendToSimilarUrl),
                    },
                ] : []),
                {
                    key: "select-all",
                    label: "Select All",
                    className: actionButtonClass,
                    onClick: handleSelectAll,
                },
                {
                    key: "cancel",
                    label: "Cancel",
                    className: cancelButtonClass,
                    onClick: handleCancelSelection,
                },
                refreshAction,
            ]
            : [
                {
                    key: "select-all",
                    label: "Select All",
                    className: actionButtonClass,
                    onClick: handleSelectAll,
                },
                refreshAction,
            ]
        : [refreshAction];
    const showStickyActions = !isHeaderVisible && actions.length > 0;


    // Close Download Modal
    const handleCloseDownloadModal = () => {
        setShowDownloadModal(false);
    };

    return (
        <div className={`min-h-screen bg-gray-50 p-6 ${showStickyActions ? "pb-24" : ""}`}>
            <div className="mx-auto max-w-7xl space-y-8">
                <header ref={headerRef} className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">

                            <Button
                                onClick={() => router.push("/hq/visual")}
                                className={`${selectedGradient} hover:from-green-600 hover:to-blue-600 text-white border-0`}
                            >
                                <ArrowLeftOutlined />
                            </Button>
                            <h1 className="text-3xl font-semibold text-gray-900">{label}</h1>
                        </div>
                        <p className="text-sm text-gray-500">
                            {replaceStringPattern(t("imageListsDesc", sourceKey.user), { status: label.toLowerCase() })}
                        </p>
                    </div>

                    <ActionsBar actions={actions} />
                </header>

                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            {total}
                        </span>
                    </div>
                    {loading ? (
                        <div className={emptyStateClass}>{t("loading", sourceKey.user)}</div>
                    ) : completedImages.length ? (
                        <div className={gridClass}>
                            {completedImages.map((image, index) => {
                                const imageUrl = image?.imageUrl;
                                if (!imageUrl) return null;
                                const industryCode = getVisualIndustryCodeValue(image?.visualIndustryCode);
                                const normalizedIndustryCode = industryCode.toLowerCase();
                                const industryBadgeLabel = getVisualIndustryBadgeLabel(industryCode, INDUSTRY_TAG_CODES);
                                return (
                                    <div
                                        key={`${imageUrl}-${index}`}
                                        className="relative"
                                        onContextMenu={(event) => handleCompletedContextMenu(event, imageUrl, normalizedIndustryCode)}
                                    >
                                        <VisualImageCard
                                            src={imageUrl}
                                            alt={`${label} visual`}
                                            selectable={isComplete}
                                            selected={selectedCompleted.has(index)}
                                            onClick={isComplete ? () => toggleCompletedSelection(index) : undefined}
                                        />
                                        {isComplete && (
                                            <div
                                                className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2.5 py-1 pointer-events-none max-w-[calc(100%-1rem)]"
                                                title={industryBadgeLabel}
                                            >
                                                <span className={`shrink-0 h-2 w-2 rounded-full ${INDUSTRY_DOT_COLOR[normalizedIndustryCode] || "bg-gray-400"}`} />
                                                <span className="text-gray-900 text-[10px] font-medium truncate leading-none capitalize">{industryBadgeLabel}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={emptyStateClass}>
                            {replaceStringPattern(t("imageListNotFound", sourceKey.user), { status: label.toLowerCase() })}

                        </div>
                    )}
                    {total > PAGE_SIZE && (
                        <div className="flex justify-center pt-2">
                            <Pagination
                                current={page}
                                pageSize={PAGE_SIZE}
                                total={total}
                                showQuickJumper={true}
                                showSizeChanger={false}
                                onChange={handlePageChange}
                                showTotal={(total, range) =>
                                    replaceStringPattern(t("nTpagination", sourceKey.user), {
                                        range1: range[0],
                                        range2: range[1],
                                        total
                                    })
                                }
                            />
                        </div>
                    )}
                </section>
            </div>
            {showStickyActions && (
                <ActionsBar actions={actions} variant="sticky" align="center" />
            )}
            {tagToImagePoolOpen && (
                <TagToImagePool
                    selectedImage={selectedImageUrls}
                    onClose={() => setTagToImagePoolOpen(false)}
                    onComplete={() => {
                        setTagToImagePoolOpen(false);
                        handleCancelSelection();
                    }}
                />
            )}
            <ViewSelectedVisual
                selectedImage={selectedImageUrls}
                open={viewSelectedOpen}
                onClose={() => setViewSelectedOpen(false)}
            />
            {showDownloadModal && (
                <DonwloadAiVisual
                    selectedImage={selectedImageUrls}
                    onClose={handleCloseDownloadModal}
                    onDownloadingChange={setDownloadingSelected}
                />
            )}
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

export default DetailsImageList;