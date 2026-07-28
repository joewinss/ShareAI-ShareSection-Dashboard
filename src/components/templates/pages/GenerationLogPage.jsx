import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Col, message, Row, Tabs, Tag } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, CopyOutlined } from "@ant-design/icons";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { GoogleReview, OthersIcon } from "../../../../public/assets/index";
import { connect } from "react-redux";
import ListingTable from "@/components/general/components/ListingTable";
import { formatDate, getMaskedCode } from "@/utility/common-functions";
import getContentGenerationLog from "@/pages/api/contentGeneration/getContentGeneration";
import getVisualGenerationLog from "@/pages/api/visualGeneration/getVisualGeneration";
import { isEmpty } from "lodash";

export const GenerationLogPage = (props) => {
    const { t } = useTranslation();
    const { user, activeTab, showTabs = true } = props;
    const router = useRouter();
    const userIdentity = user?.role;
    const PAGE_SIZE = 10;
    const [internalTab, setInternalTab] = useState("content");
    const currentTab = activeTab || internalTab;
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [filterGroup, setFilterGroup] = useState({});
    const [dataSource, setDataSource] = useState([]);


    const CONTENT_GENERATION_CREATED = {
        QUEUED: 0,
        PROCESSING: 1,
        COMPLETED: 2,
        FAILED: 3,
    }

    const CONTENT_GENERATION_ISCOMPLETE = {
        TRUE: true,
        FALSE: false,
    }

    const VISUAL_GENERATION_STATUS = {
        QUEUED: 0,
        PROCESSING: 1,
        COMPLETED: 2,
        FAILED: 3,
    }

    const CONTENT_GENERATION_CREATED_TAG = {
        [CONTENT_GENERATION_CREATED.QUEUED]: { label: "Queued", color: "gold" },
        [CONTENT_GENERATION_CREATED.PROCESSING]: { label: "Processing", color: "blue" },
        [CONTENT_GENERATION_CREATED.COMPLETED]: { label: "Completed", color: "green" },
        [CONTENT_GENERATION_CREATED.FAILED]: { label: "Failed", color: "red" },
    }

    const VISUAL_GENERATION_STATUS_TAG = {
        [VISUAL_GENERATION_STATUS.QUEUED]: { label: "Queued", color: "gold" },
        [VISUAL_GENERATION_STATUS.PROCESSING]: { label: "Processing", color: "blue" },
        [VISUAL_GENERATION_STATUS.COMPLETED]: { label: "Completed", color: "green" },
        [VISUAL_GENERATION_STATUS.FAILED]: { label: "Failed", color: "red" },
    }

    const getContentStatusTag = (status) => {
        const tag = CONTENT_GENERATION_CREATED_TAG[status];
        if (!tag) return null;
        return <Tag color={tag.color}>{tag.label}</Tag>;
    };

    const getContentCompletionTag = (status, isComplete) => {
        if (
            status === CONTENT_GENERATION_CREATED.QUEUED ||
            status === CONTENT_GENERATION_CREATED.PROCESSING
        ) {
            return null;
        }
        const isCompleteValue = isComplete === CONTENT_GENERATION_ISCOMPLETE.TRUE;
        return isCompleteValue
            ? <CheckCircleOutlined style={{ color: "#16a34a" }} />
            : <CloseCircleOutlined style={{ color: "#dc2626" }} />;
    };

    const getVisualStatusTag = (status) => {
        const tag = VISUAL_GENERATION_STATUS_TAG[status];
        return <Tag color={tag.color}>{tag.label}</Tag>;
    };

    useEffect(() => {
        const skip = (page - 1) * PAGE_SIZE;
        getData(skip);
    }, [currentTab, page, filterGroup]);

    const getData = async (skip) => {
        setLoading(true);
        const filterParams = {
            userId: user?._id,
            ...filterGroup,

        };
        {
            currentTab === "content" ?
                getContentGenerationLog(PAGE_SIZE, skip, filterParams)
                    .then((res) => { setDataSource(res.data); setTotal(res.total) })
                    .catch((err) => message.error(err))
                    .finally(() => setLoading(false))
                : currentTab === "visual" ?
                    getVisualGenerationLog(PAGE_SIZE, skip, filterParams)
                        .then((res) => { setDataSource(res.data); setTotal(res.total) })
                        .catch((err) => message.error(err))
                        .finally(() => setLoading(false))
                    : message.error("Error")
        }
    };

    async function onRefresh() {
        if (page !== 1) {
            setPage(1);
            return;
        }
        getData(0);
    }

    const tabItems = [

        {
            key: "content",
            label: (<span>{t("content", sourceKey.user)}</span>),
        },
        ...userIdentity === "masterHQ" ? [
            {
                key: "visual",
                label: (<span>{t("nTvisual", sourceKey.user)}</span>),
            }
        ] : []
    ];

    const columns = [
        {
            title: t("productName", sourceKey.user),
            dataIndex: (currentTab === "content" ? "productName" : currentTab === "visual" ? "selectedType" : null),
            filterable: true,
            key: 'productName',
            render: (text, record, index) => (
                currentTab === "content" ? record?.productName :
                    currentTab === "visual" ? record?.selectedType :
                        null
            ),
        },
        {
            title: t("batchId", sourceKey.user),
            dataIndex: (currentTab === "content" ? 'batchId' : currentTab === "visual" ? "n8nExecutionId" : null),
            filterable: true,
            key: 'batchId',
            render: (text, record, index) => (
                currentTab === "content" ?
                    (!isEmpty(record?.batchId) ?
                        <div className="flex flex-row gap-2 justify-between items-center">
                            {getMaskedCode(record?.batchId).display}
                            <button
                                type="button"
                                className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
                                onClick={() => {
                                    navigator.clipboard.writeText(record?.batchId);
                                    message.success("Copied to clipboard!");
                                }}
                            >
                                <CopyOutlined />
                            </button>
                        </div> :
                        <Tag color="red">Not Available</Tag>
                    ) :
                    currentTab === "visual" ?
                        (!isEmpty(record?.n8nExecutionId) ?
                            <div className="flex flex-row gap-2 justify-between items-center">
                                {getMaskedCode(record?.n8nExecutionId).display}
                                <button
                                    type="button"
                                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(record?.n8nExecutionId);
                                        message.success("Copied to clipboard!");
                                    }}
                                >
                                    <CopyOutlined />
                                </button>
                            </div> :
                            <Tag color="red">Not Available</Tag>) :
                        null
            ),
        },
        {
            title: t("createdBy", sourceKey.user),
            dataIndex: 'createAt',
            // filterable: true,
            key: 'createdBy',
            render: (text, record, index) => (
                record?.creatorUsername
            ),
        },
        ...(currentTab === "content"
            ? [...(userIdentity === "masterHQ"
                ? [{
                    title: t("assignTo", sourceKey.user),
                    dataIndex: 'assignTo',
                    // filterable: true,
                    key: 'assignTo',
                    render: (text, record, index) => (
                        currentTab === "content" ? record?.OutletName :
                            currentTab === "visual" ? record?.username :
                                null
                    )
                }]
                : [])]
            : []
        ),
        {
            title: t("return", sourceKey.user),
            dataIndex: 'callbackProgress',
            filterable: true,
            key: 'callbackProgress',
            render: (text, record, index) => (
                currentTab === "content" ? (
                    record.callbackProgress ? `${record?.callbackProgress?.totalReceived} / ${record?.callbackProgress?.totalExpected }` : "N/A"
                ) : null
            )
        },
        {
            title: t("createdTime", sourceKey.user),
            dataIndex: 'createdTime',
            filterable: true,
            key: 'createdTime',
            render: (text, record, index) => (
                currentTab === "content" ? (
                    <span className="inline-flex items-center gap-2">
                        {/* {getContentStatusTag(record?.status)} */}
                        <span>{formatDate(record?.startedAt, "D MMM YYYY HH:mm:ss")}</span>
                    </span>
                ) : currentTab === "visual" ? (
                    <span className="inline-flex items-center gap-2">
                        {/* {getVisualStatusTag(record?.status)} */}
                        <span>{formatDate(record?.createdAt, "D MMM YYYY HH:mm:ss")}</span>
                    </span>
                ) : null

            )
        },
        {
            title: t("status", sourceKey.user),
            dataIndex: 'status',
            filterable: true,
            key: 'status',
            render: (text, record, index) => (
                currentTab === "content" ? getContentStatusTag(record?.status) :
                    currentTab === "visual" ? getVisualStatusTag(record?.status)
                        : null
            ),
        },
        {
            title: t("lastUpdatedAt", sourceKey.user),
            dataIndex: 'lastUpdatedAt',
            filterable: true,
            key: 'lastUpdatedAt',
            render: (text, record, index) => (
                currentTab === "content" ? (
                    <span className="inline-flex items-center gap-2">
                        {/* {getContentCompletionTag(
                            record?.status,
                            record?.callbackProgress?.isComplete
                        )} */}
                        {record?.callbackProgress?.isComplete === CONTENT_GENERATION_ISCOMPLETE.TRUE ? <span>{formatDate(record?.callbackProgress?.lastCallbackAt, "D MMM YYYY HH:mm:ss")}</span> : <span>{record.startedAt != record.updatedAt ? formatDate(record?.updatedAt, "D MMM YYYY HH:mm:ss") : "-"}</span>}
                    </span>
                ) : currentTab === "visual" ? formatDate(record?.processedAt, "D MMM YYYY HH:mm:ss")
                    : null
            ),
        },
    ]

    const handleTabChange = (key) => {
        if (!activeTab) {
            setInternalTab(key);
        }
        setPage(1);
        setFilterGroup({});
    };

    return (
        <>
            <div className="p-3">
                {showTabs && (
                    <div className="mb-5 flex flex-row justify-between">
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {t("generationLog", sourceKey.user)}
                            </h1>
                        </div>
                        <div />
                    </div>
                )}

                {showTabs && (
                    <Tabs
                        type="card"
                        onChange={handleTabChange}
                        activeKey={String(currentTab)}
                        tabBarStyle={{ marginBottom: 0 }}
                        items={tabItems}
                    />
                )}

                <div className="min-h-screen bg-white from-slate-50 to-blue-50">
                    <div className="max-w-full mx-auto">
                        <Row align="middle" justify="space-between" className="p-3">
                            <Col>
                                <div className="font-bold text-xl">
                                    {currentTab === "content"
                                        ? `${t("contentGenerationLog", sourceKey.user)}`
                                        : currentTab === "visual"
                                            ? `${t("visualGenerationLog", sourceKey.user)}`
                                            : "Unknown"}
                                </div>
                            </Col>
                            <Col />
                        </Row>

                        <div>
                            <ListingTable
                                key={currentTab}
                                columns={columns}
                                dataSource={dataSource}
                                setPage={setPage}
                                total={total}
                                page={page}
                                loading={loading}
                                // listingActions={listingActions}
                                PAGE_SIZE={PAGE_SIZE}
                                onRefresh={onRefresh}
                                filterTag={true}
                                filterGroup={filterGroup}
                                setFilterGroup={setFilterGroup}
                                onFilter={(filter) => {
                                    setFilterGroup({
                                        ...filter,
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const mapStateToProps = (state) => ({
    user: state.user.user,
});

export default connect(mapStateToProps)(GenerationLogPage);
