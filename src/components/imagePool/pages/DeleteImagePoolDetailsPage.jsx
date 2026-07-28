import React, { useState, useEffect } from 'react';
import { useRouter, withRouter } from 'next/router';
import { Button, Card, Checkbox, Form, Image, message, Spin } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { connect } from 'react-redux';
import { useForm } from 'antd/lib/form/Form';
import getImagePool from '@/pages/api/imagePool/getImagePool';
import editImagePool from '@/pages/api/imagePool/editImagePool';
import { IMAGE_POOL_STATUS } from '@/constant/template';
import { LeftOutlined } from '@ant-design/icons';
// import { IMAGE_POOL_STATUS } from '@/constants/package';

export const DeleteImagePoolDetailsPage = (props) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [form] = useForm();
    const [existingImages, setExistingImages] = useState([]);
    const [imageLoading, setImageLoading] = useState(true);
    const [selectedImageIndices, setSelectedImageIndices] = useState([]);
    const [productInfo, setProductInfo] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const { poolId, productName, outletUserId } = router.query;
        if (poolId) {
            setImageLoading(true);
            setSelectedImageIndices([]); // Reset selection when opening
            getImageData(poolId);
        }
        if (productName) {
            setProductInfo({
                productId: poolId,
                productName: productName,
                outletUserId: outletUserId
            });
        }
    }, [router.query]);

    function resetStates() {
        setExistingImages([]);
        setSelectedImageIndices([]);
        form.resetFields();
    }

    function getImageData(poolId) {
        setLoading(true);
        getImagePool("all", 0, { productId: poolId, status: IMAGE_POOL_STATUS.ACTIVE, imageUrlNe: false })
            .then((res) => {
                setExistingImages(res?.data);
                setImageLoading(false);
                setLoading(false);
            })
            .catch((err) => {
                console.error("❌ getImageData failed:", err);
                message.error(err?.message || 'Failed to load images');
                setExistingImages([]);
                setImageLoading(false);

            });
    }

    // Toggle image selection
    const toggleImageSelection = (index) => {
        setSelectedImageIndices(prev => {
            if (prev.includes(index)) {
                // Remove from selection
                return prev.filter(i => i !== index);
            } else {
                // Add to selection
                return [...prev, index];
            }
        });
    };

    // Select all images
    const selectAllImages = () => {
        if (selectedImageIndices.length === existingImages.length) {
            // Deselect all
            setSelectedImageIndices([]);
        } else {
            // Select all
            setSelectedImageIndices(existingImages.map((_, index) => index));
        }
    };

    async function handleSave() {
        setLoading(true);

        try {
            // Only keep images that are selected (selected images will be deleted)
            let finalImageUrls = existingImages
                .filter((_, index) => selectedImageIndices.includes(index))
                .map(url => url?.imageUrl);

            // Call editImagePool API with remaining imageUrls
            const response = await editImagePool({
                // imagePoolId: imagePoolId,
                productId: productInfo?.productId,
                imageUrls: finalImageUrls,
                productName: productInfo?.productName,
                outletUserId: productInfo?.outletUserId,
                action: "remove"
            });

            if (response?.data?.success) {
                message.success(response?.data?.message || 'Images deleted successfully');
                resetStates();
                router.back();
            } else {
                throw new Error(response?.data?.message || 'Failed to delete images');
            }
        } catch (err) {
            console.error('Error deleting images:', err);
            message.error(err?.message || 'Error deleting images');
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        router.back();
    }

    return (
        <Card>
            <div className='flex flex-row items-center gap-4 mb-2'>
                <div className="cursor-pointer" onClick={() => handleCancel()}>
                    <LeftOutlined />
                </div>
                <div className='items-center'>
                    <h2 className="xlarge-text-size font-bold">
                        {t("deleteImage", sourceKey.user) || "Edit Image Pool"}
                    </h2>
                    <p className="second-grey-text small-text-size">
                        {productInfo?.productName}
                    </p>
                </div>
            </div>
            <Form form={form}>
                {/* Selection Controls */}
                {existingImages.length > 0 && (
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">
                            {selectedImageIndices.length} {t("selected", sourceKey.user) || "selected"}
                        </span>
                        <span
                            onClick={selectAllImages}
                            className="purple-text cursor-pointer"
                        >
                            {selectedImageIndices.length === existingImages.length
                                ? t("deselectAll", sourceKey.user) || "Deselect All"
                                : t("selectAll", sourceKey.user) || "Select All"}
                        </span>
                    </div>
                )}

                <Spin spinning={imageLoading} tip={t("loadingImages", sourceKey.user) || "Loading images..."} style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000 }}>
                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div className="p-2">
                            <div className="text-sm text-gray-600 mb-2">
                                {t("selectImagesToDelete", sourceKey.user) || "Select images to delete"}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {existingImages.map((image, index) => {
                                    const isSelected = selectedImageIndices.includes(index);
                                    return (
                                        <div
                                            key={`existing-${index}`}
                                            className="relative cursor-pointer"
                                            onClick={() => toggleImageSelection(index)}
                                        >
                                            <Image
                                                src={image.imageUrl}
                                                alt={`Existing ${index + 1}`}
                                                width={'100%'}
                                                height={180}
                                                style={{
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    opacity: isSelected ? 0.5 : 1,
                                                    transition: 'opacity 0.3s'
                                                }}
                                                loading="lazy"
                                                placeholder={
                                                    <div style={{
                                                        width: '100%',
                                                        height: 180,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: '#f0f0f0',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <Spin size="small" />
                                                    </div>
                                                }
                                                preview={false}
                                            />
                                            {/* Mask overlay when selected */}
                                            {isSelected && (
                                                <div
                                                    className="absolute bg-black bg-opacity-40 rounded-lg flex items-center justify-center"
                                                    style={{ pointerEvents: 'none' }}
                                                >
                                                </div>
                                            )}
                                            {/* Checkbox in top-right corner */}
                                            <div className="absolute top-2 right-2" style={{ pointerEvents: 'none' }}>
                                                <Checkbox
                                                    checked={isSelected}
                                                    style={{
                                                        transform: 'scale(1.2)',
                                                        pointerEvents: 'none'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {!imageLoading && existingImages.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            {t("noImages", sourceKey.user) || "No images found"}
                        </div>
                    )}
                </Spin>
            </Form>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 justify-end">
                <Button
                    size="large"
                    onClick={handleCancel}
                >
                    {t("cancel", sourceKey.user) || "Cancel"}
                </Button>
                <Button
                    loading={loading}
                    disabled={selectedImageIndices.length === 0}
                    className={`${selectedImageIndices.length === 0 ? 'disabled-btn' : 'purple-btn'}`}
                    size="large"
                    onClick={() => handleSave()}
                >
                    {t("delete", sourceKey.user)}
                </Button>
            </div>

        </Card>
    );
};

const mapStateToProps = (state) => ({
    user: state.user,
})
const mapDispatchToProps = {

}
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(DeleteImagePoolDetailsPage))