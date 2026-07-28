import { defaultTheme } from "@/@crema/constants/defaultConfig";
import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
import NumberInput from "@/components/general/input/NumberInput";
import { EMAIL_TYPES } from "@/constants/user";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import sendEmail from "@/pages/api/email/sendEmail";
import validateEmailCode from "@/pages/api/email/validateEmailCode";
import { formatTime, replaceStringPattern } from "@/utility/common-functions";
import { Button, Drawer, Form, message } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { get } from "lodash";
import { useMediaQuery } from "react-responsive";
import RegisterDrawer from "./RegisterDrawer";
import ChangePasswordDrawer from "./ChangePasswordDrawer";
import { loginSuccessful } from "@/redux/actions/user-actions";

export const EmailVerificationDrawer = (props) => {
  const { email, onVerificationSuccess, onEmailSendComplete, userData, type } =
    props;
  const { t } = useTranslation();
  const isMobile = useMediaQuery({
    maxWidth: defaultTheme.theme.breakpoints.sm,
  });

  const router = useRouter();
  const [form] = useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpValue, setOtpValue] = useState("");
  const [transactionsId, setTransactionsId] = useState("");
  const [registerDrawerOpen, setRegisterDrawerOpen] = useState(false);

  const [changePasswordDrawerOpen, setChangePasswordDrawerOpen] =
    useState(false);

  const formRules = {
    otp: [
      {
        validator: (_, value) => {
          if (!value) {
            return Promise.reject(
              <span className="xsmall-text-size red-text">
                {t("otpRequired", sourceKey.user)}
              </span>
            );
          }
          if (value.length !== 6) {
            return Promise.reject(
              <span className="xsmall-text-size red-text">
                {t("otpMustBe6Digits", sourceKey.user)}
              </span>
            );
          }
          setOtpValue(value);
          return Promise.resolve();
        },
      },
    ],
  };

  useEffect(() => {
    if (props?.open) {
      setOpen(true); // Open drawer immediately
      form.resetFields();
      setOtpValue("");
      // Send email when drawer opens or reopens
      sendVerificationEmail();
    } else {
      setOpen(false);
      // Reset transactionsId when drawer closes so email is sent again on reopen
      // setTransactionsId("");
      setCountdown(0);
    }
  }, [props?.open]);

  useEffect(() => {
    let interval = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((countdown) => countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  function onClose() {
    setOpen(false);
    // Don't reset transactionsId so we don't resend email if reopened
    if (props.handleSucessCloseDrawer) {
      props.handleSucessCloseDrawer();
    }
  }

  function sendVerificationEmail() {
    if (!email) {
      message.error(t("emailRequired", sourceKey.user));
      if (props.onClose) {
        props.onClose();
      }
      if (onEmailSendComplete) onEmailSendComplete();
      return;
    }

    setSendingEmail(true);
    sendEmail({
      to: email,
      type:
        type === "reset" ? EMAIL_TYPES.RESET_PASSWORD : EMAIL_TYPES.FIRST_LOGIN,
    })
      .then((res) => {
        setTransactionsId(res?.data?.transactionsId || "");
        message.success(t("verificationEmailSent", sourceKey.user));
        setCountdown(180); // 3 minutes
        // Drawer is already open, no need to setOpen(true) here
        if (onEmailSendComplete) onEmailSendComplete();
      })
      .catch((error) => {
        message.error(error?.message || t("failedToSendEmail", sourceKey.user));
        // Close drawer if email sending fails
        setOpen(false);
        if (props.onClose) {
          props.onClose();
        }
        if (onEmailSendComplete) onEmailSendComplete();
      })
      .finally(() => {
        setSendingEmail(false);
      });
  }

  function handleVerifyOTP() {
    if (!otpValue || otpValue.length !== 6) {
      message.warning(t("pleaseEnterValidOTP", sourceKey.user));
      return;
    }

    setLoading(true);
    form
      .validateFields()
      .then((values) => {
        return validateEmailCode({
          to: email,
          code: values.otp,
          type:
            type === "reset"
              ? EMAIL_TYPES.RESET_PASSWORD
              : EMAIL_TYPES.FIRST_LOGIN,
          transactionsId: transactionsId,
        });
      })
      .then((result) => {
        const accessKey = get(result, "data.accessToken");

        props.loginSuccessful(userData, accessKey);

        message.success(t("emailVerifiedSuccessfully", sourceKey.user));
        onClose(); // Close email verification drawer

        // Small delay to ensure drawer closes before opening register drawer

        setTimeout(() => {
          type === "register"
            ? setRegisterDrawerOpen(true)
            : type === "reset"
            ? setChangePasswordDrawerOpen(true)
            : null;
        }, 100);
      })
      .catch((error) => {
        if (error.errorFields) {
          return;
        }
        message.error(error?.message || t("invalidOTP", sourceKey.user));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleResendEmail() {
    if (countdown === 0) {
      sendVerificationEmail();
    }
  }

  const isVerifyButtonDisabled = !otpValue || otpValue.length !== 6;

  return (
    <>
      <MobileFormDrawer
        open={open}
        width={isMobile ? "100%" : "400px"}
        closable={true}
        destroyOnClose={true}
        onClose={() => onClose()}
        footer={
          <>
            <div className="flex flex-col gap-2">
              <Button
                className={`w-full ${
                  !isVerifyButtonDisabled ? "purple-btn" : "disabled-btn"
                }`}
                size="large"
                onClick={handleVerifyOTP}
                // onClick={() => {
                //   router.push("/");
                // }}
                loading={loading}
                disabled={isVerifyButtonDisabled}
              >
                {loading
                  ? t("verifying...", sourceKey.user)
                  : t("verify", sourceKey.user)}
              </Button>

              <Button
                className={`w-full second-grey-btn${
                  countdown > 0 ? " opacity-50" : ""
                }`}
                size="large"
                onClick={handleResendEmail}
                disabled={countdown > 0}
                loading={sendingEmail}
              >
                {sendingEmail
                  ? t("sending...", sourceKey.user)
                  : countdown > 0
                  ? `${t("didntGetCode", sourceKey.user)} (${formatTime(
                      countdown
                    )})`
                  : t("didntGetCode", sourceKey.user)}
              </Button>
            </div>
          </>
        }
      >
        <div className="large-text-size font-semibold">
          {t("emailVerification", sourceKey.user)}
        </div>
        <div className="mt-1 second-grey-text small-text-size mb-10">
          <div>
            {replaceStringPattern(t("emailVerificationDesc", sourceKey.user), {
              email: email,
            })}
          </div>
          <div className="mt-2">
            {t("emailVerificationDesc2", sourceKey.user)}
          </div>
        </div>
        <Form form={form}>
          <NumberInput
            label={t("verificationCode", sourceKey.user)}
            fieldName="otp"
            rules={formRules.otp}
            placeholder="000000"
            maxLength={6}
            style={{ margin: 0 }}
          />
        </Form>
      </MobileFormDrawer>

      {/* Register Drawer */}
      <RegisterDrawer
        open={registerDrawerOpen}
        onClose={() => setRegisterDrawerOpen(false)}
        email={email}
        userData={userData}
        otpData={{ otpValue, transactionsId }}
        onSuccess={() => {
          setRegisterDrawerOpen(false);
          if (onVerificationSuccess) {
            onVerificationSuccess();
          }
        }}
      />
      <ChangePasswordDrawer
        open={changePasswordDrawerOpen}
        onClose={() => setChangePasswordDrawerOpen(false)}
        email={email}
        userData={userData}
        otpData={{ otpValue, transactionsId }}
        onSuccess={() => {
          setChangePasswordDrawerOpen(false);
          if (onVerificationSuccess) {
            onVerificationSuccess();
          }
        }}
      />
    </>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = { loginSuccessful };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailVerificationDrawer);
