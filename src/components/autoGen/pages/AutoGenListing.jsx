import React, { useEffect, useState } from "react";
import { Dropdown, Switch, message } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import ListingTable from "@/components/general/components/ListingTable";
import getAutoModeList from "@/pages/api/content/getAutoModeList";
import deleteAutoMode from "@/pages/api/content/deleteAutoMode";
import updateAutoMode from "@/pages/api/content/updateAutoMode";
import SinglePopUpModal from "@/components/general/popUp/SinglePopUpModal";
import AutoModeEditDrawer from "@/components/autoGen/components/AutoModeEditDrawer";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { inputTypes } from "@/utility/config";
import {
  AUTO_MODE_STATUS,
  getLanguageOptions,
  getRoleOptions,
} from "@/constants/autoGenMode";
import { connect } from "react-redux";

const AutoGenListing = (props) => {
  const { t } = useTranslation();
  const { user } = props;
  const [filterGroup, setFilterGroup] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedEditRecord, setSelectedEditRecord] = useState(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [statusLoadingMap, setStatusLoadingMap] = useState({});
  const PAGE_SIZE = 10;
  const DEFAULT_VISIBLE_STATUSES = [
    AUTO_MODE_STATUS.ACTIVE,
    AUTO_MODE_STATUS.PAUSED,
  ];
  const languageOptions = getLanguageOptions(t);
  const roleOptions = getRoleOptions(t);

  const languageOptionMap = languageOptions.reduce((acc, item) => {
    acc[item.value] = item.title;
    return acc;
  }, {});
  const roleOptionMap = roleOptions.reduce((acc, item) => {
    acc[item.value] = item.title;
    return acc;
  }, {});
  const statusPillMap = {
    [AUTO_MODE_STATUS.ACTIVE]: {
      label: "Active",
      pillClassName: "border border-emerald-200 bg-emerald-100 text-emerald-700",
      dotClassName: "bg-emerald-500",
    },
    [AUTO_MODE_STATUS.PAUSED]: {
      label: "Paused",
      pillClassName: "border border-amber-200 bg-amber-100 text-amber-700",
      dotClassName: "bg-amber-500",
    },
    [AUTO_MODE_STATUS.INACTIVE]: {
      label: "Inactive",
      pillClassName: "border border-gray-200 bg-gray-100 text-gray-600",
      dotClassName: "bg-gray-500",
    },
  };

  const renderStatusPill = (status) => {
    const config = statusPillMap[status];
    if (!config) {
      return "-";
    }

    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium leading-none ${config.pillClassName}`}
      >
        <span className={`h-2 w-2 rounded-full ${config.dotClassName}`} />
        <span>{config.label}</span>
      </div>
    );
  };

  const columns = [
    {
      title: "Product Template Name",
      dataIndex: "productId",
      key: "productId",
      render: (text, record) => record?.contentPresetTitle,
    },

    {
      title: "Trigger Threshold",
      dataIndex: "threshold",
      key: "threshold",
      render: (text) => "< " + text + " posts",
    },
    {
      title: "Auto-Gen Count",
      dataIndex: "generationCount",
      key: "generationCount",
      render: (text) => text + " posts",
    },
    {
      title: t("language", sourceKey.user),
      dataIndex: "language",
      key: "language",
      filterable: true,
      render: (text) => languageOptionMap[text] || text || "-",
    },
    {
      title: t("businessName", sourceKey.user),
      dataIndex: "businessName",
      key: "businessName",
      render: (text) => text ?? "-",
    },
    {
      title: "Role",
      dataIndex: "roleWriter",
      key: "roleWriter",
      render: (text) => roleOptionMap[text] || text,
    },
    {
      title: t("status", sourceKey.user),
      dataIndex: "status",
      key: "status",
      filterable: true,
      type: inputTypes.dropdown,
      selections: [
        { title: t("active", sourceKey.user), value: AUTO_MODE_STATUS.ACTIVE },
        {
          title: t("inactive", sourceKey.user),
          value: AUTO_MODE_STATUS.INACTIVE,
        },
        { title: "Paused", value: AUTO_MODE_STATUS.PAUSED },
      ],
      render: (text) => renderStatusPill(text),
    },
    {
      title: "Auto Approve",
      dataIndex: "autoApprove",
      key: "autoApprove",
      render: (text, record) => {
        const currentStatus = Boolean(record?.autoApprove);
        const isActive = currentStatus === true;
        const isLoading = Boolean(statusLoadingMap?.[record?._id]);

        return (
          <Switch
            checked={isActive}
            loading={isLoading}
            onChange={(checked) => handleAutoApproveToggle(record, checked)}
            style={{
              backgroundColor: isActive ? "#52C41A" : "#d9d9d9",
            }}
          />
        );
      },
    },
    {
      title: "Auto Mode",
      dataIndex: "statusControl",
      key: "statusControl",
      render: (text, record) => {
        const currentStatus = Number(record?.status);
        const isActive = currentStatus === AUTO_MODE_STATUS.ACTIVE;
        const isLoading = Boolean(statusLoadingMap?.[record?._id]);

        return (
          <Switch
            checked={isActive}
            loading={isLoading}
            onChange={(checked) => handleStatusToggle(record, checked)}
            style={{
              backgroundColor: isActive ? "#52C41A" : "#d9d9d9",
            }}
          />
        );
      },
    },
    {
      title: "",
      dataIndex: "action",
      key: "action",
      render: (text, record) => {
        const menuItems = [
          {
            key: "editAutoMode",
            label: (
              <div
                className="flex flex-center cursor-pointer"
                onClick={() => {
                  setSelectedEditRecord(record);
                  setEditDrawerOpen(true);
                }}
              >
                {t("editAutoMode", sourceKey.user)}
              </div>
            ),
          },
          {
            key: "deleteAutoMode",
            label: (
              <div
                className="flex flex-center cursor-pointer"
                onClick={() => {
                  setSelectedRecord(record);
                  setDeleteModalOpen(true);
                }}
              >
                {t("delete", sourceKey.user)}
              </div>
            ),
          },
        ];

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

    if (isNaN(parseInt(skip, 10))) {
      skip = 0;
    } else {
      skip = parseInt(skip, 10);
    }

    const roleFilter = {};
    if (user?.role === "outlet") {
      roleFilter.outletUserId = user?._id;
    } else if (user?.role === "masterHQ") {
      roleFilter.userId = user?._id;
    }

    const filterParams = {
      ...filterGroup,
      ...roleFilter,
      statusNe: AUTO_MODE_STATUS.INACTIVE, // Always exclude inactive items from API response for consistency
    };

    getAutoModeList(PAGE_SIZE, skip, filterParams)
      .then((res) => {
        const rawData = Array.isArray(res?.data) ? res.data : [];

          setDataSource(rawData);
          setTotal(res?.total || 0);

      })
      .catch((err) => {
        console.error(err);
        message.error(err?.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function handleStatusToggle(record, checked) {
    const autoModeId = record?._id;
    if (!autoModeId) {
      return;
    }

    if (statusLoadingMap?.[autoModeId]) {
      return;
    }

    const previousStatus = Number(record?.status);
    const nextStatus = checked ? AUTO_MODE_STATUS.ACTIVE : AUTO_MODE_STATUS.PAUSED;
    if (nextStatus === previousStatus) {
      return;
    }

    setStatusLoadingMap((prev) => ({ ...prev, [autoModeId]: true }));
    setDataSource((prev) =>
      prev.map((item) =>
        item?._id === autoModeId ? { ...item, status: nextStatus } : item
      )
    );

    try {
      const response = await updateAutoMode({ autoModeId, status: nextStatus });
      message.success(
        response?.data?.message || t("editAutoModeSuccess", sourceKey.user)
      );
      getData((page - 1) * PAGE_SIZE);
    } catch (err) {
      console.error(err);
      message.error(err?.message || t("editAutoModeFailed", sourceKey.user));
      // Refresh to reflect latest API value
      getData((page - 1) * PAGE_SIZE);
    } finally {
      setStatusLoadingMap((prev) => {
        const next = { ...prev };
        delete next[autoModeId];
        return next;
      });
    }
  }

  async function handleAutoApproveToggle(record, checked) {
    const autoModeId = record?._id;
    if (!autoModeId) {
      return;
    }

    if (statusLoadingMap?.[autoModeId]) {
      return;
    }

    const previousStatus = Boolean(record?.autoApprove);
    const nextStatus = checked ? true : false;
    if (nextStatus === previousStatus) {
      return;
    }

    setStatusLoadingMap((prev) => ({ ...prev, [autoModeId]: true }));
    setDataSource((prev) =>
      prev.map((item) =>
        item?._id === autoModeId ? { ...item, autoApprove: nextStatus } : item
      )
    );

    try {
      const response = await updateAutoMode({ autoModeId, autoApprove: nextStatus });
      message.success(
        response?.data?.message || t("editAutoModeSuccess", sourceKey.user)
      );
      getData((page - 1) * PAGE_SIZE);
    } catch (err) {
      console.error(err);
      message.error(err?.message || t("editAutoModeFailed", sourceKey.user));
      // Refresh to reflect latest API value
      getData((page - 1) * PAGE_SIZE);
    } finally {
      setStatusLoadingMap((prev) => {
        const next = { ...prev };
        delete next[autoModeId];
        return next;
      });
    }
  }

  async function handleDeleteAutoMode(autoModeId) {
    if (!autoModeId) {
      return;
    }

    let isDeleted = false;
    setLoading(true);
    try {
      const response = await deleteAutoMode({ autoModeId });
      isDeleted = true;
      message.success(
        response?.data?.message || t("deleteAutoModeSuccess", sourceKey.user)
      );
    } catch (err) {
      console.error(err);
      message.error(err?.message || t("deleteAutoModeFailed", sourceKey.user));
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setSelectedRecord(null);
      if (isDeleted) {
        onRefresh();
      }
    }
  }

  async function onRefresh() {
    setPage(1);
    if (page !== 1) {
      getData((page - 1) * PAGE_SIZE);
    } else {
      getData(0);
    }
  }

  return (
    <div className="p-3">
      <div className="mb-5 flex flex-row justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900">
            {t("autoModeListing", sourceKey.user)}
          </h1>
        </div>
      </div>

      <div>
        <ListingTable
          columns={columns}
          dataSource={dataSource}
          setPage={setPage}
          total={total}
          page={page}
          loading={loading}
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
        />
      </div>
      <SinglePopUpModal
        open={deleteModalOpen}
        type={"deleteAutoMode"}
        closeable={true}
        extraData={selectedRecord}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedRecord(null);
        }}
        confirmBtn1={() => handleDeleteAutoMode(selectedRecord?._id)}
      />
      <AutoModeEditDrawer
        open={editDrawerOpen}
        selectedRecord={selectedEditRecord}
        onClose={() => {
          setEditDrawerOpen(false);
          setSelectedEditRecord(null);
        }}
        onRefreshData={onRefresh}
      />
    </div>
  );
};
const mapStateToProps = (state) => ({
  user: state.user.user,
  // packages: state.packages.packages,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AutoGenListing);