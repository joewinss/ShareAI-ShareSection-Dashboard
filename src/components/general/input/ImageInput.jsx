import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { Form, message, Upload } from "antd";
import { Upload as UploadIcon } from "../../../../public/assets";

function getBase64(file, callback) {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(file);
}

const ImageInput = ({
    label,
    fieldName,
    imageUrl,
    setImageUrl,
    rules,
    setFile,
    file,
    maxCount = 1,
    previewImage = true,
    required = true,
    multiple,
    form,
    acceptTypes,
}) => {
    const { t } = useTranslation();

    const handleChange = (info) => {
        setFile(info.fileList);

        if (form && fieldName) {
            form.setFieldsValue({ [fieldName]: info.fileList });
        }

        if (info.file && info.file.originFileObj) {
            getBase64(info.file.originFileObj, (base64Url) => {
                setImageUrl(base64Url);
            });
        } else if (info.file && !info.file.originFileObj) {
            getBase64(info.file, (base64Url) => {
                setImageUrl(base64Url);
            });
        }

        if (info.fileList.length === 0) {
            setImageUrl("");
        }
    };

    const handleRemove = (fileToRemove) => {
        const newFileList = file.filter((f) => f.uid !== fileToRemove.uid);
        setFile(newFileList);

        if (form && fieldName) {
            form.setFieldsValue({ [fieldName]: newFileList });
        }

        if (newFileList.length > 0) {
            const lastFile = newFileList[newFileList.length - 1];
            if (lastFile.originFileObj) {
                getBase64(lastFile.originFileObj, (base64Url) => {
                    setImageUrl(base64Url);
                });
            } else {
                setImageUrl(lastFile.url || lastFile.thumbUrl);
            }
        } else {
            setImageUrl("");
        }
    };

    const isImageFile = (url) => {
        if (!url) return false;
        const extensionPattern = /\.(jpeg|jpg|png|webp|gif)$/i;
        const base64Pattern = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/i;
        return extensionPattern.test(url) || base64Pattern.test(url);
    };

    const isImage = isImageFile(imageUrl);

    return (
        <div>
            {label && (
                <label
                    htmlFor={fieldName}
                    className={`mb-1 ${required && "required-label"} small-text-size`}
                    style={{ color: "#4B5563" }}
                >
                    {label}
                </label>
            )}
            <Form.Item
                style={{ margin: 0 }}
                name={fieldName}
                rules={rules}
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                    if (Array.isArray(e)) return e;
                    if (e && e.fileList) return e.fileList;
                    return file;
                }}
            >
                <div
                    className="flex justify-center bg-white rounded-lg p-4"
                    style={{ border: "2px dashed #d9d9d9" }}
                >
                    <Upload
                        name={fieldName}
                        accept={acceptTypes && acceptTypes.length ? acceptTypes.map((ext) => `.${ext}`).join(",") : "*/*"}
                        style={{ width: "100%" }}
                        beforeUpload={(fileToCheck) => {
                            if (acceptTypes && acceptTypes.length) {
                                const lower = (fileToCheck.name || "").toLowerCase();
                                const allowed = acceptTypes.some((ext) => lower.endsWith(`.${ext.toLowerCase()}`));
                                if (!allowed) {
                                    message.error(`File type not supported. Allowed: ${acceptTypes.join(", ")}`);
                                    return Upload.LIST_IGNORE || false;
                                }
                            }
                            return false;
                        }}
                        onChange={handleChange}
                        onRemove={handleRemove}
                        maxCount={maxCount}
                        multiple={multiple}
                        fileList={file}
                    >
                        {file && file.length > 0 ? (
                            previewImage && isImage ? (
                                <img src={imageUrl} alt="preview" style={{ width: "100%", height: "100%" }} />
                            ) : (
                                <div className="text-sm text-gray-600 italic">
                                    {t("uploadImage", sourceKey.user) || "File selected"}
                                </div>
                            )
                        ) : (
                            <>
                                <div className="flex justify-center">
                                    <img src={UploadIcon} alt="upload" />
                                </div>
                                <div className="text-center mt-2 text-sm text-gray-600">
                                    {t("uploadImages", sourceKey.user) || "Upload images"}
                                </div>
                                <div className="flex justify-center mt-2">
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 border border-gray-400 rounded-md px-4 py-2 text-sm font-semibold text-gray-700 bg-white"
                                        style={{ cursor: "pointer" }}
                                    >
                                        &#8679; {t("chooseFiles", sourceKey.user) || "Choose Files"}
                                    </button>
                                </div>
                            </>
                        )}
                    </Upload>
                </div>
            </Form.Item>
        </div>
    );
};

export default ImageInput;
