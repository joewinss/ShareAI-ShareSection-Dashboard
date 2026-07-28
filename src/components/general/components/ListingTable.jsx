import { Checkbox, Dropdown, Menu, Pagination, Spin, Table, Form } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { filter, isEmpty, map } from 'lodash';
import React, { useState, useEffect } from "react";
import { ExportIcon, FilterIcon, RefreshIcon, SortIcon } from '../../../../public/assets';
import FilterDrawerV2 from './FilterDrawerV2';
import ExportModal from './ExportModal';
import FilterTags from './FilterTags';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import StringInput from '../input/StringInput';
import { replaceStringPattern } from '@/utility/common-functions';
import useIsCollapsed from '@/components/useIsCollapsed';

// Helper function to derive column configurations for the listing table.
const deriveListingColumns = ({
    columns = [],
    visibleColumns = [],
    sorter = {},
    onSortClick = () => { }
}) => {
    const filteredColumns = filter(columns, (item) => {
        return visibleColumns.includes(item.key) && item?.displayable !== false;
    });

    const flattenedColumns = filteredColumns.flatMap((col) => {
        if (col.children) {
            return col.children.map((child) => ({
                ...child,
                parentTitle: col.title,
            }));
        }
        return [col];
    });

    const isActionColumn = (col) => {
        return col?.key === "action" || col?.dataIndex === "action" || col?.key === "actions";
    };

    const transformedColumns = filteredColumns.map((col) => {
        if (col.sorter) {
            return {
                ...col,
                sortOrder: col?.sortOrder || sorter[col.dataIndex],
                sorter: true,
                onHeaderCell: () => ({
                    onClick: () => onSortClick(col.dataIndex)
                })
            };
        }
        if (col.children) {
            return {
                ...col,
                children: col.children.map((child) => ({
                    ...child,
                    sortOrder: child?.sortOrder || sorter[child.dataIndex],
                    sorter: true,
                    onHeaderCell: () => ({
                        onClick: () => onSortClick(child.dataIndex)
                    })
                }))
            };
        }
        return col;
    });

    const actionColumn = flattenedColumns.find((col) => isActionColumn(col));
    const dataColumns = flattenedColumns.filter((col) => !isActionColumn(col));

    return {
        transformedColumns,
        actionColumn,
        titleColumn: dataColumns[0],
        detailColumns: dataColumns.slice(1),
    };
};



