import React, { useState, useEffect } from "react";
import { Drawer, Button, Input, InputNumber, Select, Switch, message, Modal, Steps, Segmented, Image, Spin } from "antd";
import ImageUploadWithPreview from "@/components/general/components/ImageUploadWithPreview";
import createVoucher from "@/pages/api/voucherDraw/createVoucher";
import editVoucher from "@/pages/api/voucherDraw/editVoucher";
import uploadImages from "@/pages/api/upload/images";
import generateVoucherImage from "@/pages/api/voucherDraw/generateVoucherImage";
import getVoucherImageGenerationStatus from "@/pages/api/voucherDraw/getVoucherImageGenerationStatus";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { VOUCHER_DRAW_TYPE, VOUCHER_EXPIRY_MODE } from "@/constants/data";
import { IMAGE_PROCESSING_STATUS } from "@/constants/image";

const GENERATION_POLL_INTERVAL_MS = 3000;
const GENERATION_POLL_MAX_ATTEMPTS = 40; // ~2 minutes

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const VOUCHER_TYPE_OPTIONS = [
    { value: 1, label: "Global Contribution" },
    { value: 2, label: "Merchant Draw" },
];

const CreateVoucherDrawer = ({ open, onClose, editingVoucher, isMasterHQ, outletOptions, onSuccess, defaultOutletId, defaultVoucherType }) => {
    const { t } = useTranslation();
    const isEdit = !!editingVoucher;
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [voucherType, setVoucherType] = useState(null);
    const [voucherTitle, setVoucherTitle] = useState("");
    const [voucherTnC, setVoucherTnC] = useState("");
    const [voucherImage, setVoucherImage] = useState([]);
    const [voucherImagePreviews, setVoucherImagePreviews] = useState([]);
    const [imageSourceMode, setImageSourceMode] = useState("upload");
    const [aiSourceImage, setAiSourceImage] = useState([]);
    const [aiSourceImagePreviews, setAiSourceImagePreviews] = useState([]);
    const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [voucherCount, setVoucherCount] = useState(null);
    const [expiredDays, setExpiredDays] = useState(null);
    const [rebatePercentage, setRebatePercentage] = useState(null);
    const [maxVoucherValue, setMaxVoucherValue] = useState(null);
    const [merchantStatus, setMerchantStatus] = useState("active");
    const [selectedOutletId, setSelectedOutletId] = useState(null);

    useEffect(() => {
        if (editingVoucher) {
            setStep(1);
            setImageSourceMode("upload");
            setAiSourceImage([]);
            setAiSourceImagePreviews([]);
            setGeneratedImageUrl(null);
            setVoucherType(editingVoucher.type === 2 ? VOUCHER_DRAW_TYPE.MERCHANT_DRAW : VOUCHER_DRAW_TYPE.GLOBAL_CONTRIBUTION);
            setVoucherTitle(editingVoucher.voucherTitle || "");
            setVoucherTnC(editingVoucher.voucherTnC || "");
            setVoucherImage(editingVoucher.voucherImage ? [editingVoucher.voucherImage] : []);
            setVoucherImagePreviews(
                editingVoucher.voucherImage
                    ? [{ preview: editingVoucher.voucherImage, name: "voucherImage" }]
                    : []
            );
            setVoucherCount(editingVoucher.voucherCount || null);
            setExpiredDays(editingVoucher.expiredDays || null);
            setRebatePercentage(editingVoucher.rebatePercentage || null);
            setMaxVoucherValue(editingVoucher.maxVoucherValue || null);
            setMerchantStatus(editingVoucher.type === 2 ? (editingVoucher.status === "deactive" ? "deactive" : "active") : "active");
            setSelectedOutletId(editingVoucher.outletUserId?._id || editingVoucher.outletUserId || null);
        } else {
            resetForm();
            setSelectedOutletId(defaultOutletId || null);
            setVoucherType(defaultVoucherType || null);
        }
    }, [editingVoucher, open, defaultOutletId, defaultVoucherType]);

    const resetForm = () => {
        setStep(1);
        setVoucherType(null);
        setVoucherTitle("");
        setVoucherTnC("");
        setVoucherImage([]);
        setVoucherImagePreviews([]);
        setImageSourceMode("upload");
        setAiSourceImage([]);
        setAiSourceImagePreviews([]);
        setGeneratedImageUrl(null);
        setVoucherCount(null);
        setExpiredDays(null);
        setRebatePercentage(null);
        setMaxVoucherValue(null);
        setMerchantStatus("active");
        setSelectedOutletId(null);
    };

    const handleTypeChange = (val) => {
        setVoucherType(val);
        setVoucherCount(null);
        setExpiredDays(null);
        setRebatePercentage(null);
        setMaxVoucherValue(null);
    };

    const validateStep1 = () => {
        if (!voucherType) {
            message.error("Please select a voucher type");
            return false;
        }
        if (!voucherTitle.trim()) {
            message.error(t("voucherTitleRequired", sourceKey.user));
            return false;
        }
        if (isMasterHQ && !selectedOutletId) {
            message.error(t("selectOutlet", sourceKey.user));
            return false;
        }
        if (!expiredDays || expiredDays < 1) {
            message.error("Validity days is required and must be at least 1");
            return false;
        }
        if (voucherType === VOUCHER_DRAW_TYPE.MERCHANT_DRAW) {
            if (!rebatePercentage || rebatePercentage <= 0 || rebatePercentage > 100) {
                message.error("Rebate percentage must be greater than 0 and at most 100");
                return false;
            }
            if (!maxVoucherValue || maxVoucherValue <= 0) {
                message.error("Max voucher value is required and must be greater than 0");
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (!validateStep1()) return;
        setStep(2);
    };

    const handleGenerate = async () => {
        const sourceFile = aiSourceImage[0];
        if (!sourceFile) {
            message.error("Please upload a reference image first");
            return;
        }
        setGenerating(true);
        try {
            let sourceUrl = sourceFile;
            if (sourceFile instanceof File) {
                const uploadResponse = await uploadImages({ images: [sourceFile] });
                if (uploadResponse?.error || !uploadResponse?.data?.success) {
                    throw new Error(
                        uploadResponse?.error?.message ||
                        uploadResponse?.data?.message ||
                        "Image upload failed"
                    );
                }
                sourceUrl = uploadResponse?.data?.data?.imageUrls?.[0];
            }

            const genResponse = await generateVoucherImage({
                imageUrl: sourceUrl,
                title: voucherTitle,
                voucherTnC,
            });
            if (genResponse?.error || !genResponse?.data?.status) {
                throw new Error(
                    genResponse?.error?.message ||
                    genResponse?.data?.message ||
                    "Failed to start image generation"
                );
            }
            const requestId = genResponse?.data?.data?.requestId;
            if (!requestId) {
                throw new Error("No generation request returned");
            }

            let resultImageUrl = null;
            for (let attempt = 0; attempt < GENERATION_POLL_MAX_ATTEMPTS; attempt++) {
                await sleep(GENERATION_POLL_INTERVAL_MS);

                const statusResponse = await getVoucherImageGenerationStatus({ requestId });
                if (!statusResponse?.status) {
                    throw new Error(statusResponse?.message || "Failed to check generation status");
                }

                const { status, resultImageUrl: url, failureReason } = statusResponse.data;

                if (status === IMAGE_PROCESSING_STATUS.COMPLETED) {
                    resultImageUrl = url;
                    break;
                }
                if (status === IMAGE_PROCESSING_STATUS.FAILED) {
                    throw new Error(failureReason || "Image generation failed");
                }
            }

            if (!resultImageUrl) {
                throw new Error("Image generation timed out. Please try again.");
            }

            setGeneratedImageUrl(resultImageUrl);
            message.success("Image generated successfully");
        } catch (err) {
            message.error(err?.message || "Failed to generate image");
        } finally {
            setGenerating(false);
        }
    };

    const handleSubmit = async () => {
        if (imageSourceMode === "upload" && !voucherImage[0]) {
            message.error("Please upload a voucher preview image");
            return;
        }
        if (imageSourceMode === "ai" && !generatedImageUrl) {
            message.error("Please generate a voucher preview image first");
            return;
        }

        const doSubmit = async () => {
            setLoading(true);
            try {
                let uploadedVoucherImage = imageSourceMode === "ai" ? generatedImageUrl : voucherImage[0] || null;

                if (uploadedVoucherImage instanceof File) {
                    const uploadResponse = await uploadImages({ images: [uploadedVoucherImage] });
                    if (uploadResponse?.error || !uploadResponse?.data?.success) {
                        throw new Error(
                            uploadResponse?.error?.message ||
                            uploadResponse?.data?.message ||
                            "Image upload failed"
                        );
                    }
                    const urls = uploadResponse?.data?.data?.imageUrls || [];
                    uploadedVoucherImage = urls[0] || null;
                }

                const body = {
                    type: voucherType,
                    voucherTitle: voucherTitle.trim(),
                    voucherTnC,
                    voucherImage: uploadedVoucherImage,
                };

                if (voucherType === VOUCHER_DRAW_TYPE.GLOBAL_CONTRIBUTION) {
                    body.voucherCount = voucherCount;
                } else {
                    body.rebatePercentage = rebatePercentage;
                    body.maxVoucherValue = maxVoucherValue;
                    body.status = merchantStatus;
                }

                body.expiryMode = VOUCHER_EXPIRY_MODE.EXPIRED_DAYS;
                body.expiredDays = expiredDays;

                if (selectedOutletId) body.outletUserId = selectedOutletId;

                if (isEdit) {
                    body.voucherId = editingVoucher._id;
                    await editVoucher(body);
                    message.success(t("voucherUpdated", sourceKey.user));
                } else {
                    await createVoucher(body);
                    message.success(t("voucherCreated", sourceKey.user));
                }
                resetForm();
                onSuccess?.();
                onClose();
            } catch (err) {
                message.error(err?.message || t(isEdit ? "failedToUpdateVoucher" : "failedToCreateVoucher", sourceKey.user));
            } finally {
                setLoading(false);
            }
        };

        if (isEdit && voucherType !== VOUCHER_DRAW_TYPE.MERCHANT_DRAW && editingVoucher.status === "active") {
            Modal.confirm({
                title: t("editActiveVoucher", sourceKey.user),
                content: t("editActiveVoucherWarning", sourceKey.user),
                okText: t("confirm", sourceKey.user),
                cancelText: t("cancel", sourceKey.user),
                onOk: doSubmit,
            });
        } else {
            doSubmit();
        }
    };

    return (
        <Drawer
            title={t(isEdit ? "editVoucherDrawer" : "createVoucherDrawer", sourceKey.user)}
            open={open}
            onClose={onClose}
            width={480}
            footer={
                step === 1 ? (
                    <div className="flex w-full gap-2">
                        <Button
                            type="primary"
                            onClick={handleNext}
                            className="bg-green-500 hover:bg-green-600 border-none w-full"
                        >
                            Next
                        </Button>
                    </div>
                ) : (
                    <div className="flex w-full gap-2">
                        <Button onClick={() => setStep(1)} className="w-full">
                            Back
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            loading={loading}
                            className="bg-green-500 hover:bg-green-600 border-none w-full"
                        >
                            {t(isEdit ? "saveChanges" : "createVoucher", sourceKey.user)}
                        </Button>
                    </div>
                )
            }
        >
            <div className="flex flex-col gap-4">
                <Steps
                    current={step - 1}
                    size="small"
                    items={[{ title: "Details" }, { title: "Voucher Image" }]}
                />

                {step === 1 && isMasterHQ && (
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            {t("outletLabel", sourceKey.user)} <span className="text-red-500">*</span>
                        </label>
                        <Select
                            placeholder={t("selectOutlet", sourceKey.user)}
                            value={selectedOutletId}
                            onChange={setSelectedOutletId}
                            disabled={isEdit}
                            className="w-full"
                            options={outletOptions.map((o) => ({ value: o.value, label: o.title }))}
                            showSearch
                            optionFilterProp="label"
                        />
                    </div>
                )}

                {step === 1 && (
                    <>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Voucher Type <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={voucherType}
                                onChange={handleTypeChange}
                                disabled={isEdit}
                                className="w-full"
                                placeholder="Select voucher type"
                                options={VOUCHER_TYPE_OPTIONS}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                {t("voucherTitleField", sourceKey.user)} <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={voucherTitle}
                                onChange={(e) => setVoucherTitle(e.target.value)}
                                placeholder={t("enterVoucherTitle", sourceKey.user)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">{t("voucherTnC", sourceKey.user)}</label>
                            <Input.TextArea
                                value={voucherTnC}
                                onChange={(e) => setVoucherTnC(e.target.value)}
                                placeholder={t("enterTermsAndConditions", sourceKey.user)}
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Validity Days <span className="text-red-500">*</span>
                            </label>
                            <InputNumber
                                value={expiredDays}
                                onChange={setExpiredDays}
                                min={1}
                                precision={0}
                                className="w-full"
                                placeholder="Days after winning until the voucher expires"
                            />
                        </div>

                        {voucherType === VOUCHER_DRAW_TYPE.GLOBAL_CONTRIBUTION && (
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">{t("voucherCount", sourceKey.user)}</label>
                                <InputNumber
                                    value={voucherCount}
                                    onChange={setVoucherCount}
                                    min={1}
                                    className="w-full"
                                    placeholder={t("enterVoucherCount", sourceKey.user)}
                                />
                            </div>
                        )}

                        {voucherType === VOUCHER_DRAW_TYPE.MERCHANT_DRAW && (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            checked={merchantStatus === "active"}
                                            onChange={(checked) => setMerchantStatus(checked ? "active" : "deactive")}
                                            checkedChildren="Active"
                                            unCheckedChildren="Inactive"
                                        />
                                        <span className="text-sm text-gray-500">
                                            {merchantStatus === "active" ? "Voucher is active and visible to users" : "Voucher is inactive and hidden from users"}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                                        Rebate Percentage (%) <span className="text-red-500">*</span>
                                    </label>
                                    <InputNumber
                                        value={rebatePercentage}
                                        onChange={setRebatePercentage}
                                        min={0.01}
                                        max={100}
                                        className="w-full"
                                        placeholder="Enter rebate percentage (e.g. 10 for 10%)"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                                        Max Voucher Value (RM) <span className="text-red-500">*</span>
                                    </label>
                                    <InputNumber
                                        value={maxVoucherValue}
                                        onChange={setMaxVoucherValue}
                                        min={0.1}
                                        precision={2}
                                        className="w-full"
                                        placeholder="e.g. 5 means max RM 5 per voucher"
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}

                {step === 2 && (
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            {t("voucherPreviewImage", sourceKey.user)} <span className="text-red-500">*</span>
                        </label>
                        <Segmented
                            block
                            value={imageSourceMode}
                            onChange={setImageSourceMode}
                            options={[
                                { label: "Self Upload", value: "upload" },
                                { label: "AI Generated", value: "ai" },
                            ]}
                            className="mb-3"
                        />

                        {imageSourceMode === "upload" && (
                            <ImageUploadWithPreview
                                selectedImages={voucherImage}
                                setSelectedImages={setVoucherImage}
                                imagePreviews={voucherImagePreviews}
                                setImagePreviews={setVoucherImagePreviews}
                                maxRequiredImages={1}
                                gridCols="grid-cols-2"
                            />
                        )}

                        {imageSourceMode === "ai" && (
                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Upload a reference image</label>
                                    <ImageUploadWithPreview
                                        selectedImages={aiSourceImage}
                                        setSelectedImages={setAiSourceImage}
                                        imagePreviews={aiSourceImagePreviews}
                                        setImagePreviews={setAiSourceImagePreviews}
                                        maxRequiredImages={1}
                                        gridCols="grid-cols-2"
                                    />
                                </div>

                                <Button
                                    onClick={handleGenerate}
                                    loading={generating}
                                    disabled={!aiSourceImage[0]}
                                >
                                    {generatedImageUrl ? "Regenerate" : "Generate"}
                                </Button>

                                {generating && (
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Generated Result</label>
                                        <div
                                            className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4"
                                            style={{ aspectRatio: "16 / 9" }}
                                        >
                                            <Spin />
                                            <span className="text-sm text-gray-500 text-center">
                                                Please wait while the AI generates your voucher image...
                                            </span>
                                            <span className="text-xs text-gray-400 text-center">
                                                This may take up to a minute
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {!generating && generatedImageUrl && (
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Generated Result</label>
                                        <Image
                                            src={generatedImageUrl}
                                            alt="Generated voucher preview"
                                            width="100%"
                                            style={{ borderRadius: 8, objectFit: "cover" }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Drawer>
    );
};

export default CreateVoucherDrawer;
