import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Input, message, Pagination, Row, Switch, Tabs } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import StringInput from '@/general/input/StringInput';
import { useForm } from 'antd/lib/form/Form';
import MobileFormDrawer from '@/components/general/components/MobileFormDrawer';
import { isEmpty } from 'lodash';
import SwitchInput from '@/general/input/SwitchInput';

const BranchDrawer = (props) => {
    const { selectedRecord } = props;
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = useForm();

    useEffect(() => {
        setOpen(props?.open === true);
        if (!isEmpty(selectedRecord)) {
            form.setFieldsValue({
                branchName: selectedRecord?.branchName,
                status: selectedRecord?.status,
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
                    ? t("save", sourceKey.user)
                    : t("addBranch", sourceKey.user)}
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
                            <SwitchInput
                                label={t("status", sourceKey.user)}
                                fieldName={"status"}
                            />

                            <div className="h-[1px] w-full bg-black/5" />

                            <StringInput
                                label={t("branchName", sourceKey.user)}
                                fieldName="branchName"
                                placeholder={t("branchName", sourceKey.user)}

                            />

                        </div>

                    </Form>
                </div>
            </MobileFormDrawer>
        </>
    );
};

export default BranchDrawer;