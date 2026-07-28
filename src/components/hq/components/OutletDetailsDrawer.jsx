import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, Spin, Tabs, Tooltip, message } from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import InfoBlock from "@/components/general/components/InfoBlock";
import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { useForm } from "antd/lib/form/Form";
import { useFormRules } from "@/constant/formRules";
import StringInput from "@/components/general/input/StringInput";
import DropdownInput from "@/components/general/input/DropdownInput";
import TextAreaInput from "@/components/general/input/TextAreaInput";
import ContactInput from "@/components/general/input/ContactInput";
import NumberInput from "@/components/general/input/NumberInput";
import { CREDIT_TYPE, USER_STATUS } from "@/constants/user";
import { trimIfString } from "@/utility/common-functions";
import stateCityData from "@/constants/state-city.json";
import { InstructionIcon, LocationExample } from "../../../../public/assets";
import editOutletCompanyProfile from "@/pages/api/user/editOutletCompanyProfile";
import updateOutletStatus from "@/pages/api/user/updateOutletStatus";
import updateOutletUsage from "@/pages/api/user/updateOutletUsage";
import getIndustryListing from "@/pages/api/industry/getIndustryListing";
import { connect } from "react-redux";
import { withRouter } from "next/router";

const TAB_KEYS = {
  PROFILE: "profile",
  CREDIT: "credit",
  SECURITY: "security"
};

const DESCRIPTION_MAX = 300;

const countDescriptionWords = (value = "") => {
  if (!value) return 0;
  const englishWords = value.split(/\s+/).filter((word) => /[a-zA-Z]/.test(word));
  const chineseCharacters = value.split("").filter((char) => /[\u4e00-\u9fa5]/.test(char));
  return englishWords.length + chineseCharacters.length;
};

const getCityOptions = (stateKey) => {
  if (stateKey && stateCityData[stateKey]) {
    return stateCityData[stateKey].map((city) => ({
      title: city,
      value: city,
    }));
  }
  return [];
};

