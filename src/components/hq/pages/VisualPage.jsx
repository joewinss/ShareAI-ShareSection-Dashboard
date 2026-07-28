import React, { useEffect, useState } from "react";
import { Camera, Image as ImageIcon, Loader2, RefreshCcw, Sparkles } from "lucide-react";
import { connect } from "react-redux";
import { IMAGE_PROCESSING_STATUS } from "@/constants/image";
import getVisualQueueByUserId from "@/pages/api/visualCategory/getVisualQueueByUserId";
import { Button, Empty, message, Pagination, Spin } from "antd";
import { useRouter } from "next/router";
import { LoadingOutlined } from "@ant-design/icons";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { replaceStringPattern } from "@/utility/common-functions";

const TABS = [
    { id: "all", label: "All" },
    { id: IMAGE_PROCESSING_STATUS.COMPLETED, label: "Completed" },
    { id: IMAGE_PROCESSING_STATUS.PROCESSING, label: "Processing" },
    { id: IMAGE_PROCESSING_STATUS.QUEUED, label: "Waiting" },
];

const PAGE_SIZE = 10;

const STATUS_LABEL = {
    [IMAGE_PROCESSING_STATUS.COMPLETED]: "Completed",
    [IMAGE_PROCESSING_STATUS.PROCESSING]: "Processing",
    [IMAGE_PROCESSING_STATUS.QUEUED]: "Queued",
    [IMAGE_PROCESSING_STATUS.FAILED]: "Failed",
};

const STATUS_STYLES = {
    [IMAGE_PROCESSING_STATUS.COMPLETED]: "bg-emerald-100 text-emerald-700",
    [IMAGE_PROCESSING_STATUS.PROCESSING]: "bg-amber-100 text-amber-700",
    [IMAGE_PROCESSING_STATUS.QUEUED]: "bg-blue-100 text-blue-700",
    [IMAGE_PROCESSING_STATUS.FAILED]: "bg-red-100 text-red-700"
};

const formatTimestamp = (value) => {
    if (!value) return "Unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleString();
};

const getQueryValue = (value) => (Array.isArray(value) ? value[0] : value);

const normalizeTabValue = (value) => {
    const raw = getQueryValue(value);
    if (raw === undefined || raw === null || raw === "") return TABS[0].id;
    if (raw === "all") return "all";
    if (typeof raw === "number") return raw;
    const numeric = Number.parseInt(raw, 10);
    if (Number.isFinite(numeric) && String(numeric) === String(raw).trim()) return numeric;
    return raw;
};

const parseTabFromQuery = (value) => {
    const tab = normalizeTabValue(value);
    const match = TABS.find((entry) => String(entry.id) === String(tab));
    return match ? match.id : TABS[0].id;
};

