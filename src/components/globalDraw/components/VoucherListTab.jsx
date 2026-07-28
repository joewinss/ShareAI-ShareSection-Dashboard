import React, { useEffect, useRef, useState } from "react";
import { Button, message, Modal, Tag, Dropdown } from "antd";
import { connect } from "react-redux";
import ListingTable from "@/components/general/components/ListingTable";
import getVoucherList from "@/pages/api/voucherDraw/getVoucherList";
import editVoucher from "@/pages/api/voucherDraw/editVoucher";
import getOutletListingsByMasterHQ from "@/pages/api/user/getOutletListingsByMasterHQ";
import { mapOutletOptions } from "@/utility/option-mappers";
import { formatDate } from "@/utility/common-functions";
import { inputTypes } from "@/utility/config";
import { VOUCHER_DRAW_TYPE } from "@/constants/data";
import CreateVoucherDrawer from "./CreateVoucherDrawer";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";

const PAGE_SIZE = 10;

const VoucherListTab = ({ user, outletId, autoOpenCreate = false, autoOpenCreateType = null, onAutoOpenCreateHandled }) => {
    const { t } = useTranslation();
    const userIdentity = user?.role;

    const getStatusTag = (status) => {
        const map = {
            pendingApproval: <Tag color="orange">{t("pendingApproval", sourceKey.user)}</Tag>,
            active: <Tag color="green">{t("active", sourceKey.user)}</Tag>,
            rejected: <Tag color="red">{t("rejected", sourceKey.user)}</Tag>,
            closed: <Tag color="default">{t("closed", sourceKey.user)}</Tag>,
            deactive: <Tag color="default">{t("deactive", sourceKey.user)}</Tag>,
        };
        return map[status] ?? <Tag>{status}</Tag>;
    };
    const outletUserId = userIdentity === "masterHQ" ? outletId : null;

    const [dataSource, setDataSource] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filterGroup, setFilterGroup] = useState({});
    const [sort, setSort] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [outletOptions, setOutletOptions] = useState([]);
    const [defaultVoucherType, setDefaultVoucherType] = useState(null);

    const filterGroupRef = useRef(filterGroup);
    const sortRef = useRef(sort);

    useEffect(() => { filterGroupRef.current = filterGroup; }, [filterGroup]);
    useEffect(() => { sortRef.current = sort; }, [sort]);

    useEffect(() => {
        if (userIdentity === "masterHQ") {
            getOutletListingsByMasterHQ("all", 0, {})
                .then((res) => { if (res?.data) setOutletOptions(mapOutletOptions(res.data)); })
                .catch((err) => console.error(err));
        }
    }, [userIdentity]);

    useEffect(() => {
        setPage(1);
        getData(0);
    }, [filterGroup, sort]);

    useEffect(() => {
        if (!autoOpenCreate) return;
        setEditingVoucher(null);
        setDefaultVoucherType(autoOpenCreateType || VOUCHER_DRAW_TYPE.MERCHANT_DRAW);
        setDrawerOpen(true);
        onAutoOpenCreateHandled?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoOpenCreate]);

    function getData(skip) {
        if (isNaN(parseInt(skip))) skip = 0;
        setLoading(true);
        const query = {
            ...filterGroupRef.current,
            sort: JSON.stringify(
                sortRef.current
                    ? { [sortRef.current.field]: sortRef.current.order === "ascend" ? 1 : -1 }
                    : {}
            ),
            ...(outletUserId ? { outletUserId } : {}),
        };
        getVoucherList(PAGE_SIZE, skip, query)
            .then((res) => {
                setDataSource(Array.isArray(res?.data) ? res.data : []);
                setTotal(res?.total ?? 0);
            })
            .catch(() => message.error(t("failedToLoadVouchers", sourceKey.user)))
            .finally(() => setLoading(false));
    }

    const handleDeactivate = (voucher) => {
        Modal.confirm({
            title: t("deactivateVoucher", sourceKey.user),
            content: `${t("deactivateVoucherConfirm", sourceKey.user)}`,
            okText: t("deactivate", sourceKey.user),
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await editVoucher({
                        voucherId: voucher._id,
                        status: "deactive",
                        ...(outletUserId ? { outletUserId } : {}),
                    });
                    message.success(t("voucherDeactivated", sourceKey.user));
                    getData((page - 1) * PAGE_SIZE);
                } catch (err) {
                    message.error(err?.message || t("failedToDeactivate", sourceKey.user));
                }
            },
        });
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
                    render: (val) => val?.businessInfo?.businessName || "—",
                },
            ]
            : []),
        {
            title: t("voucherTitle", sourceKey.user),
            dataIndex: "voucherTitle",
            key: "voucherTitle",
            filterable: true,
            type: inputTypes.text,
            filterProps: { placeholder: t("searchVoucher", sourceKey.user) },
            sorter: true,
            render: (v) => <span className="font-semibold text-gray-700">{v}</span>,
        },
        {
            title: t("type", sourceKey.user),
            dataIndex: "type",
            key: "type",
            filterable: true,
            type: inputTypes.dropdown,
            selections: [
                { value: VOUCHER_DRAW_TYPE.GLOBAL_CONTRIBUTION, title: t("globalContribution", sourceKey.user) },
                { value: VOUCHER_DRAW_TYPE.MERCHANT_DRAW, title: t("merchantDraw", sourceKey.user) },
            ],
            filterProps: { placeholder: t("type", sourceKey.user) },
            sorter: true,
            render: (v) => (
                <Tag color={v === VOUCHER_DRAW_TYPE.MERCHANT_DRAW ? "blue" : "purple"}>
                    {v === VOUCHER_DRAW_TYPE.MERCHANT_DRAW ? t("merchantDraw", sourceKey.user) : t("globalContribution", sourceKey.user)}
                </Tag>
            ),
        },
        {
            title: t("redeemedCount", sourceKey.user),
            key: "redeemed",
            render: (_, row) => {
                const isMerchantDraw = row.type === VOUCHER_DRAW_TYPE.MERCHANT_DRAW;
                const denominator = isMerchantDraw ? row.generatedCount : row.voucherCount;
                const pct = denominator > 0
                    ? Math.round((row.redeemedCount / denominator) * 100)
                    : 0;
                return (
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded h-1 w-16 overflow-hidden">
                            <div
                                className="h-full rounded"
                                style={{
                                    width: `${pct}%`,
                                    background: "linear-gradient(90deg,#22c55e,#3b82f6)",
                                }}
                            />
                        </div>
                        <span className="text-xs text-gray-400">
                            {row.redeemedCount ?? 0} / {denominator ?? 0}
                        </span>
                    </div>
                );
            },
        },
        {
            title: "Validity Days",
            dataIndex: "expiredDays",
            key: "expiredDays",
            sorter: true,
            render: (val) => (val != null ? `${val} day(s)` : "—"),
        },
        {
            title: t("status", sourceKey.user),
            dataIndex: "status",
            key: "status",
            filterable: true,
            type: inputTypes.dropdown,
            selections: [
                { value: "pendingApproval", title: t("pendingApproval", sourceKey.user) },
                { value: "active", title: t("active", sourceKey.user) },
                { value: "rejected", title: t("rejected", sourceKey.user) },
                { value: "closed", title: t("closed", sourceKey.user) },
                { value: "deactive", title: t("deactive", sourceKey.user) },
            ],
            filterProps: { placeholder: t("selectStatus", sourceKey.user) },
            sorter: true,
            render: (v) => getStatusTag(v),
        },
        {
            title: t("createdDate", sourceKey.user),
            dataIndex: "createdAt",
            key: "createdAt",
            filterable: true,
            type: inputTypes.dateRange,
            sorter: true,
            render: (val) => (val ? formatDate(val) : "—"),
        },
        {
            title: t("actions", sourceKey.user),
            key: "actions",
            render: (_, row) => {
                if (row.remark) {
                    return (
                        <span className="text-xs text-gray-400 italic">{row.remark}</span>
                    );
                }
                if (row.status !== "active" && row.status !== "pendingApproval" && row.status !== "deactive") {
                    return <span className="text-xs text-gray-300">—</span>;
                }

                const menuItems = [
                    { key: "editVoucher", label: t("edit", sourceKey.user) },
                    ...(row.status === "active" ? [
                        { key: "deactivateVoucher", label: <span className="text-red-500">{t("deactivate", sourceKey.user)}</span> },
                    ] : []),
                ];

                const handleMenuClick = ({ key }) => {
                    if (key === "editVoucher") { setEditingVoucher(row); setDefaultVoucherType(null); setDrawerOpen(true); }
                    if (key === "deactivateVoucher") handleDeactivate(row);
                };

                return (
                    <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={["click"]}>
                        <Button size="small">{t("action", sourceKey.user)}</Button>
                    </Dropdown>
                );
            },
        },
    ];

    const listingActions = [
        {
            render: () => (
                <Button
                    type="primary"
                    className="bg-green-500 hover:bg-green-600 border-none"
                    onClick={() => { setEditingVoucher(null); setDefaultVoucherType(null); setDrawerOpen(true); }}
                >
                    {`+ ${t("createVoucher", sourceKey.user)}`}
                </Button>
            ),
            exec: () => { setEditingVoucher(null); setDefaultVoucherType(null); setDrawerOpen(true); },
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
                listingActions={listingActions}
            />
            <CreateVoucherDrawer
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setEditingVoucher(null); setDefaultVoucherType(null); }}
                editingVoucher={editingVoucher}
                isMasterHQ={userIdentity === "masterHQ"}
                outletOptions={outletOptions}
                defaultOutletId={outletUserId}
                defaultVoucherType={defaultVoucherType}
                onSuccess={() => {
                    setPage(1);
                    getData(0);
                }}
            />
        </div>
    );
};

const mapStateToProps = (state) => ({
    user: state.user.user,
});

export default connect(mapStateToProps)(VoucherListTab);
