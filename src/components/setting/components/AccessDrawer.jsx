import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Input, message, Pagination, Row, Switch, Tabs } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import StringInput from '@/general/input/StringInput';
import { useForm } from 'antd/lib/form/Form';
import MobileFormDrawer from '@/components/general/components/MobileFormDrawer';
import { isEmpty } from 'lodash';
import DropdownInput from '@/general/input/DropdownInput';
import ContactInput from '@/general/input/ContactInput';

const AccessDrawer = (props) => {
    const { selectedRecord } = props;
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = useForm();

    useEffect(() => {
        setOpen(props?.open === true);
        if (!isEmpty(selectedRecord)) {
            form.setFieldsValue({
                title: selectedRecord?.categoryTitle,
                status: selectedRecord?.status,
                content: selectedRecord?.knowledgeBase
            })
        } else {
            form.resetFields();
        }
    }, [props?.open]);

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
                width={"360px"}
                zIndex={1200}
                title={!isEmpty(selectedRecord)
                    ? t("editAccess", sourceKey.user)
                    : t("addNewAccess", sourceKey.user)}
                footer={
                    <div className="flex flex-col">
                        <Button
                            loading={loading}
                            className={`w-full blue-btn `}
                            size="large"
                            onClick={() => handleSave()}
                        >
                            {t("confirm", sourceKey.user)}
                        </Button>
                    </div>
                }
            >
                <div className='flex flex-col space-y-4'>
                    <div className="xsmall-text-size blue-text">
                        {t("accessDesc", sourceKey.user)}
                    </div>
                    <Form form={form}>
                        <div className='flex flex-col space-y-4'>
                            <DropdownInput
                                label={t("accessType", sourceKey.user)}
                                fieldName="accessType"
                                options={[
                                    { title: "Pro", value: "Pro" },
                                ]}
                                placeholder={t("accessType", sourceKey.user)}
                            />

                            <div className="h-[1px] w-full bg-black/5" />

                            <StringInput
                                label={t("fullName", sourceKey.user)}
                                fieldName="fullName"
                                placeholder={t("fullName", sourceKey.user)}

                            />

                            <StringInput
                                label={t("id", sourceKey.user)}
                                fieldName="id"
                                placeholder={t("id", sourceKey.user)}

                            />

                            <ContactInput
                                label={t("phoneNumber", sourceKey.user)}
                                fieldName="phoneNumber"
                                // rules={formRules.contactNo}
                                // rulesCode={formRules.countryCode}
                                placeholder={t("select", sourceKey.user)}
                                placeholderInput="000000000"
                            />

                            <StringInput
                                label={t("email", sourceKey.user)}
                                fieldName="email"
                                placeholder={t("email", sourceKey.user)}

                            />

                        </div>

                    </Form>
                </div>
            </MobileFormDrawer>
        </>
    );
};

export default AccessDrawer;