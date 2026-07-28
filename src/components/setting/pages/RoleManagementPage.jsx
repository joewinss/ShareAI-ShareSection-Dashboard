import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Col, Dropdown, Input, message, Pagination, Row, Switch, Tabs, Button as AntButton } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import ListingTable from '@/general/components/ListingTable';
import { sourceKey } from '@/locales/config';
import { CATEGORY_STATUS } from '@/constant/template';
import { ActiveGreenIcon, PendingGreyIcon, SettingWhiteIcon } from '../../../../public/assets';
import { formatDate } from '@/utility/common-functions';
import { Button as ButtonUi } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MoreOutlined, SettingOutlined } from '@ant-design/icons';
import AccessDrawer from '../components/AccessDrawer';
import RoleManagementDrawer from '../components/RoleManagementDrawer';
import getAllContent from '@/pages/api/global-content/getAllContent';

const RoleManagementPage = () => {
    const { t } = useTranslation();
    const [filterGroup, setFilterGroup] = useState({});
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [accessDrawerOpen, setAccessDrawerOpen] = useState(false);
    const PAGE_SIZE = 10;
    const [roleManagementDrawerOpen, setRoleManagementDrawerOpen] = useState(false);
    const router = useRouter();

    const columns = [
        {
            title: t("accountId", sourceKey.user),
            dataIndex: 'accountId',
            filterable: true,
            key: 'accountId',
            fixed: "left",
            render: (text, record, index) => (
                <>
                    {text}
                </>
            ),
        },
        {
            title: t("type", sourceKey.user),
            dataIndex: 'type',
            filterable: true,
            key: 'type',
            render: (text, record, index) => (
                text
            ),
        },
        {
            title: t("contentCount", sourceKey.user),
            dataIndex: 'contentCount',
            filterable: true,
            key: 'contentCount',
            render: (text, record, index) => (
                text
            ),
        },
        {
            title: t("phoneNumber", sourceKey.user),
            dataIndex: 'phoneNumber',
            filterable: true,
            key: 'phoneNumber',
            render: (text, record, index) => (
                text
            ),
        },
        {
            title: t("status", sourceKey.user),
            dataIndex: "status",
            key: "status",
            // filterable: true,
            // type: inputTypes.dropdown,
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
                        key: "editAccess",
                        label: (
                            <div className=" flex flex-center cursor-pointer"
                                onClick={() => {
                                    setCategoryDrawerOpen(true);
                                    setSelectedRecord(record)
                                }}
                            >
                                {/* <img src={SettingIcon} style={{ marginRight: 5 }} /> */}
                                <SettingOutlined style={{ marginRight: 5 }} />
                                {t("editCategory", sourceKey.marketing)}
                            </div>
                        ),
                    },
                ];

                return (
                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <MoreOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
                    </Dropdown>
                );
            },
        }

    ];

    useEffect(() => {
        if (!filterGroup.platform) return;
        getData((page - 1) * PAGE_SIZE);
    }, [page, filterGroup]);

    const getData = async (skip) => {
        setLoading(true);

        if (isNaN(parseInt(skip))) {
            skip = 0;
        } else {
            skip = parseInt(skip);
        }

        const filterParams = {
            limit: PAGE_SIZE,
            page: page,
            ...filterGroup
        };

        try {
            const response = await getAllContent(filterParams);

            if (response?.data) {
                setDataSource(response.data.content || response.data);
                setTotal(response.data.summary?.totalItems || response.data.length);
            } else {
                message.error('Error fetching all content');
            }
        } catch (error) {
            message.error('Error fetching all content');
        } finally {
            setLoading(false);
        }
    };

    const listingActions = [
        {
            value: "addAccess",
            render: () => (
                <div className="">
                    <ButtonUi className="ant-btn-default bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('addAccess', sourceKey.user)}
                    </ButtonUi>
                </div>
            ),
            exec: () => {
                setAccessDrawerOpen(true)
            }
        },
    ];


    return (
        <>
            <div className='mb-5 flex flex-row justify-between items-center'>
                <div className='flex flex-col'>
                    <h1 className='text-3xl font-bold text-gray-900'>{t("roleManagement", sourceKey.user)}</h1>
                    <span className='text-gray-600 mt-1' >{t("roleManagementDesc", sourceKey.user)}</span>
                </div>
                <AntButton
                    type="primary"
                    size='large'
                    onClick={() => setRoleManagementDrawerOpen(true)}
                    className='flex items-center'
                >
                    <div className="flex items-center">
                        <img src={SettingWhiteIcon} className="mr-2" />
                        {t("roleManagement", sourceKey.user)}
                    </div>
                </AntButton>
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
                    // onRefresh={onRefresh}
                    // onExport={onExport}
                    onFilter={(filter) => {
                        setFilterGroup({
                            ...filter,
                        })
                    }}
                />

                <AccessDrawer
                    open={accessDrawerOpen}
                    // selectedRecord={"testing"}
                    onClose={() => setAccessDrawerOpen(false)}
                />

                <RoleManagementDrawer
                    visible={roleManagementDrawerOpen}
                    onClose={() => setRoleManagementDrawerOpen(false)}
                />
            </div>

        </>
    );
};

export default RoleManagementPage;