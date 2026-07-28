import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Button, Empty, Image, Input, message } from "antd";
import getGeneratedVisualContent from "@/pages/api/visualCategory/getGeneratedVisualContent";
import { useRouter } from "next/router";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { isEmpty } from "lodash";
import editImageName from "@/pages/api/images/assign-image-name";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";

const getQueryValue = (value) => (Array.isArray(value) ? value[0] : value);

const CompletedVisualPage = ({ userId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { jobId, tab, page } = router.query;
  const [visuals, setVisuals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingCurrent, setDownloadingCurrent] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [name, setName] = useState("");
  const hasVisuals = visuals.length > 0;
  const currentVisual = hasVisuals ? visuals[currentIndex] : null;
  const navButtonClass = "disabled:pointer-events-none disabled:opacity-60";

  //for filename
  useEffect(() => {
    if (visuals.length > 0) {
      setName(visuals[currentIndex]?.imageNameAssigned || "");
    }
  }, [currentIndex, visuals]);

  useEffect(() => {
    if (jobId) getData();
  }, [jobId]);

  const getData = () => {
    setLoading(true);
    getGeneratedVisualContent("all", 0, { jobId: jobId })
      .then((res) => {
        const list = res.data || [];
        setVisuals(list);
        setCurrentIndex(0);
      })
      .catch((err) => {
        console.error("Failed to load visuals", err);
      })
      .finally(() => setLoading(false));
  };

  const handlePrev = () => {
    setCurrentIndex((idx) => Math.max(idx - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((idx) => Math.min(idx + 1, visuals.length - 1));
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

  const handleDownloadCurrent = async () => {
    const url = currentVisual?.resultImageUrls?.[0];
    if (!url) return;
    setDownloadingCurrent(true);
    try {
      await downloadViaProxy(
        url,
        `${isEmpty(name)
          ? `visual-${jobId || "job"}-${currentIndex + 1}`
          : name + `-${currentIndex + 1}`
        }.jpg`
      );
    } catch (err) {
      console.error("Failed to download current image", err);
    } finally {
      setDownloadingCurrent(false);
    }
  };

  //   const handleDownloadAll = async () => {
  //     const urls = visuals.flatMap((item) => item?.resultImageUrls || []);
  //     if (!urls.length) return;
  //     setDownloadingAll(true);
  //     try {
  //       for (let i = 0; i < urls.length; i++) {
  //         const url = urls[i];
  //         await downloadViaProxy(
  //           url,
  //           `${
  //             isEmpty(name)
  //               ? `visual-${jobId || "job"}-${i + 1}`
  //               : name + `-${i + 1}`
  //           }.jpg`
  //         );
  //       }
  //     } catch (err) {
  //       console.error("Failed to download all images", err);
  //     } finally {
  //       setDownloadingAll(false);
  //     }
  //   };

  //km changes
  const handleDownloadAll = async () => {
    if (!visuals.length) return;

    setDownloadingAll(true);

    try {
      let index = 1;

      for (const visual of visuals) {
        const baseName = visual.imageNameAssigned || `visual-${jobId || "job"}`;

        const urls = visual.resultImageUrls || [];

        for (const url of urls) {
          await downloadViaProxy(url, `${baseName}-${index}.jpg`);
          index++;
        }
      }
    } catch (err) {
      console.error("Failed to download all images", err);
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex flex-row items-center gap-3">
            <Button
              onClick={() => {
                const query = {};
                const tabValue = getQueryValue(tab);
                const pageValue = getQueryValue(page);
                if (tabValue) query.tab = tabValue;
                if (pageValue) query.page = pageValue;
                router.push({ pathname: "/hq/visual", query });
              }}
              className={`bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0`}
            >
              <ArrowLeftOutlined />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Results</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center gap-6">
        {hasVisuals ? (
          <>
            <div className="flex flex-col">
              <p className="font-semibold text-gray-700 mb-2">
                Name this Picture.
              </p>
              <div className="mb-2 flex items-center">
                <Input
                  placeholder="Picture Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-border flex-1"
                />
                <Button
                  onClick={async () => {
                    if (!name) return; // safety check
                    try {
                      const response = await editImageName({
                        imageNameAssigned: name,
                        visualOutputId: currentVisual?._id, // sends undefined if currentVisual is null/undefined
                      });
                      if (response?.data?.success) {
                        message.success(t("imageNameSaved", sourceKey.user));
                        // getData((page - 1) * PAGE_SIZE); // Refresh data

                        // ✅ UPDATE visuals state
                        setVisuals((prev) =>
                          prev.map((v, i) =>
                            i === currentIndex
                              ? { ...v, imageNameAssigned: name }
                              : v
                          )
                        );
                      }
                    } catch (error) {
                      console.error("Failed to update image name:", error);
                    }
                  }}
                  className="ml-2"
                  disabled={!name} // disabled when name is empty
                >
                  Save Image Name
                </Button>
              </div>
              <div className="bg-white p-4 rounded-xl shadow flex items-center justify-center">
                <Image
                  src={currentVisual?.resultImageUrls?.[0]}
                  alt={`Generated visual ${currentIndex + 1}`}
                  className="max-h-[50vh] object-contain rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                loading={loading}
                className={navButtonClass}
              >
                Prev
              </Button>
              <span className="text-sm text-gray-600">
                Image {currentIndex + 1} of {visuals.length}
              </span>
              <Button
                onClick={handleNext}
                disabled={currentIndex >= visuals.length - 1}
                loading={loading}
                className={navButtonClass}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <Empty
            description={loading ? "Loading visuals..." : "No visuals yet"}
          />
        )}
        <div className="flex justify-center gap-3">
          <Button
            size="large"
            onClick={handleDownloadAll}
            loading={downloadingAll}
          >
            Download All Images
          </Button>
          <Button
            size="large"
            onClick={handleDownloadCurrent}
            loading={downloadingCurrent}
          >
            Download Current Image
          </Button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  userId: state.user?.user?._id,
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CompletedVisualPage);
