import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, withRouter } from 'next/router';
import { Button, Form, message, Card } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { connect } from 'react-redux';
import { useForm } from 'antd/lib/form/Form';
import getImagePool from '@/pages/api/imagePool/getImagePool';
import editImagePool from '@/pages/api/imagePool/editImagePool';
import getGeneratedVisualContent from '@/pages/api/visualCategory/getGeneratedVisualContent';
import images from "@/pages/api/upload/images";
import ImageUploadWithPreview from '@/components/general/components/ImageUploadWithPreview';
import { IMAGE_POOL_STATUS } from '@/constant/template';
import { LeftOutlined } from '@ant-design/icons';
import VisualImageCard from '@/components/hq/components/VisualImageCard';
import ActionsBar from '@/components/hq/components/ActionsBar';

export const EditImagePoolDetailsPage = (props) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [form] = useForm();
    const [uploadMode, setUploadMode] = useState('manual');
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [maxRequiredImages, setMaxRequiredImages] = useState(30);
    const [productInfo, setProductInfo] = useState(null);
    const [completedImages, setCompletedImages] = useState([]);
    const [selectedCompleted, setSelectedCompleted] = useState(() => new Set());
    const [libraryLoading, setLibraryLoading] = useState(false);
    const [isHeaderVisible, setHeaderVisible] = useState(true);
    const headerRef = useRef(null);
    const router = useRouter();
    const selectedCompletedImages = useMemo(
        () => completedImages.filter((_, index) => selectedCompleted.has(index)),
        [completedImages, selectedCompleted]
    );

    useEffect(() => {
        const { poolId, productName, outletUserId } = router.query;
        if (poolId) {
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
        setImagePreviews([]);
        setSelectedImages([]);
        setCompletedImages([]);
        setSelectedCompleted(new Set());
        form.resetFields();
    }

    function getImageData(poolId) {
        setLoading(true);
        getImagePool("all", 0, { productId: poolId, status: IMAGE_POOL_STATUS.ACTIVE })
            .then((res) => {
                setExistingImages(res?.data || []);
                setMaxRequiredImages(30);
            })
            .catch((err) => {
                console.error("❌ getImageData failed:", err);
                message.error(err?.message || 'Failed to load images');
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const getCompletedData = () => {
        setLibraryLoading(true);
        getGeneratedVisualContent("all", 0, {})
            .then((res) => {
                const list = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res)
                        ? res
                        : [];
                const urls = list
                    .flatMap((item) => (item.resultImageUrls))
                    .filter(Boolean);
                setCompletedImages(urls);
                setSelectedCompleted(new Set());
            })
            .catch((err) => {
                console.error("Failed to load completed visuals", err);
            })
            .finally(() => setLibraryLoading(false));
    };

    const toggleCompletedSelection = (index) => {
        setSelectedCompleted((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
                return next;
            }
            if (next.size >= maxRequiredImages) {
                message.error(`Maximum ${maxRequiredImages} images allowed. Currently: ${next.size}`);
                return prev;
            }
            next.add(index);
            return next;
        });
    };

    const handleSelectAllCompleted = () => {
        if (!completedImages.length) return;
        const next = new Set();
        for (let i = 0; i < completedImages.length && next.size < maxRequiredImages; i += 1) {
            next.add(i);
        }
        setSelectedCompleted(next);
    };

    const handleCancelSelection = () => {
        setSelectedCompleted(new Set());
    };

    useEffect(() => {
        if (!headerRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                setHeaderVisible(entry.isIntersecting);
            },
            { threshold: 0 }
        );
        observer.observe(headerRef.current);
        return () => observer.disconnect();
    }, []);

    async function handleSave() {
        const totalImages = uploadMode === 'manual' ? selectedImages.length : selectedCompletedImages.length;

        // Check if exceeds maximum image requirement
        if (totalImages > maxRequiredImages) {
            message.error(`Maximum ${maxRequiredImages} images allowed. Currently: ${totalImages}`);
            return;
        }

        // Check if no new images were selected
        if (totalImages === 0) {
            message.error('Please select at least one image');
            return;
        }

        setLoading(true);

        try {
            let newImageUrls = [];

            if (uploadMode === 'manual') {
                // Upload new images
                const uploadResponse = await images({ images: selectedImages });

                // Check if upload response has error
                if (uploadResponse?.error || !uploadResponse?.data?.success) {
                    const errorMessage = uploadResponse?.error?.message || uploadResponse?.data?.message || 'Failed to upload images';
                    throw new Error(errorMessage);
                }
                newImageUrls = uploadResponse?.data?.data?.imageUrls || [];
                if (newImageUrls.length === 0) {
                    throw new Error('No image URLs returned from upload');
                }
            } else {
                newImageUrls = selectedCompletedImages;
                if (newImageUrls.length === 0) {
                    throw new Error('No image URLs selected');
                }
            }

            // Call editImagePool API with imageUrls
            const response = await editImagePool({
                productId: productInfo?.productId,
                imageUrls: newImageUrls,
                productName: productInfo?.productName,
                outletUserId: productInfo?.outletUserId,
                action: "add"
            });

            if (response?.data?.success) {
                message.success(response?.data?.message || 'Images added successfully');
                resetStates();
                router.back();
            } else {
                throw new Error(response?.data?.message || 'Failed to add images');
            }
        } catch (err) {
            console.error('Error adding images:', err);
            message.error(err?.message || 'Error adding images');
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        router.back();
    }

    function handleModeToggle() {
        const nextMode = uploadMode === 'manual' ? 'imageLibrary' : 'manual';
        setUploadMode(nextMode);
        resetStates();
        if (nextMode === 'imageLibrary') {
            getCompletedData();
        }
    }

    const canConfirm =
        uploadMode === "manual" ? selectedImages.length > 0 : selectedCompleted.size > 0;
    const showBulkActions = uploadMode === "imageLibrary" && !isHeaderVisible;
    const actions = [
        {
            key: "back",
            label: t("back", sourceKey.user),
            size: "large",
            onClick: handleCancel,
        },
        ...(showBulkActions
            ? [
                {
                    key: "cancel-selected",
                    label: "Cancel Selected",
                    className: "theme-danger-button",
                    size: "large",
                    onClick: handleCancelSelection,
                    disabled: selectedCompleted.size === 0,
                },
                {
                    key: "select-all",
                    label: "Select All",
                    size: "large",
                    onClick: handleSelectAllCompleted,
                    disabled: completedImages.length === 0,
                },
            ]
            : []),
        {
            key: "confirm",
            label: t("confirm", sourceKey.user),
            className: canConfirm ? "purple-btn" : "disabled-btn",
            size: "large",
            onClick: handleSave,
            loading,
            disabled: !canConfirm,
        },
    ];

    return (
        <div className="pb-24">
            <Card>
                {/* Header */}
                <div ref={headerRef} className='flex flex-row justify-between items-center'>
                    <div className='flex flex-row items-center gap-4'>
                        <div className="cursor-pointer" onClick={() => handleCancel()}>
                            <LeftOutlined />
                        </div>
                        <div className='items-center'>
                            <h2 className="xlarge-text-size font-bold">
                                {t("addImagePool", sourceKey.user)}
                            </h2>
                            <p className="second-grey-text small-text-size">
                                {productInfo?.productName}
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleModeToggle}>
                        {uploadMode === "manual" && ("Choose From Image Library")}
                        {uploadMode === "imageLibrary" && ("Manual Upload")}
                    </Button>
                </div>
                <Form form={form}>
                    {uploadMode === 'manual' && (
                        maxRequiredImages > 0 ? (
                            <>
                                <div className="text-gray-600 mb-4 font-medium flex justify-end">
                                    <div className='flex flex-col gap-2 items-end'>
                                        {selectedImages.length} / {maxRequiredImages}
                                    </div>
                                </div>
                                <ImageUploadWithPreview
                                    selectedImages={selectedImages}
                                    setSelectedImages={setSelectedImages}
                                    imagePreviews={imagePreviews}
                                    setImagePreviews={setImagePreviews}
                                    maxRequiredImages={maxRequiredImages}
                                    showCounter={true}
                                    gridCols='grid-cols-2 md:grid-cols-4'
                                    maxFileSize={10}
                                />
                            </>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                {t("imagePoolFull", sourceKey.user) || "Image pool is full (10/10). Please delete some images first."}
                            </div>
                        )
                    )}

                    {uploadMode === 'imageLibrary' && (
                        maxRequiredImages > 0 ? (
                            <>
                                <div className="text-gray-600 mb-4 font-medium flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        <div className='flex flex-row gap-2'>
                                            <Button onClick={handleSelectAllCompleted} disabled={!completedImages.length} >
                                                Select All
                                            </Button>
                                            <Button onClick={handleCancelSelection} disabled={selectedCompleted.size === 0} className='theme-danger-button' >
                                                Cancel Selected
                                            </Button>
                                        </div>
                                        {selectedCompleted.size} / {maxRequiredImages}
                                    </div>
                                </div>
                                {libraryLoading ? (
                                    <div className="rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
                                        {t("loading", sourceKey.user)}
                                    </div>
                                ) : completedImages.length ? (
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                        {completedImages.map((url, index) => (
                                            <VisualImageCard
                                                key={`${url}-${index}`}
                                                src={url}
                                                alt="Completed visual"
                                                selectable={true}
                                                selected={selectedCompleted.has(index)}
                                                onClick={() => toggleCompletedSelection(index)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
                                        {t("imageListNotFound", sourceKey.user) || "No completed images found."}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                {t("imagePoolFull", sourceKey.user) || "Image pool is full (10/10). Please delete some images first."}
                            </div>
                        )
                    )}
                </Form>
            </Card >
            <ActionsBar actions={actions} variant="sticky" align="center" />
        </div>
    );
};

const mapStateToProps = (state) => ({
    user: state.user,
})
const mapDispatchToProps = {

}
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(EditImagePoolDetailsPage))
