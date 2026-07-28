import React, { useCallback, useEffect, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import { message } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';

export const ImageUploader = ({
    label,
    currentImage,
    onImageSelected,
    onClear,
    aspectRatioLabel,
    maxFileSizeMB = 5,
    maxWidth,
    maxHeight
}) => {

    const { t } = useTranslation();

    const [localPreview, setLocalPreview] = useState(currentImage);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [objectUrl, setObjectUrl] = useState(null);

    // Sync parent preview
    useEffect(() => {
        setLocalPreview(currentImage);
    }, [currentImage]);

    // Cleanup blob URL
    useEffect(() => {
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [objectUrl]);


    /** ===============================
     * VALIDATION LOGIC
     * =============================== */
    const validateFile = async (file) => {
        // 1. Type check
        if (!file.type.startsWith("image/")) {
            message.error(t("invalidImageType", sourceKey.user) || "Invalid image type.");
            return false;
        }

        // 2. Size check
        const maxBytes = maxFileSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
            message.error(
                `File too large. Maximum allowed is ${maxFileSizeMB}MB.`
            );
            return false;
        }

        // 3. Dimension check (optional)
        if (maxWidth || maxHeight) {
            const img = await loadImageDimensions(file);

            if (maxWidth && img.width > maxWidth) {
                message.error(`Image width exceeds ${maxWidth}px.`);
                return false;
            }
            if (maxHeight && img.height > maxHeight) {
                message.error(`Image height exceeds ${maxHeight}px.`);
                return false;
            }
        }

        return true;
    };

    const loadImageDimensions = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = URL.createObjectURL(file);
        });
    };


    /** ===============================
     * PROCESS FILE (preview + spinner + validation)
     * =============================== */
    const processFile = async (file) => {
        const isValid = await validateFile(file);
        if (!isValid) return;

        setLoading(true);

        // Generate blob preview
        const previewUrl = URL.createObjectURL(file);
        setLocalPreview(previewUrl);

        // Save for cleanup
        setObjectUrl(previewUrl);

        // Send file to parent
        onImageSelected(file);

        // Show spinner for UX smoothing
        await new Promise((res) => setTimeout(res, 300));

        setLoading(false);
    };


    /** ===============================
     * INPUT HANDLER
     * =============================== */
    const handleFileInput = useCallback((e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    }, []);


    /** ===============================
     * DRAG & DROP
     * =============================== */
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, []);


    return (
        <div className="w-full">
            {/* LABEL */}
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700">{label}</label>

                {aspectRatioLabel && (
                    <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                        {aspectRatioLabel}
                    </span>
                )}
            </div>

            {/* ===============================
          NO IMAGE SELECTED
      =============================== */}
            {!localPreview ? (
                <label
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
            relative flex flex-col items-center justify-center w-full h-32
            border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
            ${isDragging
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
                        }
          `}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        <UploadCloud className={`w-8 h-8 mb-2 ${isDragging ? 'text-brand-500' : 'text-slate-400'}`} />
                        <p className="text-xs text-slate-500">
                            <span className="font-semibold text-brand-600">
                                {t("clickToUpload", sourceKey.user) || "Click to upload"}
                            </span>{" "}
                            or drag and drop
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                            {t("imageRequirements", sourceKey.user) || "SVG, PNG, JPG, Max size applied"}
                        </p>
                    </div>

                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileInput}
                    />
                </label>
            ) : (

                /* ===============================
                    IMAGE PREVIEW MODE
                =============================== */
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 group">

                    {/* LOADING SPINNER */}
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                            <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full"></div>
                        </div>
                    )}

                    <img
                        src={localPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />

                    {/* ACTION BUTTONS */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">

                        {/* REMOVE IMAGE */}
                        <button
                            onClick={() => {
                                onClear();
                                setLocalPreview(null);
                                if (objectUrl) URL.revokeObjectURL(objectUrl);
                            }}
                            className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-lg transform hover:scale-105"
                        >
                            <X size={18} />
                        </button>

                        {/* REPLACE IMAGE */}
                        <label className="p-2 bg-white text-slate-700 rounded-full hover:bg-slate-50 transition-colors shadow-lg cursor-pointer transform hover:scale-105">
                            <ImageIcon size={18} />
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileInput}
                            />
                        </label>
                    </div>

                </div>
            )}
        </div>
    );
};