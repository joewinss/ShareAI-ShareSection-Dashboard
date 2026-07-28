import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Col, Divider, message, Row } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { CardSummary } from '../components/CardSummary';
import { sourceKey } from '@/locales/config';
import { formatDecimalNumber } from '@/utility/common-functions';
import { connect } from 'react-redux';
import OverviewCard from '../components/OverviewCard';
import { AppstoreOutlined, FileTextOutlined, EditOutlined, RightOutlined, ThunderboltOutlined } from '@ant-design/icons';
import getUserPlatformCount from '@/pages/api/userPlatform/getUserPlatformCount';
import getContentCount from '@/pages/api/userPlatform/getContentCount';
import { FilterIcon } from '../../../../public/assets/index';
import FilterDrawerV2 from '@/components/general/components/FilterDrawerV2';
import FilterTags from '@/components/general/components/FilterTags';
import getOutletListingsByMasterHQ from '@/pages/api/user/getOutletListingsByMasterHQ';
import { USER_STATUS } from '@/constants/user';
import { inputTypes } from '@/utility/config';
import { mapOutletOptions } from '@/utility/option-mappers';
import { User } from 'lucide-react';
import getStats from '@/pages/api/dashboard/getStats';
import { CONTENT_STATUS } from '@/constant/template';

const normalizeBoundaryDate = (value, boundary = "start") => {
    if (!value) return null;

    const normalizeFromDate = (inputDate) => {
        const parsedDate = new Date(inputDate);
        if (Number.isNaN(parsedDate.getTime())) return null;

        if (boundary === "end") {
            parsedDate.setHours(23, 59, 59, 999);
        } else {
            parsedDate.setHours(0, 0, 0, 0);
        }

        return parsedDate;
    };

    if (typeof value?.startOf === "function" && typeof value?.endOf === "function") {
        const adjusted = boundary === "end" ? value.endOf("day") : value.startOf("day");
        if (typeof adjusted?.toDate === "function") {
            return adjusted.toDate();
        }
        if (typeof adjusted?.valueOf === "function") {
            return normalizeFromDate(adjusted.valueOf());
        }
    }

    if (value instanceof Date || typeof value === "string" || typeof value === "number") {
        return normalizeFromDate(value);
    }

    return null;
};

