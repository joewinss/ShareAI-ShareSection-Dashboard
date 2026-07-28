import React, { useState, useEffect, useRef } from "react";
import { useRouter, withRouter } from "next/router";
import { Dropdown, message } from "antd";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MoreOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import ListingTable from "@/components/general/components/ListingTable";
import getOutletListingsByMasterHQ from "@/pages/api/user/getOutletListingsByMasterHQ";
import getUserPlatforms from '@/pages/api/platforms/getUserPlatforms';
import OutletDrawer from "../components/OutletDrawer";
import { USER_STATUS } from "@/constants/user";
import { ActiveGreenIcon, PendingBlackIcon } from "../../../../public/assets";
import updateOutletStatus from "@/pages/api/user/updateOutletStatus";
import SinglePopUpModal from "@/components/general/popUp/SinglePopUpModal";
import { formatDate } from "@/utility/common-functions";
import { inputTypes } from "@/utility/config";
import EditOutletCompanyProfileDrawer from "../components/EditOutletCompanyProfileDrawer";
import ViewOutletProfileDrawer from "../components/ViewOutletProfileDrawer";
import OutletQRTemplateCard from "../components/OutletQRTemplateCard";
import EditExpiredDateDrawer from "../components/EditExpiredDateDrawer";
import { PLATFORM_STATUS } from "@/constant/template";
import getPictureByUserId from "@/pages/api/user/getPictureByUserId";
import OutletDetailsDrawer from "../components/OutletDetailsDrawer";

