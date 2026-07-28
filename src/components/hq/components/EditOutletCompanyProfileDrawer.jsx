import React, { useState, useEffect } from "react";
import { Button, Form, message, Spin, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { useForm } from "antd/lib/form/Form";
import { connect } from "react-redux";
import { withRouter } from "next/router";
import { useFormRules } from "@/constant/formRules";
import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
import StringInput from "@/components/general/input/StringInput";
import DropdownInput from "@/components/general/input/DropdownInput";
import TextAreaInput from "@/components/general/input/TextAreaInput";
import { loginSuccessful, updateUser } from "@/redux/actions/user-actions";
import ContactInput from "@/components/general/input/ContactInput";
import { trimIfString } from "@/utility/common-functions";
import NumberInput from "@/components/general/input/NumberInput";
import stateCityData from "@/constants/state-city.json";
import { InstructionIcon, LocationExample } from "../../../../public/assets";
import editOutletCompanyProfile from "@/pages/api/user/editOutletCompanyProfile";
import updateOutletStatus from "@/pages/api/user/updateOutletStatus";
import { USER_STATUS } from "@/constants/user";
import startOnboarding from "@/pages/api/onboarding/startOnboarding";
import getIndustryListing from "@/pages/api/industry/getIndustryListing";
import { AppstoreOutlined, TranslationOutlined, RightOutlined } from "@ant-design/icons";

const STEPS = {
  CHOOSE: "choose",
  BRAND_ANALYSIS: "brand_analysis",
  REVIEW: "review",
};

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 inline-block">
    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z" />
    <path d="M12 3V5M12 19V21M3 12H5M19 12H21" />
  </svg>
);

const SelectionCard = ({ icon, title, description, badge, onClick, active }) => (
  <div
    onClick={onClick}
    className={`relative flex-1 p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[160px] flex flex-col items-start text-left
      ${active ? "border-green-500/50 bg-white shadow-lg hover:border-green-500" : "border-gray-100 bg-white hover:border-gray-200"}`}
  >
    <div className={`p-3 rounded-lg mb-4 transition-all duration-300 ${active ? "bg-green-50" : "bg-gray-50"}`}>
      {icon}
    </div>
    <h3 className="text-base font-bold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed mb-4">{description}</p>
    <div className={`mt-auto flex items-center font-semibold text-sm transition-all duration-300 ${active ? "text-green-600" : "text-gray-400"}`}>
      {badge} <RightOutlined className="ml-2 text-[10px]" />
    </div>
  </div>
);

