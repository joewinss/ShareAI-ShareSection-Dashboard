import { defaultTheme } from "@/@crema/constants/defaultConfig";
import InfoBlock from "@/components/general/components/InfoBlock";
import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
import DropdownInput from "@/components/general/input/DropdownInput";
import NumberInput from "@/components/general/input/NumberInput";
import { CREDIT_TYPE } from "@/constants/user";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import updateOutletUsage from "@/pages/api/user/updateOutletUsage";
import credit from "@/pages/credit/credit";
import { LeftOutlined } from "@ant-design/icons";
import { Button, Form, message } from "antd";
import { withRouter } from "next/router";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useMediaQuery } from "react-responsive";

export const UpdateCreditDrawer = (props) => {
    const { record, onRefreshData, visible } = props;
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const isMobile = useMediaQuery({
        maxWidth: defaultTheme.theme.breakpoints.sm,
    });
    const [form] = Form.useForm();
    const creditValue = Form.useWatch("credit", form);
    const selectedMode = Form.useWatch("mode", form) || "add";
    const selectedType = Form.useWatch("creditType", form) || CREDIT_TYPE.IMAGE;


    //Render IMAGE / CONTENT credit usage amount
    const usageAmount = Number(
        selectedType === CREDIT_TYPE.IMAGE
            ? record?.usageAndLimit?.usageAmounts?.image
            : selectedType === CREDIT_TYPE.CONTENT
                ? record?.usageAndLimit?.usageAmounts?.content
                : 0
    );

    //Render IMAGE / CONTENT credit limit amount
    const beforeAmount = Number(
        selectedType === CREDIT_TYPE.IMAGE
            ? record?.usageAndLimit?.limitAmounts?.image
            : selectedType === CREDIT_TYPE.CONTENT
                ? record?.usageAndLimit?.limitAmounts?.content
                : 0
    );

    //constant calculation for After ADD and DEDUCT.
    const afterAmount = selectedMode === "add"
        ? beforeAmount + Number(creditValue || 0)
        : selectedMode === "deduct"
            ? beforeAmount - Number(creditValue || 0)
            : null;

    //Pre-set with CONTENT and ADD
    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                creditType: CREDIT_TYPE.CONTENT,
                mode: "add",
            });
        }
    }, [visible, form]);

    // API 
    function handlesSubmit() {
        {
            form.validateFields()
                .then(() => {
                    updateCredit(afterAmount);
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    }

    function updateCredit(amount) {
        setLoading(true);
        const data = {
            creditType: selectedType,
            outletId: record?._id,
            limitAmount: amount
        }
        updateOutletUsage(data)
            .then(() => {
                message.success(t("updateSuccess", sourceKey.user));
                setLoading(false);
                onClose();
                if (onRefreshData) {
                    onRefreshData();
                }
            })
            .catch((err) => {
                message.error(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    function onClose() {
        form.resetFields();
        if (props.onClose) {
            props.onClose()
        }
    }

    const businessInfo = [
        {
            label: t("businessName", sourceKey.user),
            value: record?.businessInfo?.businessName,
        },
        {
            label: t("email", sourceKey.user),
            value: record?.businessInfo?.businessEmail,
        },
        {
            label: `Used Credits  ${selectedType === CREDIT_TYPE.IMAGE ? "(Image)" : selectedType === CREDIT_TYPE.CONTENT ? "(Content)" : null}`,
            value: usageAmount || "0"
        },
        {
            label: `Available Credits ${selectedType === CREDIT_TYPE.IMAGE ? "(Image)" : selectedType === CREDIT_TYPE.CONTENT ? "(Content)" : null}`,
            value: afterAmount - usageAmount || "0"
        },

        {
            label: `Current Limit Credits ${selectedType === CREDIT_TYPE.IMAGE ? "(Image)" : selectedType === CREDIT_TYPE.CONTENT ? "(Content)" : null}`,
            // No numeric limit (null/0) = outlet shares the HQ pool credit.
            value: beforeAmount || "Shared pool (HQ)"
        },
        {
            label: `Limit Credits Adjustment ${selectedMode === "add" ? "(Add)" : selectedMode === "deduct" ? "(Deduct)" : ""}`,
            value: afterAmount || "-",
        },
    ].filter(Boolean);

    return (
        <MobileFormDrawer
            closable={true}
            onClose={onClose}
            open={visible}
            width={"400px"}
            zIndex={1300}
            loading={loading}
            closeIcon={<LeftOutlined style={{ color: "#373337ff" }} />}
            title={
                <div className="flex flex-row justify-between">
                    <div className="flex items-center">Update Credit</div>
                </div>
            }
            footer={
                <div className="flex flex-col gap-2">
                    {/* <Button className="w-full purple-btn" size="large" onClick={handlesSubmit}>Unlimited BUTTON</Button> */}
                    <Button className="w-full purple-btn" size="large" onClick={handlesSubmit}> Update Credit</Button>
                </div>
            }
        >

            <p className="text-base font-semibold">Update {record?.businessInfo?.businessName}'s Credit Limit Amount</p>
            <div className="mt-5">
                <Form form={form}>
                    <DropdownInput
                        label="Credit Type"
                        fieldName="creditType"
                        placeholder="Image/Content"
                        options={[
                            {
                                title: "Image",
                                value: CREDIT_TYPE.IMAGE,
                            },
                            {
                                title: "Content",
                                value: CREDIT_TYPE.CONTENT,
                            },
                        ]}
                    />
                    <div className="flex flex-row gap-2">
                        <div className="w-1/2">
                            <DropdownInput
                                label="Mode"
                                fieldName="mode"
                                placeholder="Add/Deduct"
                                options={[
                                    {
                                        title: "Add",
                                        value: "add",
                                    },
                                    {
                                        title: "Deduct",
                                        value: "deduct",
                                    },
                                ]}
                            />
                        </div>
                        <div className="w-full">
                            <NumberInput
                                label={t("credit", sourceKey.user)}
                                fieldName="credit"
                                dependencies={["mode", "creditType"]}
                                rules={[
                                    {
                                        validator(_, inputValue) {
                                            const amount = Number(inputValue);
                                            if (Number.isNaN(amount) || amount <= 0) {
                                                return Promise.reject(new Error("Credit amount must be greater than zero"));
                                            }
                                            if (afterAmount <= 0) {
                                                return Promise.reject(new Error("Credit amount cannot be 0 or less than 0"));
                                            }
                                            return Promise.resolve();
                                        }
                                    },
                                ]}
                                placeholder={"0"}
                            />
                        </div>
                    </div>
                </Form>
                <div className="space-y-2">
                    <InfoBlock
                        infoTitle={t("businessInfo", sourceKey.user)}
                        fields={businessInfo}
                    />
                </div>
            </div>
        </MobileFormDrawer>
    );
};

const mapStateToProps = (state) => ({
    user: state.user,
});

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(UpdateCreditDrawer));
