import React, { useState, useEffect } from 'react';
import { useRouter, withRouter } from 'next/router';
import { Button, Card, Checkbox, Form, message, Spin } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { useForm } from 'antd/lib/form/Form';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { VIDEO_POOL_STATUS } from '@/constant/template';
import getVideoPool from '@/pages/api/videoPool/getVideoPool';
import editVideoPool from '@/pages/api/videoPool/editVideoPool';

export const DeleteVideoPoolDetailsPage = (props) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [form] = useForm();

    const [loading, setLoading] = useState(false);
    const [videoLoading, setVideoLoading] = useState(true);
    const [existingVideos, setExistingVideos] = useState([]);
    const [selectedIndices, setSelectedIndices] = useState([]);
    const [productInfo, setProductInfo] = useState(null);

    useEffect(() => {
        const { poolId, productName, outletUserId } = router.query;
        if (poolId) {
            setVideoLoading(true);
            setSelectedIndices([]);
            getVideoData(poolId);
        }
        if (productName) {
            setProductInfo({
                productId: poolId,
                productName,
                outletUserId,
            });
        }
    }, [router.query]);

    function resetStates() {
        setExistingVideos([]);
        setSelectedIndices([]);
        form.resetFields();
    }

    function getVideoData(poolId) {
        setLoading(true);
        getVideoPool('all', 0, {
            productId: poolId,
            status: VIDEO_POOL_STATUS.ACTIVE,
            videoUrlNe: false,
        })
            .then((res) => {
                setExistingVideos(res?.data || []);
                setVideoLoading(false);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                message.error(err?.message || 'Failed to load videos');
                setExistingVideos([]);
                setVideoLoading(false);
                setLoading(false);
            });
    }

    const toggleSelection = (index) => {
        setSelectedIndices((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const selectAll = () => {
        if (selectedIndices.length === existingVideos.length) {
            setSelectedIndices([]);
        } else {
            setSelectedIndices(existingVideos.map((_, i) => i));
        }
    };

    async function handleSave() {
        setLoading(true);
        try {
            const urlsToRemove = existingVideos
                .filter((_, index) => selectedIndices.includes(index))
                .map((row) => row?.videoUrl)
                .filter(Boolean);

            const response = await editVideoPool({
                productId: productInfo?.productId,
                productName: productInfo?.productName,
                outletUserId: productInfo?.outletUserId,
                videoUrls: urlsToRemove,
                action: 'remove',
            });

            if (response?.data?.success) {
                message.success(response?.data?.message || 'Videos deleted successfully');
                resetStates();
                router.back();
            } else {
                throw new Error(response?.data?.message || 'Failed to delete videos');
            }
        } catch (err) {
            console.error('Error deleting videos:', err);
            message.error(err?.message || 'Error deleting videos');
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        router.back();
    }

    return (
        <Card>
            <div className="flex flex-row items-center gap-4 mb-2">
                <div className="cursor-pointer" onClick={handleCancel}>
                    <LeftOutlined />
                </div>
                <div className="items-center">
                    <h2 className="xlarge-text-size font-bold">Delete Video Pool</h2>
                    <p className="second-grey-text small-text-size">
                        {productInfo?.productName}
                    </p>
                </div>
            </div>

            <Form form={form}>
                {existingVideos.length > 0 && (
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">
                            {selectedIndices.length}{' '}
                            {t('selected', sourceKey.user) || 'selected'}
                        </span>
                        <span onClick={selectAll} className="purple-text cursor-pointer">
                            {selectedIndices.length === existingVideos.length
                                ? t('deselectAll', sourceKey.user) || 'Deselect All'
                                : t('selectAll', sourceKey.user) || 'Select All'}
                        </span>
                    </div>
                )}

                <Spin
                    spinning={videoLoading}
                    tip="Loading videos..."
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                    }}
                >
                    {existingVideos.length > 0 && (
                        <div className="p-2">
                            <div className="text-sm text-gray-600 mb-2">
                                Select videos to delete
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {existingVideos.map((row, index) => {
                                    const isSelected = selectedIndices.includes(index);
                                    return (
                                        <div
                                            key={`existing-vid-${index}`}
                                            className="relative cursor-pointer rounded-lg overflow-hidden bg-black"
                                            onClick={() => toggleSelection(index)}
                                            style={{ aspectRatio: '1 / 1' }}
                                        >
                                            <video
                                                src={row.videoUrl}
                                                preload="metadata"
                                                muted
                                                className="w-full h-full object-cover pointer-events-none"
                                                style={{
                                                    opacity: isSelected ? 0.5 : 1,
                                                    transition: 'opacity 0.3s',
                                                }}
                                            />
                                            {isSelected && (
                                                <div
                                                    className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center"
                                                    style={{ pointerEvents: 'none' }}
                                                />
                                            )}
                                            <div
                                                className="absolute top-2 right-2"
                                                style={{ pointerEvents: 'none' }}
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    style={{
                                                        transform: 'scale(1.2)',
                                                        pointerEvents: 'none',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {!videoLoading && existingVideos.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No videos found
                        </div>
                    )}
                </Spin>
            </Form>

            <div className="flex gap-3 mt-6 justify-end">
                <Button size="large" onClick={handleCancel}>
                    {t('cancel', sourceKey.user) || 'Cancel'}
                </Button>
                <Button
                    loading={loading}
                    disabled={selectedIndices.length === 0}
                    className={`${
                        selectedIndices.length === 0 ? 'disabled-btn' : 'purple-btn'
                    }`}
                    size="large"
                    onClick={handleSave}
                >
                    {t('delete', sourceKey.user) || 'Delete'}
                </Button>
            </div>
        </Card>
    );
};

const mapStateToProps = (state) => ({ user: state.user });
const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(DeleteVideoPoolDetailsPage));
