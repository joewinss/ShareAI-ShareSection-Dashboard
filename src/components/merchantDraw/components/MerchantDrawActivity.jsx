import React, { useEffect, useRef, useState } from "react";
import { message } from "antd";
import { connect } from "react-redux";
import ListingTable from "@/components/general/components/ListingTable";
import getMerchantDrawLogs from "@/pages/api/merchantDraw/getMerchantDrawLogs";
import getOutletListingsByMasterHQ from "@/pages/api/user/getOutletListingsByMasterHQ";
import { mapOutletOptions } from "@/utility/option-mappers";
import { formatDate, formatDecimalNumber } from "@/utility/common-functions";
import { inputTypes } from "@/utility/config";

const PAGE_SIZE = 10;

/**
 * MerchantDrawActivity
 * Listing-table style activity log.
 * - masterHQ: outlet name column + outlet filter in filter drawer; always viewable
 * - outlet: no outlet column/filter; greyed out overlay when isMerchantDraw=0
 */
const MerchantDrawActivity = ({ user }) => {
    const userIdentity = user?.role;
    const isMerchantDraw = user?.isMerchantDraw ?? 0;
    const isDisabled = userIdentity === "outlet" && isMerchantDraw !== 1;

    const [dataSource, setDataSource] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filterGroup, setFilterGroup] = useState({});
    const [sort, setSort] = useState(null);
    const [outletOptions, setOutletOptions] = useState([]);
    const [totalAmountSpent, setTotalAmountSpent] = useState(0);

    const filterGroupRef = useRef(filterGroup);
    const sortRef = useRef(sort);

    useEffect(() => { filterGroupRef.current = filterGroup; }, [filterGroup]);
    useEffect(() => { sortRef.current = sort; }, [sort]);

    useEffect(() => {
        if (userIdentity === "masterHQ") {
            loadOutletOptions();
        }
    }, [userIdentity]);

    // Re-fetch from page 1 whenever filters or sort changes
    useEffect(() => {
        setPage(1);
        getData(0);
    }, [filterGroup, sort]);

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
        };
        getMerchantDrawLogs(PAGE_SIZE, skip, query)
            .then((res) => {
                setDataSource(res?.data?.logs || []);
                setTotal(res?.data?.total || 0);
                setTotalAmountSpent(res?.data?.totalAmountSpent || 0);
            })
            .catch(() => message.error("Failed to load lucky draw activity"))
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
        // Outlet column — masterHQ only, with dropdown filter
        ...(userIdentity === "masterHQ"
            ? [
                {
                    title: "Outlet",
                    dataIndex: "outletUserId",
                    key: "outletUserId",
                    filterable: true,
                    type: inputTypes.dropdown,
                    selections: outletOptions,
                    filterProps: { placeholder: "Select outlet" },
                    sorter: true,
                    render: (_, record) => record?.outletBusinessName || "-",
                },
            ]
            : []),
        {
            title: "Username (WhatsApp)",
            dataIndex: "userWhatsAppName",
            key: "userWhatsAppName",
            sorter: true,
            filterable: true,
            type: inputTypes.text,
            filterProps: { placeholder: "Search username..." },
        },
        {
            title: "User (WhatsApp)",
            dataIndex: "userWhatsApp",
            key: "userWhatsApp",
            sorter: true,
            filterable: true,
            type: inputTypes.text,
            filterProps: { placeholder: "Search phone..." },
        },
        {
            title: "Reward",
            dataIndex: "reward",
            key: "reward",
            sorter: true,
            filterable: true,
            type: inputTypes.text,
            filterProps: { placeholder: "Search reward..." },
        },
        {
            title: (
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                    <span>Distributed Amount</span>
                    <small style={{ color: '#8c8c8c', marginTop: '4px', fontWeight: 'normal' }}>
                        Total Spent: {totalAmountSpent ? `RM ${formatDecimalNumber(totalAmountSpent, 2)}` : "RM 0.00"}
                    </small>
                </div>
            ),
            dataIndex: "amountSpent",
            key: "amountSpent",
            sorter: true,
            filterable: true,
            type: inputTypes.text,
            filterProps: { placeholder: "Search distributed amount..." },
            render: (val) => (val ? `RM ${formatDecimalNumber(val, 2)}` : "-"),
        },
        {
            title: "Source",
            dataIndex: "sourceType",
            key: "sourceType",
            filterable: true,
            type: inputTypes.dropdown,
            selections: [
                { value: 1, title: "IConsi" },
                { value: 2, title: "ConsiAI" },
            ],
            filterProps: { placeholder: "Select source" },
            sorter: true,
            render: (v) => {
                if (v === 1) return "IConsi";
                if (v === 2) return "ConsiAI";
                return v ?? "-";
            },
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            sorter: true,
            filterable: true,
            type: inputTypes.dateRange,
            render: (val) => (val ? formatDate(val) : "-"),
        },
    ];

    return (
        <div className="relative">
            {/* Greyed overlay for outlet when Lucky Draw is inactive */}
            {isDisabled && (
                <div className="absolute inset-0 bg-white/60 z-10 rounded-lg pointer-events-auto cursor-not-allowed" />
            )}
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

export default connect(mapStateToProps)(MerchantDrawActivity);

