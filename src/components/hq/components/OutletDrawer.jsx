import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Input, message, Pagination, Row, Switch, Tabs } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { useForm } from 'antd/lib/form/Form';
import { useFormRules } from '@/constant/formRules';
import StringInput from '@/components/general/input/StringInput';
import MobileFormDrawer from '@/components/general/components/MobileFormDrawer';
import registerOutlet from '@/pages/api/user/registerOutlet';
import DatePickerInput from '@/components/general/input/DatePickerInput';
import SwitchInput from '@/components/general/input/SwitchInput';
import { useRefreshOutletBadgeCount } from '@/hooks/useOutletBadgeCount';

const OutletDrawer = (props) => {
    const { selectedRecord } = props;
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = useForm();
    const formRules = useFormRules(t, sourceKey);
    const refreshOutletBadgeCount = useRefreshOutletBadgeCount();


    useEffect(() => {
        setOpen(props?.open === true);
        form.resetFields();
    }, [props?.open]);

    function handleSave() {
        setLoading(true);

        form.validateFields()
            .then((values) => {
                const apiData = {
                    ...values,
                    contentPermission: values?.contentPermission || false,

                };
                return registerOutlet(apiData);
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
                title={t("createOutlet", sourceKey.user)}
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
                    <StringInput
                        label={t("businessName", sourceKey.user)}
                        fieldName="businessName"
                        rules={formRules.businessName}
                        placeholder={t("businessName", sourceKey.user)}
                    />

                    <StringInput
                        label={t("email", sourceKey.user)}
                        fieldName="email"
                        rules={formRules.email}
                        placeholder={t("email", sourceKey.user)}
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

export default OutletDrawer
