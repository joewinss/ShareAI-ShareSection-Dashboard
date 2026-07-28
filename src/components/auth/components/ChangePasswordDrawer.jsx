import React, { useState, useEffect } from "react";
import { Button, Form, message, Spin } from "antd";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { useForm } from "antd/lib/form/Form";
import { withRouter } from "next/router";
import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
import PasswordInput from "@/components/general/input/PasswordInput";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { get, isEmpty } from "lodash";
import resetPassword from "@/pages/api/auth/resetPassword";
import updateFirstTimeLogin from "@/pages/api/auth/updateFirstTimeLogin";
import login from "@/pages/api/auth/login";
import {
  loginSuccessful,
  logoutSuccessful,
} from "@/redux/actions/user-actions";
import { connect } from "react-redux";
import RegisterDrawer from "./RegisterDrawer";

const ChangePasswordDrawer = (props) => {
  const { email, onSuccess, otpData } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = useForm();
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [passwords, setPasswords] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userData, setUserData] = useState(null);
  const [registerDrawerOpen, setRegisterDrawerOpen] = useState(false);

  // Additional password validation rules
  const passwordFormRules = {
    password: [
      {
        validator: (_, value) => {
          if (!value) {
            return Promise.reject(
              <span className="xsmall-text-size red-text">
                {t("passwordRequired", sourceKey.user)}
              </span>
            );
          } else {
            return Promise.resolve();
          }
        },
      },
    ],
    confirmPassword: [
      {
        validator: (rule, value) => {
          if (value !== form.getFieldValue("password") || !value) {
            return Promise.reject(
              <span className="xsmall-text-size red-text">
                {t("passwordNotMatch", sourceKey.user)}
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
    setOpen(props?.open === true);
    if (props?.open) {
      setPasswordsMatch(false);
      setResetTrigger((prev) => prev + 1);
    }
  }, [props?.open]);

  const checkPasswordsMatch = () => {
    const password = form.getFieldValue("password");
    const confirmPassword = form.getFieldValue("confirmPassword");
    const match =
      !isEmpty(password) &&
      !isEmpty(confirmPassword) &&
      password === confirmPassword;
    setPasswordsMatch(match);
    setPasswords(password);
  };

  function handleSave() {
    setLoading(true);

    form
      .validateFields()
      .then((values) => {
        // Check if passwords match
        if (!passwordsMatch) {
          message.warning(t("passwordNotMatch", sourceKey.user));
          setLoading(false);
          return Promise.reject("Passwords do not match");
        }

        const apiData = {
          email: email,
          newPassword: values.password,
          confirmPassword: values.confirmPassword,
          code: otpData.otpValue,
          transactionsId: otpData.transactionsId,
        };

        //if userIdentity is masterHQ, completeMHQProfile
        return resetPassword(apiData);
      })
      .then((response) => {
        if (response?.data?.success) {
          message.success("Updated password successfully");
          updateFirstTimeLogin({ firstTimeLogin: 1 });
          return login({
            email: email,
            password: passwords,
          });
        } else {
          return Promise.reject(
            new Error(t("pleaseFillRequired", sourceKey.user))
          );
        }
      })
      .then((res) => {
        const accessKey = get(res, "data.data.accessToken");
        const user = get(res, "data.data.user");

        const redirectToDashboard = () => {
          message.success("Login successful");
          props.router.push(
            "/templates/pending-review"
          );
        };

        const openRegisterProfile = () => {
          setUserData(user);
          setUserEmail(email);
          setRegisterDrawerOpen(true);
          setLoading(false);
        };

        props.loginSuccessful(user, accessKey);

        const hasEmptyProfile =
          !user?.businessInfo ||
          user?.businessInfo?.businessDescription === "" ||
          user?.businessInfo?.businessDescription === null;

        if (hasEmptyProfile) {
          openRegisterProfile();
          return;
        }

        redirectToDashboard();
      })
      .then(() => {
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      })
      .catch((err) => {
        console.error(err);
        message.error(err?.message || t("pleaseFillRequired", sourceKey.user));
      })
      .finally(() => {
        setLoading(false);
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
        open={open}
        width={"400px"}
        zIndex={1300}
        title={t("resetPassword", sourceKey.user)}
        footer={
          <div className="flex flex-col">
            <Button
              loading={loading}
              className={`ant-btn-default ${passwordsMatch
                  ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  : "disabled-btn"
                } text-white`}
              size="large"
              onClick={() => {
                if (!passwordsMatch) {
                  message.warning(t("passwordNotMatch", sourceKey.user));
                } else {
                  handleSave();
                }
              }}
              disabled={!passwordsMatch}
            >
              {loading
                ? t("submitting", sourceKey.user)
                : t("completeProfile", sourceKey.user)}
            </Button>
          </div>
        }
      >
        <Spin spinning={loading}>
          <Form form={form} autoComplete="off">
            <div className="space-y-2">
              <div className="font-semibold text-base">
                {t("setPassword", sourceKey.user)}
              </div>

              <PasswordInput
                label={t("password", sourceKey.user)}
                fieldName="password"
                rules={passwordFormRules.password}
                placeholder={t("password", sourceKey.user)}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                showValidationIndicators={true}
                onChange={() => {
                  checkPasswordsMatch();
                }}
                resetTrigger={resetTrigger}
              />

              <PasswordInput
                label={t("confirmPassword", sourceKey.user)}
                fieldName="confirmPassword"
                rules={passwordFormRules.confirmPassword}
                placeholder={t("confirmPassword", sourceKey.user)}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                showValidationIndicators={false}
                onChange={() => {
                  checkPasswordsMatch();
                }}
              />
            </div>
          </Form>
        </Spin>
      </MobileFormDrawer>
      <RegisterDrawer
        open={registerDrawerOpen}
        onClose={() => setRegisterDrawerOpen(false)}
        email={userEmail}
        userData={userData}
        onSuccess={() => {
          setRegisterDrawerOpen(false);
          if (onSuccess) {
            onSuccess();
          }
        }}
      />
    </>
  );
};
const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = {
  loginSuccessful,
  logoutSuccessful,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ChangePasswordDrawer));
