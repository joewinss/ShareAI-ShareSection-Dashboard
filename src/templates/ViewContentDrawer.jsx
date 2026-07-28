import { useTranslation } from "@/locales/useTranslation";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { Button, Dropdown, message, Spin } from "antd";
import { Edit, Eye, Trash2 } from "lucide-react";
import {
  MoreOutlined,
  CheckOutlined,
  CloseOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import EditContentDrawer from "@/components/templates/components/EditContentDrawer";
import { sourceKey } from "@/locales/config";
import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
import SinglePopUpModal from "@/components/general/popUp/SinglePopUpModal";
import { Button as Button2 } from "@/components/ui/button";
import editContentStatus from "@/pages/api/contentGeneration/editContentStatus";
import { CONTENT_STATUS } from "@/constant/template";
import { isEmpty } from "lodash";
import { withRouter } from "next/router";
import { isVideoMedia } from "@/constants/mediaType";

const extractMediaUrl = (entry) =>
  typeof entry === "string" ? entry : entry?.url || null;

const ViewContentDrawer = (props) => {
  const { content, isPending, onSuccess, user } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ maxWidth: "640px" });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editContentDrawerOpen, setEditContentDrawerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const contentPermission = user?.user?.contentPermission || 0;
  const userIdentity = user?.user?.role;
  const hasAuthority = userIdentity === "masterHQ" || contentPermission === 1;
  const status = content?.status;
  useEffect(() => {
    setOpen(props?.open === true);
  }, [props?.open]);
  // console.log(content)
  const isVideo = isVideoMedia(content?.mediaType);
  const rawMedia = isVideo
    ? content?.videoUrls ?? []
    : content?.imageUrls ?? content?.images ?? [];
  const images = (Array.isArray(rawMedia) ? rawMedia : [])
    .map(extractMediaUrl)
    .filter(Boolean);

  function onClose() {
    setOpen(false);
    if (props.onClose) {
      props.onClose();
    }
  }

  const handlePreviousImage = () => {
    if (images && images.length > 0) {
      const newIndex =
        currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      // Set loading state, will be cleared by onLoad or timeout
      if (images[newIndex]) {
        setIsImageLoading(true);
      }
    }
  };

  const handleNextImage = () => {
    if (images && images.length > 0) {
      const newIndex =
        currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      // Set loading state, will be cleared by onLoad or timeout
      if (images[newIndex]) {
        setIsImageLoading(true);
      }
    }
  };
  const renderBanner = () => {
    return (
      <>
        <div
          style={{
            position: "relative",
            textAlign: "center",
            backgroundColor: "#f5f5f5",
            minHeight: "360px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Loading Spinner — image only; video uses native loading */}
          {isImageLoading && !isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <Spin size="large" />
            </div>
          )}

          {/* Media */}
          {images[currentImageIndex] ? (
            isVideo ? (
              <video
                key={`video-${currentImageIndex}-${images[currentImageIndex]}`}
                className="w-full h-[360px] object-contain bg-black"
                src={images[currentImageIndex]}
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                key={`image-${currentImageIndex}-${images[currentImageIndex]}`}
                className="w-full h-[360px] object-cover transition-all duration-300 ease-in-out"
                src={images[currentImageIndex]}
                draggable={false}
                alt={`Content image ${currentImageIndex + 1}`}
                style={{
                  opacity: isImageLoading ? 0 : 1,
                  transition: "opacity 0.3s ease",
                }}
                onLoad={() => setIsImageLoading(false)}
                onError={(e) => {
                  setIsImageLoading(false);
                  e.target.style.display = "none";
                }}
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-[360px] text-gray-400">
              <Eye className="w-16 h-16 mb-2" />
              <span className="text-sm">
                {isVideo
                  ? t("noVideo", sourceKey.user) || "No video available"
                  : t("noImage", sourceKey.user) || "No image available"}
              </span>
            </div>
          )}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePreviousImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
              >
                ‹
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
              >
                ›
              </button>
            </>
          )}
          {/* Image Counter */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {images.length > 0
              ? `${currentImageIndex + 1} / ${images.length}`
              : "0 / 0"}
          </div>
        </div>
      </>
    );
  };

  const renderDesc = () => {
    return (
      <>
        <div className="space-y-4 px-2">
          {/* <div className="large-text-size font-bold">{content?.title}</div> */}
          <div className="whitespace-pre-line">{content?.contentText}</div>
          <div className="whitespace-pre-line">{content?.location}</div>
          <div className="whitespace-pre-line">{content?.hashtags[0]}</div>
        </div>
      </>
    );
  };

  const handleEditContentStatus = async (contentId, action, imageUrls) => {
    try {
      setLoading(true);
      const response = await editContentStatus({
        contentId: contentId,
        action: action,
        imageUrls: imageUrls,
      });
      if (response?.data?.success) {
        message.success(t("contentStatusUpdated", sourceKey.user));
        onClose(); // Close the drawer
        if (onSuccess) {
          onSuccess(); // Refresh data
        }
      }
    } catch (error) {
      console.error("Error updating content status:", error);
      message.error(error?.message || "Error updating content status");
    } finally {
      setLoading(false);
      // Close all modals
      setApproveModalOpen(false);
      setRejectModalOpen(false);
      setRestoreModalOpen(false);
    }
  };

  useEffect(() => {
    setCurrentImageIndex(0);
    // Videos don't use the image spinner — let the <video> element handle its own loading.
    if (!isVideo && images && images.length > 0 && images[0]) {
      setIsImageLoading(true);
      const timeout = setTimeout(() => {
        setIsImageLoading(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
    setIsImageLoading(false);
  }, [content?.imageUrls, content?.images, content?.videoUrls, isVideo]);

  // Add timeout fallback for image navigation
  useEffect(() => {
    if (isImageLoading) {
      const timeout = setTimeout(() => {
        setIsImageLoading(false);
      }, 5000); // 5 seconds max loading time
      return () => clearTimeout(timeout);
    }
  }, [isImageLoading, currentImageIndex]);



  const renderFooter = () => {
    // If the user is NOT HQ and does NOT have permission 1, show nothing
    if (!hasAuthority || content?.isShared === 1) return null;

    // 1. Logic for Pending Review
    if (status === CONTENT_STATUS?.PENDING_REVIEW) {
      const dropdownItems = [
        {
          key: "edit",
          label: (
            <div className="flex items-center" onClick={() => setEditContentDrawerOpen(true)}>
              <Edit className="w-4 h-4 mr-2" /> {t("edit", sourceKey.user)}
            </div>
          ),
        },
        {
          key: "reject",
          label: (
            <div className="flex items-center text-red-600" onClick={() => setRejectModalOpen(true)}>
              <CloseOutlined className="w-4 h-4 mr-2" /> {t("reject", sourceKey.user)}
            </div>
          ),
        },
      ];

      return (
        <div className="flex items-center gap-2 pt-2 w-full">
          <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
            <Button2 variant="outline" size="sm" className="border-black/15 bg-white/85">
              <MoreOutlined className="w-4 h-4" />
            </Button2>
          </Dropdown>
          <Button
            className="w-full green-btn"
            loading={loading}
            onClick={() => setApproveModalOpen(true)}
          >
            {t("approve", sourceKey.user)}
          </Button>
        </div>
      );
    }

    // 2. Logic for Active/Deleted/Archived (Restore Action)
    const isRestorable = [CONTENT_STATUS?.DELETED, CONTENT_STATUS?.ARCHIVED].includes(status);

    if (isRestorable) {
      return (
        <div className="flex items-center gap-2 pt-2 w-full">
          <Button
            className="w-full green-btn"
            loading={loading}
            onClick={() => setRestoreModalOpen(true)}
          >
            <RedoOutlined className="w-4 h-4 mr-2" />
            {t("restore", sourceKey.user)}
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <MobileFormDrawer
        open={open}
        width={isMobile ? "100%" : "400px"}
        className=""
        closable={true}
        placement={"left"}
        destroyOnClose={true}
        onClose={() => onClose()}
        // zIndex={2000}
        title={<div>{/* {t("description", sourceKey.user)} */}</div>}
        footer={renderFooter()}
      >
        <div className="flex flex-col">
          {!isEmpty(images) && renderBanner()}
          {renderDesc()}
        </div>
      </MobileFormDrawer>
      <SinglePopUpModal
        open={approveModalOpen}
        type={"approvePendingContent"}
        closeable={true}
        extraData={content}
        onClose={() => {
          setApproveModalOpen(false);
        }}
        confirmBtn1={() =>
          handleEditContentStatus(content?._id, "approve", content?.imageUrls)
        }
      />

      <SinglePopUpModal
        open={rejectModalOpen}
        type={"rejectPendingContent"}
        closeable={true}
        extraData={content}
        onClose={() => {
          setRejectModalOpen(false);
        }}
        confirmBtn1={() => handleEditContentStatus(content?._id, "reject")}
      />

      <SinglePopUpModal
        open={restoreModalOpen}
        type={"restorePendingContent"}
        closeable={true}
        extraData={content}
        onClose={() => {
          setRestoreModalOpen(false);
        }}
        confirmBtn1={() => handleEditContentStatus(content?._id, "restore")}
      />

      {/* Edit Content Drawer */}
      <EditContentDrawer
        open={editContentDrawerOpen}
        onClose={() => {
          setEditContentDrawerOpen(false);
        }}
        selectedRecord={content}
        onSuccess={onSuccess}
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ViewContentDrawer));
