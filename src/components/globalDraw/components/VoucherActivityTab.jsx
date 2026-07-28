import React, { useEffect, useRef, useState } from "react";
import { message, Tag } from "antd";
import { connect } from "react-redux";
import ListingTable from "@/components/general/components/ListingTable";
import getUserVoucher from "@/pages/api/voucherDraw/getUserVoucher";
import getOutletListingsByMasterHQ from "@/pages/api/user/getOutletListingsByMasterHQ";
import { mapOutletOptions } from "@/utility/option-mappers";
import { formatDate } from "@/utility/common-functions";
import { inputTypes } from "@/utility/config";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";

const PAGE_SIZE = 10;

const VoucherActivityTab = ({ user, voucherType }) => {
    const { t } = useTranslation();
    const userIdentity = user?.role;

    const getStatusTag = (status) => {
        const map = {
            pendingDistribution: <Tag color="blue">{t("pendingDistribution", sourceKey.user)}</Tag>,
            awaitingRedemption: <Tag color="purple">{t("awaitingRedemption", sourceKey.user)}</Tag>,
            redeemed: <Tag color="green">{t("redeemed", sourceKey.user)}</Tag>,
            expired: <Tag color="default">{t("expired", sourceKey.user)}</Tag>,
            inactive: <Tag color="default">{t("inactive", sourceKey.user)}</Tag>,
            deleted: <Tag color="default">{t("deleted", sourceKey.user)}</Tag>,
        };
        return map[status] ?? <Tag>{status}</Tag>;
    };

    const activityStatusOptions = [
        { value: "pendingDistribution", title: t("pendingDistribution", sourceKey.user) },
        { value: "awaitingRedemption", title: t("awaitingRedemption", sourceKey.user) },
        { value: "redeemed", title: t("redeemed", sourceKey.user) },
        { value: "expired", title: t("expired", sourceKey.user) },
        { value: "inactive", title: t("inactive", sourceKey.user) },
        { value: "deleted", title: t("deleted", sourceKey.user) },
    ];

    const [dataSource, setDataSource] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filterGroup, setFilterGroup] = useState({});
    const [sort, setSort] = useState(null);
    const [outletOptions, setOutletOptions] = useState([]);

    const filterGroupRef = useRef(filterGroup);
    const sortRef = useRef(sort);

    useEffect(() => { filterGroupRef.current = filterGroup; }, [filterGroup]);
    useEffect(() => { sortRef.current = sort; }, [sort]);

    useEffect(() => {
        if (userIdentity === "masterHQ") {
            loadOutletOptions();
        }
    }, [userIdentity]);

    useEffect(() => {
        setPage(1);
        getData(0);
    }, [filterGroup, sort, voucherType]);

    function getData(skip) {
        if (isNaN(parseInt(skip))) skip = 0;
        setLoading(true);
        const query = {
            voucherType,
            ...filterGroupRef.current,
            sort: JSON.stringify(
                sortRef.current
                    ? { [sortRef.current.field]: sortRef.current.order === "ascend" ? 1 : -1 }
                    : {}
            ),
        };
        getUserVoucher(PAGE_SIZE, skip, query)
            .then((res) => {
                setDataSource(res?.data || []);
                setTotal(res?.total ?? 0);
            })
            .catch(() => message.error(t("failedToLoadVoucherActivity", sourceKey.user)))
            .finally(() => setLoading(false));
    }

    const loadOutletOptions = async () => {
        try {
            const res = await getOutletListingsByMasterHQ("all", 0, {});
            if (res?.data) setOutletOptions(mapOutletOptions(res.data));
        } catch (err) {
            console.error(err);
        }
    };

    const columns = [
        ...(userIdentity === "masterHQ"
            ? [
                {
                    title: t("outlet", sourceKey.user),
                    dataIndex: "outletUserId",
                    key: "outletUserId",
                    filterable: true,
                    type: inputTypes.dropdown,
                    selections: outletOptions,
                    filterProps: { placeholder: t("selectOutlet", sourceKey.user) },
                    sorter: true,
                    render: (_, record) => record?.outletBusinessName || "—",
                },
            ]
            : []),
        {
            title: t("whatsAppName", sourceKey.user),
            dataIndex: "currentOwnerName",
            key: "currentOwnerName",
            filterable: true,
            type: inputTypes.text,
            filterProps: { placeholder: t("searchName", sourceKey.user) },
            sorter: true,
            render: (v) => v || "—",
        },
        {
            title: t("voucherName", sourceKey.user),
            key: "voucherName",
            render: (_, record) =>
                record?.voucherId?.voucherTitle
                || record?.voucherTitleSnapshot
                || "—",
        },
        {
            title: t("userPhone", sourceKey.user),
            dataIndex: "currentOwnerPhone",
            key: "currentOwnerPhone",
            filterable: true,
            type: inputTypes.text,
            filterProps: { placeholder: t("searchPhone", sourceKey.user) },
            sorter: true,
        },
        {
            title: t("status", sourceKey.user),
            dataIndex: "status",
            key: "status",
            filterable: true,
            type: inputTypes.dropdown,
            selections: activityStatusOptions,
            filterProps: { placeholder: t("selectStatus", sourceKey.user) },
            sorter: true,
            render: (v) => getStatusTag(v),
        },
        {
            title: t("voucherValue", sourceKey.user),
            dataIndex: "voucherValue",
            key: "voucherValue",
            sorter: true,
            render: (v) => (v != null ? `RM ${Number(v).toFixed(2)}` : "—"),
        },
        {
            title: t("amountSpent", sourceKey.user),
            dataIndex: "amountSpent",
            key: "amountSpent",
            sorter: true,
            render: (v) => (v != null ? `RM ${Number(v).toFixed(2)}` : "—"),
        },
        {
            title: t("redeemedAt", sourceKey.user),
            dataIndex: "redeemedAt",
            key: "redeemedAt",
            sorter: true,
            render: (val) => (val ? formatDate(val) : "—"),
        },
        {
            title: t("expiredDateLabel", sourceKey.user),
            dataIndex: "expiredAt",
            key: "expiredAt",
            sorter: true,
            render: (val) => (val ? formatDate(val) : "—"),
        },
        {
            title: t("date", sourceKey.user),
            dataIndex: "createdAt",
            key: "createdAt",
            filterable: true,
            type: inputTypes.dateRange,
            sorter: true,
            render: (val) => (val ? formatDate(val) : "—"),
        },
    ];

    return (
        <div>
            <ListingTable
                columns={columns}
                dataSource={dataSource}
                setPage={(p) => {
                    setPage(p);
                    getData((p - 1) * PAGE_SIZE);
                }}
                total={total}
                page={page}
                loading={loading}
                PAGE_SIZE={PAGE_SIZE}
                filterTag={true}
                filterGroup={filterGroup}
                setFilterGroup={setFilterGroup}
                onFilter={(filter) => setFilterGroup({ ...filter })}
                onRefresh={() => {
                    setPage(1);
                    getData(0);
                }}
                onSort={(sortInfo) => setSort(sortInfo || null)}
            />
        </div>
    );
};

const mapStateToProps = (state) => ({
    user: state.user.user,
});

export default connect(mapStateToProps)(VoucherActivityTab);