const DashboardPage = (props) => {
    const { t } = useTranslation();
    const [filterGroup, setFilterGroup] = useState({});
    const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
    const [outletOptions, setOutletOptions] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [totalSharedContents, setTotalSharedContents] = useState(0);
    const [totalGenerated, setTotalGenerated] = useState(0);
    const [totalDeleted, setTotalDeleted] = useState(0);
    const [platformMeta, setPlatformMeta] = useState({});
    const [englishCount, setEnglishCount] = useState(0);
    const [chineseCount, setChineseCount] = useState(0);
    const [malayCount, setMalayCount] = useState(0);
    const userIdentity = props.user?.role;
    const router = useRouter();
    const numberPeople = Number(200);
    const agakAgakNumber = totalSharedContents * numberPeople;
    const canUseDashboardFilters = userIdentity === "masterHQ" || userIdentity === "outlet";
    const bannerLabel = useMemo(() => {
        const platformUserType = platformMeta?.userType || userIdentity;
        const viewType = platformMeta?.viewType;
        const selectedOutletName = platformMeta?.selectedOutletName;

        if (platformUserType === "masterHQ") {
            if (viewType === "allOutletsAndHQ") return "HQ + All Overview";
        if (viewType === "selectedOutlet") {
                return selectedOutletName ? `${selectedOutletName} Overview` : "Outlet Overview";
            }
            return "HQ Overview";
        }

        if (platformUserType === "outlet") {
            return "Outlet Overview";
        }

        return "Overview";
    }, [platformMeta?.userType, platformMeta?.viewType, platformMeta?.selectedOutletName, userIdentity]);

    const orderedDataSource = useMemo(() => {
        if (!Array.isArray(dataSource)) return [];
        const rest = [];
        const others = [];
        dataSource.forEach((item) => {
            if (String(item?.platform || '').toLowerCase() === 'others') {
                others.push(item);
            } else {
                rest.push(item);
            }
        });
        return [...rest, ...others];
    }, [dataSource]);

    const statsQuery = useMemo(() => ({
        ...(userIdentity === "outlet" ? { outletUserId: props.user?._id } : {}),
        ...(() => {
            const { createdAt, createdTo, dateType, ...restFilters } = filterGroup || {};
            const createdAtFrom = normalizeBoundaryDate(createdAt, "start");
            const createdAtTo = normalizeBoundaryDate(createdTo, "end");

            return {
                ...restFilters,
                ...(createdAtFrom ? { createdAtFrom } : {}),
                ...(createdAtTo ? { createdAtTo } : {}),
                ...(dateType ? { dateType } : {}),
            };
        })(),
    }), [filterGroup, props.user?._id, userIdentity]);

    const statsQueryForStats = useMemo(() => ({
        ...statsQuery,
        status: CONTENT_STATUS.ACTIVE,
    }), [statsQuery]);

    const hasActiveFilters = useMemo(() => {
        if (!filterGroup) return false;
        return Object.values(filterGroup).some((value) => {
            if (Array.isArray(value)) return value.length > 0;
            if (value === null || value === undefined) return false;
            if (typeof value === 'string') return value.trim().length > 0;
            return true;
        });
    }, [filterGroup]);

    useEffect(() => {
        getData();
    }, [statsQuery]);

    useEffect(() => {
        if (filterDrawerVisible && userIdentity === "masterHQ" && outletOptions.length === 0) {
            loadOutletOptions();
        }
    }, [filterDrawerVisible, userIdentity, outletOptions.length]);

    const loadOutletOptions = async () => {
        try {
            const response = await getOutletListingsByMasterHQ("all", 0, {
                status: USER_STATUS.ACTIVE,
                sort: JSON.stringify({ "businessInfo.businessName": 1 }),
            });
            if (response?.success && response?.data) {
                setOutletOptions(mapOutletOptions(response?.data));
                return;
            }
            setOutletOptions([]);
        } catch (error) {
            console.error("Error loading outlet options:", error);
            setOutletOptions([]);
        }
    };

    function getData() {
        Promise.all([
            getContentCount(0, 0, statsQuery),
            getUserPlatformCount(0, 0, statsQuery),
            getStats(0, 0, statsQueryForStats),
        ])
            .then(([contentRes, platformRes, statsRes]) => {
                const contentData = contentRes?.data;
                const platformData = platformRes?.data;
                const statsData = statsRes?.data;
                const contentUserType = contentData?.userType || userIdentity;
                const isOutletUser = contentUserType === "outlet";
                const useSelectedOutlet = Boolean(statsQuery?.outletUserId) || platformData?.viewType === "selectedOutlet";
                const contentScope = isOutletUser
                    ? (contentData?.user || contentData?.outlet || contentData)
                    : (useSelectedOutlet && contentData?.selectedOutlet
                        ? contentData.selectedOutlet
                        : (contentData?.hq || contentData?.outlet || contentData));

                setTotalGenerated(contentScope?.totalGeneratedCount?.content || 0);
                setTotalDeleted(contentScope?.totalDeletedCount?.content || 0);
                setTotalSharedContents(platformData?.totalSharedCount?.total || 0);
                setEnglishCount(statsData?.contentSummary?.contentByLanguage?.english?.totalApprovedNotShared || 0);
                setChineseCount(statsData?.contentSummary?.contentByLanguage?.chinese?.totalApprovedNotShared || 0);
                setMalayCount(statsData?.contentSummary?.contentByLanguage?.malay?.totalApprovedNotShared || 0);
                setPlatformMeta({
                    userType: platformData?.userType,
                    viewType: platformData?.viewType,
                    selectedOutletName: platformData?.selectedOutlet?.businessName || contentData?.selectedOutlet?.businessName,
                });

                const platformSummary = (() => {
                    const platformUserType = platformData?.userType || userIdentity;
                    if (platformUserType === "masterHQ") {
                        if (Array.isArray(platformData?.platforms)) return platformData.platforms;
                        if (Array.isArray(platformData?.platformSummary)) return platformData.platformSummary;
                        return [];
                    }
                    if (Array.isArray(platformData?.platformSummary)) return platformData.platformSummary;
                    if (Array.isArray(platformData?.platforms)) return platformData.platforms;
                    return [];
                })();

                const mappedSummary = platformSummary.map((item) => ({
                    platform: item?.title || item?.platform || item?.name || 'Unknown',
                    total: item?.sharedCount?.total ?? 0,
                    english: item?.sharedCount?.english ?? 0,
                    chinese: item?.sharedCount?.chinese ?? 0,
                    malay: item?.sharedCount?.malay ?? 0,
                }));

                setDataSource(mappedSummary);
            })
            .catch((err) => {
                console.log(err);
                message.error(err?.message);
            });
    }

    const filterOptions = useMemo(() => {
        const options = [];

        if (userIdentity === "masterHQ") {
            options.push({
                title: t("outlet", sourceKey.user),
                dataIndex: "outletUserId",
                filterable: true,
                type: inputTypes.dropdown,
                selections: outletOptions,
                placeholder: t("selectOutlet", sourceKey.user) || "Select outlet",
            });
        }
   
        options.push({
            title: t("nTdateType", sourceKey.user) || "Date Type",
            dataIndex: "dateType",
            filterable: true,
            type: inputTypes.dropdown,
            selections: [
                { title: t("nTcreatedDate", sourceKey.user) || "Created Date", value: "createdAt" },
                { title: t("nTsharedDate", sourceKey.user) || "Scanned Date", value: "sharedAt" },
            ],
            placeholder: t("nTcreatedDate", sourceKey.user) || "Created Date",
        });

        options.push({
            title: t("startDate", sourceKey.user),
            dataIndex: "createdAt",
            filterable: true,
            type: inputTypes.date,
            filterProps: {
                style: { width: "100%" },
                disabledDate: (current) => current && current.valueOf() > Date.now(),
            },
        });

        options.push({
            title: t("endDate", sourceKey.user),
            dataIndex: "createdTo",
            filterable: true,
            type: inputTypes.date,
            filterProps: {
                style: { width: "100%" },
                disabledDate: (current) => current && current.valueOf() > Date.now(),
            },
        });


        return options;
    }, [t, userIdentity, outletOptions]);

    const hasDateRangeFilter = Boolean(filterGroup?.createdAt || filterGroup?.createdTo);
    const activeDateType = filterGroup?.dateType || "createdAt";

    const overviewRowData = [
        {
            title: t('nTtotalGeneratedContents', sourceKey.user),
            value: hasDateRangeFilter && activeDateType === "sharedAt" ? "-" : formatDecimalNumber(totalGenerated, 0),
            handleClick: () => {
                router.push({ pathname: '/templates/pending-review' }, undefined, { shallow: true });
            }
        },
        {
            title: t('nTscanned', sourceKey.user),
            value: hasDateRangeFilter && activeDateType === "createdAt" ? "-" : formatDecimalNumber(totalSharedContents, 0),
            handleClick: () => {
                router.push({ pathname: '/templates/log', query: { tab: 'scan' } }, undefined, { shallow: true });
            }
        },
        {
            title: 'Total Deleted',
            value: hasDateRangeFilter && activeDateType === "sharedAt" ? "-" : formatDecimalNumber(totalDeleted, 0),
            handleClick: () => {
                router.push({ pathname: '/templates/bin' }, undefined, { shallow: true });
            }
        },
    ];

    const overviewColumnData = {
        title: (t("nTapproximatePeopleView", sourceKey.user)),
        value: <span className='flex flex-row items-center gap-2'> {formatDecimalNumber(agakAgakNumber, 0)} <User /></span>,
        hoverable: false,
        // handleClick: () => {
        //     agakAgakNumber > 0 && (message.success("HOOOORAY!! " + agakAgakNumber + " peoples had viewed !!"))
        //     agakAgakNumber === 0 && (message.info("Try to share your content to get more views!"))
        // }
    };

    const quickAccessItems = [
        {
            title: 'Categories',
            description: 'Manage and organize brand assets',
            path: '/knowledgeBase/category',
            icon: "1",
        },
        {
            title: 'Templates',
            description: 'Define brand tone and formatting',
            path: '/templates/preset',
            icon: "2",
        },
        {
            title: 'Content Creation',
            description: 'Generate multi-lingual content',
            path: '/templates/create',
            icon: "3",
        },
    ];



    return (
        <>
            <div className="relative mb-4 overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 shadow-lg">
                <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-blue-300/30 blur-2xl" />

                <div className="relative z-10 flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <span className="inline-flex items-center rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90 shadow-sm backdrop-blur-md">
                            Dashboard
                        </span>
                        <div className="flex items-center gap-2">
                            {canUseDashboardFilters && hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={() => setFilterGroup({})}
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/30 bg-white/20 text-xs font-semibold text-white/90 shadow-sm transition hover:bg-white/30"
                                    aria-label="Reset filters"
                                    title="Reset filters"
                                >
                                    ×
                                </button>
                            )}
                            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                                {bannerLabel}
                            </h1>
                        </div>
                    </div>
                    {canUseDashboardFilters && (
                        <button
                            type="button"
                            onClick={() => setFilterDrawerVisible(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold shadow-md transition hover:bg-white"
                        >
                            <img src={FilterIcon} className="h-4 w-4" />
                            <span>{t("nTfilter", sourceKey.user)}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Filter tags intentionally hidden; reset is available in the banner */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
                <div className="flex flex-col gap-4 lg:flex-1">
                    {overviewRowData.map((item) => (
                        <div key={item.title}>
                            <OverviewCard data={item} />
                        </div>
                    ))}
                </div>

                <div className="lg:flex-1">
                    <div className="h-full rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 p-[1px]">
                        <div className="flex h-full flex-col rounded-2xl bg-white px-5 py-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white">
                                        <ThunderboltOutlined />
                                    </span>
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Quick Access
                                    </span>
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                                    Direct Navigation
                                </span>
                            </div>

                            <div className="mt-4 flex flex-1 flex-col justify-between gap-3">
                                {quickAccessItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.title}
                                            type="button"
                                            onClick={() => router.push(item.path)}
                                            className="flex flex-1 items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-600 font-bold">
                                                    {item.icon}
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {item.title}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {item.description}
                                                    </span>
                                                </div>
                                            </div>
                                            <RightOutlined className="text-gray-300" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-4">
                <OverviewCard
                    data={{
                        ...overviewColumnData,
                        cardStyle: { border: 'none', borderRadius: 16 },
                        bodyStyle: { padding: '20px 24px' },
                        className: 'shadow-sm',
                    }}
                />
            </div>

            <div className="pb-4">
                <Row gutter={[12]}>
                    <Col xs={24} sm={8}>
                        <OverviewCard data={{ title: t("totalAvailableContentEn", sourceKey.user), hoverable: false, value: formatDecimalNumber(englishCount, 0) }} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <OverviewCard data={{ title: t("totalAvailableContentCn", sourceKey.user), hoverable: false, value: formatDecimalNumber(chineseCount, 0) }} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <OverviewCard data={{ title: t("totalAvailableContentMy", sourceKey.user), hoverable: false, value: formatDecimalNumber(malayCount, 0) }} />
                    </Col>
                </Row>
            </div>

            <Divider style={{ margin: '0' }} />
            <Row gutter={[12]}>
                {orderedDataSource.map((item) => (
                    <Col key={item.platform} xs={24} sm={24} md={12} lg={6} className="p-3">
                        <CardSummary data={item} outletUserId={filterGroup?.outletUserId} />
                    </Col>
                ))}
            </Row>

            {canUseDashboardFilters && (
                <FilterDrawerV2
                    filterGroup={filterGroup}
                    setFilterGroup={setFilterGroup}
                    open={filterDrawerVisible}
                    onClose={() => setFilterDrawerVisible(false)}
                    dataSource={filterOptions}
                />
            )}
        </>
    );
};


const mapStateToProps = (state) => ({
    user: state.user.user,
    // packages: state.packages.packages,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardPage);
