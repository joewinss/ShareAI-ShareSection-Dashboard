import React from "react";
import { Button, Image, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { replaceStringPattern } from "@/utility/common-functions";

/**
 * Reusable Image Upload Component with Preview
 * @param {Object} props
 * @param {Array} props.selectedImages - Array of selected image files
 * @param {Function} props.setSelectedImages - Function to update selected images
 * @param {Array} props.imagePreviews - Array of image preview objects {preview, name}
 * @param {Function} props.setImagePreviews - Function to update image previews
 * @param {number} props.maxRequiredImages - Maximum number of images allowed (default: 10)
 * @param {string} props.containerHeight - Container height calculation (default: 'calc(100vh - 180px)')
 * @param {boolean} props.showCounter - Show image counter (default: true)
 * @param {string} props.uploadButtonText - Custom upload button text
 * @param {string} props.addMoreButtonText - Custom add more button text
 * @param {string} props.gridCols - Grid columns class (default: 'grid-cols-2 md:grid-cols-2')
 * @param {number} props.maxFileSize - Maximum file size in MB (default: 5MB)
 */
const ImageUploadWithPreview = ({
  selectedImages = [],
  setSelectedImages,
  imagePreviews = [],
  setImagePreviews,
  maxRequiredImages = 10,
  containerHeight = "",
  showCounter = true,
  uploadButtonText,
  addMoreButtonText,
  gridCols = "grid-cols-4 md:grid-cols-4",
  maxFileSize = 5, // in MB
}) => {
  const { t } = useTranslation();
  const totalImages = selectedImages.length;
  const [isUploading, setIsUploading] = React.useState(false);
  const [loadingImages, setLoadingImages] = React.useState({});

  // Handle media upload for new images
  const handleMediaUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      // Check if adding new files would exceed the maximum
      const newFiles = Array.from(files);

      console.log(newFiles);
      const potentialTotal = totalImages + newFiles.length;

      if (potentialTotal > maxRequiredImages) {
        // message.error(`Maximum ${maxRequiredImages} images allowed. You currently have ${totalImages} image(s). You can only add ${maxRequiredImages - totalImages} more.`);
        message.error(
          replaceStringPattern(t("imgCountRequiredDesc", sourceKey.user), {
            max: maxRequiredImages,
            add: maxRequiredImages - totalImages,
            current: totalImages,
          })
        );
        return;
      }

      // Validate individual file size against maxFileSize (in MB)
      const maxFileSizeBytes = maxFileSize * 1024 * 1024; // Convert MB to bytes

      // ensure none of the new files exceed the per-file limit
      const oversizeFile = newFiles.find((file) => file.size > maxFileSizeBytes);
      if (oversizeFile) {
        const fileSizeMB = (oversizeFile.size / (1024 * 1024)).toFixed(2);
        message.error(
          `${oversizeFile.name} is ${fileSizeMB}MB which exceeds the maximum allowed file size of ${maxFileSize}MB.`
        );
        return;
      }

      const combinedFiles = [...selectedImages, ...newFiles];

      // Create previews for new files only (with delay to show loading)
      await new Promise((resolve) => setTimeout(resolve, 300)); // Minimum 300ms loading display

      const newPreviews = newFiles.map((file, index) => {
        const previewUrl = URL.createObjectURL(file);
        const imageIndex = imagePreviews.length + index;

        // Set loading state for this image
        setLoadingImages((prev) => ({ ...prev, [imageIndex]: true }));

        return {
          preview: previewUrl,
          name: file.name,
        };
      });
      const allPreviews = [...imagePreviews, ...newPreviews];

      setImagePreviews(allPreviews);
      setSelectedImages(combinedFiles);
    } catch (error) {
      console.error("Error selecting images:", error);
      message.error("Error selecting images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Remove new image
  const removeNewImage = (indexToRemove) => {
    const newPreviews = imagePreviews.filter(
      (_, index) => index !== indexToRemove
    );
    const newImages = selectedImages.filter(
      (_, index) => index !== indexToRemove
    );

    // Revoke URL for removed preview
    if (imagePreviews[indexToRemove]) {
      URL.revokeObjectURL(imagePreviews[indexToRemove].preview);
    }

    setImagePreviews(newPreviews);
    setSelectedImages(newImages);
  };

  return (
    <div className="flex flex-col w-full" style={{ height: containerHeight }}>
      {/* Upload Button - Sticky at top */}
      {totalImages < maxRequiredImages && (
        <div className=" top-0 z-10 bg-white">
          <div
            className={`border-2 border-dashed rounded-lg p-2 text-center cursor-pointer ${totalImages >= maxRequiredImages
              ? "border-red-300 bg-red-50"
              : totalImages > 0
                ? "border-blue-300 bg-blue-50"
                : "border-gray-300"
              }`}
            onClick={() => {
              if (totalImages < maxRequiredImages) {
                document.getElementById("media-upload").click();
              }
            }}
          >
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleMediaUpload}
              style={{ display: "none" }}
              id="media-upload"
              disabled={totalImages >= maxRequiredImages}
            />
            <div className="space-y-2">
              <Button
                type="button"
                icon={<UploadOutlined />}
                disabled={totalImages >= maxRequiredImages || isUploading}
                loading={isUploading}
              >
                {isUploading
                  ? t("uploading", sourceKey.user) || "Uploading..."
                  : selectedImages.length === 0
                    ? uploadButtonText || t("chooseNewImages", sourceKey.user)
                    : addMoreButtonText || t("addMoreImages", sourceKey.user)}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Counter Section */}
      {showCounter && (
        <div className="flex justify-end items-center">
          {/* <div className="text-gray-600 mb-2">{t("newImagesToUpload", sourceKey.user)}</div> */}
          <div className="text-sm font-medium">
            {replaceStringPattern(t("currentImages", sourceKey.user), {
              current: totalImages,
              max: maxRequiredImages,
            })}
          </div>
        </div>
      )}

      {/* Scrollable Image Previews */}
      {imagePreviews.length > 0 && (
        <div
          className="flex-1 overflow-y-auto p-2"
          style={{
            maxHeight:
              totalImages >= maxRequiredImages
                ? containerHeight
                : `calc(${containerHeight} - 160px)`,
          }}
        >
          <div className={`grid ${gridCols} gap-4 pb-4`}>
            {imagePreviews.map((preview, index) => (
              <div key={`new-${index}`} className="aspect-square relative">
                {loadingImages[index] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                )}
                <Image
                  src={preview.preview}
                  alt={`Image ${index + 1}`}
                  width={"100%"}
                  height={"100%"}
                  style={{
                    objectFit: "cover",
                    borderRadius: "8px",
                    aspectRatio: "1 / 1",
                  }}
                  onLoad={() => {
                    // Remove loading state when image is loaded
                    setLoadingImages((prev) => {
                      const newState = { ...prev };
                      delete newState[index];
                      return newState;
                    });
                  }}
                />
                {/* <div className="absolute bottom-0 left-0 right-0 bg-green-600 bg-opacity-75 text-white text-xs p-1 rounded-b-lg">
                                    {t("newImage", sourceKey.user, { index: index + 1 })}
                                </div> */}
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadWithPreview;
