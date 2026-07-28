import React, { useState, useEffect } from 'react';
import { useRouter, withRouter } from 'next/router';
import { Button, message, Pagination, Spin } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { VIDEO_POOL_STATUS } from '@/constant/template';
import getVideoPool from '@/pages/api/videoPool/getVideoPool';

const PAGE_SIZE = 10;

export const ViewVideoPoolDetailsPage = (props) => {
    const { t } = useTranslation();
    const router = useRouter();

    const [filterGroup, setFilterGroup] = useState({});
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [productInfo, setProductInfo] = useState(null);

    useEffect(() => {
        const { poolId, productName } = router.query;
        if (poolId) {
            getData(poolId, (page - 1) * PAGE_SIZE);
        }
        if (productName) {
            setProductInfo({ productName, productId: poolId });
        }
    }, [page, filterGroup, router.query]);

    function getData(poolId, skip) {
        setLoading(true);
        const safeSkip = Number.isFinite(parseInt(skip, 10)) ? parseInt(skip, 10) : 0;

        const filterParams = {
            ...filterGroup,
            productId: poolId,
            status: VIDEO_POOL_STATUS.ACTIVE,
            videoUrlNe: false,
        };

        getVideoPool(PAGE_SIZE, safeSkip, filterParams)
            .then((res) => {
                setDataSource(res?.data || []);
                setTotal(res?.total || 0);
            })
            .catch((err) => {
                console.error(err);
                message.error(err?.message || 'Failed to load videos');
            })
            .finally(() => setLoading(false));
    }

    function handlePageChange(newPage) {
        setPage(newPage);
    }

    function handleEditClick() {
        const { poolId, productName, outletUserId } = router.query;
        router.push({
            pathname: `/video-pool/edit-pool-details`,
            query: { poolId, productName, outletUserId },
        });
    }

    function handleDeleteClick() {
        const { poolId, productName, outletUserId } = router.query;
        router.push({
            pathname: `/video-pool/delete-pool-details`,
            query: { poolId, productName, outletUserId },
        });
    }

    function handleCancel() {
        router.back();
    }

    const canEdit =
        props?.user?.role === 'masterHQ' ||
        router.query.sourceType === 'own' ||
        props.user?.contentPermission === 1;

    return (
        <div className="min-h-screen bg-white from-slate-50 to-blue-50 rounded-lg">
            <div className="p-3">
                {/* Header */}
                <div className="flex flex-row justify-between items-center mb-4">
                    <div className="flex flex-row items-center gap-4">
                        <div className="cursor-pointer" onClick={handleCancel}>
                            <LeftOutlined />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="xlarge-text-size font-bold">
                                {productInfo?.productName || 'Video Pool'}
                            </h2>
                            <p className="second-grey-text small-text-size">
                                Total videos: {total}
                            </p>
                        </div>
                    </div>
                    {canEdit && (
                        <div className="flex gap-2">
                            <Button className="purple-btn" size="medium" onClick={handleEditClick}>
                                Add Video Pool
                            </Button>
                            <Button
                                className="purple-btn"
                                size="medium"
                                onClick={handleDeleteClick}
                                disabled={total === 0}
                            >
                                Delete Video Pool
                            </Button>
                        </div>
                    )}
                </div>

                {/* Grid */}
                <Spin spinning={loading} tip="Loading videos...">
                    {dataSource.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
                                {dataSource.map((row, index) => (
                                    <div
                                        key={row._id || index}
                                        className="aspect-square relative rounded-lg overflow-hidden bg-black"
                                    >
                                        <video
                                            src={row.videoUrl}
                                            controls
                                            preload="metadata"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>

                            {total > PAGE_SIZE && (
                                <div className="flex justify-center mt-6">
                                    <Pagination
                                        current={page}
                                        total={total}
                                        pageSize={PAGE_SIZE}
                                        onChange={handlePageChange}
                                        showSizeChanger={false}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        !loading && (
                            <div className="flex flex-col items-center justify-center space-y-6 w-full py-20 text-center">
                                <div className="xlarge-text-size font-bold">No videos yet</div>
                                <p className="second-grey-text">
                                    Add videos to this pool so they can be attached when sharing
                                    video content for this product.
                                </p>
                            </div>
                        )
                    )}
                </Spin>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({ user: state.user.user });
const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(ViewVideoPoolDetailsPage));
