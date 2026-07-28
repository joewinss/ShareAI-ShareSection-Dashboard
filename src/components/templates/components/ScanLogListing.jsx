import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/router';
import { Col, Dropdown, Input, message, Pagination, Row, Switch, Tabs } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { formatDate } from '@/utility/common-functions';
import ListingTable from '@/components/general/components/ListingTable';
import { inputTypes } from '@/utility/config';
import { connect } from 'react-redux';
import getGeneratedContent from '@/pages/api/contentGeneration/getGeneratedContent';
import getPlatforms from '@/pages/api/content/getPlatforms';
import { CONTENT_STATUS, PLATFORM_STATUS } from '@/constant/template';
import RenderPlatformTag from './RenderPlatformTag';
import getOutletListingsByMasterHQ from '@/pages/api/user/getOutletListingsByMasterHQ';
import { USER_STATUS } from '@/constants/user';
import { mapOutletOptions } from '@/utility/option-mappers';
import { downlodBlobFromResponse } from '@/utility/downloadReport';
import { REPORT_NAME } from '@/constant/excel';
import exportExcel from '@/pages/api/excel/exportExcel';

const ScanLogListing = (props) => {
    const { t } = useTranslation();
    const user = props.user;
    const router = useRouter();
    const [filterGroup, setFilterGroup] = useState({});
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [platformOptions, setPlatformOptions] = useState([]);
    const [outletOptions, setOutletOptions] = useState([]);
    const userIdentity = user?.role;
    const filterGroupRef = useRef(filterGroup);

    const PAGE_SIZE = 10;


    const columns = [
        {
            title: t("businessName", sourceKey.user),
            dataIndex: 'outletUserId',
            key: 'outletUserId',
            filterable: userIdentity === "masterHQ" ? true : false,
            type: inputTypes.dropdown,
            selections: outletOptions,
            filterProps: {
                placeholder: "Select outlet",
            },
            render: (text, record, index) => (
                record?.outletBusinessName
            ),
        },
        {
            title: t("platform", sourceKey.user),
            dataIndex: 'sharePlatform',
            filterable: true,
            key: 'sharePlatform',
            fixed: "left",
            type: inputTypes.dropdown,
            selections: platformOptions,
            render: (text, record, index) => (
                <RenderPlatformTag status={record?.sharePlatform} />
            ),
        },
        {
            title: t("nTsharedAt", sourceKey.user),
            dataIndex: 'sharedAt',
            key: 'sharedAt',
            // filterable: true,
            // type: inputTypes.dateRange,
            render: (text, record, index) => (
                formatDate(record?.sharedAt, 'YYYY-MM-DD HH:mm:ss')

            ),
        },
    ];

    useEffect(() => {
        filterGroupRef.current = filterGroup;
    }, [filterGroup]);

    // Sync query filter (if any) into filterGroup when URL changes.
    useEffect(() => {
        if (!router.isReady) return;
        const sharePlatformParam = router.query?.sharePlatform;
        const sharePlatform = Array.isArray(sharePlatformParam) ? sharePlatformParam[0] : sharePlatformParam;
        const outletUserIdParam = router.query?.outletUserId;
        const outletUserId = Array.isArray(outletUserIdParam) ? outletUserIdParam[0] : outletUserIdParam;
        const currentFilterGroup = filterGroupRef.current || {};

        const shouldUpdateSharePlatform = sharePlatform && currentFilterGroup?.sharePlatform !== sharePlatform;
        const shouldUpdateOutletUserId = outletUserId && currentFilterGroup?.outletUserId !== outletUserId;

        if (shouldUpdateSharePlatform || shouldUpdateOutletUserId) {
            setFilterGroup((prev) => ({
                ...prev,
                ...(shouldUpdateSharePlatform ? { sharePlatform } : {}),
                ...(shouldUpdateOutletUserId ? { outletUserId } : {}),
            }));
            setPage(1);
        }
    }, [router.isReady, router.query?.sharePlatform, router.query?.outletUserId]);

    // Fetch data whenever filters or pagination change.
    useEffect(() => {
        if (!router.isReady) return;
        getData((page - 1) * PAGE_SIZE);
    }, [router.isReady, page, filterGroup]);

    // Sync filterGroup back into the URL for sharePlatform/outletUserId.
    useEffect(() => {
        if (!router.isReady) return;
        const sharePlatform = filterGroup?.sharePlatform;
        const outletUserId = filterGroup?.outletUserId;
        const currentShareParam = router.query?.sharePlatform;
        const currentShare = Array.isArray(currentShareParam) ? currentShareParam[0] : currentShareParam;
        const currentOutletParam = router.query?.outletUserId;
        const currentOutlet = Array.isArray(currentOutletParam) ? currentOutletParam[0] : currentOutletParam;

        const nextQuery = { ...router.query };
        if (sharePlatform) {
            nextQuery.sharePlatform = sharePlatform;
        } else {
            delete nextQuery.sharePlatform;
        }
        if (outletUserId) {
            nextQuery.outletUserId = outletUserId;
        } else {
            delete nextQuery.outletUserId;
        }

        const normalizedShare = sharePlatform || undefined;
        const normalizedOutlet = outletUserId || undefined;
        if (currentShare === normalizedShare && currentOutlet === normalizedOutlet) return;

        router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
    }, [router.isReady, filterGroup?.sharePlatform, filterGroup?.outletUserId, router.pathname, router.query]);

    useEffect(() => {
        loadPlatformOptions();
    }, []);

    useEffect(() => {
        if (userIdentity === "masterHQ") {
            loadOutletOptions();
        }
    }, [userIdentity]);

    function getData(skip) {
        setLoading(true);

        if (isNaN(parseInt(skip))) {
            skip = 0;
        } else {
            skip = parseInt(skip);
        }

        const filterParams = {
            isShared: 1,
            ...filterGroup,
        };

        getGeneratedContent(PAGE_SIZE, skip, filterParams)
            .then((res) => {
                setDataSource(res?.data || []);
                setTotal(res?.total);
            })

            .catch((err) => {
                console.log(err);
                message.error(err?.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const loadPlatformOptions = async () => {
        try {
            const response = await getPlatforms("all", 0, {
                status: PLATFORM_STATUS.ACTIVE,
            });
            if (response?.data) {
                const options = response?.data?.map((platform) => ({
                    title: platform.title,
                    value: platform.title,
                }));
                setPlatformOptions(options);
            }
        } catch (error) {
            console.error("Error loading category options:", error);
        }
    };


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
            setOutletOptions(buildOutletOptionsFromData(dataSource));
        } catch (error) {
            console.error("Error loading outlet options:", error);
            setOutletOptions(buildOutletOptionsFromData(dataSource));
        }
    };



    async function onRefresh() {
        setPage(1)
        if (page !== 1) {
            getData((page - 1) * PAGE_SIZE);
        } else {
            getData(0);
        }
    }

    function onExport() {
        setLoading(true);
        exportExcel({
            reportName: REPORT_NAME.ScanLogReport,
            filterQuery: {
                isShared: 1,
                ...filterGroup,
            },
        })
            .then((res) => {
                downlodBlobFromResponse(res, "Scan Log Report");
                message.success("Exported Successfully");
            })
            .catch((err) => {
                console.log(err?.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }


    return (
        <>
            <div className="">
                <ListingTable
                    columns={columns}
                    dataSource={dataSource}
                    setPage={setPage}
                    total={total}
                    page={page}
                    loading={loading}
                    PAGE_SIZE={PAGE_SIZE}
                    onRefresh={onRefresh}
                    filterTag={true}
                    filterGroup={filterGroup}
                    setFilterGroup={setFilterGroup}
                    onExport={onExport}
                    onFilter={(filter) => {
                        setFilterGroup({
                            ...filter,
                        })
                    }}
                />
            </div>
        </>
    );
};

const mapStateToProps = (state) => ({
    user: state.user.user,
});

export default connect(mapStateToProps)(ScanLogListing);