// Listing table with responsive card view, filters, actions, sorting, and export.
const ListingTable = (props) => {
    const {
        columns,
        dataSource,
        listingActions,
        setPage,
        total,
        page,
        xScroll,
        onSort,
        bordered = true,
        listingActionsStart,
        loading = false,
        hasSort = true,
        onRefresh,
        onExport,
        onFilter,
        PAGE_SIZE,
        onRow,
        filterListingAction = false,
        filterFieldName = "username",
        filterPlaceholder = "Search...",
        filterTag = false,
        filterGroup = {},
        setFilterGroup,
        excludeFilterFields = []
    } = props;
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [exportModalVisible, setExportModalVisible] = useState(false);
    const [sorter, setSorter] = useState({});
    const isCollapsed = useIsCollapsed();

    // Columns eligible for filter UI (drawer/tags).
    const filterOptions = columns?.filter(col => col?.filterable === true || col?.children?.every(child => child?.filterable === true));

    // Resolve nested dataIndex paths and normalize empty display values.
    const getRecordValue = (record, dataIndex) => {
        if (!dataIndex) return undefined;
        if (Array.isArray(dataIndex)) {
            return dataIndex.reduce((acc, key) => acc?.[key], record);
        }
        if (typeof dataIndex === "string") {
            return dataIndex.split(".").reduce((acc, key) => acc?.[key], record);
        }
        return record?.[dataIndex];
    };

    const renderColumnValue = (col, record, index) => {
        const rawValue = getRecordValue(record, col.dataIndex);
        if (col.render) {
            return col.render(rawValue, record, index);
        }
        if (rawValue === undefined || rawValue === null || rawValue === "") {
            return "-";
        }
        return rawValue;
    };


    // Initialize visible columns whenever column definitions change.
    useEffect(() => {
        if (columns) {
            setVisibleColumns(columns.map(col => col.key));
        }
    }, [columns])

    // Toggle sort order for a field and notify the parent.
    function handleSortChange(field) {
        const currentSortOrder = sorter[field];
        let newSortOrder;

        if (currentSortOrder === 'ascend') {
            newSortOrder = 'descend';
        } else if (currentSortOrder === 'descend') {
            newSortOrder = undefined;
        } else {
            newSortOrder = 'ascend';
        }

        if (newSortOrder === undefined) {
            setSorter({});
            if (onSort) onSort(undefined);  // Pass undefined to indicate clear
        } else {
            setSorter({ [field]: newSortOrder });
            if (onSort) onSort({
                field,
                order: newSortOrder
            });
        }
    };

    function handleCheckboxChange(checkedValues) {
        setVisibleColumns(checkedValues);
    };

    // Derived columns for both table and collapsed card layouts.
    const { transformedColumns, actionColumn, titleColumn, detailColumns } = deriveListingColumns({
        columns,
        visibleColumns,
        sorter,
        onSortClick: handleSortChange
    });

    return (
        <Spin spinning={loading}>
            <div className="bg-white rounded-lg p-3">
                {/* Header controls: filters, search, and listing actions */}
                <div className={`listing-table-header flex items-center justify-between gap-2${isCollapsed ? " listing-table-header-collapsed" : ""}`}>
                    <div className='listing-table-group flex min-w-0 items-center gap-2'>
                        {filterOptions?.length > 0 &&
                            <div
                                className="listing-table-filter border rounded-lg p-2 cursor-pointer hover:bg-gray-200"
                                onClick={() => setFilterDrawerVisible(true)}
                            >
                                <div className='flex flex-row items-center gap-2'>
                                    <img src={FilterIcon} style={{ width: "18px" }} />
                                    <span>{t("nTfilter", sourceKey.user)}</span>
                                </div>
                            </div>
                        }

                        {filterListingAction && (
                            // Inline search filter in the header.
                            <Form form={form}>
                                <StringInput
                                    fieldName={filterFieldName}
                                    placeholder={filterPlaceholder}
                                    style={{ marginBottom: 0, width: 200 }}
                                    required={false}
                                    className="h-full p-2"
                                    suffix={
                                        <SearchOutlined
                                            onClick={(e) => {
                                                const inputElement = e.currentTarget.closest(".ant-input-affix-wrapper").querySelector("input");
                                                if (inputElement) {
                                                    const value = inputElement.value.trim();
                                                    if (onFilter) {
                                                        onFilter(value ? { [filterFieldName]: value } : {});
                                                    }
                                                    setPage(1);
                                                }
                                            }}
                                            style={{ cursor: "pointer" }}
                                        />
                                    }
                                    onKeyPress={(event) => {
                                        if (event.key === "Enter") {
                                            const value = event.target.value.trim();
                                            if (onFilter) {
                                                if (value === "") {
                                                    onFilter({});
                                                } else {
                                                    onFilter({ [filterFieldName]: value });
                                                }
                                            }
                                            setPage(1);
                                        }
                                    }}
                                />
                            </Form>
                        )}

                        {map(listingActionsStart, (item, index) => (
                            <div
                                key={index}
                                className="listing-table-action"
                                onClick={() => {
                                    item.exec();
                                }}
                            >
                                {item.render()}
                            </div>
                        ))}

                    </div>

                    {/* Column Visibility Control */}
                    <div className='listing-table-group flex min-w-0 items-center gap-2'>
                        {map(listingActions, (item, index) => {
                            return (
                                <div
                                    key={index}
                                    className="listing-table-action"
                                    onClick={() => {
                                        item.exec();
                                    }}
                                >
                                    {item.render()}
                                </div>
                            )
                        })}

                        {/* Refresh Button */}
                        {onRefresh && (
                            <div
                                className="listing-table-icon-action rounded-lg p-2 cursor-pointer hover:bg-gray-300"
                                onClick={async () => {
                                    setIsAnimating(true);
                                    await onRefresh();
                                    setTimeout(() => {
                                        setIsAnimating(false);
                                    }, 500);
                                }}
                            >
                                <div className={`${isAnimating ? 'rotate' : ''}`}>
                                    <img src={RefreshIcon} style={{ width: "18px" }} />
                                </div>
                            </div>
                        )}

                        {/* Sort Button */}
                        {hasSort && (
                            <div>
                                <Dropdown
                                    menu={{
                                        className: 'sortChecked',
                                        items: columns
                                            ?.filter(col => col.key !== 'action' && col.displayable !== false)
                                            ?.map(col => ({
                                                key: col.key,
                                                label: (
                                                    <div onClick={e => e.stopPropagation()}>
                                                        <Checkbox
                                                            checked={visibleColumns.includes(col.key)}
                                                            onChange={e => {
                                                                const newVisibleColumns = e.target.checked
                                                                    ? [...visibleColumns, col.key]
                                                                    : visibleColumns.filter(key => key !== col.key);
                                                                handleCheckboxChange(newVisibleColumns);
                                                            }}
                                                        >
                                                            {col.title}
                                                        </Checkbox>
                                                    </div>
                                                ),
                                            })),
                                    }}
                                    trigger={['click']}
                                >
                                    <div className="listing-table-icon-action rounded-lg p-2 cursor-pointer hover:bg-gray-300">
                                        <img src={SortIcon} style={{ width: "18px" }} />
                                    </div>
                                </Dropdown>
                            </div>
                        )}

                        {/* Export Button */}
                        {onExport && (
                            <div
                                className="listing-table-icon-action border rounded-lg p-2 cursor-pointer bg-gray-200"
                                onClick={() => setExportModalVisible(true)}
                            >
                                <img src={ExportIcon} style={{ width: "18px" }} />
                            </div>
                        )}
                    </div>
                </div>


                {(!isEmpty(listingActions) || hasSort) && // Borderline
                    <div className="my-3" style={{ height: "2px", backgroundColor: "#0000000D" }} />
                }

                {/* Render Active Filter Tags */}
                {filterTag && setFilterGroup && (
                    <FilterTags
                        filterGroup={filterGroup}
                        setFilterGroup={setFilterGroup}
                        filterOptions={filterOptions}
                        excludeFields={excludeFilterFields}
                        onFilterRemove={() => setPage(1)}
                        onClearAll={() => setPage(1)}
                    />
                )}

                <div>
                    {/* Card layout when collapsed; table layout otherwise */}
                    {isCollapsed ? (
                        <div className="space-y-3">
                            {map(dataSource, (record, index) => (
                                <div
                                    key={record?.key || record?._id || index}
                                    className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="text-xs text-gray-500">
                                                {titleColumn?.title || titleColumn?.parentTitle || "-"}
                                            </div>
                                            <div className="mt-0.5 text-sm font-semibold text-gray-900">
                                                {titleColumn
                                                    ? renderColumnValue(titleColumn, record, index)
                                                    : "-"}
                                            </div>
                                        </div>
                                        {actionColumn && (
                                            <div className="shrink-0">
                                                {renderColumnValue(actionColumn, record, index)}
                                            </div>
                                        )}
                                    </div>
                                    {detailColumns.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {detailColumns.map((col) => (
                                                <div key={col.key || col.dataIndex} className="text-sm text-gray-700">
                                                    <div className="text-xs text-gray-500">
                                                        {col.title || col.parentTitle}
                                                    </div>
                                                    <div className="mt-0.5">
                                                        {renderColumnValue(col, record, index)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="flex justify-end">
                                <Pagination
                                    current={page}
                                    pageSize={PAGE_SIZE}
                                    total={total}
                                    showQuickJumper={true}
                                    showSizeChanger={false}
                                    onChange={(page_selected) => {
                                        setPage(page_selected);
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <Table
                            size="large"
                            columns={transformedColumns}
                            dataSource={dataSource}
                            pagination={{
                                // simple: true,
                                total: total,
                                current: page,
                                onChange: (page_selected) => {
                                    setPage(page_selected);
                                },
                                pageSize: PAGE_SIZE,
                                showSizeChanger: false,
                                showQuickJumper: true,
                                showTotal: isCollapsed
                                    ? undefined
                                    : (total, range) =>
                                        replaceStringPattern(t("nTpagination", sourceKey.user), {
                                            range1: range[0],
                                            range2: range[1],
                                            total: total
                                        }),
                            }}
                            scroll={{
                                x: xScroll ? xScroll : true,
                            }}
                            bordered={bordered}
                            onRow={onRow}
                        />
                    )}
                </div>
            </div >

            {/* Filter Drawer for mobile view control */}
            {!isEmpty(filterOptions) &&
                <FilterDrawerV2
                    filterGroup={filterGroup}
                    setFilterGroup={(value) => {
                        // Update filterGroup if setFilterGroup is provided
                        if (setFilterGroup) {
                            setFilterGroup({
                                ...filterGroup,
                                ...value
                            });
                        }
                        // Also call onFilter for backward compatibility
                        if (onFilter) {
                            onFilter(value);
                        }
                        setPage(1)
                    }}
                    open={filterDrawerVisible}
                    onClose={() => setFilterDrawerVisible(false)}
                    dataSource={filterOptions}
                />
            }

            <ExportModal
                open={exportModalVisible}
                onClose={() => setExportModalVisible(false)}
                onOK={onExport}
            />
        </Spin>
    )
}

export default ListingTable;
