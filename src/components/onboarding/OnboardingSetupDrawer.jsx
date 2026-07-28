import { AppstoreOutlined, TranslationOutlined, RightOutlined } from "@ant-design/icons";
import { Form, Button, message, Spin } from "antd";
import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
import StringInput from "@/components/general/input/StringInput";
import TextAreaInput from "@/components/general/input/TextAreaInput";
import DropdownInput from "@/components/general/input/DropdownInput";
import { useForm } from "antd/lib/form/Form";
import { useFormRules } from "@/constant/formRules";
import { trimIfString } from "@/utility/common-functions";
import editOwnCompanyProfile from "@/pages/api/auth/editOwnCompanyProfile";
import startOnboarding from "@/pages/api/onboarding/startOnboarding";
import getIndustryListing from "@/pages/api/industry/getIndustryListing";
import { updateBusinessInfo as updateBusinessInfoAction } from "@/redux/actions/user-actions";
import { InstructionIcon } from "../../../public/assets";

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

const DESCRIPTION_MAX = 300;

const countDescriptionWords = (value = "") => {
    const englishWords = value.split(/\s+/).filter((word) => /[a-zA-Z]/.test(word));
    const chineseCharacters = value.split("").filter((char) => /[\u4e00-\u9fa5]/.test(char));
    return englishWords.length + chineseCharacters.length;
};

