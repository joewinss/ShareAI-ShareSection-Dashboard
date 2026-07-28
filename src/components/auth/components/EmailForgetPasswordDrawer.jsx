import { defaultTheme } from "@/@crema/constants/defaultConfig";
import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { Button, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useMediaQuery } from "react-responsive";
import EmailVerificationDrawer from "./EmailVerificationDrawer";

export const EmailForgetPasswordDrawer = (props) => {
  const { open = false, onClose = () => {} } = props;
  const { t } = useTranslation();
  const isMobile = useMediaQuery({
    maxWidth: defaultTheme.theme.breakpoints.sm,
  });

  const [form] = Form.useForm();
  const emailValue = Form.useWatch("email", form);

  const [loading, setLoading] = useState(false);
  const [emailVerificationDrawerOpen, setEmailVerificationDrawerOpen] =
    useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);

  const formRules = {
    email: [
      {
        validator: (_, value) => {
          const type = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          if (!value) {
            return Promise.reject(
              <span style={{ color: "red", fontSize: "10px" }}>
                {t("emailRequired", sourceKey.user)}
              </span>
            );
          } else if (!type.test(value)) {
            return Promise.reject(
              <span style={{ color: "red", fontSize: "10px" }}>
                {t("invalidEmail", sourceKey.user)}
              </span>
            );
          } else {
            return Promise.resolve();
          }
        },
      },
    ],
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setIsEmailValid(false);
      setLoading(false);
    }
  }, [open, form]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!emailValue) {
      setIsEmailValid(false);
      return;
    }

    form
      .validateFields(["email"])
      .then(() => setIsEmailValid(true))
      .catch(() => setIsEmailValid(false));
  }, [emailValue, form, open]);

  function handleSubmit() {
    if (!isEmailValid) {
      return;
    }

    setLoading(true);
    form
      .validateFields()
      .then((values) => {
        setUserEmail(values.email);
        setEmailVerificationDrawerOpen(true);
        onClose();
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const buttonClasses = isEmailValid
    ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
    : "bg-gray-200 text-gray-500 cursor-not-allowed";

  const handleVerificationDrawerClose = () => {
    setEmailVerificationDrawerOpen(false);
  };

  return (
    <>
      <MobileFormDrawer
        open={open}
        width={isMobile ? "100%" : "400px"}
        closable={true}
        destroyOnClose={true}
        onClose={() => onClose()}
        footer={
          <div className="flex flex-col gap-2">
            <Button
              className={`w-full ${buttonClasses}`}
              size="large"
              disabled={!isEmailValid || loading}
              loading={loading}
              onClick={handleSubmit}
            >
              {t("confirm", sourceKey.user)}
            </Button>
          </div>
        }
      >
        <div className="large-text-size font-semibold">
          {t("accountEmail", sourceKey.user)}
        </div>
        <div className="mt-1 second-grey-text small-text-size ">
          <div>{t("accountEmailDesc", sourceKey.user)}</div>
          <div className="second-grey-text small-text-size ">
            {t("accountEmailDesc1", sourceKey.user)}
          </div>
        </div>

        <div className="mt-5">
          <Form form={form}>
            <Form.Item name="email" rules={formRules.email}>
              <Input placeholder="Email" type="email" size="large" />
            </Form.Item>
          </Form>
        </div>
      </MobileFormDrawer>
      <EmailVerificationDrawer
        open={emailVerificationDrawerOpen}
        onClose={handleVerificationDrawerClose}
        email={userEmail}
        type={"reset"}
        handleSucessCloseDrawer={handleVerificationDrawerClose}
        onVerificationSuccess={() => setEmailVerificationDrawerOpen(false)}
      />
    </>
  );
};
const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailForgetPasswordDrawer);
