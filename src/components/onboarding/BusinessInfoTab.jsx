import { SettingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { connect } from "react-redux";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import OnboardingSetupDrawer from "@/components/onboarding/OnboardingSetupDrawer";
import { updateBusinessInfo as updateBusinessInfoAction } from "@/redux/actions/user-actions";

const INDUSTRY_DISPLAY = {
    "Food & Beverage": "foodAndBeverage",
    "Beauty & Hair": "beautyAndHair",
    "Gyms & Yoga Studios": "gymsAndYogaStudios",
    "SPA, Massage & Wellness": "spaMassageAndWellness",
    "Dentists & Aesthetic Clinics": "dentistsAndAestheticClinics",
    "Pet Industry": "petIndustry",
    "Furniture & Home Stores": "furnitureAndHomeStores",
    "Photography & Bridal Studios": "photographyAndBridalStudios",
    "Optical Shops": "opticalShops",
    "Car Wash & Auto Detailing": "carWashAndAutoDetailing",
    "Others": "others",
};

const BusinessInfoTab = (props) => {
    const { user } = props;
    const { t } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const businessInfo = user?.user?.businessInfo || {};
    const industry = businessInfo.industry;
    const businessDescription = businessInfo.businessDescription;

    const industryDisplay = industry
        ? (INDUSTRY_DISPLAY[industry] ? t(INDUSTRY_DISPLAY[industry], sourceKey.user) : industry)
        : null;

    const isEmpty = !industry && !businessDescription;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {t("businessInfo", sourceKey.user)}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {t("nTbusinessInfoTabDesc", sourceKey.user)}
                    </p>
                </div>
                <SettingOutlined
                    className="text-xl cursor-pointer hover:opacity-70 text-gray-600"
                    onClick={() => setDrawerOpen(true)}
                />
            </div>

            {isEmpty ? (
                /* Empty State */
                <div
                    className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-all"
                    onClick={() => setDrawerOpen(true)}
                >
                    <SettingOutlined className="text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-400 font-medium">{t("nTsetUpBusinessInfo", sourceKey.user)}</p>
                    <p className="text-sm text-gray-300 mt-1">{t("nTsetUpBusinessInfoDesc", sourceKey.user)}</p>
                </div>
            ) : (
                /* Info Display */
                <div className="space-y-4">
                    {/* Industry */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            {t("industry", sourceKey.user)}
                        </div>
                        <div className="text-gray-900 font-medium">
                            {industryDisplay || <span className="text-gray-400 italic">{t("nTnotSet", sourceKey.user)}</span>}
                        </div>
                    </div>

                    {/* Business Description */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            {t("businessDetails", sourceKey.user)}
                        </div>
                        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {businessDescription || <span className="text-gray-400 italic">{t("nTnotSet", sourceKey.user)}</span>}
                        </div>
                    </div>
                </div>
            )}

            <OnboardingSetupDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onSuccess={() => setDrawerOpen(false)}
            />
        </div>
    );
};

const mapStateToProps = (state) => ({
    user: state.user,
});

const mapDispatchToProps = {
    updateBusinessInfoAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(BusinessInfoTab);