const countDescriptionWords = (value = "") => {
  if (!value) return 0;
  const englishWords = value
    .split(/\s+/)
    .filter((word) => /[a-zA-Z]/.test(word));
  const chineseCharacters = value
    .split("")
    .filter((char) => /[\u4e00-\u9fa5]/.test(char));
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

const EditOutletCompanyProfileDrawer = (props) => {
  const { onSuccess, extraData, onRefreshData, type, user } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = useForm();
  const formRules = useFormRules(t, sourceKey);
  const [descriptionCount, setDescriptionCount] = useState(0);
  const DESCRIPTION_MAX = 300;
  const userId = extraData?._id;
  const [selectedState, setSelectedState] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [step, setStep] = useState(STEPS.CHOOSE);
  const [showAnalysisFailed, setShowAnalysisFailed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [industryOptions, setIndustryOptions] = useState([]);

  // Generate state options from JSON data
  const stateOptions = Object.keys(stateCityData).map((state) => ({
    title: state,
    value: state,
  }));

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
    setOpen(props?.open === true);
    if (props?.open) {
      form.resetFields();
      setDescriptionCount(0);
      setSelectedState("");
      setCityOptions([]);
      setStep(STEPS.CHOOSE);
      setShowAnalysisFailed(false);
      setAnalyzing(false);
      form.setFieldsValue({
        phoneNumberCountryCode: "+60",
      });

      getIndustryListing(100, 0)
        .then((res) => {
          const list = res?.data || [];
          if (list.length > 0) {
            setIndustryOptions(list.map((item) => ({ title: item.name, value: item.name })));
          }
        })
        .catch((err) => console.error("getIndustryListing failed", err));
    }
  }, [props?.open, form]);

  useEffect(() => {
    if (!props?.open || type !== "edit" || !extraData?.businessInfo) {
      return;
    }

    const info = extraData.businessInfo || {};
    const address = info.businessAddress || {};
    const stateValue = address?.state || "";
    const cityList = getCityOptions(stateValue);
    const descriptionValue = info?.businessDescription || "";

    setSelectedState(stateValue);
    setCityOptions(cityList);

    if (descriptionValue || info?.industry) {
      setStep(STEPS.REVIEW);
    }

    form.setFieldsValue({
      phoneNumberCountryCode: info?.countryCode || "+60",
      phoneNumber: info?.phoneNumber,
      address: address?.address,
      state: stateValue || undefined,
      city: address?.city,
      zipcode: address?.zipcode,
      businessName: info?.businessName,
      businessNameCn: info?.businessNameCn,
      industry: info?.industry,
      businessDescription: descriptionValue,
      specialRemark: info?.specialRemark || address?.address || "",
    });
    setDescriptionCount(countDescriptionWords(descriptionValue));
  }, [props?.open, type, extraData, form]);

  const handleIndustryChange = (value) => {
    form.setFieldsValue({ industry: value });
  };

  async function handleBrandAnalysis() {
    try {
      await form.validateFields(["companyLink"]);
    } catch {
      return;
    }
    const companyLink = form.getFieldValue("companyLink");
    setAnalyzing(true);
    setShowAnalysisFailed(false);
    try {
      const locales = (localStorage.getItem("locale") || "en").replace(/"/g, "");
      const language = locales === "cn" ? "chinese" : "english";

      const response = await startOnboarding({ companyLink, language });
      if (response.data.success) {
        const result = response.data.result;
        if (!result.businessDescription || !result.industry) {
          setShowAnalysisFailed(true);
        } else {
          form.setFieldsValue({
            businessName: result.businessName,
            businessNameCn: result.businessNameCn == "N/A" ? result.businessName : result.businessNameCn,
            industry: result.industry,
            businessDescription: result.businessDescription ? result.businessDescription.replace(/\\n/g, "\n") : "",
          });
          setDescriptionCount(countDescriptionWords(result.businessDescription || ""));
          setStep(STEPS.REVIEW);
        }
      } else {
        setShowAnalysisFailed(true);
      }
    } catch (err) {
      setShowAnalysisFailed(true);
    } finally {
      setAnalyzing(false);
    }
  }

  const handleStateChange = (value) => {
    setSelectedState(value);
    // Reset city field when state changes
    form.setFieldsValue({ city: undefined });

    // Update city options based on selected state
    const cities = getCityOptions(value);
    setCityOptions(cities);
  };

  function handleSave() {
    setLoading(true);

    form
      .validateFields()
      .then((values) => {
        const apiData = {
          userId: userId,
          businessName: trimIfString(values.businessName),
          businessNameCn: trimIfString(values.businessNameCn),
          industry: values?.industry,
          countryCode: values.phoneNumberCountryCode || "+60",
          phoneNumber:
            values.phoneNumberCountryCode === "+60" &&
              values.phoneNumber?.startsWith("0")
              ? values.phoneNumber.slice(1)
              : values.phoneNumber,
          businessAddress: {
            address: trimIfString(values.address),
            state: trimIfString(values.state),
            zipcode: trimIfString(values.zipcode),
            city: trimIfString(values.city),
          },
          businessDescription: trimIfString(values.businessDescription),
          specialRemark: trimIfString(values.specialRemark),
        };

        return editOutletCompanyProfile(apiData);
      })
      .then((response) => {
        if (response?.data?.success) {
          message.success(
            t("profileCompletedSuccessfully", sourceKey.user) ||
            "Profile completed successfully!"
          );
          updateOutletStatus({ userId: userId, status: USER_STATUS.ACTIVE }).then(() => {
            if (onRefreshData) {
              onRefreshData();
            }
          })
          onClose();
          if (onSuccess) {
            onSuccess();
          }
        }
      })
      .catch((err) => {
        console.error(err);
        message.error(err?.message || t("pleaseFillRequired", sourceKey.user));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function onClose() {
    setOpen(false);
    if (props.onClose) {
      props.onClose();
    }
  }

  return (
    <>
      <MobileFormDrawer
        closable={true}
        onClose={onClose}
        open={open}
        width={"400px"}
        zIndex={1300}
        title={t("completeYourProfile", sourceKey.user)}
        footer={
          <div className="flex flex-col">
            {step === STEPS.REVIEW && (
              <Button
                loading={loading}
                className={`ant-btn-default ${"bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"} text-white`}
                size="large"
                onClick={() => {
                  handleSave();
                }}
              >
                {loading
                  ? t("submitting", sourceKey.user)
                  : t("completeProfile", sourceKey.user)}
              </Button>
            )}
            {step !== STEPS.REVIEW && (
              <Button
                disabled={true}
                className="ant-btn-default disabled-btn text-white"
                size="large"
              >
                {t("completeProfile", sourceKey.user)}
              </Button>
            )}
          </div>
        }
      >
        <Spin spinning={loading || analyzing}>
          <Form
            form={form}
            autoComplete="off"
            onValuesChange={(changedValues, allValues) => {
              if (
                Object.prototype.hasOwnProperty.call(
                  changedValues,
                  "businessDescription"
                )
              ) {
                const value = changedValues.businessDescription || "";
                setDescriptionCount(countDescriptionWords(value));
              }
            }}
          >
            <div className="space-y-4">
              <div className="font-semibold text-base py-2">
                {t("accountInformation", sourceKey.user)}
              </div>

              <ContactInput
                label={t("phoneNumber", sourceKey.user)}
                fieldName="phoneNumber"
                placeholder={t("select", sourceKey.user)}
                placeholderInput="000000000"
                rules={formRules.contactNo}
                rulesCode={formRules.countryCode}
              />
              <TextAreaInput
                label={t("pinnedCompanyNameLocation", sourceKey.user)}
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

              <div className="mt-4">
                <div className="font-semibold text-base py-2">
                  {t("businessInformation", sourceKey.user)}
                </div>

                {step === STEPS.CHOOSE && (
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-gray-500">{t("nTsetUpBusinessInfoDesc", sourceKey.user)}</p>
                    <div className="flex flex-col gap-4">
                      <SelectionCard
                        active
                        icon={<TranslationOutlined style={{ fontSize: "22px", color: "#22c55e" }} />}
                        title={t("nTuseAIToHelp", sourceKey.user)}
                        description={t("nTuseAIToHelpDesc", sourceKey.user)}
                        badge={t("nTrecommended", sourceKey.user)}
                        onClick={() => {
                          form.resetFields(["companyLink"]);
                          setShowAnalysisFailed(false);
                          setStep(STEPS.BRAND_ANALYSIS);
                        }}
                      />
                      <SelectionCard
                        icon={<AppstoreOutlined style={{ fontSize: "22px", color: "#9CA3AF" }} />}
                        title={t("nTmanualSetUpBusiness", sourceKey.user)}
                        description={t("nTmanualSetUpBusinessDesc", sourceKey.user)}
                        badge={t("nTmanualSetUp", sourceKey.user)}
                        onClick={() => setStep(STEPS.REVIEW)}
                      />
                    </div>
                  </div>
                )}

                {step === STEPS.BRAND_ANALYSIS && (
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-gray-500">{t("nTpasteCompanyUrlDesc", sourceKey.user)}</p>
                    {showAnalysisFailed && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {t("analyzingBrandFailed", sourceKey.user)}
                      </div>
                    )}
                    <StringInput
                      fieldName="companyLink"
                      label={t("nTcompanyUrl", sourceKey.user)}
                      placeholder="https://yourbusiness.com"
                      rules={[{ required: true, message: t("companyLinkRequired", sourceKey.user) }]}
                    />
                    <Button
                      className="w-full h-[48px] bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold border-none hover:opacity-90 mt-2"
                      loading={analyzing}
                      onClick={handleBrandAnalysis}
                    >
                      <span className="flex items-center justify-center">
                        <SparkleIcon />
                        {t("nTanalyzeBrand", sourceKey.user)}
                      </span>
                    </Button>
                    <Button
                      className="w-full h-[44px] bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 mt-2"
                      onClick={() => setStep(STEPS.CHOOSE)}
                    >
                      {t("back", sourceKey.user)}
                    </Button>
                    {showAnalysisFailed && (
                      <Button
                        className="w-full h-[44px] bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 mt-2"
                        onClick={() => setStep(STEPS.REVIEW)}
                      >
                        {t("nTmanualSetUpBusiness", sourceKey.user)}
                      </Button>
                    )}
                  </div>
                )}

                {step === STEPS.REVIEW && (
                  <div className="space-y-4 pt-2">
                    {
                      // type !== "complete" && (
                      <>
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
                      </>
                      // )
                    }
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
                        <>
                          <div className="flex small-text-size">
                            <span className="whitespace-normal break-words" style={{ display: 'inline-block', maxWidth: '100%' }}>
                              {t("businessDetailsCopy", sourceKey.user)}{"\u00A0"}
                              <img
                                src={InstructionIcon}
                                alt="Instruction Icon"
                                className="inline-block w-4 h-4 cursor-pointer"
                                style={{ width: 16, height: 16 }}
                                onClick={() => {
                                  const desc = t("businessDetailsDesc", sourceKey.user);
                                  form.setFieldsValue({ businessDescription: desc });
                                  setDescriptionCount(countDescriptionWords(desc));
                                }}
                              />
                            </span>
                          </div>
                        </>
                      }
                    />
                    <div className="flex justify-end items-center small-text-size second-grey-text">
                      <div
                        className={`${descriptionCount > DESCRIPTION_MAX ? "red-text" : ""} ml-2`}
                      >
                        {descriptionCount}/{DESCRIPTION_MAX}
                      </div>
                    </div>
                    <Button
                      className="w-full h-[44px] bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 mt-4"
                      onClick={() => setStep(STEPS.CHOOSE)}
                    >
                      {t("back", sourceKey.user)}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Form>
        </Spin>
      </MobileFormDrawer>
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = {
  loginSuccessful,
  updateUser,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(EditOutletCompanyProfileDrawer));
