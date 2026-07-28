import React, { useEffect, useState } from "react";
import { message } from "antd";
import SinglePopUpModal from "@/components/general/popUp/SinglePopUpModal";

const DonwloadAiVisual = ({
  selectedImage = [],
  onClose,
  onComplete,
  onDownloadingChange,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (selectedImage.length > 0) {
      setShowModal(true);
      return;
    }
    setShowModal(false);
    message.error("No images selected");
    if (onClose) onClose();
  }, [selectedImage.length, onClose]);

  useEffect(() => {
    if (onDownloadingChange) onDownloadingChange(downloading);
  }, [downloading, onDownloadingChange]);

  const handleCloseAll = () => {
    setShowModal(false);
    if (onClose) onClose();
  };

  const downloadViaProxy = async (imageUrl, fallbackName) => {
    const url = imageUrl?.url || imageUrl;
    if (!url) return;

    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Failed to fetch image");

    const blob = await response.blob();
    const fileName =
      fallbackName || url.split("/").pop()?.split("?")[0] || "image.jpg";

    let mimeType = blob.type;
    if (!mimeType || mimeType === "application/octet-stream") {
      const ext = fileName.split(".").pop()?.toLowerCase();
      mimeType =
        {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          webp: "image/webp",
        }[ext] || "image/jpeg";
    }

    const file = new File([blob], fileName, { type: mimeType });
    const blobUrl = window.URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  };

  const handleConfirmDownload = async () => {
    if (!selectedImage.length) {
      message.error("No images selected");
      return;
    }

    setDownloading(true);
    try {
      let index = 1;
      for (const url of selectedImage) {
        await downloadViaProxy(url, `visual-${index}.jpg`);
        index++;
      }
      if (onComplete) onComplete();
      handleCloseAll();
    } catch (err) {
      console.error("Failed to download selected images", err);
      message.error(err?.message || "Failed to download selected images");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SinglePopUpModal
      type="ShowSelectedVIsual"
      open={showModal}
      closeable
      modalLoading={downloading}
      extraData={{
        items: selectedImage,
        primaryActionLabel: "Download",
      }}
      onClose={handleCloseAll}
      confirmBtn2={handleConfirmDownload}
    />
  );
};

export default DonwloadAiVisual;
