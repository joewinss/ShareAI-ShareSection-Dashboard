import React, { useState, useEffect } from "react";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { connect } from "react-redux";
import { withRouter } from "next/router";
import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
import InfoBlock from "@/components/general/components/InfoBlock";
import { formatDate } from "@/utility/common-functions";

const ViewOutletProfileDrawer = (props) => {
  const { record } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const businessInfo = record?.businessInfo;
  const wallet = record?.usageAndLimit

  useEffect(() => {
    setOpen(props?.open === true);
  }, [props?.open]);

  function onClose() {
    setOpen(false);
    if (props.onClose) {
      props.onClose();
    }
  }

  const accountInformation = [
    {
      label: t("countryCode", sourceKey.user),
      value: businessInfo?.countryCode,
    },
    {
      label: t("phoneNumber", sourceKey.user),
      value: businessInfo?.phoneNumber,
    },
    {
      label: t("email", sourceKey.user),
      value: businessInfo?.businessEmail,
    },
    {
      label: t("pinnedCompanyNameLocation", sourceKey.user),
      value: (
        <span className="text-right w-full block">
          {businessInfo?.businessAddress?.address}
        </span>
      ),
    },
    {
      label: t("state", sourceKey.user),
      value: (
        <span className="text-right w-full block">
          {businessInfo?.businessAddress?.state}
        </span>
      ),
    },
    {
      label: t("city", sourceKey.user),
      value: (
        <span className="text-right w-full block">
          {businessInfo?.businessAddress?.city}
        </span>
      ),
    },
    {
      label: t("zipCode", sourceKey.user),
      value: (
        <span className="text-right w-full block">
          {businessInfo?.businessAddress?.zipcode}
        </span>
      ),
    },
    {
      label: t("nTexpiredDate", sourceKey.user),
      value: (
        <span className="text-right w-full block">
          {formatDate(businessInfo?.expiredAt, "DD MMM YYYY") || "N/A"}
        </span>
      ),
    },
  ];

  const businessInformation = [
    {
      label: t("businessName", sourceKey.user) + t("enSlashBm", sourceKey.user),
      value: businessInfo?.businessName,
    },
    {
      label: t("businessNameCn", sourceKey.user),
      value: businessInfo?.businessNameCn || businessInfo?.businessName,
    },
    {
      label: t("industry", sourceKey.user),
      value: businessInfo?.industry,
    },
  ];
  const businessInformation2 = [
    {
      value: businessInfo?.businessDescription,
    },
  ];

  const visual = [
    {
      label: t("visualUsage", sourceKey.user),
      value: wallet?.usageAmounts?.image || "0",
    },
    {
      label: t("visualLimit", sourceKey.user),
      value: wallet?.limitAmounts?.image || "0",
    },
  ];

  const content = [
    {
      label: t("visualUsage", sourceKey.user),
      value: wallet?.usageAmounts?.content || "0",
    },
    {
      label: t("visualLimit", sourceKey.user),
      value: wallet?.limitAmounts?.content || "0",
    },
  ];

  return (
    <>
      <MobileFormDrawer
        closable={true}
        onClose={onClose}
        width={"360px"}
        open={open}
        title={t("viewProfile", sourceKey.user)}
      >
        <div className="flex flex-col space-y-4">
          <InfoBlock
            infoTitle={t("accountInformation", sourceKey.user)}
            fields={accountInformation}
          />
          <InfoBlock
            infoTitle={t("businessInformation", sourceKey.user)}
            fields={businessInformation}
          />
          <InfoBlock
            infoTitle={t("businessDescription", sourceKey.user)}
            fields={businessInformation2}
          />
          <InfoBlock
            infoTitle={t("visual", sourceKey.user)}
            fields={visual}
          />
          <InfoBlock
            infoTitle={t("content", sourceKey.user)}
            fields={content}
          />
        </div>
      </MobileFormDrawer>
    </>
  );
};

const mapStateToProps = (state) => ({});
const mapDispatchToProps = {};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ViewOutletProfileDrawer));
