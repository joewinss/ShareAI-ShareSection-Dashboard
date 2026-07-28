import React, { useState, useEffect } from 'react';
import { useRouter, withRouter } from 'next/router';
import { Col, Dropdown, Input, message, Pagination, Row, Switch, Tabs, Tag } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { ActiveGreenIcon, PendingGreyIcon } from '../../../../public/assets';
import { formatDate, formatDecimalNumber } from '@/utility/common-functions';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CategoryDrawer from '../components/CategoryDrawer';
import { ArrowUpOutlined, DeleteOutlined, MoreOutlined, SettingOutlined } from '@ant-design/icons';
import ListingTable from '@/components/general/components/ListingTable';
import getCategory from '@/pages/api/category/getCategory';
import { inputTypes } from '@/utility/config';
import editCategory from '@/pages/api/category/editCategory';
import { CATEGORY_STATUS } from '@/constants/user';
import SinglePopUpModal from '@/components/general/popUp/SinglePopUpModal';
import { connect } from 'react-redux';
import SharedListDrawer from '../components/SharedListDrawer';

const CategoryListingPage = (props) => {
    const user = props.user;
    const { t } = useTranslation();
    const [filterGroup, setFilterGroup] = useState({});
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
    const PAGE_SIZE = 10;
    const router = useRouter();
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [sharedListDrawerOpen, setSharedListDrawerOpen] = useState(false);

    const columns = [
        {
            title: t("category", sourceKey.user),
            dataIndex: 'title',
            filterable: true,
            key: 'category',
            fixed: "left",
            render: (text, record, index) => (
                <>
                    {text}
                </>
            ),
        },
        {
            title: t("nTsharedUnit", sourceKey.user),
            dataIndex: "shareUnit",
            key: "shareUnit",
            render: (text, record, index) => {
                return (
                    <div className={`${record?.applicableOutletDetails?.length > 0 ? 'cursor-pointer blue-text' : ''}`}
                        onClick={() => {
                            setSelectedRecord(record)
                            setSharedListDrawerOpen(true)
                        }}
                    >
                        {formatDecimalNumber(record?.applicableOutletDetails?.length, 0 || 0)}
                        {record?.applicableOutletDetails?.length > 0 && <ArrowUpOutlined style={{ fontSize: '10px' }} rotate={45} />}
                    </div>
                )
            },
        },
        {
            title: t("nTcreatedBy", sourceKey.user),
            dataIndex: "source",
            key: "source",
            render: (text, record, index) => record?.userId === user?._id ? <Tag color="gold">{t("nTownCreated", sourceKey.user)}</Tag> : <Tag color="blue">{t("nTshared", sourceKey.user)}</Tag>,
        },
        {
            title: t("createdAt", sourceKey.user),
            dataIndex: 'createdAt',
            filterable: true,
            displayable: false,
            key: 'createdAt',
            type: inputTypes.dateRange,
            render: (text, record, index) => (
                text
            ),
        },
        {
            title: t("status", sourceKey.user),
            dataIndex: "status",
            key: "status",
            filterable: true,
            type: inputTypes.dropdown,
            selections: [
                { title: t("active", sourceKey.product), value: CATEGORY_STATUS.ACTIVE },
                { title: t("inactive", sourceKey.product), value: CATEGORY_STATUS.INACTIVE },
            ],
            render: (text, record, index) => {
                let content = null;
                switch (record?.status) {
                    case CATEGORY_STATUS.ACTIVE:
                        content = (
                            <div className="flex items-center">
                                <img src={ActiveGreenIcon} style={{ marginRight: 5 }} />
                                <div className="flex flex-col">
                                    <div>{t("active", sourceKey.user)}</div>
                                    <div className="xsmall-text-size grey-second-text">{`${t("createdOn", sourceKey.user)} ${formatDate(record?.createdAt, "D MMM YYYY HH:mm:ss")}`}</div>
                                </div>
                            </div>
                        );
                        break;
                    case CATEGORY_STATUS.INACTIVE:
                        content = (
                            <div className="flex items-center">
                                <img src={PendingGreyIcon} style={{ marginRight: 5 }} />
                                <div className="flex flex-col">
                                    <div>{t("inactive", sourceKey.user)}</div>
                                    <div className="xsmall-text-size grey-second-text">{`${t("createdOn", sourceKey.user)} ${formatDate(record?.createdAt, "D MMM YYYY HH:mm:ss")}`}</div>
                                </div>
                            </div>
                        );
                        break;

                    default:
                        content = <span>{record?.status}</span>;
                        break;
                }
                return content;
            }
        },

        {
            title: "",
            dataIndex: 'action',
            key: 'action',

            // width: isMobile ? 20 : 20,

            render: (text, record) => {

                const menuItems = [
                    {
                        key: "editCategory",
                        label: (
                            <div className=" flex flex-center cursor-pointer"
                                onClick={() => {
                                    setCategoryDrawerOpen(true);
                                    setSelectedRecord(record)
                                }}
                            >
                                {/* <img src={SettingIcon} style={{ marginRight: 5 }} /> */}
                                <SettingOutlined style={{ marginRight: 5 }} />
                                {t("editCategory", sourceKey.user)}
                            </div>
                        ),

                    },
                    {
                        key: "delete",
                        label: (
                            <div className=" flex flex-center cursor-pointer"
                                onClick={() => {
                                    setDeleteModalOpen(true);
                                    setSelectedRecord(record)
                                }}
                            >
                                <DeleteOutlined style={{ marginRight: 5 }} />
                                {t("delete", sourceKey.user)}
                            </div>
                        ),
                    },
                ];

                if (record?.userId !== user?._id) return null;

                return (
                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <MoreOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
                    </Dropdown>
                );
            },
        }

    ];

    useEffect(() => {
        getData((page - 1) * PAGE_SIZE);
    }, [page, filterGroup]);

    function getData(skip) {
        setLoading(true);

        if (isNaN(parseInt(skip))) {
            skip = 0;
        } else {
            skip = parseInt(skip);
        }

        const filterParams = {
            ...filterGroup,
            statusNe: CATEGORY_STATUS.DELETED,
            // paymentStatus: [0, 1, 2],
            // sort: {
            //     status: 1,
            //     createdAt: -1
            // }
        };

        getCategory(PAGE_SIZE, skip, filterParams)
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


    const listingActions = [
        {
            value: "createContent",
            render: () => (
                <div className="">
                    <Button className="ant-btn-default bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('addCategory', sourceKey.user)}
                    </Button>
                </div>
            ),
            exec: () => {
                setCategoryDrawerOpen(true)
            }
        },
    ];

    async function onRefresh() {
        setPage(1)
        if (page !== 1) {
            getData((page - 1) * PAGE_SIZE);
        } else {
            getData(0);
        }
    }

    async function handleDeleteCategory(categoryId) {
        setLoading(true);
        try {
            const response = await editCategory({ categoryId: categoryId, action: "delete" });
            if (response) {
                message.success(response?.data?.message);
            }
        } catch (err) {
            message.error(err.err?.message);
        } finally {
            setLoading(false);
            setDeleteModalOpen(false);
            setSelectedRecord(null);
            onRefresh();
        }
    }

    return (
        <>
            <div className='mb-5 flex flex-row justify-between'>
                <div className='flex flex-col'>
                    <h1 className='text-3xl font-bold text-gray-900'>{t("categoryListing", sourceKey.user)}</h1>
                    <span className='text-gray-600 mt-1' >{t("categoryListingDesc", sourceKey.user)}</span>
                </div>
            </div>
            <div className="">
                <ListingTable
                    columns={columns}
                    dataSource={dataSource}
                    setPage={setPage}
                    total={total}
                    page={page}
                    loading={loading}
                    listingActions={listingActions}
                    PAGE_SIZE={PAGE_SIZE}
                    onRefresh={onRefresh}
                    filterTag={true}
                    filterGroup={filterGroup}
                    setFilterGroup={setFilterGroup}
                    // onExport={onExport}
                    onFilter={(filter) => {
                        setFilterGroup({
                            ...filter,
                        })
                    }}
                />
            </div>
            <CategoryDrawer
                open={categoryDrawerOpen}
                selectedRecord={selectedRecord}
                onRefreshData={() => getData((page - 1) * PAGE_SIZE)}
                onClose={() => { setCategoryDrawerOpen(false); setSelectedRecord(null) }}
            />
            <SinglePopUpModal
                open={deleteModalOpen}
                type={"deleteCategory"}
                closeable={true}
                extraData={selectedRecord}
                onClose={() => { setDeleteModalOpen(false); setSelectedRecord(null) }}
                confirmBtn1={() => handleDeleteCategory(selectedRecord?._id)}
            />
            <SharedListDrawer
                open={sharedListDrawerOpen}
                selectedRecord={selectedRecord}
                onClose={() => { setSharedListDrawerOpen(false); setSelectedRecord(null) }}
            />
        </>
    );
};

const mapStateToProps = (state) => ({
    user: state.user.user,
});
const mapDispatchToProps = {};
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(CategoryListingPage));