const OutletListingPage = (user) => {
  const { t } = useTranslation();
  const [filterGroup, setFilterGroup] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [outletDrawerOpen, setOutletDrawerOpen] = useState(false);
  const [editProfileDrawer, setEditProfileDrawer] = useState(false);
  const [viewProfileDrawer, setViewProfileDrawer] = useState(false);
  const [suspendedOutletModalOpen, setSuspendedOutletModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [type, setType] = useState("");
  const [qrCodeDrawerOpen, setQrCodeDrawerOpen] = useState(false);
  const [qrIconUrl, setQrIconUrl] = useState("");
  const qrTemplateRef = useRef(null);
  const [reactivatedOutletModalOpen, setReactivatedOutletModalOpen] = useState(false);
  const [expiredDateDrawerOpen, setExpiredDateDrawerOpen] = useState(false);
  const [deleteOutletModalOpen, setDeleteUserModalOpen] = useState(false);

  const PAGE_SIZE = 10;
  const MODAL_Z_INDEX = 1401;
  const router = useRouter();

  const handleCloseEditProfileDrawer = () => {
    setEditProfileDrawer(false);
    setType("");
  };

  const columns = [
    // {
    //     title: t("username", sourceKey.user),
    //     dataIndex: 'username',
    //     filterable: true,
    //     key: 'username',
    //     fixed: "left",
    //     render: (text, record, index) => (
    //         text
    //     ),
    // },
    {
      title: t("businessName", sourceKey.user) + t("enSlashBm", sourceKey.user),
      dataIndex: "businessName",
      filterable: true,
      key: "businessInfo.businessName",
      render: (text, record, index) => (
        <div
          className=" flex flex-center cursor-pointer blue-text"
          onClick={() => {
            setViewProfileDrawer(true);
            setSelectedRecord(record);
          }}
        >
          {record?.businessInfo?.businessName
            ? record?.businessInfo?.businessName
            : "-"}
        </div>
      ),
    },
    {
      title: t("businessNameCn", sourceKey.user),
      dataIndex: "businessNameCn",
      filterable: true,
      key: "businessInfo.businessNameCn",
      render: (text, record, index) => (
        <div
          className=" flex flex-center"
          // onClick={() => {
          //   setViewProfileDrawer(true);
          //   setSelectedRecord(record);
          // }}
        >
          {record?.businessInfo?.businessNameCn
            ? record?.businessInfo?.businessNameCn
            : record?.businessInfo?.businessName}
        </div>
      ),
    },
    {
      title: t("email", sourceKey.user),
      dataIndex: "businessInfo.businessEmail",
      filterable: true,
      key: "businessInfo.businessEmail",
      render: (text, record, index) => record?.businessInfo.businessEmail,
    },
    {
      title: t("status", sourceKey.user),
      dataIndex: "status",
      filterable: true,
      key: "status",
      type: inputTypes.dropdown,
      selections: [
        { title: t("active", sourceKey.user), value: USER_STATUS.ACTIVE },
        { title: t("inactive", sourceKey.user), value: USER_STATUS.INACTIVE },
        { title: t("suspended", sourceKey.user), value: USER_STATUS.SUSPENDED },
      ],
      render: (text, record, index) => {
        let content = null;
        switch (text) {
          case USER_STATUS.ACTIVE:
            content = (
              <div className="flex items-center">
                <img src={ActiveGreenIcon} style={{ marginRight: 5 }} />
                <div className="flex flex-col">
                  <div>{t("active", sourceKey.user)}</div>
                  <div className="xsmall-text-size grey-second-text">{`${t(
                    "createdOn",
                    sourceKey.user
                  )} ${formatDate(
                    record?.createdAt,
                    "D MMM YYYY HH:mm:ss"
                  )}`}</div>
                </div>
              </div>
            );
            break;
          case USER_STATUS.SUSPENDED:
            content = (
              <div className="flex items-center">
                <img src={PendingBlackIcon} style={{ marginRight: 5 }} />
                <div className="flex flex-col">
                  <div>{t("suspended", sourceKey.user)}</div>
                </div>
              </div>
            );
            break;
          case USER_STATUS.INACTIVE:
            content = (
              <div className="flex items-center">
                <img src={PendingBlackIcon} style={{ marginRight: 5 }} />
                <div className="flex flex-col">
                  <div>{t("inactive", sourceKey.user)}</div>
                  <div className="xsmall-text-size grey-second-text">{`${t(
                    "createdOn",
                    sourceKey.user
                  )} ${formatDate(
                    record?.createdAt,
                    "D MMM YYYY HH:mm:ss"
                  )}`}</div>
                </div>
              </div>
            );
            break;
          default:
            content = <span>{text}</span>;
            break;
        }
        return content;
      },
    },
    {
      title: t("createdAt", sourceKey.user),
      dataIndex: "createdAt",
      filterable: true,
      displayable: false,
      key: "createdAt",
      type: inputTypes.dateRange,
      render: (text, record, index) => text,
    },

    {
      title: "",
      dataIndex: "action",
      key: "action",
      render: (text, record) => {
        const menuItems =
          record.status === USER_STATUS.ACTIVE
            ? [
              {
                key: "editPlatformSettings",
                label: (
                  <div
                    className=" flex flex-center cursor-pointer"
                    onClick={() => {
                      //navigate to edit platform settings page
                      router.push({
                        pathname: `/settings/platform-listing`,
                        query: { userId: record._id },
                      });
                      setSelectedRecord(record);
                    }}
                  >
                    {t("editPlatformSettings", sourceKey.user)}
                  </div>
                ),
              },
              {
                key: "editOutletProfile",
                label: (
                  <div
                    className=" flex flex-center cursor-pointer"
                    onClick={() => {
                      setEditProfileDrawer(true);
                      setSelectedRecord(record);
                      setType("edit");
                    }}
                  >
                    {t("editProfile", sourceKey.user)}
                  </div>
                ),
              },
              // {
              //   key: "editOutletCredit",
              //   label: (
              //     <div
              //       className=" flex flex-center cursor-pointer"
              //       onClick={() => {
              //         setEditProfileDrawer(true);
              //         setSelectedRecord(record);
              //         setType("credit");
              //       }}
              //     >
              //       {t("editCredit", sourceKey.user)}
              //     </div>
              //   ),
              // },
              {
                key: "editExpiredDate",
                label: (
                  <div
                    className=" flex flex-center cursor-pointer"
                    onClick={() => {
                      setExpiredDateDrawerOpen(true);
                      setSelectedRecord(record);
                    }}
                  >
                    {t("nTeditProfileSetting", sourceKey.user)}
                  </div>
                ),
              },
              {
                key: "outletQRCode",
                label: (
                  <div
                    className=" flex flex-center cursor-pointer"
                    onClick={async () => {
                      // Check user platforms first: block if none configured or any inactive
                      try {
                        const res = await getUserPlatforms("all", 0, { userId: record._id });
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
                      setSelectedRecord(record);
                    }}
                  >
                    {t("outletQrCode", sourceKey.user)}
                  </div>
                ),
              },
              {
                key: "manageLuckyDraw",
                label: (
                  <div
                    className=" flex flex-center cursor-pointer"
                    onClick={() => {
                      router.push({
                        pathname: "/lucky-draw/merchant",
                        query: { tab: "settings", userId: record._id },
                      });
                    }}
                  >
                    {t("manageLuckyDraw", sourceKey.user)}
                  </div>
                ),
              },
              // {
              //   key: "suspendActivateOutlet",
              //   label: (
              //     <div
              //       className=" flex flex-center cursor-pointer"
              //       onClick={() => {
              //         setSuspendedOutletModalOpen(true);
              //         setSelectedRecord(record);
              //       }}
              //     >
              //       {t("suspendOutlet", sourceKey.user)}
              //     </div>
              //   ),
              // },
              // {
              //   key: "deleteOutlet",
              //   label: (
              //     <div
              //       className=" flex flex-center cursor-pointer"
              //       onClick={() => {
              //         setDeleteUserModalOpen(true);
              //         setSelectedRecord(record);
              //       }}
              //     >
              //       {t("nTdeleteOutlet", sourceKey.user)}
              //     </div>
              //   ),
              // },
            ]
            : record.status === USER_STATUS.SUSPENDED
              ? [
                {
                  key: "reactivateOutlet",
                  label: (
                    <div
                      className=" flex flex-center cursor-pointer"
                      onClick={() => {
                        setReactivatedOutletModalOpen(true);
                        setSelectedRecord(record);
                      }}
                    >
                      {t("reactivateOutlet", sourceKey.user)}
                    </div>
                  ),
                },
              ]
              : record.status === USER_STATUS.INACTIVE
                ? [
                  {
                    key: "completeOutletProfile",
                    label: (
                      <div
                        className=" flex flex-center cursor-pointer"
                        onClick={() => {
                          setEditProfileDrawer(true);
                          setSelectedRecord(record);
                          setType("complete");
                        }}
                      >
                        {t("completeProfile", sourceKey.user)}
                      </div>
                    ),
                  },
                  {
                    key: "suspendActivateOutlet",
                    label: (
                      <div
                        className=" flex flex-center cursor-pointer"
                        onClick={() => {
                          setSuspendedOutletModalOpen(true);
                          setSelectedRecord(record);
                        }}
                      >
                        {t("suspendOutlet", sourceKey.user)}
                      </div>
                    ),
                  },
                ]
                : [];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <MoreOutlined style={{ fontSize: "20px", cursor: "pointer" }} />
          </Dropdown>
        );
      },
    },
  ];

  useEffect(() => {
    getData((page - 1) * PAGE_SIZE);
  }, [page, filterGroup]);

  useEffect(() => {
    let isActive = true;
    if (!qrCodeDrawerOpen || !selectedRecord?._id) {
      setQrIconUrl("");
      return () => {
        isActive = false;
      };
    }

    setQrIconUrl(selectedRecord?.businessInfo?.profilePictureUrl || "");
    getPictureByUserId(0, 0, { userId: selectedRecord._id })
      .then((res) => {
        if (!isActive) return;
        setQrIconUrl(res?.data?.businessInfo?.profilePictureUrl || "");
      })
      .catch((err) => {
        if (!isActive) return;
        console.error("getPictureByUserId failed", err);
        setQrIconUrl("");
      });

    return () => {
      isActive = false;
    };
  }, [qrCodeDrawerOpen, selectedRecord?._id]);

  function getData(skip) {
    setLoading(true);

    if (isNaN(parseInt(skip))) {
      skip = 0;
    } else {
      skip = parseInt(skip);
    }

    const filterParams = {
      statusNe: USER_STATUS.DELETED,
      ...filterGroup,
    };

    getOutletListingsByMasterHQ(PAGE_SIZE, skip, filterParams)
      .then((res) => {
        setDataSource(res?.data);
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

  async function downloadQrCode() {
    const businessName =
      selectedRecord?.businessInfo?.businessName?.trim() || "qrcode";
    const safeFileName = businessName.replace(/[^\w.-]+/g, "_");
    const downloadName = `${safeFileName}.png`;

    if (qrTemplateRef.current && selectedRecord) {
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

  const handleUpdateOutletStatus = async (record, status) => {
    try {
      setLoading(true);
      const response = await updateOutletStatus({
        userId: record._id,
        status: status,
      });
      if (response?.data?.success) {
        message.success(t("statusUpdated", sourceKey.user));
        getData((page - 1) * PAGE_SIZE); // Refresh data
        if (status === USER_STATUS.SUSPENDED || status === USER_STATUS.DELETED) {
          setEditProfileDrawer(false);
          setType("");
        }
      }
    } catch (error) {
      console.error("Error updating content status:", error);
      message.error(error?.message || "Error updating content status");
    } finally {
      setLoading(false);
      if (status === USER_STATUS.ACTIVE) {
        setReactivatedOutletModalOpen(false);
      } else if (status === USER_STATUS.SUSPENDED) {
        setSuspendedOutletModalOpen(false);
      } else if (status === USER_STATUS.DELETED) {
        setDeleteUserModalOpen(false);
      }
      setSelectedRecord(null);
    }
  };

  async function onRefresh() {
    setPage(1);
    if (page !== 1) {
      getData((page - 1) * PAGE_SIZE);
    } else {
      getData(0);
    }
  }

  const listingActions = [
    {
      value: "createOutlet",
      render: () => (
        <div className="">
          <Button className="ant-btn-default bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            {t("createNewOutlet", sourceKey.user)}
          </Button>
        </div>
      ),
      exec: () => {
        setOutletDrawerOpen(true);
      },
    },
  ];

  const qrHeadline = t("outletQrHeadline", sourceKey.user);
  const baseOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  const qrShareLink =
    selectedRecord && baseOrigin
      ? `${baseOrigin}/shareSection?userId=${selectedRecord?._id}${selectedRecord?.expiredAt ? `&expiredDate=${selectedRecord.expiredAt}` : ""}`
      : baseOrigin
        ? `${baseOrigin}/shareSection`
        : "";
  const resolvedQrIconUrl =
    qrIconUrl || selectedRecord?.businessInfo?.profilePictureUrl || "";
  const qrData = {
    link: qrShareLink,
    businessName: selectedRecord?.businessInfo?.businessName,
    profilePictureUrl: resolvedQrIconUrl,
  };

  return (
    <>
      <div className="mb-5 flex flex-row justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900">
            {t("outletListing", sourceKey.user)}
          </h1>
          <span className="text-gray-600 mt-1">
            {t("outletListingDesc", sourceKey.user)}
          </span>
        </div>
      </div>
      <div className="">
        <ListingTable
          columns={columns}
          dataSource={dataSource}
          setPage={setPage}
          total={total}
          page={page}
          loading={loading}
          listingActions={listingActions}
          PAGE_SIZE={PAGE_SIZE}
          onRefresh={onRefresh}
          filterTag={true}
          filterGroup={filterGroup}
          setFilterGroup={setFilterGroup}
          onFilter={(filter) => {
            setFilterGroup({
              ...filter,
            });
          }}
        // onExport={onExport}
        />
      </div>

      <OutletDetailsDrawer
        open={editProfileDrawer && (type === "edit" || type === "credit")}
        onClose={handleCloseEditProfileDrawer}
        onRefreshData={onRefresh}
        onSuspendOutlet={() => setSuspendedOutletModalOpen(true)}
        onDeleteOutlet={() => setDeleteUserModalOpen(true)}
        selectedRecord={selectedRecord}
        tab={type === "credit" ? "credit" : "profile"}
      />

      <EditOutletCompanyProfileDrawer
        open={editProfileDrawer && type === "complete"}
        onClose={handleCloseEditProfileDrawer}
        onRefreshData={onRefresh}
        extraData={selectedRecord}
        type={type}
      />
      <ViewOutletProfileDrawer
        open={viewProfileDrawer}
        onClose={() => setViewProfileDrawer(false)}
        record={selectedRecord}
      />

      <OutletDrawer
        open={outletDrawerOpen}
        onClose={() => setOutletDrawerOpen(false)}
        onRefreshData={onRefresh}
      />


      {selectedRecord && qrShareLink && (
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
            mode={selectedRecord?.createdBy?.qrType === 2 ? "mtpn" : "default"}
            ref={qrTemplateRef}
            businessName={selectedRecord?.businessInfo?.businessName || "-"}
            qrValue={qrShareLink}
            headline={qrHeadline}
            qrIcon={resolvedQrIconUrl}
          />
        </div>
      )}

      <SinglePopUpModal
        open={suspendedOutletModalOpen}
        type={"suspendOutlet"}
        closeable={true}
        extraData={selectedRecord}
        zIndex={MODAL_Z_INDEX}
        onClose={() => {
          setSuspendedOutletModalOpen(false);
          if (!editProfileDrawer) {
            setSelectedRecord(null);
          }
        }}
        confirmBtn1={() =>
          handleUpdateOutletStatus(selectedRecord, USER_STATUS.SUSPENDED)
        }
      />
      <SinglePopUpModal
        open={qrCodeDrawerOpen}
        type={"qrCode"}
        height={"auto"}
        extraData={qrData}
        closeable={true}
        onClose={() => setQrCodeDrawerOpen(false)}
        confirmBtn1={downloadQrCode}
      />

      <SinglePopUpModal
        open={reactivatedOutletModalOpen}
        type={"reactivateOutlet"}
        closeable={true}
        extraData={selectedRecord}
        onClose={() => {
          setReactivatedOutletModalOpen(false);
          setSelectedRecord(null);
        }}
        confirmBtn1={() =>
          handleUpdateOutletStatus(selectedRecord, USER_STATUS.ACTIVE)
        }
      />

      <SinglePopUpModal
        open={deleteOutletModalOpen}
        type={"deleteOutlet"}
        closeable={true}
        extraData={selectedRecord}
        zIndex={MODAL_Z_INDEX}
        onClose={() => {
          setDeleteUserModalOpen(false);
          if (!editProfileDrawer) {
            setSelectedRecord(null);
          }
        }}
        confirmBtn1={() =>
          handleUpdateOutletStatus(selectedRecord, USER_STATUS.DELETED)
        }
      />

      <EditExpiredDateDrawer
        open={expiredDateDrawerOpen}
        onClose={() => setExpiredDateDrawerOpen(false)}
        onRefreshData={onRefresh}
        selectedRecord={selectedRecord}
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});
const mapDispatchToProps = {};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(OutletListingPage));