const SelectionCard = ({ icon, title, description, badge, onClick, active }) => (
    <div
        onClick={onClick}
        className={`relative flex-1 p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[200px] flex flex-col items-start text-left
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

const OnboardingSetupDrawer = (props) => {
    const { open, onClose, onSuccess, user } = props;
    const { t } = useTranslation();
    const [step, setStep] = useState(STEPS.CHOOSE);
    const [loading, setLoading] = useState(false);
    const [showAnalysisFailed, setShowAnalysisFailed] = useState(false);
    const [prefillData, setPrefillData] = useState(null);
    const [descriptionCount, setDescriptionCount] = useState(0);
    const [form] = useForm();
    const formRules = useFormRules(t, sourceKey);
    const [industryOptions, setIndustryOptions] = useState([]);

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
    }, [open]);

    function handleClose() {
        setStep(STEPS.CHOOSE);
        setShowAnalysisFailed(false);
        setPrefillData(null);
        setDescriptionCount(0);
        form.resetFields();
        if (onClose) onClose();
    }

    function handleManual() {
        const userBusinessInfo = user?.user?.businessInfo || {};
        const availableValues = industryOptions.map((o) => o.value);
        const industry = availableValues.includes(userBusinessInfo.industry)
            ? userBusinessInfo.industry
            : undefined;
        const data = {
            industry,
            businessDescription: userBusinessInfo.businessDescription || "",
        };
        setPrefillData(data);
        openReviewStep(data);
    }

    function openReviewStep(data) {
        const availableValues = industryOptions.map((o) => o.value);
        const industry = availableValues.includes(data?.industry) ? data.industry : undefined;
        form.setFieldsValue({
            industry: industry,
            businessDescription: data?.businessDescription
                ? data.businessDescription.replace(/\\n/g, "\n")
                : "",
        });
        setDescriptionCount(countDescriptionWords(data?.businessDescription || ""));
        setStep(STEPS.REVIEW);
    }

    async function handleBrandAnalysis() {
        try {
            await form.validateFields(["companyLink"]);
        } catch {
            return;
        }
        const companyLink = form.getFieldValue("companyLink");
        setLoading(true);
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
                    form.resetFields(["companyLink"]);
                    openReviewStep(result);
                }
            } else {
                setShowAnalysisFailed(true);
            }
        } catch (err) {
            setShowAnalysisFailed(true);
        } finally {
            setLoading(false);
        }
    }

    function handleReviewSubmit() {
        form.validateFields(["industry", "businessDescription"]).then((values) => {
            setLoading(true);
            editOwnCompanyProfile({
                industry: trimIfString(values.industry),
                businessDescription: trimIfString(values.businessDescription),
            })
                .then((res) => {
                    const businessInfoData = res?.data?.data?.data;
                    if (businessInfoData) {
                        props.updateBusinessInfoAction(businessInfoData);
                    }
                    message.success(t("profileUpdatedSuccessfully", sourceKey.user));
                    handleClose();
                    if (onSuccess) onSuccess();
                })
                .catch((err) => {
                    message.error(err.message);
                })
                .finally(() => {
                    setLoading(false);
                });
        });
    }

    const getTitle = () => {
        if (step === STEPS.CHOOSE) return t("nTsetUpBusinessInfo", sourceKey.user);
        if (step === STEPS.BRAND_ANALYSIS) return t("nTbrandAnalysis", sourceKey.user);
        return t("nTreviewBusinessInfo", sourceKey.user);
    };

    const getBackAction = () => {
        if (step === STEPS.CHOOSE) return handleClose;
        if (step === STEPS.BRAND_ANALYSIS) return () => setStep(STEPS.CHOOSE);
        return () => {
            form.resetFields(["industry", "businessDescription"]);
            setStep(STEPS.CHOOSE);
        };
    };

    const stepContent = (() => {
        if (step === STEPS.CHOOSE) {
            return (
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
                            onClick={handleManual}
                        />
                    </div>
                </div>
            );
        }

        if (step === STEPS.BRAND_ANALYSIS) {
            return (
                <Spin spinning={loading} tip={t("analyzingBrandLoading", sourceKey.user)}>
                    <div className="space-y-4 pt-2">
                        <p className="text-sm text-gray-500">{t("nTpasteCompanyUrlDesc", sourceKey.user)}</p>
                        {showAnalysisFailed && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {t("analyzingBrandFailed", sourceKey.user)}
                            </div>
                        )}
                        <Form form={form} layout="vertical">
                            <StringInput
                                fieldName="companyLink"
                                label={t("nTcompanyUrl", sourceKey.user)}
                                placeholder="https://yourbusiness.com"
                                rules={formRules.companyLink || [{ required: true, message: t("companyLinkRequired", sourceKey.user) }]}
                            />
                        </Form>
                        <Button
                            className="w-full h-[48px] bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold border-none hover:opacity-90"
                            loading={loading}
                            onClick={handleBrandAnalysis}
                        >
                            <span className="flex items-center justify-center">
                                <SparkleIcon />
                                {t("nTanalyzeBrand", sourceKey.user)}
                            </span>
                        </Button>
                        {showAnalysisFailed && (
                            <Button
                                className="w-full h-[44px] bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                                onClick={handleManual}
                            >
                                {t("nTmanualSetUpBusiness", sourceKey.user)}
                            </Button>
                        )}
                    </div>
                </Spin>
            );
        }

        // REVIEW step
        return (
            <div className="space-y-4 pt-2">
                <Form
                    form={form}
                    layout="vertical"
                    onValuesChange={(changedValues, allValues) => {
                        if (Object.prototype.hasOwnProperty.call(changedValues, "businessDescription")) {
                            setDescriptionCount(countDescriptionWords(allValues.businessDescription || ""));
                        }
                    }}
                >
                    <DropdownInput
                        fieldName="industry"
                        placeholder={t("chooseIndustry", sourceKey.user)}
                        rules={formRules.industry}
                        label={t("industry", sourceKey.user)}
                        options={industryOptions}
                    />
                    <TextAreaInput
                        label={t("businessDetails", sourceKey.user)}
                        fieldName="businessDescription"
                        placeholder={t("businessDetailsDesc", sourceKey.user)}
                        rules={formRules.businessDescription}
                        rows={9}
                        extraLabel={
                            <div className="flex small-text-size">
                                <span className="whitespace-normal break-words" style={{ display: "inline-block", maxWidth: "100%" }}>
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
                        }
                    />
                    <div className="flex justify-end small-text-size second-grey-text">
                        <div className={descriptionCount > DESCRIPTION_MAX ? "red-text" : ""}>
                            {descriptionCount}/{DESCRIPTION_MAX}
                        </div>
                    </div>
                </Form>
            </div>
        );
    })();

    const drawerFooter = step === STEPS.REVIEW ? (
        <Button
            className="w-full h-[48px] bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold border-none hover:opacity-90"
            loading={loading}
            onClick={handleReviewSubmit}
        >
            {t("save", sourceKey.user)}
        </Button>
    ) : null;

    return (
        <MobileFormDrawer
            open={open}
            onClose={getBackAction()}
            title={getTitle()}
            width="400px"
            zIndex={1200}
            footer={drawerFooter}
        >
            {stepContent}
        </MobileFormDrawer>
    );
};

const mapStateToProps = (state) => ({
    user: state.user,
});

const mapDispatchToProps = {
    updateBusinessInfoAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(OnboardingSetupDrawer);
