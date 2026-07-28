import React, { useEffect, useState } from 'react';
import { Button, Form, message, Tooltip, Tabs } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import BusinessInfoTab from '@/components/onboarding/BusinessInfoTab';
import { useForm } from 'antd/lib/form/Form';
import { connect } from 'react-redux';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { useFormRules } from '@/constant/formRules';
import TextAreaInput from '@/components/general/input/TextAreaInput';
import StringInput from '@/components/general/input/StringInput';
import ContactInput from '@/components/general/input/ContactInput';
import { updateUser, updateBusinessInfo } from '@/redux/actions/user-actions';
import { trimIfString } from '@/utility/common-functions';
import editOwnCompanyProfile from '@/pages/api/auth/editOwnCompanyProfile';
import DropdownInput from '@/components/general/input/DropdownInput';
import NumberInput from '@/components/general/input/NumberInput';
import { InstructionIcon, LocationExample } from '../../../../public/assets';
import stateCityData from '@/constants/state-city.json';
import { ArrowRight, Edit3, Save } from 'lucide-react';
import { ProfilePreview } from '../components/ProfilePreview';
import { ImageUploader } from '@/components/general/components/ImageUploader';
import getPictureByUserId from '@/pages/api/user/getPictureByUserId';
import images from '@/pages/api/upload/images';
const ProfileSettingPage = (props) => {
    const { user } = props;
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [form] = useForm();
    const [descriptionCount, setDescriptionCount] = useState(0);
    const DESCRIPTION_MAX = 300;
    const formRules = useFormRules(t, sourceKey);
    const userIdentity = user?.user?.role;
    const [selectedState, setSelectedState] = useState("");
    const [cityOptions, setCityOptions] = useState([]);
    const [isEditing, setIsEditing] = useState(true);
    const [bannerUrl, setBannerUrl] = useState(null);      // State for image URLs
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    const handleStateChange = (value) => {
        setSelectedState(value);
        // Reset city field when state changes
        form.setFieldsValue({ city: undefined });

        // Update city options based on selected state
        if (value && stateCityData[value]) {
            const cities = stateCityData[value].map(city => ({
                title: city,
                value: city
            }));
            setCityOptions(cities);
        } else {
            setCityOptions([]);
        }
    };


    useEffect(() => {
        // Set initial form values from user data
        form.setFieldsValue({
            businessName: user?.user?.businessInfo?.businessName,
            businessEmail: user?.user?.businessInfo?.businessEmail,
            phoneNumber: user?.user?.businessInfo?.phoneNumber,
            address: user?.user?.businessInfo?.businessAddress?.address,
            specialRemark:
                user?.user?.businessInfo?.specialRemark ||
                user?.user?.businessInfo?.businessAddress?.address,
            state: user?.user?.businessInfo?.businessAddress?.state,
            city: user?.user?.businessInfo?.businessAddress?.city,
            zipcode: user?.user?.businessInfo?.businessAddress?.zipcode,
            industry: user?.user?.businessInfo?.industry,
            businessDescription: user?.user?.businessInfo?.businessDescription,
            phoneNumberCountryCode: user?.user?.businessInfo?.countryCode,
        });

        // Initialize description counter from existing user value
        const initText = user?.user?.businessInfo?.businessDescription || '';
        const englishWords = initText
            .split(/\s+/)
            .filter((word) => /[a-zA-Z]/.test(word));
        const chineseCharacters = initText
            .split('')
            .filter((char) => /[\u4e00-\u9fa5]/.test(char));
        setDescriptionCount(englishWords.length + chineseCharacters.length);
    }, [user]);

    function handleSubmit() {
        form
            .validateFields()
            .then((values) => {
                setLoading(true);

                const apiData = {
                    // businessName: trimIfString(values.businessName),
                    // businessEmail: trimIfString(values.businessEmail),
                    phoneNumber:
                        values.phoneNumberCountryCode === '+60' &&
                            values.phoneNumber?.startsWith('0')
                            ? values.phoneNumber.slice(1)
                            : values.phoneNumber,
                    ...(userIdentity === "outlet" ? {
                        businessAddress: {
                            address: trimIfString(values.address),
                            state: trimIfString(values.state),
                            zipcode: trimIfString(values.zipcode),
                            city: trimIfString(values.city),
                        },
                        specialRemark: trimIfString(values.specialRemark),
                    } : {}),
                    countryCode: values.phoneNumberCountryCode,
                };

                editOwnCompanyProfile(apiData)
                    .then((res) => {
                        message.success(res?.data?.data?.message || t('profileUpdatedSuccessfully', sourceKey.user));

                        // The API returns businessInfo directly, not wrapped in a user object
                        const businessInfoData = res?.data?.data?.data;

                        if (businessInfoData) {
                            props.updateBusinessInfo(businessInfoData);
                        }
                    })
                    .catch((err) => {
                        message.error(err.message);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            })
            .catch((err) => {
                console.log('Validation Failed:', err);
            });
    }

    const handleSave = async () => {
        if (bannerUrl || avatarUrl) {
            const data = {};
            try {
                if (bannerFile) {
                    const uploadResponse = await images({ images: [bannerFile] });
                    const uploadedUrl = uploadResponse?.data?.data?.imageUrls?.[0];
                    if (uploadedUrl) {
                        data.backgroundImageUrl = uploadedUrl;
                    }
                }
                if (avatarFile) {
                    const uploadResponse = await images({ images: [avatarFile] });
                    const uploadedUrl =
                        uploadResponse?.data?.data?.imageUrls?.[0]
                    if (uploadedUrl) {
                        data.profilePictureUrl = uploadedUrl;
                    }
                }
                await editOwnCompanyProfile(data);
                await getData();
                const res = await getPictureByUserId(0, 0, { userId: user.user._id });
                props.updateBusinessInfo({
                    profilePictureUrl: res?.data?.businessInfo?.profilePictureUrl,
                });
                setIsEditing(false);
            } catch (err) {
                message.error(err?.message || "Failed to update photo");
            }
        };
    };

    useEffect(() => { getData() }, [])

    function getData() {
        let searchProfile = true;
        const fetchPictures = async () => {
            if (!user.user?._id) return;
            try {
                const res = await getPictureByUserId(0, 0, { userId: user.user._id });
                if (!searchProfile) return;

                const businessInfo = res?.data?.businessInfo;

                if (!businessInfo) {
                    setIsEditing(true);
                    return;
                }

                setIsEditing(false);
                if (businessInfo.backgroundImageUrl) {
                    setBannerUrl(businessInfo.backgroundImageUrl);
                }
                if (businessInfo.profilePictureUrl) {
                    setAvatarUrl(businessInfo.profilePictureUrl);
                }
            } catch (error) {
                if (!searchProfile) return;
                setIsEditing(true);
            }
        };
        fetchPictures();
        return () => {
            searchProfile = false;
        };
    } [user?.user?._id];

    const handleImageSelect = (file, type) => {           // Handle file selection → create preview URL
        const objectUrl = URL.createObjectURL(file);
        if (type === "banner") {
            setBannerUrl(objectUrl);
            setBannerFile(file);
        }
        else {
            setAvatarUrl(objectUrl);
            setAvatarFile(file);
        }
    };

    const handleClear = (type) => {
        if (type === "banner") {
            setBannerUrl(null);
            setBannerFile(null);
        }
        else {
            setAvatarUrl(null);
            setAvatarFile(null);
        }
    };

    // If all images cleared while not in editing mode → return to editing
    useEffect(() => {
        if (!bannerUrl && !avatarUrl && !isEditing) {
            setIsEditing(true);
        }
    }, [bannerUrl, avatarUrl, isEditing]);

    const stateOptions = Object.keys(stateCityData).map(state => ({
        title: state,
        value: state
    }));

    const profileInfoContent = (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {t('editProfile', sourceKey.user)}
                </h1>
            </div>
            <Form
                form={form}
                autoComplete="off"
                layout="vertical"
                onValuesChange={(changedValues, allValues) => {
                    if (
                        Object.prototype.hasOwnProperty.call(
                            changedValues,
                            'businessDescription'
                        )
                    ) {
                        const text = allValues.businessDescription || '';
                        const englishWords = text
                            .split(/\s+/)
                            .filter((word) => /[a-zA-Z]/.test(word));
                        const chineseCharacters = text
                            .split('')
                            .filter((char) => /[\u4e00-\u9fa5]/.test(char));
                        setDescriptionCount(
                            englishWords.length + chineseCharacters.length
                        );
                    }
                }}
            >
                <StringInput
                    label={`${t('businessName', sourceKey.user)}`}
                    fieldName="businessName"
                    placeholder={t('enterBusinessName', sourceKey.user)}
                    rules={formRules.businessName}
                    disabled={true}
                />
                <StringInput
                    label={`${t('businessEmail', sourceKey.user)}`}
                    fieldName="businessEmail"
                    placeholder={t('enterBusinessEmail', sourceKey.user)}
                    rules={formRules.businessEmail}
                    disabled={true}
                />
                <ContactInput
                    label={t('phoneNumber', sourceKey.user)}
                    fieldName="phoneNumber"
                    placeholder={t('select', sourceKey.user)}
                    placeholderInput="000000000"
                    rules={formRules.contactNo}
                    rulesCode={formRules.countryCode}
                />
                {userIdentity === "outlet" && (
                    <>
                        <TextAreaInput
                            label={t("pinnedCompanyNameLocation", sourceKey.user)}
                            fieldName="address"
                            rules={formRules.address}
                            placeholder={t("enterAddress", sourceKey.user)}
                        />

                        <StringInput
                            label={
                                <span>
                                    {t("specialRemark", sourceKey.user)}{" "}
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
                            showSearch={true}
                            onChange={handleStateChange}
                        />

                        <DropdownInput
                            label={t("city", sourceKey.user)}
                            fieldName="city"
                            rules={formRules.city}
                            options={cityOptions}
                            placeholder={selectedState ? t("selectCity", sourceKey.user) : t("selectStateFirst", sourceKey.user)}
                            showSearch={true}
                        // disabled={!selectedState || cityOptions.length === 0}
                        />

                        <NumberInput
                            label={t("zipCode", sourceKey.user)}
                            fieldName="zipcode"
                            placeholder={t("enterZipCode", sourceKey.user)}
                            rules={formRules.zipCode}
                        /> */}
                    </>
                )}
                {userIdentity === "masterHQ" && (
                    <>
                        {/* masterHQ: industry/description managed separately */}
                    </>
                )}

                <div className="mt-6">
                    <Button
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                        size="large"
                        loading={loading}
                        onClick={handleSubmit}
                    >
                        {t('save', sourceKey.user)}
                    </Button>
                </div>
            </Form>
        </>
    );

    const profilePictureContent = (
        <>
            <div className="min-h-screen py-2 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Profile Settings
                        </h1>
                        <p className="text-slate-500 max-w-lg">
                            Customize your profile with a banner and profile photo.
                        </p>
                    </div>
                    {/* Preview Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                {isEditing ? "Live Preview" : "Current Profile"}
                            </h2>
                            {/* Hint text */}
                            {isEditing && !bannerUrl && !avatarUrl && (
                                <div className="flex items-center justify-center gap-2 text-sm text-slate-400 animate-pulse">
                                    <ArrowRight size={16} />
                                    <span>Upload images to preview your profile</span>
                                </div>
                            )}
                        </div>

                        {/* Preview Card */}
                        <ProfilePreview
                            bannerUrl={bannerUrl}
                            avatarUrl={avatarUrl}
                            className="transform transition-all duration-500 hover:shadow-2xl"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex">
                        <div className="flex gap-3">
                            {isEditing ? (
                                <Button
                                    onClick={handleSave}
                                    disabled={!bannerUrl && !avatarUrl}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all ${(!bannerUrl && !avatarUrl)
                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                        : "bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                        }`}
                                >
                                    <Save size={18} />
                                    Save Changes
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-slate-700 border border-slate-200 hover:border-brand-300 hover:text-brand-600 font-medium transition-all shadow-sm hover:shadow-md"
                                >
                                    <Edit3 size={18} />
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Editor Section */}
                    {isEditing && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <div className="flex flex-col md:flex-row gap-6">

                                <ImageUploader
                                    label="Cover Image"
                                    currentImage={bannerUrl}
                                    onImageSelected={(file) => handleImageSelect(file, "banner")}
                                    onClear={() => handleClear("banner")}
                                    aspectRatioLabel="3:1"
                                />

                                <ImageUploader
                                    label="Profile Photo"
                                    currentImage={avatarUrl}
                                    onImageSelected={(file) => handleImageSelect(file, "avatar")}
                                    onClear={() => handleClear("avatar")}
                                    aspectRatioLabel="1:1"
                                />
                            </div>
                        </div>
                    )}

                </div>
            </div></>
    );

    const tabItems = [
        {
            key: "profile-info",
            label: t("profileInfo", sourceKey.user),
            children: profileInfoContent,
        },
        ...(userIdentity !== "masterHQ" ? [{
            key: "profile-picture",
            label: t("profilePicture", sourceKey.user),
            children: profilePictureContent,
        }] : []),
        ...(userIdentity === "outlet" ? [{
            key: "business-info",
            label: t("businessInfo", sourceKey.user),
            children: <BusinessInfoTab />,
        }] : []),
    ];

    return (

        <div className="bg-white rounded-lg p-3">
            <Tabs defaultActiveKey="profile-info" items={tabItems} />
        </div>
    );
};

const mapStateToProps = (state) => ({
    user: state.user,
});

const mapDispatchToProps = {
    updateUser,
    updateBusinessInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileSettingPage);