const parsePageFromQuery = (value) => {
    const raw = getQueryValue(value);
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const VisualPage = ({ userId }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(TABS[0].id);
    const [visuals, setVisuals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const router = useRouter();

    const updateQuery = (nextTab, nextPage) => {
        if (!router.isReady) return;
        router.replace(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    tab: nextTab,
                    page: String(nextPage)
                }
            },
            undefined,
            { shallow: true }
        );
    };

    useEffect(() => {
        if (!router.isReady) return;
        const nextTab = parseTabFromQuery(router.query.tab);
        const nextPage = parsePageFromQuery(router.query.page);
        const currentTab = getQueryValue(router.query.tab);
        const currentPage = getQueryValue(router.query.page);
        const normalizedPage = String(nextPage);
        const normalizedTab = String(nextTab);
        const needsReplace = String(currentTab) !== normalizedTab || String(currentPage) !== normalizedPage;
        setActiveTab(nextTab);
        setPage(nextPage);
        if (needsReplace) {
            updateQuery(nextTab, nextPage);
        }
    }, [router.isReady, router.query.tab, router.query.page]);

    useEffect(() => {
        if (!router.isReady || !userId) return;
        const queryTab = getQueryValue(router.query.tab);
        const queryPage = getQueryValue(router.query.page);
        const isQuerySynced = String(queryTab) === String(activeTab) && String(queryPage) === String(page);
        if (!isQuerySynced) return;
        getData((page - 1) * PAGE_SIZE, activeTab);
    }, [router.isReady, userId, page, activeTab, router.query.tab, router.query.page]);

    const getData = (skip, statusOverride) => {
        if (!userId) return;
        setLoading(true);
        if (isNaN(parseInt(skip, 10))) {
            skip = 0;
        } else {
            skip = parseInt(skip, 10);
        }
        const query = { userId };
        const status = statusOverride ?? activeTab;
        if (status !== "all") {
            query.status = status;
        }
        getVisualQueueByUserId(PAGE_SIZE, skip, query)
            .then((res) => {
                const rawEntries = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
                const normalized = rawEntries
                    .map((record) => {
                        const images = Array.isArray(record?.images) ? record.images : [];
                        const status = Number.isFinite(record?.status)
                            ? record.status
                            : Number.parseInt(record?.status, 10);
                        return {
                            jobId: record?._id,
                            imageUrl: images[0]?.imageUrl, // Only one card per record; show first image when multiple
                            selectedType: record?.selectedType,
                            selectedMode: record?.selectedMode,
                            updatedAt: record?.updatedAt,
                            status,
                            creditCost: record?.creditCosted,
                            selectedTittle: record?.typeRelated?.title
                        };
                    })
                    .filter((visual) => visual.jobId);

                setVisuals(normalized);
                setTotal(Number.isFinite(res?.total) ? res.total : rawEntries.length);
            })
            .catch((err) => {
                console.error("Failed to load visuals", err);
            })
            .finally(() => setLoading(false));
    };

    const refresh = () => {
        updateQuery(TABS[0].id, 1);
    }

    return (
        <div className="relative p-6 space-y-6">
            {loading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                    <Spin
                        indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}
                        size="large"
                        className="text-primary"
                    />
                    <span className="ml-4 text-primary">Loading...</span>
                </div>
            )}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Visuals</h1>
                    <p className="text-sm text-gray-600">
                        Quick preview of generated visuals by platform.
                    </p>
                </div>
            </header>

            <div className="flex w-full flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-3">
                    {TABS.map((tab) => {
                        const isActive = tab.id === activeTab;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    if (tab.id === activeTab) return;
                                    updateQuery(tab.id, 1);
                                }}
                                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${isActive
                                    ? "border-transparent bg-gradient-to-r from-green-500 to-blue-500 text-white shadow"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <Button
                    onClick={refresh}
                    loading={loading}
                    className="ml-auto rounded-full border px-4 py-2 text-sm font-medium transition"
                    icon={<RefreshCcw size={15} className="mt-1" />}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
                {loading && !visuals.length ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin">
                        Loading visuals...
                    </Loader2>
                ) : visuals.length ? (
                    visuals.map((visual) => {
                        const pillTone = STATUS_STYLES[visual.status];
                        const statusLabel = STATUS_LABEL[visual.status] || "Unknown";
                        return (
                            <div
                                key={visual.jobId}
                                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                onClick={() => {
                                    visual.status === IMAGE_PROCESSING_STATUS.COMPLETED ? router.push({
                                        pathname: "/hq/visual/showVisual",
                                        query: { jobId: visual.jobId, tab: activeTab, page: String(page) }
                                    }) :
                                        visual.status === IMAGE_PROCESSING_STATUS.PROCESSING ? message.warning("Processing... Please wait to view the result.") :
                                            visual.status === IMAGE_PROCESSING_STATUS.QUEUED ? message.info("Queued... Please wait for a moment.") :
                                                visual.status === IMAGE_PROCESSING_STATUS.FAILED ? message.error("Error Found: Please contact our support team") : null
                                }}
                            >
                                <div className="relative overflow-hidden rounded-xl bg-gray-50">
                                    {visual.imageUrl ? (
                                        <img
                                            src={visual.imageUrl}
                                            alt={visual.selectedType || "Generated visual"}
                                            className="h-48 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-48 items-center justify-center text-gray-400">
                                            <ImageIcon className="h-10 w-10" />
                                        </div>
                                    )}
                                    <div
                                        className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${pillTone}`}
                                    >
                                        {statusLabel}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between text-sm text-gray-700">
                                        <span className="font-semibold">
                                            {visual.selectedTittle}
                                        </span>
                                        {visual.selectedMode ?
                                            <span className="inline-flex items-center gap-1 text-blue-600">
                                                <Camera className="h-4 w-4" />
                                                {t(visual.selectedMode, sourceKey.user) || visual.selectedMode}
                                            </span> : null}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Credit Costed: {visual.creditCost}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Updated: {formatTimestamp(visual.updatedAt)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
                        <Empty description="No visuals found" />
                        <p className="mt-2 text-sm text-gray-400">Get started by generating some visuals!</p>
                    </div>
                )}
            </div>

            <div className="flex justify-end items-center mt-4">
                <Pagination
                    current={page}
                    pageSize={PAGE_SIZE}
                    total={total}
                    showQuickJumper={true}
                    showSizeChanger={false}
                    onChange={(nextPage) => updateQuery(activeTab, nextPage)}
                    showTotal={(total, range) =>
                        replaceStringPattern(t("nTpagination", sourceKey.user), {
                            range1: range[0],
                            range2: range[1],
                            total: total
                        })
                    }
                />
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    userId: state.user?.user?._id
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(VisualPage)
