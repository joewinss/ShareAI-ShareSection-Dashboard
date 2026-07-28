import React, { useEffect, useState } from "react";
import {
  CloseOutlined,
  LeftOutlined,
  LoadingOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Image, Modal, Spin } from "antd";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";

const ViewSelectedVisual = ({
  selectedImage = [],
  open = false,
  onClose,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Array.isArray(selectedImage) ? selectedImage : [];
  const maxIndex = Math.max(items.length - 1, 0);
  const safeIndex = Math.min(currentIndex, maxIndex);
  const currentItem = items[safeIndex];
  const currentUrl = currentItem?.url || currentItem?.imageUrl || currentItem;
  const showPrev = items.length > 1 && safeIndex > 0;
  const showNext = items.length > 1 && safeIndex < maxIndex;

  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
    }
  }, [open, items.length]);

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
  };

  return (
    <Modal
      wrapClassName="no-padding-modal-body modal-body-background-transparent"
      centered
      maskClosable
      onCancel={handleClose}
      closable={false}
      width={880}
      mask
      footer={null}
      open={open}
    >
      <div className="white-bg rounded-lg flex flex-col select-none w-full pb-4">
        <div className="grid grid-cols-4">
          <div className="col-span-1 flex justify-start items-center" />
          <div className="col-span-2 flex justify-center flex-col">
            <div className="flex justify-center text-center font-semibold large-text-size">
              {t("selectedVisual", sourceKey.user)}
            </div>
          </div>
          <div className="col-span-1 flex justify-end pt-0.5">
            <div className="cursor-pointer" onClick={handleClose}>
              <CloseOutlined style={{ fontSize: 16 }} />
            </div>
          </div>
        </div>

        <div className="m-2" style={{ overflow: "hidden", minHeight: "160px" }}>
          <div className="relative p-3">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-lg z-10">
                <Spin indicator={<LoadingOutlined spin />} size="large" />
              </div>
            )}
            {items.length ? (
              <div className="relative w-full h-[550px] bg-white rounded-xl overflow-hidden flex items-center justify-center shadow-[0_12px_30px_rgba(16,24,40,0.12)]">
                <div className="w-full h-full flex items-center justify-center p-4">
                  <Image
                    src={currentUrl}
                    alt={`Visual ${safeIndex + 1}`}
                    preview={{
                      mask: <div className="text-white text-sm">Preview</div>,
                    }}
                    className="object-contain max-h-[460px] w-auto drop-shadow-md rounded-lg"
                    wrapperStyle={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                </div>

                {showPrev && (
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 z-10 p-3 rounded-full bg-gray-900/30 text-white backdrop-blur-sm hover:bg-gray-900/60 transition-all duration-300 flex items-center justify-center group"
                    aria-label="Previous Image"
                  >
                    <LeftOutlined className="text-lg opacity-80 group-hover:opacity-100" />
                  </button>
                )}

                {showNext && (
                  <button
                    onClick={handleNext}
                    className="absolute right-4 z-10 p-3 rounded-full bg-gray-900/30 text-white backdrop-blur-sm hover:bg-gray-900/60 transition-all duration-300 flex items-center justify-center group"
                    aria-label="Next Image"
                  >
                    <RightOutlined className="text-lg opacity-80 group-hover:opacity-100" />
                  </button>
                )}

                {items.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gray-100/80 text-xs font-medium text-gray-500 backdrop-blur-md">
                    {safeIndex + 1} / {items.length}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[360px] flex items-center justify-center text-[#606977] text-xl font-semibold text-center">
                No images selected
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewSelectedVisual;
