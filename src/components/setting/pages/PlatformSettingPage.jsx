import React, { useEffect, useState } from 'react';
import { Button, Form, message, Collapse, Switch } from 'antd'; // Added Collapse and Switch
import { useForm } from 'antd/lib/form/Form';
import { connect } from 'react-redux';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import StringInput from '@/components/general/input/StringInput';
import SwitchInput from '@/components/general/input/SwitchInput';
import { GoogleReview, OthersIcon } from '../../../../public/assets';
import getUserPlatforms from '@/pages/api/platforms/getUserPlatforms';
import { trimIfString } from '@/utility/common-functions';
import { useFormRules } from '@/constant/formRules';
import { useRouter } from 'next/router';
import editUserPlatformV2 from '@/pages/api/platforms/editUserPlatformV2';
import { LeftOutlined } from '@ant-design/icons';
import { PLATFORM_NAME, PLATFORM_STATUS, PLATFORM_TYPE } from '@/constant/template';
import { getPlatformIcon } from '@/utility/ImagesFunction';

const { Panel } = Collapse;

const PlatformSettingPage = (props) => {
    const { user } = props;
    const { t } = useTranslation();
    const [form] = useForm();
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [switchStates, setSwitchStates] = useState({});
    const formRules = useFormRules(t, sourceKey);
    const router = useRouter();

    useEffect(() => {
        const userId = router.query.userId || user?.user?._id;
        if (userId) {
            getPlatformsData(userId);
        }
    }, [router.query.userId, user?.user?._id]);

    function getPlatformsData(userId) {
        getUserPlatforms(10, 0, { userId: userId })
            .then((res) => {
                const userPlatforms = res?.userPlatforms || [];
                setDataSource(userPlatforms);

                const formValues = {};
                const initialSwitchStates = {};

                userPlatforms.forEach((platform) => {
                    const platformTitle = platform.title;
                    const statusValue = platform.status === PLATFORM_STATUS.ACTIVE;
                    formValues[`${platformTitle}Status`] = statusValue;
                    initialSwitchStates[platformTitle] = statusValue;

                    if (platform.url && platformTitle !== 'Others') {
                        formValues[`${platformTitle}OfficialPageUrl`] = trimIfString(platform.url);
                    }
                });

                form.setFieldsValue(formValues);
                setSwitchStates(initialSwitchStates);
            })
            .catch((err) => console.error('❌ getPlatformsData failed:', err));
    }

    // Build and Sort platformsToRender
    const platformsToRender = (dataSource || [])
        .filter((userPlatform) => userPlatform && userPlatform._id)
        .map((userPlatform) => ({
            _id: userPlatform._id,
            title: userPlatform.title,
            key: userPlatform.title,
            platform: userPlatform.title,
            icon: getPlatformIcon(userPlatform.title),
            status: userPlatform.status,
            url: userPlatform.url,
            type: userPlatform.type,
        }))
        .sort((a, b) => {
            if (a.title === PLATFORM_NAME.GOOGLE_REVIEW) return -1;
            if (b.title === PLATFORM_NAME.GOOGLE_REVIEW) return 1;

            // 2. Others always last
            if (a.title === PLATFORM_NAME.OTHERS) return 1;
            if (b.title === PLATFORM_NAME.OTHERS) return -1;

            return 0;
        });

    // --- LOGIC FOR GROUPING ---
    const regularPlatforms = platformsToRender.filter(p => p.type !== PLATFORM_TYPE.OTHER);
    const otherPlatforms = platformsToRender.filter(p => p.type === PLATFORM_TYPE.OTHER);

    // Check if ALL "Other" platforms are ON
    const isAllOtherOn = otherPlatforms.length > 0 && otherPlatforms.every(p => switchStates[p.title]);

    // Handle the Master Toggle click
    const handleMasterToggle = (checked) => {
        const newStates = { ...switchStates };
        const formUpdates = {};

        otherPlatforms.forEach(p => {
            newStates[p.title] = checked;
            formUpdates[`${p.key}Status`] = checked;
        });

        setSwitchStates(newStates);
        form.setFieldsValue(formUpdates);
    };

    function handleConfirm() {
        // When Panel is collapsed, the form fields inside might not be registered or validated correctly 
        // if `preserve={false}` (default for some setups, though AntD default is true).
        // However, `validateFields()` only returns values for registered fields.
        // We should merge `switchStates` into the final check since `handleMasterToggle` updates state directly.

        form.validateFields().then(async (values) => {
            try {
                setLoading(true);
                const requests = platformsToRender.map((p) => {
                    const title = p.title;

                    // Priority: 1. Form value (if rendered) 2. State value (if collapsed/hidden)
                    // If form value is undefined (not rendered), fall back to switchStates
                    let statusBool = values[`${title}Status`];

                    if (statusBool === undefined) {
                        statusBool = switchStates[title];
                    }

                    const payload = {
                        userPlatformId: p._id,
                        status: !!statusBool ? PLATFORM_STATUS.ACTIVE : PLATFORM_STATUS.INACTIVE,
                        url: values[`${title}OfficialPageUrl`] || '',
                        ...(router.query.userId ? { userId: router.query.userId } : {}),
                    };
                    return editUserPlatformV2(payload);
                });

                await Promise.all(requests);
                message.success(t('changesSaved', sourceKey.user));
                getPlatformsData(router.query.userId || user?.user?._id);
            } catch (err) {
                message.error(err?.message || 'Save failed');
            } finally {
                setLoading(false);
            }
        });
    }

    // Helper component to avoid repeating code
    const RenderPlatformItem = (item) => {
        const isSwitchOn = switchStates[item.title] || false;
        return (
            <div key={item.key} className="border rounded-lg p-4 mb-4 bg-white">
                <div className="w-full flex justify-between items-center mb-3">
                    <div className="flex flex-row gap-3 items-center">
                        {item.icon && (
                            <img src={item.icon} alt={item.platform} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                        )}
                        <div className="font-medium text-base">{item.platform}</div>
                    </div>
                    <SwitchInput
                        fieldName={`${item.key}Status`}
                        onChange={(checked) => {
                            setSwitchStates((prev) => ({ ...prev, [item.title]: checked }));
                        }}
                    />
                </div>
                {item.type === PLATFORM_TYPE.URL && (
                    <StringInput
                        label={t('officialPageUrl', sourceKey.user)}
                        fieldName={`${item.key}OfficialPageUrl`}
                        placeholder={t('enterBusinessUrl', sourceKey.user)}
                        style={{ margin: 0 }}
                        rules={isSwitchOn ? formRules.url : []}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex flex-row items-center gap-4 mb-6">
                {router?.query.userId && (
                    <div className="cursor-pointer" onClick={() => router.back()}><LeftOutlined /></div>
                )}
                <h1 className="text-2xl font-bold text-gray-900">{t('businessSetting', sourceKey.user)}</h1>
            </div>

            <Form form={form} autoComplete="off" layout="vertical">
                {/* 1. Render Regular Platforms */}
                {regularPlatforms.map(item => RenderPlatformItem(item))}

                {otherPlatforms.length > 0 && (
                    <Collapse className="overflow-hidden border bg-transparent" expandIconPosition="end">
                        <Panel
                            key="others"
                            className="rounded-lg bg-white"
                            header={
                                <div className="flex justify-between items-center w-full pr-4" onClick={(e) => e.stopPropagation()}>
                                    <span className="font-bold text-lg">{t('nTallPlatforms', sourceKey.user)}</span>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checkedChildren={t('nTall', sourceKey.user)}
                                            checked={isAllOtherOn}
                                            onChange={handleMasterToggle}
                                        />
                                    </div>
                                </div>
                            }
                        >
                            {otherPlatforms.map(item => RenderPlatformItem(item))}
                        </Panel>
                    </Collapse>
                )}
            </Form>

            <div className="mt-6">
                <Button
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-none"
                    size="large"
                    loading={loading}
                    onClick={handleConfirm}
                >
                    {t('saveChanges', sourceKey.user)}
                </Button>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({ user: state.user });
export default connect(mapStateToProps)(PlatformSettingPage);