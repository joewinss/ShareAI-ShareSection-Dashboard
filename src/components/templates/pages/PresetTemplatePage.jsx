import React, { useState, useEffect } from "react";
import { useRouter, withRouter } from "next/router";
import {
  Col,
  Dropdown,
  Input,
  message,
  Pagination,
  Row,
  Spin,
  Switch,
  Tabs,
  Tag,
} from "antd";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ArrowUpOutlined, MoreOutlined, SettingOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import PresetTemplateDrawer from "../components/PresetTemplateDrawer";
import SinglePopUpModal from "@/components/general/popUp/SinglePopUpModal";
import ListingTable from "@/components/general/components/ListingTable";
import getPresetContent from "@/pages/api/contentPreset/getPresetContent";
import { PRESET_STATUS } from "@/constants/user";
import { ActiveGreenIcon, PendingGreyIcon } from "../../../../public/assets";
import { formatDate, formatDecimalNumber } from "@/utility/common-functions";
import editPresetContent from "@/pages/api/contentPreset/editPresetContent";
import { inputTypes } from "@/utility/config";
import SharedListDrawer from "@/components/knowledgeBase/components/SharedListDrawer";

const PresetTemplatePage = (props) => {
  const { t } = useTranslation();
  const [filterGroup, setFilterGroup] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [presetTemplateDrawerOpen, setPresetTemplateDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const PAGE_SIZE = 10;
  const router = useRouter();
  const { user } = props;
  const expiredAt = user?.expiredAt;
  const isExpired = expiredAt ? new Date(expiredAt).getTime() < Date.now() : false;
  const expiredDateStr = expiredAt ? new Date(expiredAt).toLocaleString() : null;
  const [sharedListDrawerOpen, setSharedListDrawerOpen] = useState(false);
  const role = user?.role;
  //open drawer if query param is present
  useEffect(() => {
    if (router.query.openDrawer === "1") {
      setPresetTemplateDrawerOpen(true);
    }
  }, [router.query.openDrawer]);

  async function handleDeleteTemplate(templateId) {
    setLoading(true);
    try {
      const response = await editPresetContent({
        presetId: templateId,
        status: PRESET_STATUS.DELETED,
      });
      if (response) {
        message.success(response?.data?.message);
      }
    } catch (err) {
      message.error(err.err?.message);
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setSelectedRecord(null);
      onRefresh();
    }
  }

  const columns = [
    {
      title: t("presetName", sourceKey.user),
      dataIndex: "presetName",
      filterable: true,
      key: "presetName",
      fixed: "left",
      render: (text, record, index) => text,
    },
    {
      title: t("nTproductName", sourceKey.user),
      dataIndex: "productName",
      filterable: true,
      key: "productName",
      render: (text, record, index) => text,
    },

    ...(role === 'masterHQ' ? [{
      title: t("nTsharedUnit", sourceKey.user),
      dataIndex: "shareUnit",
      key: "shareUnit",
      render: (text, record, index) => {
        return (
          <div className={`${record?.applicableOutletDetails?.length > 0 ? 'cursor-pointer blue-text' : ''}`}
            onClick={() => {
              setSelectedRecord(record)
              setSharedListDrawerOpen(true)
            }}
          >
            {formatDecimalNumber(record?.applicableOutletDetails?.length, 0 || 0)}
            {record?.applicableOutletDetails?.length > 0 && <ArrowUpOutlined style={{ fontSize: '10px' }} rotate={45} />}
          </div>
        )
      },
    }] : []),
    {
      title: t("nTcreatedBy", sourceKey.user),
      dataIndex: "username",
      key: "username",
      render: (text, record, index) => record?.username
    },
    {
      title: t("status", sourceKey.user),
      dataIndex: "status",
      key: "status",
      filterable: true,
      type: inputTypes.dropdown,
      selections: [
        { title: t("active", sourceKey.user), value: PRESET_STATUS.ACTIVE },
        { title: t("inactive", sourceKey.user), value: PRESET_STATUS.INACTIVE },
      ],
      render: (text, record, index) => {
        let content = null;
        switch (record?.status) {
          case PRESET_STATUS.ACTIVE:
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
          case PRESET_STATUS.INACTIVE:
            content = (
              <div className="flex items-center">
                <img src={PendingGreyIcon} style={{ marginRight: 5 }} />
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
            content = <span>{record?.status}</span>;
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

      // width: isMobile ? 20 : 20,

      render: (text, record) => {
        const menuItems = [
          ...record?.status === PRESET_STATUS.ACTIVE ? [{
            key: "useTemplate",
            label: (
              <div
                className={` flex flex-center ${isExpired ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                onClick={() => {
                  if (isExpired) {
                    message.error(t("nTsubscriptionExpired", sourceKey.user));
                    return;
                  }
                  // Navigate directly to create template page with preset template ID
                  router.push({
                    pathname: "/templates/create",
                    query: {
                      presetTemplateId: record._id,
                    },
                  });
                }}
              >
                {t("useTemplate", sourceKey.user)}
              </div>
            ),
          }] : [],
          ...record?.userId === user?._id || role === 'masterHQ' ? [
            {
              key: "editPresetTemplate",
              label: (
                <div
                  className=" flex flex-center cursor-pointer"
                  onClick={() => {
                    setPresetTemplateDrawerOpen(true);
                    setSelectedRecord(record);
                  }}
                >
                  {t("editPresetTemplate", sourceKey.user)}
                </div>
              ),
            }] : [],
          {
            key: "viewImagePool",
            label: (
              <div
                className="flex flex-center cursor-pointer"
                onClick={() =>
                  router.push({
                    pathname: "/image-pool/image-pool-details",
                    query: {
                      poolId: record?.productId,
                      productName: record?.productName,
                      outletUserId: record?.outletUserId,
                      sourceType: record?.userId === user?._id ? "own" : "shared",
                    },
                  })
                }
              >
                {t("viewImagePoolDetails", sourceKey.user)}
              </div>
            ),
          },
          {
            key: "viewVideoPool",
            label: (
              <div
                className="flex flex-center cursor-pointer"
                onClick={() =>
                  router.push({
                    pathname: "/video-pool/video-pool-details",
                    query: {
                      poolId: record?.productId,
                      productName: record?.productName,
                      outletUserId: record?.outletUserId,
                      sourceType: record?.userId === user?._id ? "own" : "shared",
                    },
                  })
                }
              >
                {t("viewVideoPoolDetails", sourceKey.user)}
              </div>
            ),
          },
          ...record?.userId === user?._id ? [{
            key: "delete",
            label: (
              <div
                className=" flex flex-center cursor-pointer"
                onClick={() => {
                  setDeleteModalOpen(true);
                  setSelectedRecord(record);
                }}
              >
                {t("delete", sourceKey.user)}
              </div>
            )
          }] : [],
        ].filter(Boolean);

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

  function getData(skip) {
    setLoading(true);

    if (isNaN(parseInt(skip))) {
      skip = 0;
    } else {
      skip = parseInt(skip);
    }

    const filterParams = {
      statusNe: PRESET_STATUS.DELETED,
      ...filterGroup,
    };

    getPresetContent(PAGE_SIZE, skip, filterParams)
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

  const listingActions = [
    {
      value: "createPresetTemplate",
      render: () => (
        <div className="">
          <Button className="ant-btn-default bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            {t("createPresetTemplate", sourceKey.user)}
          </Button>
        </div>
      ),
      exec: () => {
        setPresetTemplateDrawerOpen(true);
      },
    },
  ];

  async function onRefresh() {
    setPage(1);
    if (page !== 1) {
      getData((page - 1) * PAGE_SIZE);
    } else {
      getData(0);
    }
  }

  return (
    <>
      <Spin
        spinning={loading}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
        }}
      >
        <div className="mb-5 flex flex-row justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("presetTemplate", sourceKey.user)}
            </h1>
            <span className="text-gray-600 mt-1">
              {t("presetTemplateDesc", sourceKey.user)}
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
            // onExport={onExport}
            filterTag={true}
            filterGroup={filterGroup}
            setFilterGroup={setFilterGroup}
            onFilter={(filter) => {
              setFilterGroup({
                ...filter,
              });
            }}
          />
        </div>
        <PresetTemplateDrawer
          open={presetTemplateDrawerOpen}
          onClose={() => {
            setPresetTemplateDrawerOpen(false);
            setSelectedRecord(null);
          }}
          selectedRecord={selectedRecord}
          onRefreshData={onRefresh}
        />
        <SinglePopUpModal
          open={deleteModalOpen}
          type={"deletePreset"}
          closeable={true}
          extraData={selectedRecord}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedRecord(null);
          }}
          confirmBtn1={() => handleDeleteTemplate(selectedRecord?._id)}
        />
        <SharedListDrawer
          open={sharedListDrawerOpen}
          selectedRecord={selectedRecord}
          onClose={() => { setSharedListDrawerOpen(false); setSelectedRecord(null) }}
        />
      </Spin>
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.user.user,
});
const mapDispatchToProps = {};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(PresetTemplatePage));
