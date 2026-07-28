import React, { useState, useEffect } from 'react';
import { useRouter, withRouter } from 'next/router';
import { Dropdown, message, Tag } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { MoreOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import ListingTable from '@/components/general/components/ListingTable';
import SinglePopUpModal from '@/components/general/popUp/SinglePopUpModal';
import getAvailablePoolListing from '@/pages/api/videoPool/getAvailablePoolListing';
import editVideoPool from '@/pages/api/videoPool/editVideoPool';

const PAGE_SIZE = 10;

const VideoPoolPage = (props) => {
    const { user } = props;
    const { t } = useTranslation();
    const router = useRouter();
    const userIdentity = user?.user?.role;

    const [filterGroup, setFilterGroup] = useState({});
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedContent, setSelectedContent] = useState('');

    const columns = [
        {
            title: t("productName", sourceKey.user),
            dataIndex: 'productName',
            filterable: true,
            key: 'productName',
            fixed: 'left',
            render: (text) => text,
        },
        {
            title: 'Video Count',
            dataIndex: 'videoCount',
            key: 'videoCount',
            render: (text) => text,
        },
        {
            title: '',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => {
                const menuItems = [
                    {
                        key: 'view',
                        label: (
                            <div
                                className="flex flex-center cursor-pointer"
                                onClick={() => {
                                    router.push({
                                        pathname: `/video-pool/video-pool-details`,
                                        query: {
                                            poolId: record.productId,
                                            productName: record.productName,
                                            outletUserId: record.outletUserId,
                                        },
                                    });
                                }}
                            >
                                View Video Pool
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
        },
    ];

    useEffect(() => {
        getData((page - 1) * PAGE_SIZE);
    }, [page, filterGroup]);

    function getData(skip) {
        setLoading(true);
        const safeSkip = Number.isFinite(parseInt(skip, 10)) ? parseInt(skip, 10) : 0;

        const filterParams = {
            ...(userIdentity === 'outlet' && {
                outletUserId: user?.user?._id,
            }),
            ...filterGroup,
        };

        getAvailablePoolListing(PAGE_SIZE, safeSkip, filterParams)
            .then((res) => {
                setDataSource(res?.data || []);
                setTotal(res?.total || 0);
            })
            .catch((err) => {
                console.error(err);
                message.error(err?.message || 'Failed to load video pools');
            })
            .finally(() => setLoading(false));
    }

    async function handleDeleteContent(content) {
        if (!content) return;
        setLoading(true);
        try {
            const response = await editVideoPool({
                productId: content?.productId,
                action: 'editPoolStatus',
            });
            message.success(response?.data?.message || 'Video pool deactivated');
            setDeleteModalOpen(false);
            setSelectedContent(null);
            onRefresh();
        } catch (err) {
            console.error(err);
            message.error(err?.message || 'Error deactivating video pool');
        } finally {
            setLoading(false);
        }
    }

    async function onRefresh() {
        setPage(1);
        getData(0);
    }

    return (
        <>
            <div className="mb-5 flex flex-row justify-between">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-900">Video Pool</h1>
                    <span className="text-gray-600 mt-1">
                        Manage videos available for sharing on video-type content.
                    </span>
                    <div className="mt-2">
                        <Tag color="blue">
                            Videos are pulled from this pool at share time for video templates.
                        </Tag>
                    </div>
                </div>
            </div>

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
            />

            <SinglePopUpModal
                open={deleteModalOpen}
                type={'deleteImagePool'}
                closeable={true}
                extraData={selectedContent}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedContent(null);
                }}
                confirmBtn1={() => handleDeleteContent(selectedContent)}
            />
        </>
    );
};

const mapStateToProps = (state) => ({ user: state.user });
const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(VideoPoolPage));
