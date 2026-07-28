import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Share2,
  Users,
  FileText,
  Facebook,
  Instagram,
  MessageCircle,
  Music,
  Trash,
  QrCodeIcon,
  MoreHorizontal,
  Eye,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Col,
  Dropdown,
  Input,
  message,
  Pagination,
  Row,
  Switch,
  Tabs,
  Tag,
} from "antd";
import { useTranslation } from "@/locales/useTranslation";
import {
  facebook,
  FilterIcon,
  GoogleReview,
  imageExample,
  instagram,
  OthersIcon,
  redNote,
} from "../../../../public/assets/index";
import ViewContentDrawer from "@/templates/ViewContentDrawer";
import {
  FilterOutlined,
  SearchOutlined,
  SwapOutlined,
  MoreOutlined,
  CheckOutlined,
  CloseOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { sourceKey } from "@/locales/config";
import EditContentDrawer from "../components/EditContentDrawer";
import SinglePopUpModal from "@/components/general/popUp/SinglePopUpModal";
import ImageSection from "@/components/general/components/ImageSection";
import getGeneratedContent from "@/pages/api/contentGeneration/getGeneratedContent";
import { connect } from "react-redux";
import { CONTENT_STATUS, PLATFORM_STATUS } from "@/constant/template";
import { renderStatusTag } from "@/utility/content-function";
import editContentStatus from "@/pages/api/contentGeneration/editContentStatus";
import ContentCardSection from "../components/ContentCardSection";
import getOutletListingsByMasterHQ from "@/pages/api/user/getOutletListingsByMasterHQ";
import { PRESET_STATUS, USER_STATUS } from "@/constants/user";
import { inputTypes } from "@/utility/config";
import FilterTags from "@/components/general/components/FilterTags";
import FilterDrawerV2 from "@/components/general/components/FilterDrawerV2";
import OutletQRTemplateCard from "@/components/hq/components/OutletQRTemplateCard";
import QuotaSummaryBar from "@/components/general/components/QuotaSummaryBar";
import { useStats } from "@/hooks/useStatsInfo";
import { replaceStringPattern } from "@/utility/common-functions";
import getPresetContent from "@/pages/api/contentPreset/getPresetContent";
import useIsCollapsed from "@/components/useIsCollapsed";
import getUserPlatforms from "@/pages/api/platforms/getUserPlatforms";
import getCategory from "@/pages/api/category/getCategory";
import { mapOutletOptions } from "@/utility/option-mappers";
import { useRefreshCreditBalance } from "@/hooks/useCreditBalance";

export const BinPage = (props) => {
  const { t } = useTranslation();
  const { user } = props;
  const [currentTab, setCurrentTab] = useState("googleReview");
  const [currentPage, setCurrentPage] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterGroup, setFilterGroup] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiTemplates, setApiTemplates] = useState(null);
  const [allContent, setAllContent] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 10;
  const [qrCodeDrawerOpen, setQrCodeDrawerOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { defaultTab } = router.query;
  const [viewContentDrawerOpen, setViewContentDrawerOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const userIdentity = user?.role;
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [outletOption, setOutletOption] = useState([]);
  const qrTemplateRef = useRef(null);
  const [statsRecord, setStatsRecord] = useState(null);
  const [presetTemplatesOption, setPresetTemplatesOption] = useState([]);
  // const isMtpn = user?.createdBy?.qrType === 2
  const isMtpn = user?.qrType === 2
  const isCollapsed = useIsCollapsed();
  const expiredAt = user?.expiredAt;
  const isExpired = expiredAt ? new Date(expiredAt).getTime() < Date.now() : false;
  const expiredDateStr = expiredAt ? new Date(expiredAt).toLocaleString() : null;
  const contentPermission = user?.contentPermission
  const hasAuthority = userIdentity === "masterHQ" || contentPermission === 1;
  const [categoryOption, setCategoryOption] = useState([]);
  const refreshCreditBalance = useRefreshCreditBalance();
  useEffect(() => {
    // if (!filterGroup.platform) return;
    getData((page - 1) * PAGE_SIZE);
  }, [page, filterGroup]);

  useEffect(() => {
    if (filterDrawerVisible && userIdentity === "masterHQ" && outletOption.length === 0) {
      loadOutletOption();
    }
    if (filterDrawerVisible) {
      loadPresetTemplates()
      loadCategoryOptions()
    }
  }, [filterDrawerVisible]);

  const loadOutletOption = async () => {
    try {
      const response = await getOutletListingsByMasterHQ("all", 0, {
        status: USER_STATUS.ACTIVE,
        sort: JSON.stringify({ "businessInfo.businessName": 1 }),
      });
      if (response?.success && response?.data) {
        setOutletOption(mapOutletOptions(response?.data));
      } else {
        // console.log("No outlet data in response");
        setOutletOption([]);
      }
    } catch (error) {
      console.error("Error loading outlet options:", error);
      setOutletOption([]);
    }
  };

  const loadPresetTemplates = async () => {
    try {
      const response = await getPresetContent("all", 0, {
        statusNe: PRESET_STATUS.DELETED,
      });
      if (response?.success && response?.data) {
        const options = response?.data?.map((preset) => ({
          title: preset?.productName,
          value: preset.productId,
        }));
        setPresetTemplatesOption(options);
      } else {
        setPresetTemplatesOption([]);
      }
    } catch (error) {
      console.error(error.message);
      setPresetTemplatesOption([]);
    }
  };

  const loadCategoryOptions = async () => {
    try {
      const response = await getCategory("all", 0, {
        status: CONTENT_STATUS.ACTIVE,
      });
      if (response?.data) {
        const options = response?.data?.map((category) => ({
          title: category.title,
          value: category._id,
        }));
        setCategoryOption(options);
      }
    } catch (error) {
      console.error("Error loading category options:", error);
    }
  };

  const statsQuery = useMemo(() => ({
    status: CONTENT_STATUS?.ARCHIVED,
    ...(userIdentity === "outlet" ? { outletUserId: user?._id } : {}),
    ...filterGroup,
  }), [filterGroup, user?._id, userIdentity]);

  const { data: statsData } = useStats({
    poll: true,
    intervalMs: 60000,
    enabled: true,
    refetchOnMount: 'always',
    query: statsQuery,
    scopeKey: "bin",
  });

  useEffect(() => {
    setStatsRecord(statsData?.data || null);
  }, [statsData]);

  function getData(skip) {
    setLoading(true);

    if (isNaN(parseInt(skip))) {
      skip = 0;
    } else {
      skip = parseInt(skip);
    }

    getGeneratedContent(PAGE_SIZE, skip, statsQuery)
      .then((res) => {
        setAllContent(res?.data);
        setTotal(res?.total);
      })
      .catch((err) => {
        console.log(err);
        message.error(err?.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const handleEditContentStatus = async (contentId, action) => {
    try {
      setLoading(true);
      const response = await editContentStatus({
        contentId: contentId,
        action: action,
      });
      if (response?.data?.success) {
        message.success(t("contentStatusUpdated", sourceKey.user));
        // if (filterGroup.platform) {
        getData((page - 1) * PAGE_SIZE); // Refresh data
        // }
      }
    } catch (error) {
      console.error("Error updating content status:", error);
      message.error(error?.message || "Error updating content status");
    } finally {
      setLoading(false);
      refreshCreditBalance();
      if (action === "restore") {
        setRestoreModalOpen(false);
      }
      setSelectedContent(null);
    }
  };

  const tabItems = [
    {
      label: (
        <div className="flex items-center">
          <img src={GoogleReview} className="tab-icon" alt="Google Review" />
          <span>{t("googleReview", sourceKey.user)}</span>
        </div>
      ),
      key: "googleReview",
    },
    {
      label: (
        <div className="flex items-center">
          <img src={OthersIcon} className="tab-icon" alt="Others" />
          <span>{t("others", sourceKey.user)}</span>
        </div>
      ),
      key: "others",
    },
  ];

  // Define filter options - only show outlet filter for masterHQ
  const filterOptions = [
    {
      title: t("productName", sourceKey.user),
      dataIndex: "productName",
      filterable: true,
      placeholder: t("productName", sourceKey.user) || "Search content text...",
    },
    {
      title: t("nTlanguage", sourceKey.user),
      dataIndex: "language",
      filterable: true,
      type: inputTypes.dropdown,
      selections: [
        { title: t("nTenglish", sourceKey.user), value: "english" },
        { title: t("nTmalay", sourceKey.user), value: "malay" },
        { title: t("nTchinese", sourceKey.user), value: "chinese" },
      ],
      placeholder: t("nTlanguage", sourceKey.user),
    },
    {
      title: t("nTpresetTemplate", sourceKey.user),
      dataIndex: "productId",
      filterable: true,
      type: inputTypes.dropdown,
      selections: presetTemplatesOption,
      placeholder: t("nTpresetTemplate", sourceKey.user),
    },
    {
      title: t("nTcategory", sourceKey.user),
      dataIndex: "categoryId",
      filterable: true,
      type: inputTypes.dropdown,
      selections: categoryOption,
      placeholder: t("nTcategory", sourceKey.user),
    },
    ...(userIdentity === "masterHQ"
      ? [
        {
          title: t("outlet", sourceKey.user),
          dataIndex: "outletUserId",
          filterable: true,
          type: inputTypes.dropdown,
          selections: outletOption,
          placeholder: t("selectOutlet", sourceKey.user) || "Select outlet",
        },
      ]
      : []),
    {
      title: t("createdAt", sourceKey.user),
      dataIndex: "createdAt",
      filterable: true,
      type: inputTypes.dateRange,
    },
  ];

  // const handleTabChange = (key) => {
  //   setCurrentTab(key);
  //   setPage(1);
  //   setFilterGroup({
  //     platform: key,
  //   });
  //   router.replace(
  //     {
  //       pathname: router.pathname,
  //       query: { ...router.query, defaultTab: key },
  //     },
  //     undefined,
  //     { shallow: true, scroll: false }
  //   );
  // };

  async function downloadQrCode() {
    const businessName =
      user?.businessInfo?.businessName?.trim() || user?.username || "qrcode";
    const safeFileName = businessName.replace(/[^\w.-]+/g, "_");
    const downloadName = `${safeFileName}.png`;

    if (qrTemplateRef.current) {
      try {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(qrTemplateRef.current, {
          useCORS: true,
          backgroundColor: null,
          scale: 2,
        });
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      } catch (error) {
        console.error("Failed to export QR template card", error);
      }
    }

    const qrModal = document.querySelector(".ant-modal-content");
    if (!qrModal) return;

    const canvas = qrModal.querySelector("canvas");
    const img = qrModal.querySelector("img");
    let url = null;
    if (canvas) {
      url = canvas.toDataURL("image/png");
    } else if (img) {
      url = img.src;
    }
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      message.error(
        t("qrCodeNotFound", sourceKey.user) || "QR code not found."
      );
    }
  }

  useEffect(() => {
    // if (!filterGroup.platform) return;
    const contentInterval = setInterval(() => {
      getData((page - 1) * PAGE_SIZE);
    }, 60000); // 1 minute

    return () => {
      clearInterval(contentInterval);
    };
  }, [page, filterGroup]);

  const qrHeadline = t("outletQrHeadline", sourceKey.user);
  const baseOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  const qrShareLink =
    user?._id && baseOrigin
      ? `${baseOrigin}/shareSection?userId=${user?._id}${user?.expiredAt ? `&expiredDate=${user.expiredAt}` : ""}`
      : baseOrigin
        ? `${baseOrigin}/shareSection`
        : "";
  const qrIconUrl = user?.businessInfo?.profilePictureUrl || "";

  return (
    <>
      <div className="live-bg p-3">
        <div className="mb-5 flex flex-row justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("bin", sourceKey.user)}
            </h1>
            <span className="text-gray-600 mt-1">
              {t("binDesc", sourceKey.user)}{" "}
              <span className="red-text font-bold">
                {t("binDesc1", sourceKey.user)}
              </span>
            </span>
          </div>
          <div></div>
        </div>
        {/* <Tabs
          type="card"
          onChange={handleTabChange}
          activeKey={String(currentTab)}
          tabBarStyle={{ marginBottom: 0 }}
          items={tabItems}
        /> */}

        <div className="min-h-screen bg-white from-slate-50 to-blue-50">
          <div className="max-w-full mx-auto">
            <Row align="middle" justify="space-between" className="p-3">
              <Col>
                {/* <div className="font-bold text-xl">
                  {currentTab === "googleReview"
                    ? `${t("googleReview", sourceKey.user)}`
                    : currentTab === "others"
                      ? `${t("others", sourceKey.user)}`
                      : `${t("platform", sourceKey.user)}`}
                </div> */}
              </Col>
              <Col>
                <Row align="middle" gutter={8}>
                  <Col>
                    {hasAuthority && (<Button
                      className="ant-btn-default"
                      onClick={() => {
                        router.push({
                          pathname: "/templates/multi-select",
                          query: {
                            pageType: "bin",
                            // platform: currentTab,
                            ...filterGroup // Pass current filters to multi-select page
                          },
                        });
                      }}
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      {t("nTmultiSelect", sourceKey.user) || "Multi - select"}
                    </Button>)}

                  </Col>
                  <Col>
                    <Link
                      href={{
                        pathname: "/templates/create",
                        // query: { currentTab: currentTab },
                      }}
                    >
                      <Button
                        className="ant-btn-default bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                        onClick={(e) => {
                          if (isExpired) {
                            e.preventDefault();
                            message.error(
                              t("nTsubscriptionExpired", sourceKey.user)
                            );
                          }
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t("createContent", sourceKey.user)}
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </Col>
            </Row>
            <div className="p-3">
              <div className="h-px w-full mb-3 bg-black/[0.02]"></div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 flex justify-between w-full"
              >
                <div
                  className="rounded-lg p-2 cursor-pointer hover:bg-gray-200 border"
                  onClick={() => setFilterDrawerVisible(true)}
                >
                  <div className='flex flex-row items-center gap-2'>
                    <img src={FilterIcon} style={{ width: "18px" }} />
                    <span>{t("nTfilter", sourceKey.user)}</span>
                  </div>
                </div>

                {userIdentity === "outlet" && (
                  <Button
                    className="black-btn rounded-lg hover:bg-gray-800"
                    onClick={async () => {
                      try {
                        const res = await getUserPlatforms("all", 0, { userId: user?._id });
                        const userPlatforms = res?.userPlatforms || [];
                        const active = userPlatforms.filter((p) => p?.status === PLATFORM_STATUS.ACTIVE);

                        if (!userPlatforms || userPlatforms.length === 0) {
                          message.error(t("nTnoPlatformsConfigured", sourceKey.user));
                          return;
                        }

                        if (active.length === 0) {
                          message.error(t("nTplatformsNotActive", sourceKey.user));
                          return;
                        }
                      } catch (err) {
                        console.error("getUserPlatforms failed", err);
                        message.error(err?.message);
                        return;
                      }
                      setQrCodeDrawerOpen(true);
                    }}
                  >
                    <QrCodeIcon className="w-4 h-4 mr-2" />
                    Get QR Code
                  </Button>
                )}
              </motion.div>

              {/* Render Active Filter Tags */}
              <FilterTags
                filterGroup={filterGroup}
                setFilterGroup={setFilterGroup}
                filterOptions={filterOptions}
                excludeFields={["platform"]}
                onFilterRemove={() => setPage(1)}
                onClearAll={() => setPage(1)}
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2"
              >
                {allContent?.map((template, index) => (
                  <ContentCardSection
                    key={template._id}
                    template={template}
                    index={index}
                    onPreviewClick={() => {
                      setViewContentDrawerOpen(true);
                      setSelectedContent(template);
                    }}
                    dropdownMenuItems={hasAuthority ? [
                      {
                        key: "restore",
                        label: (
                          <div
                            className="flex items-center cursor-pointer"
                            onClick={() => {
                              setSelectedContent(template);
                              setRestoreModalOpen(true);
                            }}
                          >
                            <RedoOutlined className="w-4 h-4 mr-2" />
                            {t("restore", sourceKey.user)}
                          </div>
                        ),
                      },
                    ] : []}
                    t={t}
                  />
                ))}
              </motion.div>

              {allContent?.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center py-12"
                >
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No templates found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ||
                      filterType !== "all" ||
                      filterPlatform !== "all"
                      ? "Try adjusting your search or filters"
                      : "Create your first template to get started"}
                  </p>
                  <Link
                    href={{
                      pathname: "/templates/create",
                      query: { currentTab: currentTab },
                    }}
                  >
                    <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                      onClick={(e) => {
                        if (isExpired) {
                          e.preventDefault();
                          message.error(
                            t("nTsubscriptionExpired", sourceKey.user)
                          );
                        }
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Template
                    </Button>
                  </Link>
                </motion.div>
              )}
              <div className="flex justify-end items-center mt-4">
                <Pagination
                  current={page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  showQuickJumper={true}
                  showSizeChanger={false}
                  // onChange={handlePageChange}
                  onChange={(page) => setPage(page)}
                  showTotal={
                    isCollapsed
                      ? undefined
                      : (total, range) =>
                        replaceStringPattern(t("nTpagination", sourceKey.user), {
                          range1: range[0],
                          range2: range[1],
                          total: total
                        })
                  }
                />
              </div>
              {allContent?.length != 0 && (
                <QuotaSummaryBar
                  remainingActive={statsRecord?.contentSummary?.totalArchived}
                  showEn={false}
                  showCn={false}
                  showMy={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {qrShareLink && (
        <div
          style={{
            position: "fixed",
            top: -10000,
            left: -10000,
            pointerEvents: "none",
            opacity: 0,
          }}
          aria-hidden="true"
        >
          <OutletQRTemplateCard
            mode={isMtpn ? "mtpn" : "default"}
            ref={qrTemplateRef}
            businessName={
              user?.businessInfo?.businessName || user?.username || "-"
            }
            qrValue={qrShareLink}
            headline={qrHeadline}
            description=""
            description2=""
            qrIcon={qrIconUrl}
          />
        </div>
      )}
      <SinglePopUpModal
        open={qrCodeDrawerOpen}
        type={"qrCode"}
        height={"auto"}
        extraData={{ link: qrShareLink || "", profilePictureUrl: qrIconUrl }}
        closeable={true}
        onClose={() => setQrCodeDrawerOpen(false)}
        confirmBtn1={downloadQrCode}
      />
      <ViewContentDrawer
        open={viewContentDrawerOpen}
        onClose={() => setViewContentDrawerOpen(false)}
        content={selectedContent}
        onSuccess={() => {
          setViewContentDrawerOpen(false);
          setSelectedContent(null);
          // if (filterGroup.platform) {
          getData((page - 1) * PAGE_SIZE);
          // }
        }}
      />

      <SinglePopUpModal
        open={restoreModalOpen}
        type={"restorePendingContent"}
        closeable={true}
        extraData={selectedContent}
        onClose={() => {
          setRestoreModalOpen(false);
          setSelectedContent(null);
        }}
        confirmBtn1={() =>
          handleEditContentStatus(selectedContent?._id, "restore")
        }
      />

      <FilterDrawerV2
        filterGroup={filterGroup}
        setFilterGroup={(value) => {
          setFilterGroup({
            ...filterGroup,
            ...value,
          });
          setPage(1);
        }}
        open={filterDrawerVisible}
        onClose={() => setFilterDrawerVisible(false)}
        dataSource={filterOptions}
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.user.user,
  // packages: state.packages.packages,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(BinPage);
