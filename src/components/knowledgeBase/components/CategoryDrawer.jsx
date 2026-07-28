import React, { useState, useEffect } from 'react';
import { Alert, Button, Col, Form, Input, message, Pagination, Row, Select, Switch, Tabs, Tooltip } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { useForm } from 'antd/lib/form/Form';
import { isEmpty } from 'lodash';
import { useFormRules } from '@/constant/formRules';
import createCategory from '@/pages/api/category/createCategory';
import editCategory from '@/pages/api/category/editCategory';
import StringInput from '@/components/general/input/StringInput';
import TextAreaInput from '@/components/general/input/TextAreaInput';
import SwitchInput from '@/components/general/input/SwitchInput';
import MobileFormDrawer from '@/components/general/components/MobileFormDrawer';
import { CATEGORY_STATUS, USER_STATUS } from '@/constants/user';
import { trimIfString } from '@/utility/common-functions';
import { mapOutletOptions } from '@/utility/option-mappers';
import DropdownInput from '@/components/general/input/DropdownInput';
import getOutletListingsByMasterHQ from '@/pages/api/user/getOutletListingsByMasterHQ';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import { TooltipImageCategory } from '../../../../public/assets';
import { InfoCircleOutlined } from '@ant-design/icons';

const CategoryDrawer = (props) => {
    const { selectedRecord, user } = props;
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = useForm();
    const formRules = useFormRules(t, sourceKey);
    const [outletOption, setOutletOption] = useState([]);
    const loadOutletOption = async () => {
        try {
            const response = await getOutletListingsByMasterHQ("all", 0, {
                status: USER_STATUS.ACTIVE,
            });
            if (response?.success && response?.data) {
                setOutletOption(mapOutletOptions(response?.data));
            }
        } catch (error) {
            console.error("Error loading outlet options:", error);
        }
    };

    useEffect(() => {
        setOpen(props?.open === true);
        if (!isEmpty(selectedRecord)) {
            form.setFieldsValue({
                title: selectedRecord?.title,
                status: selectedRecord?.status,
                description: selectedRecord?.description,
                applicableOutletId: selectedRecord?.applicableOutletId || [],
            });
        } else {
            form.resetFields();
        }
        if (user?.user?.role === "masterHQ") {
            loadOutletOption();
        }
    }, [props?.open, selectedRecord, form]);

    function onClose() {
        setOpen(false);
        if (props.onClose) {
            props.onClose();
        }
    }

    function handleSave() {
        setLoading(true);

        form.validateFields()
            .then((values) => {

                if (isEmpty(selectedRecord)) {
                    const apiData = {
                        ...values,
                        title: trimIfString(values.title),
                        description: trimIfString(values.description),
                        status: values.status ? CATEGORY_STATUS.ACTIVE : CATEGORY_STATUS.INACTIVE,
                    };

                    return createCategory(apiData);
                } else {
                    const apiData = {
                        ...values,
                        title: trimIfString(values.title),
                        description: trimIfString(values.description),
                        status: values.status ? CATEGORY_STATUS.ACTIVE : CATEGORY_STATUS.INACTIVE,
                        categoryId: selectedRecord._id,
                        action: "edit"
                    };
                    return editCategory(apiData);
                }
            })
            .then((response) => {
                if (response) {
                    message.success(response.data?.message || t("success", sourceKey.user));
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

    return (
        <>
            <MobileFormDrawer
                closable={true}
                onClose={onClose}
                open={open}
                width={"360px"}
                zIndex={1200}
                title={!isEmpty(selectedRecord)
                    ? t("editCategory", sourceKey.user)
                    : t("addCategory", sourceKey.user)}
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
                <Form form={form}>
                    <SwitchInput
                        label={t("status", sourceKey.user)}
                        fieldName={"status"}
                    />

                    <StringInput
                        label={
                            <>
                                {t("categoryTitle", sourceKey.user)}
                                <Tooltip
                                    title={
                                        <>
                                            <img src={TooltipImageCategory} />
                                            <span className="small-text-size ">
                                                {t("nTcategoryToolTip", sourceKey.user)}
                                            </span>
                                        </>
                                    }
                                >
                                    <InfoCircleOutlined className="pl-2" />
                                </Tooltip>
                            </>
                        }
                        fieldName="title"
                        placeholder={t("categoryTitle", sourceKey.user)}
                        rules={formRules.categoryTitle}
                    />
                    <TextAreaInput
                        label={t("description", sourceKey.user)}
                        fieldName="description"
                        rows={10}
                        placeholder={t("description", sourceKey.user)}
                        rules={formRules.description}
                    />
                    {user?.user?.role === "masterHQ" &&
                        <DropdownInput
                            label={t("assignTo", sourceKey.user)}
                            fieldName="applicableOutletId"
                            options={outletOption}
                            mode="multiple"
                            multipleAll={true}
                            placeholder={t("outlet", sourceKey.user)}
                        />
                    }
                </Form>
            </MobileFormDrawer>
        </>
    );
};


const mapStateToProps = (state) => ({
    user: state.user,
});
const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CategoryDrawer));
