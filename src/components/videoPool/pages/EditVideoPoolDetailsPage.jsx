import React, { useState, useEffect } from 'react';
import { useRouter, withRouter } from 'next/router';
import { Card, Form, message } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { useForm } from 'antd/lib/form/Form';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { VIDEO_POOL_STATUS } from '@/constant/template';
import getVideoPool from '@/pages/api/videoPool/getVideoPool';
import editVideoPool from '@/pages/api/videoPool/editVideoPool';
import videosUpload from '@/pages/api/upload/videos';
import getGenerationConfig from '@/pages/api/generationConfiguration/getConfig';
import VideoUploadWithPreview from '@/components/general/components/VideoUploadWithPreview';
import ActionsBar from '@/components/hq/components/ActionsBar';

export const EditVideoPoolDetailsPage = (props) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [form] = useForm();

    const [loading, setLoading] = useState(false);
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [videoPreviews, setVideoPreviews] = useState([]);
    const [existingCount, setExistingCount] = useState(0);
    const [productInfo, setProductInfo] = useState(null);
    const [maxVideos, setMaxVideos] = useState(30);

    useEffect(() => {
        getGenerationConfig()
            .then((res) => {
                const size = res?.data?.videoPoolSize;
                if (size && size > 0) setMaxVideos(size);
            })
            .catch((err) => console.error('Failed to load generation config:', err));
    }, []);

    useEffect(() => {
        const { poolId, productName, outletUserId } = router.query;
        if (poolId) {
            loadExistingCount(poolId);
        }
        if (productName) {
            setProductInfo({
                productId: poolId,
                productName,
                outletUserId,
            });
        }
    }, [router.query]);

    function loadExistingCount(poolId) {
        getVideoPool('all', 0, {
            productId: poolId,
            status: VIDEO_POOL_STATUS.ACTIVE,
        })
            .then((res) => {
                setExistingCount(res?.total || (res?.data || []).length || 0);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    function resetStates() {
        videoPreviews.forEach((p) => {
            try {
                URL.revokeObjectURL(p.preview);
            } catch (_) {}
        });
        setSelectedVideos([]);
        setVideoPreviews([]);
        form.resetFields();
    }

    async function handleSave() {
        if (selectedVideos.length === 0) {
            message.error('Please select at least one video');
            return;
        }
        if (existingCount + selectedVideos.length > maxVideos) {
            message.error(
                `Maximum ${maxVideos} videos per pool. Currently: ${existingCount}.`
            );
            return;
        }

        setLoading(true);
        try {
            const uploadRes = await videosUpload({ videos: selectedVideos });
            if (uploadRes?.error || !uploadRes?.data?.success) {
                throw new Error(
                    uploadRes?.error?.message ||
                        uploadRes?.data?.message ||
                        'Failed to upload videos'
                );
            }
            const newUrls = uploadRes?.data?.data?.videoUrls || [];
            if (newUrls.length === 0) {
                throw new Error('No video URLs returned from upload');
            }

            const response = await editVideoPool({
                productId: productInfo?.productId,
                productName: productInfo?.productName,
                outletUserId: productInfo?.outletUserId,
                videoUrls: newUrls,
                action: 'add',
            });

            if (response?.data?.success) {
                message.success(response?.data?.message || 'Videos added successfully');
                resetStates();
                router.back();
            } else {
                throw new Error(response?.data?.message || 'Failed to add videos');
            }
        } catch (err) {
            console.error('Error adding videos:', err);
            message.error(err?.message || 'Error adding videos');
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        router.back();
    }

    const remainingSlots = Math.max(0, maxVideos - existingCount);
    const canConfirm = selectedVideos.length > 0 && remainingSlots > 0;

    const actions = [
        {
            key: 'back',
            label: t('back', sourceKey.user),
            size: 'large',
            onClick: handleCancel,
        },
        {
            key: 'confirm',
            label: t('confirm', sourceKey.user),
            className: canConfirm ? 'purple-btn' : 'disabled-btn',
            size: 'large',
            onClick: handleSave,
            loading,
            disabled: !canConfirm,
        },
    ];

    return (
        <div className="pb-24">
            <Card>
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row items-center gap-4">
                        <div className="cursor-pointer" onClick={handleCancel}>
                            <LeftOutlined />
                        </div>
                        <div className="items-center">
                            <h2 className="xlarge-text-size font-bold">Add Video Pool</h2>
                            <p className="second-grey-text small-text-size">
                                {productInfo?.productName}
                            </p>
                        </div>
                    </div>
                </div>

                <Form form={form}>
                    {remainingSlots > 0 ? (
                        <>
                            <div className="text-gray-600 mb-4 font-medium flex justify-end">
                                <div className="flex flex-col gap-2 items-end">
                                    {selectedVideos.length} / {remainingSlots} (
                                    {existingCount} already in pool)
                                </div>
                            </div>
                            <VideoUploadWithPreview
                                selectedVideos={selectedVideos}
                                setSelectedVideos={setSelectedVideos}
                                videoPreviews={videoPreviews}
                                setVideoPreviews={setVideoPreviews}
                                maxRequiredVideos={remainingSlots}
                                maxFileSize={100}
                                showCounter={false}
                                gridCols="grid-cols-2 md:grid-cols-4"
                            />
                        </>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            Video pool is full ({maxVideos}/{maxVideos}). Delete some videos
                            first.
                        </div>
                    )}
                </Form>
            </Card>
            <ActionsBar actions={actions} variant="sticky" align="center" />
        </div>
    );
};

const mapStateToProps = (state) => ({ user: state.user });
const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(EditVideoPoolDetailsPage));
