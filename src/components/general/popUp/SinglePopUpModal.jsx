import {
  CloseOutlined,
  DownloadOutlined,
  LeftOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Form, message, Modal, QRCode, Spin, Tooltip } from "antd";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { isVideoMedia } from "@/constants/mediaType";
import { connect } from "react-redux";
// import { useTranslation } from "../../../locales/useTranslation";
// import { sourceKey } from "../../../locales/config";
import { useForm } from "antd/lib/form/Form";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { replaceStringPattern } from "@/utility/common-functions";
import { ShuffleIcon, WhiteShareIcon } from "../../../../public/assets";
import DropdownInput from "../input/DropdownInput";
import { Zap } from "lucide-react";
import {
  GuidedShareFlowModal,
  GuidedReplayFinalModal,
} from "@/components/shareContent/component/GuidedShareModal";
import { getProxiedImageUrl } from "@/utility/shareFlow";

const AUTO_MODE_OPTION_VALUES = [10, 20];

const SinglePopUpModal = (props) => {
  const {
    type,
    extraData,
    loading = false,
    zIndex,
    tooltip,
    modalLoading = false,
    form: externalForm,
    modalWidth,
  } = props;
  const { t } = useTranslation();
  const [internalForm] = useForm();
  const form = externalForm || internalForm;
  const [open, setOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMainImageLoading, setIsMainImageLoading] = useState(false);

  const handlePreviousImage = () => {
    if (extraData?.previewImage && extraData.previewImage.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? extraData.previewImage.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (extraData?.previewImage && extraData.previewImage.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === extraData.previewImage.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleDownloadCurrentImage = async () => {
    if (!extraData?.previewImage || extraData.previewImage.length === 0) {
      message.error(
        t("noImagesAvailable", sourceKey.user) ||
        "No images available for download"
      );
      return;
    }

    const currentImage = extraData.previewImage[currentImageIndex];
    // if (!currentImage?.url) {
    //   message.error(t("imageUrlNotAvailable", sourceKey.user) || "Current image URL not available");
    //   return;
    // }

    setIsDownloading(true);

    // Show preparing message immediately
    const hidePreparingMessage = message.loading({
      content:
        t("nTpreparingDownload", sourceKey.user) || "Preparing download...",
      duration: 0, // Don't auto-hide
    });
    try {
      const url = currentImage?.url || currentImage;
      const fileExtension = url.split(".").pop()?.split("?")[0] || "jpg";
      const fileName = `image_${currentImageIndex + 1}.${fileExtension}`;

      // Method 1: Try backend proxy first (if available)
      try {
        const proxyUrl = `/api/images/download-image?imageUrl=${encodeURIComponent(
          url
        )}&filename=${encodeURIComponent(fileName)}`;

        const link = document.createElement("a");
        link.href = proxyUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Hide preparing message and show success
        hidePreparingMessage();
        setTimeout(() => {
          message.success(
            t("downloadStarted", sourceKey.user) ||
            `Download started: ${fileName}`
          );
        }, 500);
        return;
      } catch (proxyError) {
        console.log("Proxy method failed:", proxyError);
        throw new Error(
          t("downloadFailed", sourceKey.user) || "Download failed"
        );
      }
    } catch (error) {
      console.error("Error downloading current image:", error);
      hidePreparingMessage();
      message.error(
        t("downloadFailed", sourceKey.user) ||
        "Download failed: " + error.message
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAllImages = async () => {
    if (!extraData?.previewImage || extraData.previewImage.length === 0) {
      message.error(
        t("noImagesAvailable", sourceKey.user) ||
        "No images available for download"
      );
      return;
    }

    setIsDownloading(true);

    // Show preparing message immediately
    const hidePreparingMessage = message.loading({
      content:
        t("preparingDownload", sourceKey.user) || `Preparing to download ${extraData.previewImage.length} images...`,
      duration: 0, // Don't auto-hide
    });

    let successCount = 0;
    let failCount = 0;

    try {
      // Download all images sequentially with a small delay between each
      for (let i = 0; i < extraData.previewImage.length; i++) {
        try {
          const image = extraData.previewImage[i];
          const url = image?.url || image;
          const fileExtension = url.split(".").pop()?.split("?")[0] || "jpg";
          const fileName = `image_${i + 1}.${fileExtension}`;

          const proxyUrl = `/api/images/download-image?imageUrl=${encodeURIComponent(
            url
          )}&filename=${encodeURIComponent(fileName)}`;

          const link = document.createElement("a");
          link.href = proxyUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          successCount++;

          // Small delay between downloads to prevent browser blocking
          if (i < extraData.previewImage.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch (error) {
          console.error(`Failed to download image ${i + 1}:`, error);
          failCount++;
        }
      }

      // Hide preparing message and show result
      hidePreparingMessage();
      setTimeout(() => {
        if (failCount === 0) {
          message.success(
            t("nTdownloadAllSuccess", sourceKey.user) ||
            `Successfully started downloading ${successCount} images`
          );
        } else {
          message.warning(
            t("downloadPartialSuccess", sourceKey.user) ||
            `Downloaded ${successCount} images, ${failCount} failed`
          );
        }
      }, 500);
    } catch (error) {
      console.error("Error downloading all images:", error);
      hidePreparingMessage();
      message.error(
        t("downloadFailed", sourceKey.user) ||
        "Download failed: " + error.message
      );
    } finally {
      setIsDownloading(false);
    }
  };

  function close() {
    if (props.onClose) {
      props.onClose();
    } else {
      setVisible(false);
    }
  }

  useEffect(() => {
    setOpen(props.open === true);
  }, [props.open]);

  const _renderHeader = (type, extraData) => {
    const red = "#FF4D4F";
    const blue = "#1766A4";
    const green = "#52C41A";
    const orange = "#FAAD14";
    const white = "#37333480";
    let subColor = "";
    let header = {};

    switch (type) {
      case "reactivateUser":
        header = {
          title: t("confirmation", sourceKey.user),
          subTitle: t("reactivateUser", sourceKey.user),
          subColor: "B",
        };
        break;
      case "qrCode":
        header = {
          title: extraData?.businessName || t("qrCode", sourceKey.user),
        };
        break;
      case "chooseLanguage":
        header = {
          title: t("choosePreferredLanguage", sourceKey.user),
        };
        break;
      case "deletePreset":
        header = {
          title: t("confirmation", sourceKey.user),
          subTitle: t("deletePresetTemplate", sourceKey.user),
          subColor: "R",
        };
        break;
      case "deleteAutoMode":
        header = {
          title: t("confirmation", sourceKey.user),
          subTitle: t("deleteAutoModeTemplate", sourceKey.user),
          subColor: "R",
        };
        break;
      case "deletePendingContent":
        header = {
          title: t("confirmation", sourceKey.user),
          subTitle: t("deletePendingContent", sourceKey.user),
          subColor: "R",
        };
        break;
      case "deleteContent":
        header = {
          title: t("confirmation", sourceKey.user),
          subTitle: t("deleteContent", sourceKey.user),
          subColor: "R",
        };
        break;
      case "successfulShare":
        header = {
          title: t("share", sourceKey.user),
        };
        break;
      case "contentNotFound":
        header = {
          title: t("share", sourceKey.user),
        };
        break;
      case "expiredShare":
        header = {
          title: t("nTshareExpiredTitle", sourceKey.user),
        };
        break;
      case "sessionTimeout":
        header = {
          title: t("nTsessionExpired", sourceKey.user),
        };
        break;
      case "connectionIssue":
        header = {
          title: t("connectionIssueTitle", sourceKey.user) || "Connection Error",
        };
        break;
      case "approvePendingContent":
        header = {
          title: t("confirmation", sourceKey.user),
          subTitle: t("approvePendingContent", sourceKey.user),
          subColor: "G",
        };
        break;
      case "rejectPendingContent":
        header = {
          title: t("confirmation", sourceKey.user),
          subTitle: t("rejectPendingContent", sourceKey.user),
          subColor: "R",
        };
        break;
      case "restorePendingContent":
        header = {
          title: t("confirmation", sourceKey.user),
          subTitle: t("restorePendingContent", sourceKey.user),
          subColor: "G",
        };
        break;
      case "suspendOutlet":
        header = {
          title: t("confirmation", sourceKey.user),
          subTitle: t("suspendOutlet", sourceKey.user),
          subColor: "R",
        };
        break;
      case "deleteCategory":
        header = {
          title: t("confirmation", sourceKey.user),
          subTitle: t("deleteCategory", sourceKey.user),
          subColor: "R",
        };
        break;
      case "reactivateOutlet":
        header = {
          title: t("confirmation", sourceKey.user),
          subTitle: t("reactivateOutlet", sourceKey.user),
          subColor: "G",
        };
        break;
      case "deleteImagePool":
        header = {
          title: t("confirmation", sourceKey.user),
          subTitle: t("deleteImagePool", sourceKey.user),
          subColor: "R",
        };
        break;
      case "VisualPool":
        header = {
          title: t("visualPool", sourceKey.user)
        };
        break;
      case "ShowSelectedVIsual":
        header = {
          title: t("selectedVisual", sourceKey.user)
        };
        break;
      case "AddVisualtoImagePool":
        header = {
          title: t("addVisualToImagePool", sourceKey.user)
        };
        break;
      case "deleteOutlet":
        header = {
          title: t("confirmation", sourceKey.user),
          subTitle: t("nTdeleteOutlet", sourceKey.user),
          subColor: "R",
        };
        break;
      case "updatePreset":
        header = {
          title: t("nTproductInfoTemplate", sourceKey.user),
          subTitle: t("nTreplaceInfo", sourceKey.user),
          subColor: "B",
        };
        break;
      case "AutoModeSetup":
        header = {
          title: "Auto Mode Rules Setup",
          subTitle: "Automate your content pipeline based on smart triggers.",
          subColor: "B",
        };
        break;
      default:
        break;
    }

    if (!isEmpty(header) && header.subTitle !== undefined) {
      switch (header.subColor) {
        case "R":
          subColor = red;
          break;
        case "B":
          subColor = blue;
          break;
        case "G":
          subColor = green;
          break;
        case "O":
          subColor = orange;
          break;

        default:
          subColor = white;
          break;
      }
    } else {
      subColor = blue;
    }

    const isAutoModeCollapsed = type === "AutoModeSetup" && extraData?.isCollapsed;

    return (
      <>
        <div
          className={`flex justify-center text-center font-semibold ${isAutoModeCollapsed ? "medium-text-size leading-tight" : "large-text-size"
            }`}
        >
          {header?.title || ""}
        </div>
        {!isAutoModeCollapsed && (
          <div
            className="flex justify-center text-center small-text-size leading-3"
            style={{ color: subColor }}
          >
            {header?.subTitle || ""}
          </div>
        )}
      </>
    );
  };


  const _renderContent = (type, extraData, hasButtons) => {
    let content;
    let hasPaddingRight = true;
    switch (type) {
      case "reactivateUser":
        content = <></>;
        break;
      case "qrCode":
        const qrValue =
          typeof extraData === "string" ? extraData : extraData?.link || "";
        const qrIcon =
          typeof extraData === "object"
            ? getProxiedImageUrl(extraData?.profilePictureUrl)
            : "";
        content = (
          <div className="flex flex-col items-center p-4">
            <QRCode
              bordered={false}
              bgColor="#ffffff"
              icon={qrIcon || undefined}
              iconSize={qrIcon ? 40 : undefined}
              value={qrValue || " "}
            />
          </div>
        );
        break;
      case "chooseLanguage":
        const languageOptions = extraData.languageOptions || [
          "English",
          "Chinese",
          "Malay",
        ];
        content = (
          <div className="flex flex-col items-center justify-center gap-4 h-full my-4">
            {languageOptions.map((langObj, idx) => {
              const langKey =
                typeof langObj === "string" ? langObj : langObj.key;
              const langLabel =
                typeof langObj === "string" ? langObj : langObj.label;
              return (
                <div
                  key={langKey}
                  className={`w-full rounded-lg border text-center py-3 cursor-pointer text-[16px] transition-all duration-200 ${extraData?.selected === langKey
                    ? "border-[#1890ff] bg-[#e6f7ff] text-[#1890ff]"
                    : "border-[#E5E7EB] bg-[#FAFAFA] text-[#373334] hover:border-[#91d5ff] hover:bg-[#e6f7ff]"
                    }`}
                  style={{ fontWeight: 500, outline: "none" }}
                  tabIndex={0}
                  onClick={() =>
                    extraData?.onSelect && extraData.onSelect(langKey)
                  }
                >
                  {langLabel}
                </div>
              );
            })}
          </div>
        );
        hasPaddingRight = false;
        break;
      case "shareContent": {
        const isVideo = isVideoMedia(extraData?.mediaType);
        const currentMediaUrl =
          extraData?.previewImage?.[currentImageIndex]?.url ||
          extraData?.previewImage?.[currentImageIndex];
        content = (
          <div className="flex flex-col">
            {extraData?.previewImage && extraData?.previewImage.length > 0 && (
              <div className="w-full h-[240px] rounded-t-lg overflow-hidden flex justify-center items-center bg-[#F5F5F5] relative">
                <>
                  <div className="mb-1 relative w-full h-full">
                    {isMainImageLoading && !isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#F5F5F5] z-10">
                        <Spin size="large" />
                      </div>
                    )}
                    {isVideo ? (
                      <video
                        key={currentMediaUrl}
                        src={currentMediaUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full h-full bg-black"
                        style={{ maxHeight: 250, objectFit: "contain" }}
                      />
                    ) : (
                      <img
                        src={currentMediaUrl}
                        alt={`Preview ${currentImageIndex + 1}`}
                        className="object-cover w-full h-full"
                        style={{
                          maxHeight: 250,
                          opacity: isMainImageLoading ? 0 : 1,
                          transition: "opacity 0.3s ease",
                        }}
                        onLoadStart={() => setIsMainImageLoading(true)}
                        onLoad={() => setIsMainImageLoading(false)}
                        onError={() => setIsMainImageLoading(false)}
                      />
                    )}

                    {/* Counter at top right */}
                    {extraData?.previewImage.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {currentImageIndex + 1}/{extraData.previewImage.length}
                      </div>
                    )}

                    {extraData?.previewImage.length > 1 && (
                      <>
                        <button
                          onClick={handlePreviousImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
                        >
                          <LeftOutlined />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
                        >
                          <RightOutlined />
                        </button>
                      </>
                    )}

                    {/* Download current image button — videos use native controls */}
                    {!isVideo && (
                      <button
                        onClick={handleDownloadAllImages}
                        disabled={isDownloading}
                        className="absolute right-2 bottom-2 w-8 h-8 blue-btn bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                        title={`Download Image ${currentImageIndex + 1}`}
                      >
                        {isDownloading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <DownloadOutlined style={{ fontSize: 12 }} />
                        )}
                      </button>
                    )}
                  </div>
                </>
              </div>
            )}
            <div
              className="text-[14px] text-[#373334] leading-6 overflow-y-auto flex flex-col gap-3 pt-2"
            // style={{ maxHeight: "240px" }}
            >

              {extraData?.selectedRecord?.contentText && (
                <div className="whitespace-normal">
                  {extraData.selectedRecord.contentText}
                </div>
              )}

              {extraData?.selectedRecord?.location && (
                <div className="whitespace-normal">
                  {extraData.selectedRecord.location}
                </div>
              )}

              {extraData?.selectedRecord?.hashtags &&
                extraData.selectedRecord.hashtags.length > 0 && (
                  <div className="whitespace-normal">
                    {extraData.selectedRecord.hashtags.map((tag, i) => (
                      <span key={i} className="mr-2">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          </div>
        );

        hasPaddingRight = false;
        break;
      }
      case "VisualPool": {
        const hasItems = Array.isArray(extraData?.items) && extraData.items.length > 0;
        const items = hasItems ? extraData.items : [];
        const isLoading = extraData?.loading;
        const selectedId = extraData?.selectedId;
        const onSelect = extraData?.onSelect;
        const renderItem = (item, idx) => {
          const id = item?._id || item?.id || idx;
          const isSelected = selectedId !== undefined && selectedId === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect && onSelect(item, idx)}
              className={`aspect-square w-full rounded-xl border transition-all duration-150 overflow-hidden shadow-sm ${isSelected
                ? "border-[#1766A4] ring-2 ring-[#1766A4]/40"
                : "border-[#E8ECF1]"
                } ${onSelect ? "hover:-translate-y-0.5 hover:shadow-md" : ""
                } cursor-pointer`}
              style={{ background: "#F7F9FC" }}
            >
              {item?.thumbnail || item?.url ? (
                <img
                  src={item.thumbnail || item.url}
                  alt={item?.label || `Visual ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#f7f8fa] to-[#eef1f6] flex items-center justify-center text-[#9AA2AE] text-sm">
                  {item?.label || ""}
                </div>
              )}
            </button>
          );
        };

        content = (
          <div className="relative p-5">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-lg z-10">
                <Spin indicator={<LoadingOutlined spin />} size="large" />
              </div>
            )}
            {hasItems ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items.map((item, idx) => renderItem(item, idx))}
              </div>
            ) : (
              <div className="h-[360px] flex items-center justify-center text-[#606977] text-xl font-semibold text-center">
                Image pool is empty
              </div>
            )}
          </div>
        );
        hasPaddingRight = false;
        break;
      }
      case "ShowSelectedVIsual": {
        const hasItems = Array.isArray(extraData?.items) && extraData.items.length > 0;
        const items = hasItems ? extraData.items : [];
        const isLoading = extraData?.loading;

        content = (
          <div className="relative p-5">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-lg z-10">
                <Spin indicator={<LoadingOutlined spin />} size="large" />
              </div>
            )}
            {hasItems ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items.map((item, idx) => {
                  const url = item?.url || item?.imageUrl || item;
                  return (
                    <div
                      key={url || idx}
                      className="aspect-square w-full rounded-xl border border-[#E8ECF1] overflow-hidden shadow-sm"
                      style={{ background: "#F7F9FC" }}
                    >
                      {url ? (
                        <img
                          src={url}
                          alt={`Visual ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#f7f8fa] to-[#eef1f6] flex items-center justify-center text-[#9AA2AE] text-sm">
                          {`Visual ${idx + 1}`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[360px] flex items-center justify-center text-[#606977] text-xl font-semibold text-center">
                No images selected
              </div>
            )}
          </div>
        );
        hasPaddingRight = false;
        break;
      }
      case "AddVisualtoImagePool": {
        const options = Array.isArray(extraData?.options) ? extraData.options : [];
        const isLoading = extraData?.loading;
        const onPresetChange = extraData?.onPresetChange;

        content = (
          <div className="relative p-5">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-lg z-10">
                <Spin indicator={<LoadingOutlined spin />} size="large" />
              </div>
            )}
            <div className="space-y-4">
              <div className="text-sm text-[#373334]">
                Select a preset template to add images into.
              </div>
              <DropdownInput
                label={t("presetTemplate", sourceKey.user) || "Preset Template"}
                fieldName="presetId"
                placeholder={t("selectTemplate", sourceKey.user) || "Select template"}
                options={options}
                onChange={onPresetChange}
                required={false}
              />
            </div>
          </div>
        );
        hasPaddingRight = false;
        break;
      }
      case "AutoModeSetup": {
        const thresholdRules = Array.isArray(extraData?.thresholdRules)
          ? extraData.thresholdRules
          : [];
        const generationCountRules = Array.isArray(extraData?.generationCountRules)
          ? extraData.generationCountRules
          : [];

        content = (
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-2 text-[#111827] text-[18px] font-semibold">
              <Zap className="w-5 h-5 text-[#2F66F2]" />
              <span>Automation Triggers</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item noStyle shouldUpdate>
                {() => {
                  const thresholdValue = Number(form.getFieldValue("threshold"));
                  const thresholdError = form.getFieldError("threshold")?.[0];

                  return (
                    <div className="rounded-2xl border border-[#D9E2EC] bg-[#FAFCFF] p-4 space-y-3">
                      <Form.Item name="threshold" rules={thresholdRules} hidden>
                        <input type="hidden" />
                      </Form.Item>
                      <div className="font-semibold text-[#1F2937]">Trigger Threshold</div>
                      <div className="grid grid-cols-2 gap-3">
                        {AUTO_MODE_OPTION_VALUES.map((value) => {
                          const isSelected = thresholdValue === value;

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                form.setFields([
                                  { name: "threshold", value, errors: [] },
                                ])
                              }
                              className={`rounded-xl border px-4 py-3 text-left transition-all ${isSelected
                                ? "border-[#2F66F2] bg-[#F3F7FF] text-[#1D4ED8]"
                                : "border-[#D9E2EC] bg-white text-[#475467] hover:border-[#AFC4FF] hover:bg-[#FAFCFF]"
                                }`}
                            >
                              <div className="text-sm font-semibold leading-5">
                                Less than {value} posts
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {thresholdError && (
                        <div className="text-xs text-[#FF4D4F] leading-5">
                          {thresholdError}
                        </div>
                      )}
                      <div className="text-xs text-[#94A3B8]">
                        System will check queue every 30 minutes.
                      </div>
                    </div>
                  );
                }}
              </Form.Item>

              <Form.Item noStyle shouldUpdate>
                {() => {
                  const generationCountValue = Number(form.getFieldValue("generationCount"));
                  const generationCountError = form.getFieldError("generationCount")?.[0];

                  return (
                    <div className="rounded-2xl border border-[#D9E2EC] bg-[#FAFCFF] p-4 space-y-3">
                      <Form.Item
                        name="generationCount"
                        rules={generationCountRules}
                        hidden
                      >
                        <input type="hidden" />
                      </Form.Item>
                      <div className="font-semibold text-[#1F2937]">Generation Count</div>
                      <div className="grid grid-cols-2 gap-3">
                        {AUTO_MODE_OPTION_VALUES.map((value) => {
                          const isSelected = generationCountValue === value;

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                form.setFields([
                                  { name: "generationCount", value, errors: [] },
                                ])
                              }
                              className={`rounded-xl border px-4 py-3 text-left transition-all ${isSelected
                                ? "border-[#2F66F2] bg-[#F3F7FF] text-[#1D4ED8]"
                                : "border-[#D9E2EC] bg-white text-[#475467] hover:border-[#AFC4FF] hover:bg-[#FAFCFF]"
                                }`}
                            >
                              <div className="text-sm font-semibold leading-5">
                                Regenerate {value} posts
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {generationCountError && (
                        <div className="text-xs text-[#FF4D4F] leading-5">
                          {generationCountError}
                        </div>
                      )}
                      <div className="text-xs text-[#94A3B8]">
                        Credits will be consumed on each automated run.
                      </div>
                    </div>
                  );
                }}
              </Form.Item>
            </div>
          </div>
        );

        hasPaddingRight = false;
        break;
      }
      case "successfulShare":
        content = (
          <div className="flex flex-col item-center pt-10">
            <div className="medium-text-size text-center">
              {t("sharedesc1", sourceKey.user)}
            </div>
            <div className="petite-text-size second-grey-text text-center">
              {t("sharedesc2", sourceKey.user)}
            </div>
          </div>
        );

        break;
      case "contentNotFound":
        content = (
          <div className="flex flex-col item-center pt-10">
            <div className="medium-text-size text-center">
              {t("contentNotFoundDesc1", sourceKey.user)}
            </div>
            <div className="petite-text-size second-grey-text text-center">
              {t("contentNotFoundDesc2", sourceKey.user)}
            </div>
          </div>
        );

        break;
      case "expiredShare":
        content = (
          <div className="flex flex-col item-center pt-6">
            <div className="medium-text-size text-center">
              {t("nTshareExpiredDesc", sourceKey.user)}
            </div>
          </div>
        );

        break;
      case "sessionTimeout":
        content = (
          <div className="flex flex-col item-center pt-6 px-4">
            <div className="medium-text-size text-center">
              {t("nTsessionExpiredDesc", sourceKey.user)}
            </div>
          </div>
        );
        break;
      case "connectionIssue":
        content = (
          <div className="flex flex-col item-center pt-10 px-4">
            <div className="medium-text-size text-center">
              {t("connectionIssueRetry", sourceKey.user) ||
                "Internet may be unstable. Please try sharing again."}
            </div>
          </div>
        );
        break;
      case "viewContentAgain":
        {
          const isVideo = isVideoMedia(extraData?.mediaType);
          const currentMediaUrl =
            extraData?.previewImage?.[currentImageIndex]?.url ||
            extraData?.previewImage?.[currentImageIndex];
          content = (
            <div className="flex flex-col">
              {extraData?.previewImage &&
                extraData?.previewImage.length > 0 && (
                  <div className="w-full h-[240px] rounded-t-lg overflow-hidden flex justify-center items-center bg-[#F5F5F5] relative">
                    <>
                      <div className="mb-1 relative w-full h-full">
                        {isMainImageLoading && !isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#F5F5F5] z-10">
                            <Spin size="large" />
                          </div>
                        )}
                        {isVideo ? (
                          <video
                            key={currentMediaUrl}
                            src={currentMediaUrl}
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full h-full bg-black"
                            style={{ maxHeight: 250, objectFit: "contain" }}
                          />
                        ) : (
                          <img
                            src={currentMediaUrl}
                            alt={`Preview ${currentImageIndex + 1}`}
                            className="object-cover w-full h-full"
                            style={{
                              maxHeight: 250,
                              opacity: isMainImageLoading ? 0 : 1,
                              transition: "opacity 0.3s ease",
                            }}
                            onLoadStart={() => setIsMainImageLoading(true)}
                            onLoad={() => setIsMainImageLoading(false)}
                            onError={() => setIsMainImageLoading(false)}
                          />
                        )}

                        {/* Counter at top right */}
                        {extraData?.previewImage.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {currentImageIndex + 1}/
                            {extraData.previewImage.length}
                          </div>
                        )}

                        {extraData?.previewImage.length > 1 && (
                          <>
                            <button
                              onClick={handlePreviousImage}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
                            >
                              <LeftOutlined />
                            </button>
                            <button
                              onClick={handleNextImage}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
                            >
                              <RightOutlined />
                            </button>
                          </>
                        )}

                        {/* Download current image button — videos use native controls */}
                        {!isVideo && (
                          <button
                            onClick={handleDownloadAllImages}
                            disabled={isDownloading}
                            className="absolute right-2 bottom-2 w-8 h-8 blue-btn bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                            title={`Download Image ${currentImageIndex + 1}`}
                          >
                            {isDownloading ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <DownloadOutlined style={{ fontSize: 12 }} />
                            )}
                          </button>
                        )}
                      </div>
                    </>
                  </div>
                )}
              <div className="text-[14px] text-[#373334] leading-6 overflow-y-auto flex flex-col gap-3 pt-2">
                {/* {extraData?.selectedRecord?.title && (
                  <div className="whitespace-normal">
                    {extraData.selectedRecord.title}
                  </div>
                )} */}

                {extraData?.selectedRecord?.contentText && (
                  <div className="whitespace-normal">
                    {extraData.selectedRecord.contentText}
                  </div>
                )}

                {extraData?.selectedRecord?.location && (
                  <div className="whitespace-normal">
                    {extraData.selectedRecord.location}
                  </div>
                )}

                {extraData?.selectedRecord?.hashtags &&
                  extraData.selectedRecord.hashtags.length > 0 && (
                    <div className="whitespace-normal">
                      {extraData.selectedRecord.hashtags.map((tag, i) => (
                        <span key={i} className="mr-2">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          );

          hasPaddingRight = false;
        }
        break;
      case "deletePreset":
        content = replaceStringPattern(
          t("deletePresetTemplateConfirmation", sourceKey.user),
          { templateName: extraData?.presetName }
        );
        break;
      case "deleteAutoMode":
        content = replaceStringPattern(
          t("deleteAutoModeTemplateConfirmation", sourceKey.user),
          { templateName: extraData?.contentPresetTitle || extraData?.presetName || "-" }
        );
        break;
      case "deletePendingContent":
        content = replaceStringPattern(
          t("deletePendingContentConfirmation", sourceKey.user),
          { templateName: extraData?.productName }
        );
        break;
      case "deleteContent":
        content = replaceStringPattern(
          t("deleteContentConfirmation", sourceKey.user),
          { templateName: extraData?.productName }
        );
        break;
      case "approvePendingContent":
        content = replaceStringPattern(
          t("approvePendingContentConfirmation", sourceKey.user),
          { contentName: extraData?.title }
        );
        break;
      case "rejectPendingContent":
        content = replaceStringPattern(
          t("rejectPendingContentConfirmation", sourceKey.user),
          { contentName: extraData?.title }
        );
        break;
      case "restorePendingContent":
        content = replaceStringPattern(
          t("restorePendingContentConfirmation", sourceKey.user),
          { contentName: extraData?.title }
        );
        break;
      case "suspendOutlet":
        content = replaceStringPattern(
          t("suspendOutletConfirmation", sourceKey.user),
          { outletName: extraData?.businessInfo?.businessName }
        );
        break;
      case "deleteCategory":
        content = replaceStringPattern(
          t("deleteCategoryConfirmation", sourceKey.user),
          { categoryName: extraData?.title }
        );
        break;
      case "deleteImagePool":
        content = replaceStringPattern(
          t("deleteImagePoolConfirmation", sourceKey.user),
          { imagePool: extraData?.productName }
        );
        break;
      case "updatePreset":
        content = t("nTupdatePresetTemplateDesc", sourceKey.user);
        break;
      case "reactivateOutlet":
        content = replaceStringPattern(
          t("reactivateOutletConfirmation", sourceKey.user),
          { outletName: extraData?.businessInfo?.businessName }
        );
        break;
      case "deleteOutlet":
        content = replaceStringPattern(
          t("deleteOutletConfirmation", sourceKey.user),
          { outletName: extraData?.businessInfo?.businessName }
        );
        break;
      default:
        break;
    }
    const isShareContent = type === "shareContent";
    const contentMinHeight = (() => {
      if (isShareContent) {
        return hasButtons ? "200px" : "160px";
      }
      return hasButtons ? "160px" : "120px";
    })();
    const contentMaxHeight =
      type === "ShowSelectedVIsual"
        ? "60vh"
        : type === "AutoModeSetup"
          ? "70vh"
          : "180vh";

    return (
      <div
        className={`popup-scrollbar m-2 ${hasPaddingRight ? "pr-2" : ""} ${type === "chooseLanguage" ? "flex flex-col justify-center" : ""
          }`}
        style={{
          overflowY: "auto",
          maxHeight: contentMaxHeight,
          minHeight: contentMinHeight,
          flexGrow: isShareContent ? 1 : 0,
          padding: isShareContent ? "0 4px 12px" : undefined,
          height: type === "chooseLanguage" ? "100%" : "auto",
        }}
      >
        {content}
      </div>
    );
  };

  const _renderButton = (type) => {
    let customFooter = {};
    switch (type) {
      case "reactivateUser":
        customFooter.button1 = {
          label: t("confirm", sourceKey.user),
          color: "B",
          path: () => props.confirmBtn1(),
        };
        break;
      case "qrCode":
        customFooter.button1 = {
          label: t("download", sourceKey.user),
          color: "B",
          path: () => props.confirmBtn1(),
        };
        break;
      case "shareContent":
        customFooter.button1 = {
          label: <img src={ShuffleIcon} alt="Shuffle" className="w-5 h-5 mr-2" />,
          color: "W",
          path: () => {
            if (props.onShuffle) {
              props.onShuffle();
            }
          },
          isSwitch: true
        };
        customFooter.button2 = {
          label: (
            <div className="flex flex-row items-center justify-center w-full">
              <img src={WhiteShareIcon} alt="Share" className="mr-1" />
              {t("share", sourceKey.user)}
            </div>
          ),
          color: "B",
          path: () => {
            if (props.confirmBtn1) {
              props.confirmBtn1();
            }
          }
        };
        break;
      case "successfulShare":
        customFooter.button1 = {
          label: (
            <div className="flex flex-col justify-center px-2 w-full">
              {props.confirmBtn1Label || t("close", sourceKey.user)}
            </div>
          ),
          color: props.confirmBtn1Color || "B",
          path: () => props.confirmBtn1 && props.confirmBtn1(),
        };
        customFooter.button2 = {
          label: (
            <div className="flex flex-row justify-center px-2 w-full">
              {props.confirmBtn2Label || t("viewContentAgain", sourceKey.user)}
            </div>
          ),
          color: props.confirmBtn2Color || "B",
          path: () => props.confirmBtn2 && props.confirmBtn2(),
        };
        break;
      case "contentNotFound":
        customFooter.button1 = {
          label: (
            <div className="flex flex-row px-2 w-full">
              {t("close", sourceKey.user)}
            </div>
          ),
          color: "B",
          path: () => props.confirmBtn1(),
        };
        break;
      case "expiredShare":
        customFooter.button1 = {
          label: (
            <div className="flex flex-row px-2 w-full">{t("close", sourceKey.user)}</div>
          ),
          color: "B",
          path: () => props.confirmBtn1(),
        };
        break;
      case "sessionTimeout":
        customFooter.button1 = {
          label: (
            <div className="flex flex-row px-2 w-full">{t("close", sourceKey.user)}</div>
          ),
          color: "B",
          path: () => props.confirmBtn1(),
        };
        break;
      case "connectionIssue":
        customFooter.button1 = {
          label: (
            <div className="flex flex-row px-2 w-full">{t("close", sourceKey.user)}</div>
          ),
          color: "B",
          path: () => props.confirmBtn1(),
        };
        break;
      case "viewContentAgain":
        customFooter.button1 = {
          label: (
            <div className="flex flex-row px-2 w-full">
              <img src={WhiteShareIcon} alt="Share" className="mr-1" />
              {t("share?", sourceKey.user)}
            </div>
          ),
          color: "B",
          path: () => props.confirmBtn1(),
        };
        break;
      case "chooseLanguage":
        customFooter.button1 = {
          label: t("select", sourceKey.user) || "Select",
          color: "B",
          path: () => props.confirmBtn1(),
        };
        break;
      case "deletePreset":
        customFooter.button1 = {
          label: t("confirm", sourceKey.user),
          color: "R",
          path: () => props.confirmBtn1(),
        };
        break;
      case "deleteAutoMode":
        customFooter.button1 = {
          label: t("confirm", sourceKey.user),
          color: "R",
          path: () => props.confirmBtn1(),
        };
        break;
      case "deletePendingContent":
        customFooter.button1 = {
          label: t("confirm", sourceKey.user),
          color: "R",
          path: () => props.confirmBtn1(),
        };
        break;
      case "deleteContent":
        customFooter.button1 = {
          label: t("confirm", sourceKey.user),
          color: "R",
          path: () => props.confirmBtn1(),
        };
        break;
      case "approvePendingContent":
        customFooter.button1 = {
          label: t("confirm", sourceKey.user),
          color: "B",
          path: () => props.confirmBtn1(),
        };
        break;
      case "rejectPendingContent":
        customFooter.button1 = {
          label: t("confirm", sourceKey.user),
          color: "R",
          path: () => props.confirmBtn1(),
        };
        break;
      case "restorePendingContent":
        customFooter.button1 = {
          label: t("confirm", sourceKey.user),
          color: "B",
          path: () => props.confirmBtn1(),
        };
        break;
      case "suspendOutlet":
        customFooter.button1 = {
          label: t("confirm", sourceKey.user),
          color: "R",
          path: () => props.confirmBtn1(),
        };
        break;
      case "deleteCategory":
        customFooter.button1 = {
          label: t("confirm", sourceKey.user),
          color: "R",
          path: () => props.confirmBtn1(),
        };
        break;
      case "deleteImagePool":
        customFooter.button1 = {
          label: t("confirm", sourceKey.user),
          color: "R",
          path: () => props.confirmBtn1(),
        };
        break;
      case "reactivateOutlet":
        customFooter.button1 = {
          label: t("confirm", sourceKey.user),
          color: "B",
          path: () => props.confirmBtn1(),
        };
        break;
      case "deleteOutlet":
        customFooter.button1 = {
          label: t("confirm", sourceKey.user),
          color: "R",
          path: () => props.confirmBtn1(),
        };
        break;
      case "updatePreset":
        customFooter.button1 = {
          label: t("nTskip", sourceKey.user),
          color: "G",
          path: () => props.confirmBtn1(),
        };
        customFooter.button2 = {
          label: t("nTreplace", sourceKey.user),
          color: "B",
          path: () => props.confirmBtn2(),
        };
        break;
      case "AutoModeSetup":
        customFooter.button1 = {
          label: "Cancel",
          color: "G",
          path: () => props.confirmBtn1 && props.confirmBtn1(),
        };
        customFooter.button2 = {
          label: (
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Save & Activate Auto Mode</span>
            </div>
          ),
          color: "B",
          path: () => props.confirmBtn2 && props.confirmBtn2(),
        };
        break;
      case "ShowSelectedVIsual": {
        const primaryActionLabel =
          extraData?.primaryActionLabel || t("Next", sourceKey.user);
        customFooter.button1 = {
          label: primaryActionLabel,
          color: "B",
          path: () => {
            if (props.confirmBtn2) {
              props.confirmBtn2();
            }
          },
        };
        break;
      }
      case "AddVisualtoImagePool":
        customFooter.button1 = {
          label: t("confirm", sourceKey.user) || "Confirm",
          color: "B",
          path: () => props.confirmBtn1(),
        };
        break;
      default:
        break;
    }
    const button1 = customFooter?.button1 || null;
    const button2 = customFooter?.button2 || null;
    const hasButtons = button1 || button2;

    let buttonColor1;
    let buttonColor2;

    function getButtonColor(button) {
      switch (button?.color) {
        case "G":
          return "lightgrey-bg-btn";
        case "R":
          return "red-bg";
        case "W":
          return "bg-white";
        case "P":
          return "purple-bg";
        default:
          return "blue-btn";
      }
    }
    buttonColor1 = getButtonColor(button1);
    buttonColor2 = getButtonColor(button2);

    return {
      hasButtons,
      buttons: (
        <>
          {!isEmpty(customFooter) && (
            <div
              className={`${type === "AutoModeSetup"
                ? "flex flex-col md:flex-row gap-2 p-3"
                : type === "successfulShare"
                  ? "flex flex-col gap-2 p-3"
                : `flex flex-row gap-2 ${type === "shareContent" ? " p-3" : ""}`
                }`}
            >
              {button1 && (
                <div
                  className={`${button2
                    ? button1.isSwitch
                      ? "w-10 h-10"
                      : type === "AutoModeSetup"
                        ? "w-full md:w-1/2"
                        : type === "successfulShare"
                          ? "w-full"
                        : "w-1/2"
                    : "w-full"
                    } ${buttonColor1} ${button1.isSwitch
                      ? "border border-gray-300 rounded-md"
                      : `py-1 rounded-md ${type === "AutoModeSetup" ? "px-3" : ""}`
                    } flex justify-center items-center ${type === "AutoModeSetup" ? "text-sm text-center leading-tight min-h-[44px]" : "large-text-size"} cursor-pointer hover:opacity-70`}
                  onClick={button1.path}
                >
                  {button1 && <span className="mr-2 flex items-center"></span>}
                  <div>{button1.label}</div>
                </div>
              )}
              {button2 && (
                <div
                  className={`${buttonColor2} ${type === "shareContent" || type === "AutoModeSetup" || type === "successfulShare" ? "w-full" : "w-1/2"
                    } py-1 flex justify-center items-center rounded-md ${type === "AutoModeSetup" ? "text-sm text-center leading-tight min-h-[44px] px-3" : "large-text-size"} cursor-pointer hover:opacity-70`}
                  onClick={button2.path}
                >
                  <div>{button2.label}</div>
                </div>
              )}
            </div>
          )}
        </>
      ),
    };
  };

  const _renderPopUp = () => {
    if (type === "guidedShareFlow") {
      return (
        <GuidedShareFlowModal
          data={{ ...extraData, isMobileViewport: typeof window !== "undefined" ? window.innerWidth < 768 : false, isOpen: open }}
          loading={loading ? loading : false}
        />
      );
    }

    if (type === "guidedReplayFinal") {
      return (
        <GuidedReplayFinalModal
          data={{ ...extraData, isMobileViewport: typeof window !== "undefined" ? window.innerWidth < 768 : false }}
          loading={loading ? loading : false}
          onShareAgain={props.confirmBtn1}
          onEndSession={props.confirmBtn2}
          onClose={props.onClose}
        />
      );
    }

    const { hasButtons, buttons } = _renderButton(type);

    return (
      <Spin spinning={modalLoading}>
        <Form form={form}>
          <div
            className={`white-bg rounded-lg flex flex-col select-none w-full`}
            style={{
              height: props.height,
              maxHeight: props.maxHeight || "auto",
            }}
          >
            <div
              className={`grid grid-cols-4 ${type === "shareContent" ? " p-1" : ""
                }`}
            >
              <div className="col-span-1 flex justify-start items-center">
                {tooltip && (
                  <Tooltip
                    className="ml-2"
                    color="white"
                    trigger="click"
                    placement="top"
                    title={
                      <div className="white-bg small-text-size">{tooltip}</div>
                    }
                  >
                    <QuestionCircleOutlined style={{ color: "#37333480" }} />
                  </Tooltip>
                )}
              </div>
              <div className="col-span-2 flex justify-center flex-col">
                {_renderHeader(type, extraData)}
              </div>
              <div className="col-span-1 flex justify-end pt-0.5">
                {props.closeable && (
                  <div className="cursor-pointer" onClick={() => close()}>
                    <CloseOutlined style={{ fontSize: 16 }} />
                  </div>
                )}
              </div>
            </div>

            {_renderContent(type, extraData, hasButtons)}

            {/* fetch categoryList for shareContent type */}
            {type === "shareContent" && extraData?.categoryList && extraData.categoryList.length > 0 && (
              <div className="flex items-center gap-2 mb-4 px-2 overflow-x-auto whitespace-nowrap scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {extraData.categoryList.map((category) => (
                  <button
                    key={category.categoryId}
                    type="button"
                    className={`px-3 py-1 rounded-full text-sm transition-all duration-200 flex-shrink-0 ${extraData?.selectedCategoryId === category.categoryId
                      ? "bg-[#1890ff] text-white"
                      : "bg-[#e6f7ff] text-[#1890ff] hover:bg-[#91d5ff]"
                      }`}
                    onClick={() =>
                      extraData?.onCategoryChange &&
                      extraData.onCategoryChange(category.categoryId)
                    }
                    disabled={extraData?.categoryLoading}
                  >
                    {category.categoryName}
                  </button>
                ))}
              </div>
            )}
            {/* fetch products for based on category */}
            {type === "shareContent" && extraData?.productOptions && (
              <div className="px-3">
                <DropdownInput
                  label={t("nTproduct", sourceKey.user)}
                  className="w-full"
                  fieldName="productId"
                  placeholder={t("nTchooseProduct", sourceKey.user)}
                  showSearch={true}
                  onChange={extraData.onProductChange}
                  value={extraData.selectedProductId}
                  options={extraData.productOptions}
                />
              </div>
            )}
            {buttons}
          </div>
        </Form>
      </Spin>
    );
  };

  const largeModalTypes = [
    "VisualPool",
    "ShowSelectedVIsual",
    "AddVisualtoImagePool",
    "AutoModeSetup",
  ];
  const maskClosableTypes = [
    "VisualPool",
    "ShowSelectedVIsual",
    "AddVisualtoImagePool",
  ];
  const isGuidedType = type === "guidedShareFlow" || type === "guidedReplayFinal";
  const isMobileViewport = typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const resolvedWidth = isGuidedType
    ? (isMobileViewport ? "100vw" : (type === "guidedShareFlow" ? 980 : 720))
    : (modalWidth || (largeModalTypes.includes(type) ? 880 : 400));

  return (
    <>
      <Modal
        wrapClassName={`no-padding-modal-body modal-body-background-transparent${type === "shareContent" ? " share-content-modal" : ""}${isGuidedType ? " guided-modal" : ""}`}
        centered={!(isGuidedType && isMobileViewport)}
        maskClosable={maskClosableTypes.includes(type)}
        onCancel={maskClosableTypes.includes(type) ? close : undefined}
        closable={false}
        width={resolvedWidth}
        style={isGuidedType && isMobileViewport ? { top: 0, margin: 0, paddingBottom: 0, maxWidth: "100vw" } : undefined}
        mask
        footer={null}
        open={open}
        zIndex={zIndex}
      >
        <div className="rounded-lg">{_renderPopUp()}</div>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(SinglePopUpModal);