const OutletDetailsDrawer = (props) => {
  const {
    open,
    onClose,
    onRefreshData,
    onSuspendOutlet,
    onDeleteOutlet,
    selectedRecord,
    tab,
    user,
  } = props;
  const { t } = useTranslation();
  const [profileForm] = useForm();
  const [creditForm] = Form.useForm();
  const formRules = useFormRules(t, sourceKey);
  const [loading, setLoading] = useState(false);
  const [creditLoading, setCreditLoading] = useState(false);
  const [descriptionCount, setDescriptionCount] = useState(0);
  const [selectedState, setSelectedState] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [exampleText, setExampleText] = useState("");
  const initialTab = tab === TAB_KEYS.CREDIT ? TAB_KEYS.CREDIT : TAB_KEYS.PROFILE;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [industryOptions, setIndustryOptions] = useState([]);

  const industryExamples = {
    "Food & Beverage": t("foodAndBeverageExample", sourceKey.user),
    "Beauty & Hair": t("beautyAndHairExample", sourceKey.user),
    "Gyms & Yoga Studios": t("gymsAndYogaStudiosExample", sourceKey.user),
    "SPA, Massage & Wellness": t("spaMassageAndWellnessExample", sourceKey.user),
    "Dentists & Aesthetic Clinics": t("dentistsAndAestheticClinicsExample", sourceKey.user),
    "Pet Industry": t("petIndustryExample", sourceKey.user),
    "Furniture & Home Stores": t("furnitureAndHomeStoresExample", sourceKey.user),
    "Photography & Bridal Studios": t("photographyAndBridalStudiosExample", sourceKey.user),
    "Optical Shops": t("opticalShopsExample", sourceKey.user),
    "Car Wash & Auto Detailing": t("carWashAndAutoDetailingExample", sourceKey.user),
  }
  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;

    getIndustryListing(100, 0)
      .then((res) => {
        const list = res?.data || [];
        if (list.length > 0) {
          setIndustryOptions(list.map((item) => ({ title: item.name, value: item.name })));
        }
      })
      .catch((err) => console.error("getIndustryListing failed", err));

    profileForm.resetFields();
    setDescriptionCount(0);
    setSelectedState("");
    setCityOptions([]);
    profileForm.setFieldsValue({
      phoneNumberCountryCode: "+60",
    });
    creditForm.resetFields();
  }, [open, profileForm, creditForm]);

  useEffect(() => {
    if (!open || !selectedRecord?.businessInfo) {
      return;
    }


    // =====================================
    // ||        Business Info            ||
    // =====================================
    const info = selectedRecord.businessInfo || {};
    const address = info.businessAddress || {};
    const stateValue = address?.state || "";
    const cityList = getCityOptions(stateValue);
    const descriptionValue = info?.businessDescription || "";

    setSelectedState(stateValue);
    setCityOptions(cityList);

    profileForm.setFieldsValue({
      phoneNumberCountryCode: info?.countryCode || "+60",
      phoneNumber: info?.phoneNumber,
      address: address?.address,
      state: stateValue || undefined,
      city: address?.city,
      zipcode: address?.zipcode,
      businessName: info?.businessName,
      businessNameCn: info?.businessNameCn == "N/A" || !info?.businessNameCn ? info?.businessName : info?.businessNameCn,
      industry: info?.industry,
      businessDescription: descriptionValue,
      specialRemark: info?.specialRemark,
    });
    setDescriptionCount(countDescriptionWords(descriptionValue));
  }, [open, selectedRecord, profileForm, user]);

  const handleIndustryChange = (value) => {
    setExampleText(industryExamples[value] || "");
    profileForm.setFieldsValue({ industry: value });
  };

  const showCreditTab = true;

  useEffect(() => {
    if (!open || !showCreditTab) return;
    creditForm.setFieldsValue({
      creditType: CREDIT_TYPE.CONTENT,
      mode: "add",
    });
  }, [open, creditForm, showCreditTab]);

  const stateOptions = useMemo(
    () =>
      Object.keys(stateCityData).map((state) => ({
        title: state,
        value: state,
      })),
    []
  );

  const handleStateChange = (value) => {
    setSelectedState(value);
    profileForm.setFieldsValue({ city: undefined });
    setCityOptions(getCityOptions(value));
  };

  const handleSave = () => {
    if (!selectedRecord?._id) return;

    setLoading(true);
    profileForm
      .validateFields()
      .then((values) => {
        const apiData = {
          userId: selectedRecord._id,
          businessName: trimIfString(values.businessName),
          businessNameCn: trimIfString(values.businessNameCn),
          industry: values?.industry,
          countryCode: values.phoneNumberCountryCode || "+60",
          phoneNumber:
            values.phoneNumberCountryCode === "+60" && values.phoneNumber?.startsWith("0")
              ? values.phoneNumber.slice(1)
              : values.phoneNumber,
          businessAddress: {
            address: trimIfString(values.address),
            state: trimIfString(values.state),
            zipcode: trimIfString(values.zipcode),
            city: trimIfString(values.city),
          },
          specialRemark: values.specialRemark,
          businessDescription: trimIfString(values.businessDescription),
        };

        return editOutletCompanyProfile(apiData);
      })
      .then((response) => {
        if (response?.data?.success) {
          message.success(
            t("profileCompletedSuccessfully", sourceKey.user) || "Profile completed successfully!"
          );
          updateOutletStatus({ userId: selectedRecord._id, status: USER_STATUS.ACTIVE });
          if (onRefreshData) {
            onRefreshData();
          }
          handleClose();
        }
      })
      .catch((err) => {
        console.error(err);
        message.error(err?.message || t("pleaseFillRequired", sourceKey.user));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // =====================================
  // ||        Credit Part              ||
  // =====================================
  const creditValue = Form.useWatch("credit", creditForm);
  const selectedMode = Form.useWatch("mode", creditForm) || "add";
  const selectedType = Form.useWatch("creditType", creditForm) || CREDIT_TYPE.IMAGE;
  const usageAmount = Number(
    selectedType === CREDIT_TYPE.IMAGE
      ? selectedRecord?.usageAndLimit?.usageAmounts?.image
      : selectedType === CREDIT_TYPE.CONTENT
        ? selectedRecord?.usageAndLimit?.usageAmounts?.content
        : 0
  );
  const beforeAmount = Number(
    selectedType === CREDIT_TYPE.IMAGE
      ? selectedRecord?.usageAndLimit?.limitAmounts?.image
      : selectedType === CREDIT_TYPE.CONTENT
        ? selectedRecord?.usageAndLimit?.limitAmounts?.content
        : 0
  );
  const afterAmount =
    selectedMode === "add"
      ? beforeAmount + Number(creditValue || 0)
      : selectedMode === "deduct"
        ? beforeAmount - Number(creditValue || 0)
        : null;

  const handleCreditSubmit = () => {
    if (!selectedRecord?._id) return;
    creditForm
      .validateFields()
      .then(() => {
        setCreditLoading(true);
        return updateOutletUsage({
          creditType: selectedType,
          outletId: selectedRecord._id,
          limitAmount: afterAmount,
        });
      })
      .then(() => {
        message.success(t("updateSuccess", sourceKey.user));
        if (onRefreshData) {
          onRefreshData();
        }
        handleClose();
      })
      .catch((err) => {
        if (err?.errorFields?.length) return;
        console.error(err);
        message.error(err?.message || "Failed to update credit.");
      })
      .finally(() => {
        setCreditLoading(false);
      });
  };

  const handleClose = () => {
    profileForm.resetFields();
    creditForm.resetFields();
    if (onClose) {
      onClose();
    }
  };



  const profileTabContent = (
    <Spin spinning={loading}>
      <Form
        form={profileForm}
        autoComplete="off"
        onValuesChange={(changedValues) => {
          if (Object.prototype.hasOwnProperty.call(changedValues, "businessDescription")) {
            const value = changedValues.businessDescription || "";
            setDescriptionCount(countDescriptionWords(value));
          }
        }}
      >
        <div className="space-y-2">
          <div className="font-semibold text-base">{t("accountInformation", sourceKey.user)}</div>

          <ContactInput
            label={t("phoneNumber", sourceKey.user)}
            fieldName="phoneNumber"
            placeholder={t("select", sourceKey.user)}
            placeholderInput="000000000"
            rules={formRules.contactNo}
            rulesCode={formRules.countryCode}
          />

          <TextAreaInput
            label={
              <span>
                {t("pinnedCompanyNameLocation", sourceKey.user)}{" "}
                <Tooltip
                  title={
                    <div>
                      <img src={LocationExample} />
                      <p>{t("pinnedLocationTooltip", sourceKey.user)}</p>
                    </div>
                  }
                >
                  <InfoCircleOutlined style={{ color: "#8c8c8c", cursor: "pointer" }} />
                </Tooltip>
              </span>
            }
            fieldName="address"
            rules={formRules.address}
            placeholder={t("enterAddress", sourceKey.user)}
          />

          <StringInput
            label={
              <span>{t("specialRemark", sourceKey.user)}{" "}
                <Tooltip title={
                  <div>
                    <img src={LocationExample} ></img>
                    <p>{t("pinnedLocationTooltip", sourceKey.user)}</p>
                  </div>}>
                  <InfoCircleOutlined style={{ color: "#8c8c8c", cursor: "pointer" }} />
                </Tooltip>
              </span>
            }
            fieldName="specialRemark"
            placeholder={t("enterSpecialRemark", sourceKey.user) || "e.g. near KLCC, Level 2 Pavilion"}
          />

          {/* <DropdownInput
            label={t("state", sourceKey.user)}
            fieldName="state"
            rules={formRules.state}
            options={stateOptions}
            placeholder={t("selectState", sourceKey.user)}
            showSearch
            onChange={handleStateChange}
          />

          <DropdownInput
            label={t("city", sourceKey.user)}
            fieldName="city"
            rules={formRules.city}
            options={cityOptions}
            placeholder={
              selectedState ? t("selectCity", sourceKey.user) : t("selectStateFirst", sourceKey.user)
            }
            showSearch
            disabled={!selectedState || cityOptions.length === 0}
          />

          <NumberInput
            label={t("zipCode", sourceKey.user)}
            fieldName="zipcode"
            placeholder={t("enterZipCode", sourceKey.user)}
            rules={formRules.zipCode}
          /> */}
        </div>

        <div className="space-y-2 mt-6">
          <div className="font-semibold text-base">{t("businessInformation", sourceKey.user)}</div>

          <StringInput
            label={t("businessName", sourceKey.user) + t("enSlashBm", sourceKey.user)}
            fieldName="businessName"
            rules={formRules.businessName}
            placeholder={t("businessName", sourceKey.user)}
          />

          <StringInput
            label={t("businessNameCn", sourceKey.user)}
            fieldName="businessNameCn"
            rules={formRules.businessName}
            placeholder={t("businessNameCn", sourceKey.user)}
          />

          <DropdownInput
            label={`${t("industry", sourceKey.user)}`}
            fieldName="industry"
            placeholder={t("nTchooseIndustry", sourceKey.user)}
            rules={formRules.industry}
            showSearch={true}
            onChange={handleIndustryChange}
            options={industryOptions}
          />
          <TextAreaInput
            label={t("businessDetails", sourceKey.user)}
            fieldName="businessDescription"
            placeholder={t("businessDetailsDesc", sourceKey.user)}
            rows={10}
            rules={formRules.businessDescription}
            style={{ margin: 0 }}
            extraLabel={
              <div className="flex small-text-size">
                <span
                  className="whitespace-normal break-words"
                  style={{
                    display: "inline-block",
                    maxWidth: "100%",
                  }}
                >
                  {t("businessDetailsCopy", sourceKey.user)}
                  {"\u00A0"}
                  <img
                    src={InstructionIcon}
                    alt="Instruction Icon"
                    className="inline-block w-4 h-4 cursor-pointer"
                    style={{ width: 16, height: 16 }}
                    onClick={() => {
                      const desc = t("businessDetailsDesc", sourceKey.user);
                      profileForm.setFieldsValue({
                        businessDescription: desc,
                      });
                      setDescriptionCount(countDescriptionWords(desc));
                    }}
                  />
                </span>
              </div>
            }
          />

          <div className="flex justify-end items-center small-text-size second-grey-text">
            <div className={`${descriptionCount > DESCRIPTION_MAX ? "red-text" : ""} ml-2`}>
              {descriptionCount}/{DESCRIPTION_MAX}
            </div>
          </div>
        </div>
      </Form>
    </Spin>
  );

  const businessInfo = [
    {
      label: t("businessName", sourceKey.user),
      value: selectedRecord?.businessInfo?.businessName,
    },
    {
      label: t("email", sourceKey.user),
      value: selectedRecord?.businessInfo?.businessEmail,
    },
    {
      label: `Used Credits ${selectedType === CREDIT_TYPE.IMAGE ? "(Image)" : "(Content)"}`,
      value: usageAmount || "0",
    },
    {
      label: `Available Credits ${selectedType === CREDIT_TYPE.IMAGE ? "(Image)" : "(Content)"}`,
      value: afterAmount - usageAmount || "0",
    },
    {
      label: `Current Limit Credits ${selectedType === CREDIT_TYPE.IMAGE ? "(Image)" : "(Content)"}`,
      value: beforeAmount || "-",
    },
    {
      label: `Limit Credits Adjustment ${selectedMode === "add" ? "(Add)" : "(Deduct)"}`,
      value: afterAmount || "-",
    },
  ].filter(Boolean);

  const creditTabContent = (
    <div className="space-y-4">
      <p className="text-base font-semibold">
        Update {selectedRecord?.businessInfo?.businessName || "-"}'s Credit Limit Amount
      </p>
      <Form form={creditForm}>
        <DropdownInput
          label="Credit Type"
          fieldName="creditType"
          placeholder="Image/Content"
          options={[
            {
              title: "Image",
              value: CREDIT_TYPE.IMAGE,
            },
            {
              title: "Content",
              value: CREDIT_TYPE.CONTENT,
            },
          ]}
        />
        <div className="flex flex-row gap-2">
          <div className="w-1/2">
            <DropdownInput
              label="Mode"
              fieldName="mode"
              placeholder="Add/Deduct"
              options={[
                {
                  title: "Add",
                  value: "add",
                },
                {
                  title: "Deduct",
                  value: "deduct",
                },
              ]}
            />
          </div>
          <div className="w-full">
            <NumberInput
              label={t("credit", sourceKey.user)}
              fieldName="credit"
              dependencies={["mode", "creditType"]}
              rules={[
                {
                  validator(_, inputValue) {
                    const amount = Number(inputValue);
                    if (Number.isNaN(amount) || amount <= 0) {
                      return Promise.reject(new Error("Credit amount must be greater than zero"));
                    }
                    if (afterAmount <= 0) {
                      return Promise.reject(new Error("Credit amount cannot be 0 or less than 0"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              placeholder={"0"}
            />
          </div>
        </div>
      </Form>
      <InfoBlock infoTitle={t("businessInfo", sourceKey.user)} fields={businessInfo} />
    </div>
  );

  const securityTabContent = (
    <div className="space-y-4">
      <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 flex gap-3">
        <ExclamationCircleOutlined className="text-yellow-600 text-lg mt-0.5" />
        <div>
          <div className="font-semibold text-yellow-700">
            {t("sensitiveActions", sourceKey.user)}
          </div>
          <div className="text-sm text-yellow-700">
            {t("sensitiveActionsDesc", sourceKey.user)}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="w-full text-left border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-300"
        onClick={() => {
          if (onSuspendOutlet) {
            onSuspendOutlet();
          }
        }}
      >
        <div>
          <div className="font-semibold text-gray-900">
            {t("suspendAccount", sourceKey.user)}
          </div>
          <div className="text-sm text-gray-500">
            {t("suspendAccountDesc", sourceKey.user)}
          </div>
        </div>
        <PauseCircleOutlined className="text-blue-500 text-xl" />
      </button>

      <button
        type="button"
        className="w-full text-left border border-red-200 rounded-xl p-4 flex items-center justify-between hover:border-red-300"
        onClick={() => {
          if (onDeleteOutlet) {
            onDeleteOutlet();
          }
        }}
      >
        <div>
          <div className="font-semibold text-red-600">
            {t("deletePermanently", sourceKey.user)}
          </div>
          <div className="text-sm text-red-500">
            {t("deletePermanentlyDesc", sourceKey.user)}
          </div>
        </div>
        <DeleteOutlined className="text-red-500 text-xl" />
      </button>
    </div>
  );

  const items = useMemo(() => {
    const baseItems = [
      {
        key: TAB_KEYS.PROFILE,
        label: t("businessInformation", sourceKey.user),
        children: <div className="py-2">{profileTabContent}</div>,
      },
    ];

    if (showCreditTab) {
      baseItems.push({
        key: TAB_KEYS.CREDIT,
        label: t("editCredit", sourceKey.user),
        children: <div className="py-2">{creditTabContent}</div>,
      });
    }

    baseItems.push({
      key: TAB_KEYS.SECURITY,
      label: t("security", sourceKey.user),
      children: <div className="py-2">{securityTabContent}</div>,
    });

    return baseItems;
  }, [creditTabContent, profileTabContent, securityTabContent, showCreditTab, t]);

  return (
    <MobileFormDrawer
      closable
      onClose={handleClose}
      open={open}
      width="400px"
      zIndex={1300}
      title={selectedRecord?.businessInfo?.businessName}
      footer={
        activeTab === TAB_KEYS.PROFILE ? (
          <div className="flex flex-col">
            <Button
              loading={loading}
              className="ant-btn-default bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              size="large"
              onClick={handleSave}
            >
              {loading ? t("submitting", sourceKey.user) : t("completeProfile", sourceKey.user)}
            </Button>
          </div>
        ) : activeTab === TAB_KEYS.CREDIT ? (
          <div className="flex flex-col">
            <Button
              loading={creditLoading}
              className="ant-btn-default bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              size="large"
              onClick={handleCreditSubmit}
            >
              {creditLoading ? t("submitting", sourceKey.user) : "Update Credit"}
            </Button>
          </div>
        ) : null
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </MobileFormDrawer>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(OutletDetailsDrawer));
