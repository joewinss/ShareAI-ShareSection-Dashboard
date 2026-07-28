import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Input, message, Pagination, Row, Switch, Tabs } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { useForm } from 'antd/lib/form/Form';
import { useFormRules } from '@/constant/formRules';
import MobileFormDrawer from '@/components/general/components/MobileFormDrawer';
import editOutletCompanyProfile from '@/pages/api/user/editOutletCompanyProfile';
import DatePickerInput from '@/components/general/input/DatePickerInput';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import SwitchInput from '@/components/general/input/SwitchInput';
import { useRefreshOutletBadgeCount } from '@/hooks/useOutletBadgeCount';

const EditExpiredDateDrawer = (props) => {
    const { selectedRecord } = props;
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = useForm();
    const formRules = useFormRules(t, sourceKey);
    const refreshOutletBadgeCount = useRefreshOutletBadgeCount();



    useEffect(() => {
        setOpen(props?.open === true);
        if (!isEmpty(selectedRecord)) {
            const formattedExpiredDate = selectedRecord?.expiredAt ? dayjs(selectedRecord?.expiredAt) : null;
            form.setFieldsValue({
                businessName: selectedRecord?.businessInfo?.businessName,
                email: selectedRecord?.businessInfo?.businessEmail,
                expiredAt: formattedExpiredDate,
                contentPermission: selectedRecord?.contentPermission || false,
            })
        } else {
            form.resetFields();
        }
    }, [props?.open, selectedRecord]);

    function handleSave() {
        setLoading(true);

        form.validateFields()
            .then((values) => {
                const apiData = {
                    userId: selectedRecord?._id,
                    ...values,
                    contentPermission: values?.contentPermission || false,
                };
                return editOutletCompanyProfile(apiData);
            })
            .then((response) => {
                if (response) {
                    message.success(response.data?.message || t("success", sourceKey.user));
                    refreshOutletBadgeCount();
                }
                setLoading(false);
                onClose();
                props.onRefreshData();
            })
            .catch((err) => {
                setLoading(false);
                console.log(err);
                message.error(err?.message || t("pleaseFillRequired", sourceKey.user));
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
                width={"360px"}
                open={open}
                title={t("nTeditProfileSetting", sourceKey.user)}
                footer={
                    <div className="flex flex-col">
                        <Button
                            loading={loading}
                            className="ant-btn-default bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                            size="large"
                            onClick={() => handleSave()}
                        >
                            {t("confirm", sourceKey.user)}
                        </Button>
                    </div>
                }
            >
                <Form form={form}>
                    <SwitchInput
                        label={t("nTaccess", sourceKey.user)}
                        fieldName={"contentPermission"}
                    />
                    <DatePickerInput
                        label={t("nTexpiredDate", sourceKey.user)}
                        fieldName="expiredAt"
                        required={false}
                        placeholder={t("selectDate", sourceKey.user)}
                    />
                </Form>
            </MobileFormDrawer>
        </>
    );
};

export default EditExpiredDateDrawer
