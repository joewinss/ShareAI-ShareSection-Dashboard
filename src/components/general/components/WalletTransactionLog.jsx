import React from "react";
import { Empty, Pagination } from "antd";
import { isEmpty, map } from "lodash";
import { NoReferralIcon } from "../../../../public/assets";
import { formatDate, formatDecimalNumber } from "@/utility/common-functions";


const WalletTransactionLog = ({
    tabData,
    selectedKey,
    onTabChange,
    dataSource,
    total,
    page,
    pageSize = 10,
    onPageChange,
    emptyText = "No transactions yet",
    theme = {
        selected: "text-primary",
        unselected: "text-gray-400",
        style: {
            selected: {},
            unselected: {}
        }
    }
}) => {
    const renderRows = () => {
        if (isEmpty(dataSource)) return null;

        return (
            <>
                {map(dataSource, (item, index) => (
                    <div className="small-text-size" key={`withdrawal-${index}`}>
                        <div className="p-4">
                            {/* Title & Date */}
                            <div className="flex justify-between items-center">
                                <div className="font-semibold medium-text-size">
                                    {item.title || null}
                                </div>
                                <div>
                                    {item.type === "IN" && (
                                        <span className="text-green-700 medium-text-size font-extrabold">
                                            {`+ ${item?.amountType === "Cash" ? "RM" : ""
                                                }${formatDecimalNumber(item?.amount, 0)}${item?.amountType === "Cash" ? "" : " Credit(s)"
                                                }`}
                                        </span>
                                    )}
                                    {item.type === "OUT" && (
                                        <span className="text-red-600 medium-text-size font-extrabold">
                                            {`- ${item?.amountType === "Cash" ? "RM" : ""
                                                }${formatDecimalNumber(item?.amount, 0)}${item?.amountType === "Cash" ? "" : " Credit(s)"
                                                }`}
                                        </span>
                                    )}
                                </div>

                            </div>

                            {/* Status & Amount */}
                            <div className="flex justify-between items-center mb-2">
                                <div className="my-2">
                                    {item.remark || item?.status || null}
                                </div>
                                <div className="mb-1">
                                    {item?.status === "Completed"
                                        ? formatDate(item.updatedAt, "DD MMM YYYY HH:mm:ss")
                                        : formatDate(item.createdAt, "DD MMM YYYY HH:mm:ss")}
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: "1px", backgroundColor: "#F7F5F2" }} />
                    </div>
                ))}

                <Pagination
                    className="mt-4"
                    size="small"
                    total={total}
                    pageSize={pageSize}
                    current={page}
                    align="end"
                    showSizeChanger={false}
                    showQuickJumper={false}
                    responsive
                    onChange={onPageChange}
                />
            </>
        );
    };

    return (
        <div className="w-full">
            <div className="pt-8 pb-5">
                {/* Tabs */}
                <div className="flex justify-center space-x-4 py-2 overflow-x-auto sm:overflow-x-visible">
                    {tabData.map(({ key, label }) => (
                        <React.Fragment key={key}>
                            <div
                                className={`text-sm cursor-pointer ${selectedKey === key ? theme.selected : theme.unselected
                                    }`}
                                style={selectedKey === key ? theme.style?.selected : theme.style?.unselected}
                                onClick={() => onTabChange(key)}
                            >
                                {label}
                            </div>
                            <div style={{ height: "1px", backgroundColor: "#EFECE6" }} />
                        </React.Fragment>
                    ))}
                </div>

                <div style={{ height: "1px", backgroundColor: "#EFECE6" }} />

                {/* Content */}
                {!isEmpty(dataSource) ? (
                    renderRows()
                ) : (
                    <div className="flex items-center flex-col gap-4 mt-10">
                        <Empty />
                    </div>
                )}
            </div>
        </div>
    );
};

export default WalletTransactionLog;
