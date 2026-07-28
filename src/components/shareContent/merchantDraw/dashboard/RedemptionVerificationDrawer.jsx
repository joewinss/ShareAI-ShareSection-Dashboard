import React, { useEffect, useState } from "react";
import { Button, Drawer, Form, Input, InputNumber, message } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import redeemVoucher from "@/pages/api/voucherDraw/public/redeemVoucher";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";

const getActivityId = (voucher) => voucher?._id || voucher?.activityId;

const RedemptionVerificationDrawer = ({ open, voucher, phone, onClose, onRedeemed }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            form.resetFields();
        }
    }, [form, open]);

    const handleSubmit = async () => {
        const activityId = getActivityId(voucher);

        if (!phone || !activityId) {
            message.error(t("redemptionFailed", sourceKey.user));
            return;
        }

        setLoading(true);
        try {
            const values = await form.validateFields();
            const response = await redeemVoucher({
                phone,
                activityId,
                merchantCode: values.merchantCode,
                amountSpent: values.amountSpent ?? null,
            });

            if (response?.data?.status === true) {
                message.success(t("redeemSuccessfully", sourceKey.user));
                onClose?.();
                onRedeemed?.();
            } else {
                message.error(response?.data?.message || t("redemptionFailed", sourceKey.user));
            }
        } catch (err) {
            if (err?.errorFields) return;
            message.error(err?.message || t("redemptionFailed", sourceKey.user));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            open={open}
            width="100%"
            placement="left"
            zIndex={1500}
            destroyOnClose={true}
            closeIcon={<LeftOutlined style={{ color: "#643300", fontSize: "12px" }} />}
            onClose={onClose}
            title={
                <div className="flex items-center text-sm font-normal">
                    {t("back", sourceKey.user)}
                </div>
            }
            footer={
                <Button
                    type="primary"
                    loading={loading}
                    disabled={loading}
                    className="w-full bg-purple-600"
                    size="large"
                    onClick={handleSubmit}
                >
                    {t("redeemNow", sourceKey.user)}
                </Button>
            }
        >
            <div className="flex flex-col">
                <h2 className="text-xl font-bold text-gray-900">
                    {t("redemptionVerification", sourceKey.user)}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                    {t("redemptionInstructions", sourceKey.user)}
                </p>

                <Form form={form} layout="vertical" className="mt-6">
                    <Form.Item
                        label={t("merchantCode", sourceKey.user)}
                        name="merchantCode"
                        rules={[{ required: true, message: t("merchantCodeRequired", sourceKey.user) }]}
                    >
                        <Input placeholder={t("enterCode", sourceKey.user)} autoComplete="off" />
                    </Form.Item>

                    <Form.Item
                        label={t("totalBillAmount", sourceKey.user)}
                        name="amountSpent"
                        rules={[
                            {
                                validator: (_, value) => {
                                    if (value === undefined || value === null || value === "" || value > 0) return Promise.resolve();
                                    return Promise.reject(new Error(t("amountSpentMustBeGreaterThanZero", sourceKey.user)));
                                },
                            },
                        ]}
                    >
                        <InputNumber
                            addonBefore="RM"
                            min={0}
                            precision={2}
                            className="w-full"
                            placeholder="0.00"
                        />
                    </Form.Item>
                </Form>
            </div>
        </Drawer>
    );
};

export default RedemptionVerificationDrawer;
