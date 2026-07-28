import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Checkbox, message, Spin, Image, Row, Col, Pagination, Empty } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { connect } from 'react-redux';
import getGeneratedContent from '@/pages/api/contentGeneration/getGeneratedContent';
import editContentStatus from '@/pages/api/contentGeneration/editContentStatus';
import { CONTENT_STATUS } from '@/constant/template';
import { CheckOutlined, CloseOutlined, RedoOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import FilterDrawerV2 from '@/components/general/components/FilterDrawerV2';
import FilterTags from '@/components/general/components/FilterTags';
import { FilterIcon } from '../../../../public/assets/index';
import { inputTypes } from '@/utility/config';
import getOutletListingsByMasterHQ from '@/pages/api/user/getOutletListingsByMasterHQ';
import { PRESET_STATUS, USER_STATUS } from '@/constants/user';
import getPresetContent from '@/pages/api/contentPreset/getPresetContent';
import { replaceStringPattern } from '@/utility/common-functions';
import ContentCardSection from '../components/ContentCardSection';
import ViewContentDrawer from '@/templates/ViewContentDrawer';
import getCategory from '@/pages/api/category/getCategory';
import { useRefreshStats } from '@/hooks/useStatsInfo';
import { mapOutletOptions } from '@/utility/option-mappers';

export const MultiSelectContentPage = (props) => {
    const { t } = useTranslation();
    const { user } = props;
    const [loading, setLoading] = useState(false);
    const [contentLoading, setContentLoading] = useState(true);
    const [allContent, setAllContent] = useState([]);
    const [selectedContentIds, setSelectedContentIds] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);
    const [filterGroup, setFilterGroup] = useState({});
    const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
    const [outletOption, setOutletOption] = useState([]);
    const [presetTemplatesOption, setPresetTemplatesOption] = useState([]);
    const [viewContentDrawerOpen, setViewContentDrawerOpen] = useState(false);
    const [selectedContent, setSelectedContent] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const PAGE_SIZE = 10;
    const router = useRouter();
    const userIdentity = user?.role;
    const contentPermission = user?.contentPermission
    const hasAuthority = userIdentity === "masterHQ" || contentPermission === 1;
    const [categoryOption, setCategoryOption] = useState([]);
    const refreshSidebarStats = useRefreshStats("sidebar");

    useEffect(() => {
        // Load filter options immediately when component mounts to ensure display name mapping works
        loadPresetTemplates();
        loadCategoryOptions();
        if (userIdentity === "masterHQ") {
            loadOutletOption();
        }
    }, []);

    useEffect(() => {
        if (!router.isReady) return;

        const { pageType, ...filters } = router.query;
        if (pageType) {
            setPageInfo({ pageType });
        }

        // Initialize filters if present in URL
        if (Object.keys(filters).length > 0) {
            setFilterGroup(prev => ({ ...prev, ...filters }));
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        if (!pageInfo) return;
        loadContent((page - 1) * PAGE_SIZE);
    }, [page, filterGroup, pageInfo]);

    useEffect(() => {
        if (filterDrawerVisible && userIdentity === "masterHQ" && outletOption.length === 0) {
            loadOutletOption();
        }
        if (filterDrawerVisible) {
            loadPresetTemplates();
            loadCategoryOptions();

        }
    }, [filterDrawerVisible]);

    const loadOutletOption = async () => {
        try {
            const response = await getOutletListingsByMasterHQ("all", 0, {
                status: USER_STATUS.ACTIVE,
            });
            if (response?.success && response?.data) {
                setOutletOption(mapOutletOptions(response?.data));
            } else {
                setOutletOption([]);
            }
        } catch (error) {
            console.error("Error loading outlet options:", error);
            setOutletOption([]);
        }
    };

    const loadPresetTemplates = async () => {
        try {
            const response = await getPresetContent("all", 0, {
                statusNe: PRESET_STATUS.DELETED,
            });
            if (response?.success && response?.data) {
                const options = response?.data?.map((preset) => ({
                    title: preset?.productName,
                    value: preset.productId,
                }));
                setPresetTemplatesOption(options);
            } else {
                setPresetTemplatesOption([]);
            }
        } catch (error) {
            console.error(error.message);
            setPresetTemplatesOption([]);
        }
    };

    const loadCategoryOptions = async () => {
        try {
            const response = await getCategory("all", 0, {
                status: CONTENT_STATUS.ACTIVE,
            });
            if (response?.data) {
                const options = response?.data?.map((category) => ({
                    title: category.title,
                    value: category._id,
                }));
                setCategoryOption(options);
            }
        } catch (error) {
            console.error("Error loading category options:", error);
        }
    };

    function loadContent(skip) {
        setContentLoading(true);

        if (isNaN(parseInt(skip))) {
            skip = 0;
        } else {
            skip = parseInt(skip);
        }

        let statusFilter;
        switch (pageInfo?.pageType) {
            case 'pending':
                statusFilter = CONTENT_STATUS.PENDING_REVIEW;
                break;
            case 'live':
                statusFilter = CONTENT_STATUS.ACTIVE;
                break;
            case 'bin':
                statusFilter = CONTENT_STATUS.ARCHIVED;
                break;
            default:
                statusFilter = CONTENT_STATUS.PENDING_REVIEW;
        }

        const filterParams = {
            status: statusFilter,
            ...(userIdentity === "outlet" ? { outletUserId: user?._id } : {}),
            ...filterGroup,
        };

        getGeneratedContent(PAGE_SIZE, skip, filterParams)
            .then((res) => {
                setAllContent(res?.data || []);
                setTotal(res?.total || 0);
                setContentLoading(false);
            })
            .catch((err) => {
                console.error("❌ loadContent failed:", err);
                message.error(err?.message || 'Failed to load content');
                setAllContent([]);
                setTotal(0);
                setContentLoading(false);
            });
    }

    const toggleContentSelection = (contentId) => {
        setSelectedContentIds(prev => {
            if (prev.includes(contentId)) {
                return prev.filter(id => id !== contentId);
            } else {
                return [...prev, contentId];
            }
        });
    };

    const selectAllContent = () => {
        if (selectedContentIds.length === allContent.length) {
            setSelectedContentIds([]);
        } else {
            setSelectedContentIds(allContent.map(content => content._id));
        }
    };

    const handleBatchAction = async (action) => {
        if (selectedContentIds.length === 0) {
            message.warning(t("pleaseSelectContent", sourceKey.user) || "Please select content");
            return;
        }

        setLoading(true);
        try {
            // Get imageUrls from all selected content for approve action
            // Format: { contentId1: [urls...], contentId2: [urls...] }
            const imageUrls = action === 'approve'
                ? allContent
                    .filter(c => selectedContentIds.includes(c._id))
                    .reduce((acc, content) => {
                        if (content.imageUrls && content.imageUrls.length > 0) {
                            acc[content._id] = content.imageUrls;
                        }
                        return acc;
                    }, {})
                : undefined;

            const response = await editContentStatus({
                contentId: selectedContentIds,
                action: action,
                imageUrls: imageUrls
            });

            if (response?.data?.success) {
                const summary = response?.data?.summary;
                message.success(
                    `${t("contentStatusUpdated", sourceKey.user)}: ${summary?.successful || selectedContentIds.length} ${t("successful", sourceKey.user)}, ${summary?.failed || 0} ${t("failed", sourceKey.user)}`
                );

                // Refresh content
                loadContent((page - 1) * PAGE_SIZE);
                setSelectedContentIds([]);
                refreshSidebarStats();
            }
        }
        catch (error) {
            console.error("Error in batch action:", error);
            message.error(error?.message || "Error updating content");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const getPageTitle = () => {
        switch (pageInfo?.pageType) {
            case 'pending':
                return t("pending", sourceKey.user);
            case 'live':
                return t("shareAI", sourceKey.user);
            case 'bin':
                return t("bin", sourceKey.user);
            default:
                return t("nTmultiSelect", sourceKey.user);
        }
    };

    const getPageDescription = () => {
        switch (pageInfo?.pageType) {
            case 'pending':
                return t("pendingDesc", sourceKey.user);
            case 'live':
                return t("shareAIDesc", sourceKey.user);
            case 'bin':
                return t("binDesc", sourceKey.user);
            default:
                return "";
        }
    };

    const filterOptions = [
        // {
        //     title: t("platform", sourceKey.user),
        //     dataIndex: "platform",
        //     filterable: true,
        //     type: inputTypes.dropdown,
        //     selections: [
        //         { title: t("googleReview", sourceKey.user), value: "googleReview" },
        //         { title: t("others", sourceKey.user), value: "others" },
        //     ],
        //     placeholder: t("platform", sourceKey.user),
        // },
        {
            title: t("productName", sourceKey.user),
            dataIndex: "productName",
            filterable: true,
            placeholder: t("productName", sourceKey.user) || "Search content text...",
        },
        {
            title: t("nTlanguage", sourceKey.user),
            dataIndex: "language",
            filterable: true,
            type: inputTypes.dropdown,
            selections: [
                { title: t("nTenglish", sourceKey.user), value: "english" },
                { title: t("nTmalay", sourceKey.user), value: "malay" },
                { title: t("nTchinese", sourceKey.user), value: "chinese" },
            ],
            placeholder: t("nTlanguage", sourceKey.user),
        },
        {
            title: t("nTpresetTemplate", sourceKey.user),
            dataIndex: "productId",
            filterable: true,
            type: inputTypes.dropdown,
            selections: presetTemplatesOption,
            placeholder: t("nTpresetTemplate", sourceKey.user),
            renderData: (productId) => {
                const preset = presetTemplatesOption.find((p) => p.value === productId);
                return preset ? preset.title : productId;
            },
        },
        {
            title: t("nTcategory", sourceKey.user),
            dataIndex: "categoryId",
            filterable: true,
            type: inputTypes.dropdown,
            selections: categoryOption,
            placeholder: t("nTcategory", sourceKey.user),
        },
        ...(userIdentity === "masterHQ"
            ? [
                {
                    title: t("outlet", sourceKey.user),
                    dataIndex: "outletUserId",
                    filterable: true,
                    type: inputTypes.dropdown,
                    selections: outletOption,
                    placeholder: t("selectOutlet", sourceKey.user) || "Select outlet",
                    renderData: (outletId) => {
                        const outlet = outletOption.find((o) => o.value === outletId);
                        return outlet ? outlet.title : outletId;
                    },
                },
            ]
            : []),
        {
            title: t("createdAt", sourceKey.user),
            dataIndex: "createdAt",
            filterable: true,
            type: inputTypes.dateRange,
        },
    ];

    const getAvailableActions = () => {
        if (!hasAuthority) {
            return [];
        }

        switch (pageInfo?.pageType) {
            case 'pending':
                return [
                    { key: 'approve', label: t("approve", sourceKey.user), icon: <CheckOutlined />, color: 'text-green-600' },
                    { key: 'reject', label: t("reject", sourceKey.user), icon: <CloseOutlined />, color: 'text-red-600' }
                ];
            case 'live':
            case 'bin':
                return [
                    { key: 'restore', label: t("restore", sourceKey.user), icon: <RedoOutlined />, color: 'text-blue-600' }
                ];
            default:
                return [];
        }
    };

    return (
        <>
            <div className={`${pageInfo?.pageType === 'pending' ? 'pending-bg' : pageInfo?.pageType === 'bin' ? 'live-bg' : 'live-bg'} p-3`}>
                {/* Header Section */}
                <div className="mb-5 flex flex-row justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <Button
                                type="text"
                                icon={<ArrowLeft className="w-5 h-5" />}
                                onClick={() => router.back()}
                                className="hover:bg-gray-100"
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {getPageTitle()} - {t("nTmultiSelect", sourceKey.user)}
                                </h1>
                                <span className="text-gray-600 mt-1">
                                    {getPageDescription()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="min-h-screen bg-white from-slate-50 to-blue-50">
                    <div className="max-w-full mx-auto">
                        {/* Title and Actions Row */}
                        <Row align="middle" justify="space-between" className="p-3">
                            <Col>
                                <div className="font-bold text-xl">
                                    {t("nTmultiSelect", sourceKey.user)}
                                </div>
                            </Col>
                            <Col>
                                <Row align="middle" gutter={8}>
                                    {getAvailableActions().map(action => (
                                        <Col key={action.key}>
                                            <Button
                                                loading={loading}
                                                disabled={selectedContentIds.length === 0}
                                                className={`ant-btn-default ${selectedContentIds.length === 0 ? 'disabled-btn' : ''} ${action.color}`}
                                                icon={action.icon}
                                                onClick={() => handleBatchAction(action.key)}
                                            >
                                                {action.label} ({selectedContentIds.length})
                                            </Button>
                                        </Col>
                                    ))}
                                </Row>
                            </Col>
                        </Row>

                        <div className="p-3">
                            <div className="h-px w-full mb-3 bg-black/[0.02]"></div>

                            {/* Filter and Selection Controls */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mb-6 flex justify-between w-full items-center"
                            >
                                {/* Filter Button */}
                                <div
                                    className="rounded-lg p-2 cursor-pointer hover:bg-gray-200 border"
                                    onClick={() => setFilterDrawerVisible(true)}
                                >
                                    <div className='flex flex-row items-center gap-2'>
                                        <img src={FilterIcon} style={{ width: "18px" }} />
                                        <span>{t("nTfilter", sourceKey.user)}</span>
                                    </div>
                                </div>

                                {/* Selection Controls */}
                                {allContent.length > 0 && (
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-600 font-medium">
                                            {selectedContentIds.length} {t("selected", sourceKey.user) || "selected"}
                                        </span>
                                        <Button
                                            type="link"
                                            onClick={selectAllContent}
                                            className="purple-text"
                                        >
                                            {selectedContentIds.length === allContent.length
                                                ? t("deselectAll", sourceKey.user) || "Deselect All"
                                                : t("selectAll", sourceKey.user) || "Select All"}
                                        </Button>
                                    </div>
                                )}
                            </motion.div>

                            {/* Render Active Filter Tags */}
                            <FilterTags
                                filterGroup={filterGroup}
                                setFilterGroup={setFilterGroup}
                                filterOptions={filterOptions}
                                onFilterRemove={() => {
                                    setPage(1);
                                    setSelectedContentIds([]);
                                }}
                                onClearAll={() => {
                                    setPage(1);
                                    setSelectedContentIds([]);
                                }}
                            />

                            <Spin spinning={contentLoading} tip={t("loadingContent", sourceKey.user) || "Loading content..."}>
                                {/* Content Grid */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2"
                                >
                                    {allContent.map((content, index) => {
                                        const isSelected = selectedContentIds.includes(content._id);
                                        return (
                                            <div
                                                key={content._id}
                                                className={`relative cursor-pointer transition-all ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : ''
                                                    }`}
                                                onClick={() => toggleContentSelection(content._id)}
                                            >
                                                <ContentCardSection
                                                    template={content}
                                                    index={index}
                                                    t={t}
                                                    onPreviewClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedContent(content);
                                                        setViewContentDrawerOpen(true);
                                                    }}
                                                />
                                                {/* Checkbox Overlay */}
                                                <div className="absolute top-2 right-2 z-10">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        style={{ pointerEvents: 'none' }}
                                                    />
                                                </div>
                                                {/* Selected Overlay */}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-purple-500 bg-opacity-10 pointer-events-none rounded-lg" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </motion.div>

                                {!contentLoading && allContent.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-center py-10 text-gray-500"
                                    >
                                        <Empty />
                                    </motion.div>
                                )}
                            </Spin>

                            {/* Pagination */}
                            <div className="flex justify-end items-center mt-4">
                                <Pagination
                                    current={page}
                                    pageSize={PAGE_SIZE}
                                    total={total}
                                    showQuickJumper={true}
                                    showSizeChanger={false}
                                    onChange={(page) => {
                                        setPage(page);
                                        setSelectedContentIds([]);
                                    }}
                                    showTotal={(total, range) => replaceStringPattern(t("nTpagination", sourceKey.user), {
                                        range1: range[0],
                                        range2: range[1],
                                        total: total
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Content Drawer */}
            <ViewContentDrawer
                open={viewContentDrawerOpen}
                onClose={() => {
                    setViewContentDrawerOpen(false);
                    setSelectedContent(null);
                }}
                content={selectedContent}
                onSuccess={() => {
                    setViewContentDrawerOpen(false);
                    setSelectedContent(null);
                    loadContent((page - 1) * PAGE_SIZE);
                }}
                userIdentity={userIdentity}
            />

            {/* Filter Drawer */}
            <FilterDrawerV2
                filterGroup={filterGroup}
                setFilterGroup={(value) => {
                    setFilterGroup({
                        ...filterGroup,
                        ...value,
                    });
                    setPage(1);
                    setSelectedContentIds([]);
                }}
                open={filterDrawerVisible}
                onClose={() => setFilterDrawerVisible(false)}
                dataSource={filterOptions}
            />
        </>
    );
};

const mapStateToProps = (state) => ({
    user: state.user.user,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(MultiSelectContentPage);
