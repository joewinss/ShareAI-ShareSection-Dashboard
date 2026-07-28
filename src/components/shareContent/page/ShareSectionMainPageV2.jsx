import { useEffect, useState } from "react";
import { Typography, Dropdown, Menu, message, Spin } from "antd";
import {
  facebook,
  instagram,
  redNote,
  LogoGoodnite,
  TransalationIcon2,
  GoogleReview,
  OthersIcon,
  ShareAi,
  Background,
} from "../../../../public/assets";
import { Button } from "@/components/ui/button";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import SharePlatformListV2 from "../component/SharePlatformListV2";
import SinglePopUpModal from "@/components/general/popUp/SinglePopUpModal";
import { isEmpty } from "lodash";
import { useRouter } from "next/router";
import getUserPlatforms from "@/pages/api/platforms/getUserPlatforms";
import {
  parseShareFields,
  formatShareContent,
} from "@/utility/common-functions";
import getRandomBusinessContent from "@/pages/api/content/getRandomeBusinessContent";
import shareContent from "@/pages/api/content/shareContent";
import getContentProductList from "@/pages/api/content/getContentProductList";
import getLanguages from "@/pages/api/content/getLanguages";
import getBusinessContentById from "@/pages/api/content/getBusinessContentById";
import { CONTENT_STATUS, PLATFORM_NAME, PLATFORM_STATUS, PLATFORM_TYPE } from "@/constant/template";
import getPictureByUserId from "@/pages/api/user/getPictureByUserId";
import { getPlatformIcon } from "@/utility/ImagesFunction";
import getCategoryList from "@/pages/api/content/getCategoryList";

