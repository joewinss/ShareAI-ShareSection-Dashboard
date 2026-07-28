import React from "react";
import { Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { replaceStringPattern } from "@/utility/common-functions";

const VideoUploadWithPreview = ({
  selectedVideos = [],
  setSelectedVideos,
  videoPreviews = [],
  setVideoPreviews,
  maxRequiredVideos = 1,
  containerHeight = "",
  showCounter = true,
  uploadButtonText,
  addMoreButtonText,
  gridCols = "grid-cols-2 md:grid-cols-2",
  maxFileSize = 100, // in MB
}) => {
  const { t } = useTranslation();
  const totalVideos = selectedVideos.length;
  const [isUploading, setIsUploading] = React.useState(false);

  const handleMediaUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const newFiles = Array.from(files);
      const potentialTotal = totalVideos + newFiles.length;

      if (potentialTotal > maxRequiredVideos) {
        message.error(
          `Maximum ${maxRequiredVideos} video(s) allowed. You currently have ${totalVideos}.`
        );
        return;
      }

      const maxFileSizeBytes = maxFileSize * 1024 * 1024;
      const oversize = newFiles.find((file) => file.size > maxFileSizeBytes);
      if (oversize) {
        const sizeMB = (oversize.size / (1024 * 1024)).toFixed(2);
        message.error(
          `${oversize.name} is ${sizeMB}MB which exceeds the maximum allowed file size of ${maxFileSize}MB.`
        );
        return;
      }

      const allowed = ["video/mp4", "video/quicktime", "video/webm"];
      const badType = newFiles.find((f) => !allowed.includes(f.type));
      if (badType) {
        message.error(
          `${badType.name} is not a supported video format. Use MP4, MOV, or WebM.`
        );
        return;
      }

      const combinedFiles = [...selectedVideos, ...newFiles];

      const newPreviews = newFiles.map((file) => ({
        preview: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
      }));
      const allPreviews = [...videoPreviews, ...newPreviews];

      setVideoPreviews(allPreviews);
      setSelectedVideos(combinedFiles);
    } catch (error) {
      console.error("Error selecting videos:", error);
      message.error("Error selecting videos. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeVideo = (indexToRemove) => {
    const newPreviews = videoPreviews.filter((_, i) => i !== indexToRemove);
    const newVideos = selectedVideos.filter((_, i) => i !== indexToRemove);

    if (videoPreviews[indexToRemove]) {
      URL.revokeObjectURL(videoPreviews[indexToRemove].preview);
    }

    setVideoPreviews(newPreviews);
    setSelectedVideos(newVideos);
  };

  return (
    <div className="flex flex-col w-full" style={{ height: containerHeight }}>
      {totalVideos < maxRequiredVideos && (
        <div className="top-0 z-10 bg-white">
          <div
            className={`border-2 border-dashed rounded-lg p-2 text-center cursor-pointer ${
              totalVideos >= maxRequiredVideos
                ? "border-red-300 bg-red-50"
                : totalVideos > 0
                ? "border-blue-300 bg-blue-50"
                : "border-gray-300"
            }`}
            onClick={() => {
              if (totalVideos < maxRequiredVideos) {
                document.getElementById("video-upload").click();
              }
            }}
          >
            <input
              type="file"
              multiple
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleMediaUpload}
              style={{ display: "none" }}
              id="video-upload"
              disabled={totalVideos >= maxRequiredVideos}
            />
            <div className="space-y-2">
              <Button
                type="button"
                icon={<UploadOutlined />}
                disabled={totalVideos >= maxRequiredVideos || isUploading}
                loading={isUploading}
              >
                {isUploading
                  ? t("uploading", sourceKey.user) || "Uploading..."
                  : selectedVideos.length === 0
                  ? uploadButtonText || "Choose Video"
                  : addMoreButtonText || "Add Another Video"}
              </Button>
              <p className="text-xs text-gray-400 mt-1">
                Only allow video duration less than 1 minute
              </p>
            </div>
          </div>
        </div>
      )}

      {showCounter && (
        <div className="flex justify-end items-center">
          <div className="text-sm font-medium">
            {totalVideos} / {maxRequiredVideos}
          </div>
        </div>
      )}

      {videoPreviews.length > 0 && (
        <div className="flex-1 overflow-y-auto p-2">
          <div className={`grid ${gridCols} gap-4 pb-4`}>
            {videoPreviews.map((preview, index) => (
              <div key={`vid-${index}`} className="relative">
                <video
                  src={preview.preview}
                  controls
                  className="w-full rounded-lg border border-gray-200"
                  style={{ maxHeight: 220, objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
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

export default VideoUploadWithPreview;