const ShareSectionMainPageV2 = () => {
  const [langOpen, setLangOpen] = useState(false);
  const { t } = useTranslation();
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [tempSelectedLanguage, setTempSelectedLanguage] = useState("english");
  const PAGE_SIZE = 10;
  const [loading, setLoading] = useState(false);
  const [shareContentModalOpen, setShareContentModalOpen] = useState(false);
  const [succesfulShareOpen, setsuccessfulShareOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedImage, setSelectedImage] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [preparedImageFiles, setPreparedImageFiles] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [viewContentAgainOpen, setViewContentAgainOpen] = useState(false);
  const [formatContent, setFormatContent] = useState("");
  const [parsedContentText, setParsedContentText] = useState("");
  const [backgroundPicture, setBackgroundPicture] = useState(Background);
  const [profilePicture, setProfilePicture] = useState(ShareAi);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const router = useRouter();
  // router query values
  const queryUserId =
    router.isReady && router.query?.userId
      ? String(router.query.userId)
      : null;

  const defaultLanguageOptions = [
    { key: "english", label: "EN" },
    { key: "chinese", label: "中" },
    { key: "malay", label: "Melayu" },
  ];
  const [languageOptions, setLanguageOptions] = useState(defaultLanguageOptions);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [contentNotFoundOpen, setContentNotFoundOpen] = useState(false);
  const [platformList, setPlatformList] = useState([]);
  const [platformsFetchState, setPlatformsFetchState] = useState("loading");
  const [expiredModalOpen, setExpiredModalOpen] = useState(false);

  // Derive language options from backend response

  const languageMenu = (
    <Menu
      style={{ background: "rgba(255,255,255,0.8)", }}
      selectedKeys={[selectedLanguage]}
    >
      {languageOptions.map((opt) => (
        <Menu.Item
          key={opt.key}
          onClick={async () => {
            setLangOpen(false);
            setSelectedLanguage(opt.key);

            // For multiple platforms, wait for user to select platform first
            // Don't fetch content yet - let them choose platform
            if (platformList && platformList.length > 1) {
              return;
            }

            // Single platform - proceed with content fetch
            setSelectedCategoryId(null);
            setCategoryLoading(true);

            try {
              setLoading(true);
              const res = await getCategoryList("all", 0, {
                outletUserId: queryUserId,
                language: opt.key,
                isShared: 0,
                status: CONTENT_STATUS.ACTIVE,
              });

              const categories = res?.data || [];

              // Check if categories is empty
              if (categories.length === 0) {
                setContentNotFoundOpen(true);
                setCategoryLoading(false);
                setLoading(false);
                return;
              }

              setCategoryList(categories);

              let firstCategoryId = null;
              if (categories.length > 0) {
                firstCategoryId = categories[0].categoryId;
                setSelectedCategoryId(firstCategoryId);

                // based on the category id fetch all product
                try {
                  const productRes = await getProductListByCategory("all", 0, {
                    outletUserId: queryUserId,
                    language: opt.key,
                    isShared: 0,
                    status: CONTENT_STATUS.ACTIVE,
                    categoryId: firstCategoryId,
                  });
                  lwt
                  setSelectedProductId(productRes?.data[0]?._id || null);
                  try {
                    const contentRes = await getRandomBusinessContent(1, 0, {
                      userId: queryUserId,
                      language: opt.key,
                      productId: firstCategoryId,
                    });

                    const content = contentRes?.data?.content || "";

                    // Check if content is empty or null
                    if (!content || isEmpty(content)) {
                      setContentNotFoundOpen(true);
                      setLoading(false);
                      setCategoryLoading(false);
                      return;
                    }

                    setSelectedImage(contentRes?.data?.content?.imageUrls);
                    setSelectedRecord(contentRes?.data?.content);

                    await prepareImagesForSharing(
                      contentRes?.data?.content?.imageUrls
                    );

                    // Open share modal for single platform
                    setShareContentModalOpen(true);
                  } catch (contentError) {
                    console.error(
                      "Failed to load content for language change",
                      contentError
                    );
                    setContentNotFoundOpen(true);
                  }
                } catch (err) {

                } finally {
                  setLoading(false);
                }
              }

              setCategoryLoading(false);
            } catch (err) {
              console.error("Category loading failed on language change", err);
              setCategoryLoading(false);
              setContentNotFoundOpen(true);
              setLoading(false);
            }
          }}
          className={
            selectedLanguage === opt.key ? "ant-menu-item-selected" : ""
          }
        >
          {opt.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  const prepareImagesForSharing = async (imageUrls) => {
    if (!imageUrls || imageUrls.length === 0) {
      setPreparedImageFiles([]);
      return;
    }

    try {
      setLoading(true);

      const fetchPromises = imageUrls.map(async (imageUrl, index) => {
        try {
          // Handle both string URLs and objects with url property
          const url =
            typeof imageUrl === "string" ? imageUrl : imageUrl?.url || imageUrl;

          const proxyUrl = `/api/images/proxy-image?url=${encodeURIComponent(
            url
          )}`;

          const response = await fetch(proxyUrl);

          if (!response.ok) {
            console.error(
              `Failed to fetch image ${index}: ${response.status}`,
              url
            );
            return null;
          }

          const blob = await response.blob();
          const urlParts = url.split("/");
          const fileName =
            urlParts[urlParts.length - 1].split("?")[0] ||
            `image_${index + 1}.jpg`;

          let mimeType = blob.type;

          if (!mimeType || mimeType === "application/octet-stream") {
            const fileExtension = fileName.split(".").pop().toLowerCase();
            const mimeTypes = {
              jpg: "image/jpeg",
              jpeg: "image/jpeg",
              png: "image/png",
              gif: "image/gif",
              webp: "image/webp",
            };
            mimeType = mimeTypes[fileExtension] || "image/jpeg";
          }

          return new File([blob], fileName, { type: mimeType });
        } catch (error) {
          console.error(`Failed to prepare image ${index}:`, error);
          return null;
        }
      });

      const files = (await Promise.all(fetchPromises)).filter(Boolean);
      setPreparedImageFiles(files);
    } catch (error) {
      console.error("Failed to prepare images for sharing:", error);
      setPreparedImageFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // main logic to get Content, 
  const handleCategoryChange = async (categoryId) => {
    setSelectedCategoryId(categoryId);
    setLoading(true);
    try {
      const res = await getRandomBusinessContent(1, 0, {
        userId: queryUserId,
        language: selectedLanguage,
        productId: categoryId,
      });

      const content = res?.data?.content || "";

      // Check if content is empty or null
      if (!content || isEmpty(content)) {
        setContentNotFoundOpen(true);
        setShareContentModalOpen(false);
        return;
      }

      setSelectedImage(res?.data?.content?.imageUrls);
      setSelectedRecord(res?.data?.content);

      await prepareImagesForSharing(res?.data?.content?.imageUrls);
    } catch (e) {
      console.error("handleCategoryChange failed", e);
      setContentNotFoundOpen(true);
      setShareContentModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  function getLanguageMenu() {
    getLanguages(10, 0, {
      userId: queryUserId,
    })
      .then((res) => {
        const available = res?.data?.languagesAvailable || [];

        if (isEmpty(available)) {
          setLanguageOptions(defaultLanguageOptions);
          setContentNotFoundOpen(true);
          setLanguageModalOpen(false);
          return;
        }

        const lower = available.map((s) => String(s).toLowerCase());
        const options = [];

        if (lower.some((s) => s.includes("eng"))) {
          const opt = defaultLanguageOptions.find((o) => o.key === "english");
          if (opt) options.push(opt);
        }
        if (lower.some((s) => s.includes("chi") || s.includes("zh"))) {
          const opt = defaultLanguageOptions.find((o) => o.key === "chinese");
          if (opt) options.push(opt);
        }
        if (lower.some((s) => s.includes("mal") || s.includes("ms"))) {
          const opt = defaultLanguageOptions.find((o) => o.key === "malay");
          if (opt) options.push(opt);
        }

        const finalOptions =
          options.length === 0 ? defaultLanguageOptions : options;

        setLanguageOptions(finalOptions);
        setTempSelectedLanguage(finalOptions[0]?.key || "english");
        setContentNotFoundOpen(false);

        setLanguageModalOpen(false);
        setTimeout(() => setLanguageModalOpen(true), 50);
      })
      .catch((err) => {
        setLanguageOptions(defaultLanguageOptions);
        setContentNotFoundOpen(true);
        setLanguageModalOpen(false);
        console.error("getLanguageMenu failed", err);
      });
  }

  function getContent(outletUserId, language, contentId, imageUrls) {
    // Convert imageUrls to proper format if it's an array of strings
    const formattedImageUrls = Array.isArray(imageUrls)
      ? imageUrls.map((url) =>
        typeof url === "string" ? url : url?.url || url
      )
      : [];

    getBusinessContentById(1, 0, {
      outletUserId,
      language,
      contentId,
      imageUrls: formattedImageUrls,
    })
      .then((res) => {
        setSelectedContent(res?.data?.content);
        // Use the imageUrls from the response or the passed imageUrls
        const imagesToPrepare =
          res?.data?.content?.imageUrls || formattedImageUrls;
        prepareImagesForSharing(imagesToPrepare);
      })
      .catch((err) => {
        console.error("getContent failed", err);
      });
  }

  async function handlePlatformShare(
    platformName,
    selectedLanguage,
    selectedCategoryId
  ) {
    setLoading(true);
    try {
      const platformMeta = (platformList || []).find(
        (p) => p.name === platformName
      ) || { name: platformName, title: platformName };

      // Set selected platform and converted value
      setSelectedPlatform(platformMeta);

      // Reset category when platform changes
      setSelectedCategoryId(null);

      // First, get categories for this language
      setCategoryLoading(true);
      const categoryRes = await getContentProductList("all", 0, {
        outletUserId: queryUserId,
        language: selectedLanguage,
        isShared: 0,
        status: CONTENT_STATUS.ACTIVE,
      });

      const categories = categoryRes?.data || [];

      if (categories.length === 0) {
        setContentNotFoundOpen(true);
        setCategoryLoading(false);
        setLoading(false);
        return;
      }

      setCategoryList(categories);

      // Always use the first category from the new platform's categories
      const categoryIdToUse = categories[0]?.productId;
      setSelectedCategoryId(categoryIdToUse);

      setCategoryLoading(false);

      // Now fetch content for this category
      const res = await getRandomBusinessContent(1, 0, {
        userId: queryUserId,
        language: selectedLanguage,
        productId: categoryIdToUse,
        // platform: convertedValue,
      });

      const content = res?.data?.content || "";

      // Check if content is empty or null
      if (!content || isEmpty(content)) {
        setContentNotFoundOpen(true);
        return;
      }

      setSelectedImage(res?.data?.content?.imageUrls);
      setSelectedRecord(res?.data?.content);

      await prepareImagesForSharing(
        res?.data?.content?.imageUrls?.url || res?.data?.content?.imageUrls
      );

      // Open share content modal
      setShareContentModalOpen(true);
    } catch (e) {
      console.error("handlePlatformShare error:", e);
      setContentNotFoundOpen(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!queryUserId) {
      if (router.isReady) {
        setPlatformList([]);
        setPlatformsFetchState("ready");
      }
      return;
    }
    const expiredDateParam = router.query?.expiredDate;
    if (expiredDateParam) {
      const parsed = Date.parse(expiredDateParam);
      if (!isNaN(parsed) && parsed < Date.now()) {
        setExpiredModalOpen(true);
        setPlatformList([]);
        setPlatformsFetchState("ready");
        return;
      }
    }

    // Get language options early
    getLanguageMenu();

    //Before Step 1, Render Profile and Background Image. 
    getPictureByUserId(0, 0, { userId: queryUserId })
      .then((res) => {
        const background = res?.data?.businessInfo?.backgroundImageUrl
          ? res?.data?.businessInfo?.backgroundImageUrl
          : Background;
        setBackgroundPicture(background);
        const profile = res?.data?.businessInfo?.profilePictureUrl
          ? res?.data?.businessInfo?.profilePictureUrl
          : ShareAi;
        setProfilePicture(profile);
      })
      .catch((err) => {
        console.error("getPictureByUserId failed", err);
        setBackgroundPicture(Background);
        setProfilePicture(ShareAi);
      });

    // Step 1: Get user platforms
    setPlatformsFetchState("loading");
    setPlatformList([]);
    getUserPlatforms(100, 0, { userId: queryUserId })
      .then((res) => {
        const userPlatforms = res?.userPlatforms || [];
        const activePlatforms = userPlatforms.filter(
          (p) => p.status === PLATFORM_STATUS.ACTIVE
        );

        // Check if all platforms are inactive (status 0) or no platforms exist
        if (activePlatforms.length === 0) {
          setContentNotFoundOpen(true);
          setPlatformList([]);
          return;
        }

        const list = activePlatforms.map((p, idx) => ({
          id: idx,
          platformId: p.platformId,
          title: p.title,
          name: String(p.title).toLowerCase().replace(/\s+/g, ""),
          url: p.url || "",
          status: p.status,
          icon: getPlatformIcon(p.title),
          type: p.type,
        }));

        const sortedList = list.sort((a, b) => {
          // Use the specific titles you defined
          const titleA = a.title;
          const titleB = b.title;

          // Google Review logic (move to top)
          if (titleA === PLATFORM_NAME.GOOGLE_REVIEW) return -1;
          if (titleB === PLATFORM_NAME.GOOGLE_REVIEW) return 1;

          // Others logic (move to bottom)
          if (titleA === PLATFORM_NAME.OTHERS) return 1;
          if (titleB === PLATFORM_NAME.OTHERS) return -1;

          // Maintain original order for everything else
          return 0;
        });


        setPlatformList(sortedList);

        // If only one platform, auto-select it and set converted value
        if (sortedList.length === 1) {
          setSelectedPlatform(sortedList[0]);
        }
      })
      .catch((err) => {
        console.error("getUserPlatforms failed", err);
        setContentNotFoundOpen(true);
      })
      .finally(() => {
        setPlatformsFetchState("ready");
      });
  }, [queryUserId, router.isReady]);

  const handleShareClick = async () => {
    try {
      setLoading(true);
      await shareContent({
        contentId: selectedRecord?._id,
        platform: selectedPlatform?.title,
        platformId: selectedPlatform?.platformId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Language Modal */}
      <SinglePopUpModal
        type="chooseLanguage"
        open={languageModalOpen}
        height={"auto"}
        closeable={false}
        onClose={() => setLanguageModalOpen(false)}
        extraData={{
          selected: tempSelectedLanguage,
          onSelect: setTempSelectedLanguage,
          languageOptions,
        }}
        confirmBtn1={async () => {
          setSelectedLanguage(tempSelectedLanguage);
          setLanguageModalOpen(false);

          // For multiple platforms, wait for user to select platform first
          // Don't fetch content yet - let them choose platform
          if (platformList && platformList.length > 1) {
            return;
          }

          // Single platform - proceed with content fetch
          setSelectedCategoryId(null);
          setCategoryLoading(true);

          try {
            const res = await getContentProductList("all", 0, {
              outletUserId: queryUserId,
              language: tempSelectedLanguage,
              isShared: 0,
              // platform: convertedPlatformValue,
              status: CONTENT_STATUS.ACTIVE,
            });

            const categories = res?.data || [];

            // Check if categories is empty
            if (categories.length === 0) {
              setContentNotFoundOpen(true);
              setCategoryLoading(false);
              setLoading(false);
              return;
            }

            setCategoryList(categories);

            let firstCategoryId = null;
            if (categories.length > 0) {
              firstCategoryId = categories[0].productId;
              setSelectedCategoryId(firstCategoryId);

              setLoading(true);
              try {
                const contentRes = await getRandomBusinessContent(1, 0, {
                  userId: queryUserId,
                  language: tempSelectedLanguage,
                  productId: firstCategoryId,
                  // platform: convertedPlatformValue,
                });

                const content = contentRes?.data?.content || "";

                // Check if content is empty or null
                if (!content || isEmpty(content)) {
                  setContentNotFoundOpen(true);
                  setLoading(false);
                  setCategoryLoading(false);
                  return;
                }

                setSelectedImage(contentRes?.data?.content?.imageUrls);

                setSelectedRecord(contentRes?.data?.content);

                await prepareImagesForSharing(
                  contentRes?.data?.content?.imageUrls
                );

                // Open share modal for single platform
                setShareContentModalOpen(true);
              } catch (contentError) {
                console.error("Failed to load initial content", contentError);
                setContentNotFoundOpen(true);
              } finally {
                setLoading(false);
              }
            }

            setCategoryLoading(false);
          } catch (err) {
            console.error("Category loading failed", err);
            setCategoryLoading(false);
            setContentNotFoundOpen(true);
          }
        }}
      />

      {/* Share Content Modal */}
      <SinglePopUpModal
        type="shareContent"
        open={shareContentModalOpen}
        onClose={() => {
          setShareContentModalOpen(false);
        }}
        closeable={true}
        height={"auto"}
        modalLoading={loading}
        extraData={{
          selectedRecord: selectedRecord,
          previewImage: selectedImage,
          categoryList: categoryList,
          selectedCategoryId: selectedCategoryId,
          onCategoryChange: handleCategoryChange,
          categoryLoading: categoryLoading,
        }}
        onShuffle={async () => {
          // Shuffle - get another random content for the same category
          setLoading(true);
          try {
            const res = await getRandomBusinessContent(1, 0, {
              userId: queryUserId,
              language: selectedLanguage,
              productId: selectedCategoryId,
            });

            const content = res?.data?.content || "";

            if (!content || isEmpty(content)) {
              message.warning(t("noMoreContent", sourceKey.user) || "No more content available");
              setLoading(false);
              return;
            }

            setSelectedImage(res?.data?.content?.imageUrls);
            setSelectedRecord(res?.data?.content);

            await prepareImagesForSharing(res?.data?.content?.imageUrls);
          } catch (e) {
            console.error("Shuffle failed", e);
            message.error(e?.message || t("failedToLoadContent", sourceKey.user) || "Failed to load content");
          } finally {
            setLoading(false);
          }
        }}
        confirmBtn1={async () => {
          const platform = selectedPlatform || (platformList && platformList[0]);
          const type = platform?.type || "";
          if (type === PLATFORM_TYPE.OTHER) {
            if (navigator.share) {
              try {
                // const contentText = selectedRecord?.contentText || selectedRecord?.text || '';
                const formatContent = formatShareContent(selectedRecord);
                setFormatContent(formatContent);
                // console.log("formatContent to share:", formatContent);
                await navigator.clipboard.writeText(formatContent);
                let shareSuccess = false;

                if (preparedImageFiles && preparedImageFiles.length > 0) {
                  try {
                    const shareData = {
                      files: preparedImageFiles,
                      text: formatContent,
                    };
                    await navigator.share(shareData);
                    shareSuccess = true;
                  } catch (fileShareErr) {
                    console.log(
                      "File share failed, falling back to text:",
                      fileShareErr
                    );
                  }
                }

                if (!shareSuccess) {
                  const shareDataTextOnly = {
                    text: formatContent,
                  };
                  await navigator.share(shareDataTextOnly);
                  shareSuccess = true;
                }

                if (!shareSuccess) {
                  throw new Error("Share failed");
                }
              } catch (err) {
                if (err.name !== "AbortError") {
                  try {
                    await navigator.clipboard.writeText(formatContent);
                  } catch (clipErr) {
                    console.error("Clipboard fallback failed:", clipErr);
                  }
                }
              }
            } else {
              try {
                await navigator.clipboard.writeText(
                  selectedRecord?.contentText || selectedRecord?.text || ""
                );
              } catch (clipErr) {
                console.error("Clipboard fallback failed:", clipErr);
              }
            }
          } else if (type === PLATFORM_TYPE.URL) {
            try {
              await navigator.clipboard.writeText(
                selectedRecord?.contentText || ""
              );
              message.success(
                t("copiedToClipboard", sourceKey.user) || "Copied"
              );
            } catch (e) {
              console.error("clipboard write failed", e);
              message.error(t("copyFailed", sourceKey.user) || "Copy failed");
            }
            const url = platform?.url;

            if (url) {
              try {
                let finalUrl = url;
                if (!/^https?:\/\//i.test(finalUrl)) {
                  finalUrl = "https://" + finalUrl;
                }
                window.open(finalUrl, "_blank");
              } catch (e) {
                console.error("open url failed", e);
              }
            }
          }
          setShareContentModalOpen(false);
          setsuccessfulShareOpen(true);
          handleShareClick();
        }}
      />

      {/* Successful Share Modal */}
      <SinglePopUpModal
        type="successfulShare"
        open={succesfulShareOpen}
        height={"auto"}
        closeable={false}
        confirmBtn1={() => {
          setsuccessfulShareOpen(false);
          window.location.href = "https://itscreative.biz/ishare";
        }}
        confirmBtn2={() => {
          // console.log(selectedImage)
          // const imageUrls = selectedImage?.map(img => img?.url || img) || [];

          getContent(
            queryUserId,
            selectedLanguage,
            selectedRecord?._id,
            selectedImage
          );
          setViewContentAgainOpen(true);
          setsuccessfulShareOpen(false);
        }}
      />

      {/* Content Not Found Modal */}
      <SinglePopUpModal
        type="contentNotFound"
        open={contentNotFoundOpen}
        height={"auto"}
        onClose={() => {
          setContentNotFoundOpen(false);
        }}
        closeable={true}
        confirmBtn1={() => {
          setContentNotFoundOpen(false);
          window.location.href = "https://itscreative.biz/ishare";
        }}
      />

      <SinglePopUpModal
        type="expiredShare"
        open={expiredModalOpen}
        closeable={false}
        onClose={() => setExpiredModalOpen(false)}
        confirmBtn1={() => {
          setExpiredModalOpen(false);
          if (window.opener) {
            window.close();
          } else {
            window.location.href = "https://itscreative.biz/ishare";
          }
        }}
      />

      {/* View Content Again Modal */}
      <SinglePopUpModal
        type="viewContentAgain"
        open={viewContentAgainOpen}
        height={"auto"}
        closeable={false}
        extraData={{
          selectedRecord: selectedContent,
          previewImage: selectedContent?.imageUrls,
        }}
        confirmBtn1={async () => {
          const platform = selectedPlatform || (platformList && platformList[0]);
          const type = platform?.type || "";
          if (type === PLATFORM_TYPE.OTHER) {
            const formatContent = formatShareContent(selectedContent);
            setParsedContentText(formatContent);
            if (navigator.share) {
              try {
                await navigator.clipboard.writeText(parsedContentText || "");
                let shareSuccess = false;

                if (preparedImageFiles && preparedImageFiles.length > 0) {
                  try {
                    const shareData = {
                      files: preparedImageFiles,
                      text: parsedContentText,
                    };
                    await navigator.share(shareData);
                    shareSuccess = true;
                  } catch (fileShareErr) {
                    console.log(
                      "File share failed, falling back to text:",
                      fileShareErr
                    );
                  }
                }

                if (!shareSuccess) {
                  const shareDataTextOnly = {
                    text: parsedContentText,
                  };
                  await navigator.share(shareDataTextOnly);
                  shareSuccess = true;
                }

                if (!shareSuccess) {
                  throw new Error("Share failed");
                }
              } catch (err) {
                if (err.name !== "AbortError") {
                  // Handle error silently
                }
              }
            } else {
              try {
                await navigator.clipboard.writeText(parsedContentText || "");
              } catch (clipErr) {
                console.error("Clipboard fallback failed:", clipErr);
              }
            }
          } else if (type === PLATFORM_TYPE.URL) {
            console.log("selectedContent:", selectedContent?.contentText);
            try {
              await navigator.clipboard.writeText(
                selectedContent?.contentText || ""
              );
              message.success(
                t("copiedToClipboard", sourceKey.user) || "Copied"
              );
            } catch (e) {
              console.error("clipboard write failed", e);
              message.error(t("copyFailed", sourceKey.user) || "Copy failed");
            }
            const url = platform?.url;

            if (url) {
              try {
                let finalUrl = url;
                if (!/^https?:\/\//i.test(finalUrl)) {
                  finalUrl = "https://" + finalUrl;
                }
                window.open(finalUrl, "_blank");
              } catch (e) {
                console.error("open url failed", e);
              }
            }
          }
          setViewContentAgainOpen(false);
          setsuccessfulShareOpen(true);
        }}
      />

      {/* Header Section with Logo */}
      <div
        style={{
          height: 150,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
        }}
      >
        {/* Background Picture */}
        <img
          src={backgroundPicture || Background}
          alt="Header background"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />
        {/* Darken Background Picture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.35) 100%)",
            zIndex: 1,
          }}
        />
        {/* Language Dropdown */}
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 3 }}>
          <Dropdown
            overlay={languageMenu}
            trigger={["click"]}
            open={langOpen}
            onOpenChange={setLangOpen}
            placement="bottomRight"
          >
            <Button variant="white" width={32} height={32}>
              <img src={TransalationIcon2} alt="Language" />
            </Button>
          </Dropdown>
        </div>

        <div>
          {/* Logo */}
          <img
            src={profilePicture || ShareAi}
            alt="Goodnite"
            style={{
              height: 120,
              width: 120,
              borderRadius: "100%",
              position: "absolute",
              left: "50%",
              top: "100%",
              transform: "translate(-50%, -50%)",
              zIndex: 3,
            }}
          />
        </div>
      </div>

      <Spin
        spinning={loading || platformsFetchState === "loading"}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
        }}
      >
        <div className="py-10 px-3 flex flex-col items-center w-full">
          <div className="w-screen max-w-full px-0 flex flex-col items-center">
            <div className="pt-5 w-full">
              {platformsFetchState !== "ready" ? (
                <div className="text-center text-gray-500 py-10">
                  {t("loading", sourceKey.user) || "Loading..."}
                </div>
              ) : isEmpty(platformList) ? (
                <div className="text-center text-gray-500 py-10">
                  {t("noAvailableContent", sourceKey.user)}
                </div>
              ) : (
                <SharePlatformListV2
                  platforms={platformList}
                  onShareClick={(platform) =>
                    handlePlatformShare(
                      platform.name,
                      selectedLanguage,
                      selectedCategoryId
                    )
                  }
                  loading={loading}
                />
              )}
            </div>
          </div>
        </div>
      </Spin>
    </>
  );
};

export default ShareSectionMainPageV2;
