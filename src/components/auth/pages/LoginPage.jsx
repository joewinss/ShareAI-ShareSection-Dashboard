import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sofa } from "lucide-react";
import { connect } from "react-redux";
import { Form, message, Input, Button } from "antd";
import { useForm } from "antd/lib/form/Form";
import {
  loginSuccessful,
  logoutSuccessful,
  updateBusinessInfo,
} from "@/redux/actions/user-actions";
import { withRouter } from "next/router";
import { get } from "lodash";
import login from "@/pages/api/auth/login";
import EmailVerificationDrawer from "../components/EmailVerificationDrawer";
import { EmailForgetPasswordDrawer } from "../components/EmailForgetPasswordDrawer";
import { ShareAi } from "../../../../public/assets";
import { getIShareRedirectLoginUrl, getIShareRedirectUrl } from "@/utility/common-functions";

const LoginPage = (props) => {
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const [emailVerificationDrawerOpen, setEmailVerificationDrawerOpen] =
    useState(false);
  const [emailForgetPasswordDrawerOpen, setEmailForgetPasswordDrawerOpen] =
    useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userData, setUserData] = useState(null);
  const [type, setType] = useState(null);

  const formRules = {
    email: [
      {
        validator: (_, value) => {
          const type = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          if (!value) {
            return Promise.reject(
              <span style={{ color: "red", fontSize: "10px" }}>
                Email is required
              </span>
            );
          } else if (!type.test(value)) {
            return Promise.reject(
              <span style={{ color: "red", fontSize: "10px" }}>
                Invalid email format
              </span>
            );
          } else {
            return Promise.resolve();
          }
        },
      },
    ],
    password: [
      {
        validator: (_, value) => {
          if (!value) {
            return Promise.reject(
              <span style={{ color: "red", fontSize: "10px" }}>
                Password is required
              </span>
            );
          } else {
            return Promise.resolve();
          }
        },
      },
    ],
  };

  function handleCloseDrawer() {
    setEmailVerificationDrawerOpen(false);
    setEmailForgetPasswordDrawerOpen(false);
    props.logoutSuccessful();
  }

  function handleSucessCloseDrawer() {
    setEmailVerificationDrawerOpen(false);
  }

  function handleSubmit() {
    setLoading(true);
    form
      .validateFields()
      .then((values) => {
        const trimmedValues = {
          email: values.email?.trim() || "",
          password: values.password?.trim() || "",
        };

        login({
          email: trimmedValues.email,
          password: trimmedValues.password,
        })
          .then((res) => {
            const accessKey = get(res, "data.data.accessToken");
            const user = get(res, "data.data.user");

            // Check if first time login

            if (user?.role === "masterHQ") {
              if (user?.firstTimeLogin === 0) {
                // Store user data and email for later use
                props.loginSuccessful(user, accessKey);
                setUserData(user);
                setType("register");
                setUserEmail(trimmedValues.email);
                setEmailVerificationDrawerOpen(true);
                setLoading(false);
              } else {
                // Update Redux state for normal login
                props.loginSuccessful(user, accessKey);
                message.success("Login successful");
                props.router.push(
                  "/"
                );
              }
            } else {
              if (user?.businessInfo?.businessDescription === "") {
                props.loginSuccessful(user, accessKey);
                setUserData(user);
                setType("register");
                setUserEmail(trimmedValues.email);
                setEmailVerificationDrawerOpen(true);
                setLoading(false);
              } else if (user?.firstTimeLogin === 0) {
                // Store user data and email for later use
                props.loginSuccessful(user, accessKey);
                setUserData(user);
                setType("reset");
                setUserEmail(trimmedValues.email);
                setEmailVerificationDrawerOpen(true);
                setLoading(false);
                // The drawer opens immediately, sendEmail will run inside the drawer
              } else {
                // Update Redux state for normal login
                props.loginSuccessful(user, accessKey);
                message.success("Login successful");
                props.router.push(
                  "/"
                );
              }
            }
          })
          .catch((err) => {
            console.error(err);
            message.error(err?.message || "Login failed");
          })
          .finally(() => setLoading(false));
      })
      .catch((err) => {
        console.error(err);
        message.error("Login failed");
        setLoading(false);
      });
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <>
      <Head>
        <title>Login - ShareAi </title>
        <meta
          name="description"
          content="Login to your furniture outlet social media management dashboard."
        />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto mb-2 p-3 rounded-full w-fit"
              >
                {/* <Sofa className="h-8 w-8 text-white" /> */}
                <img src={ShareAi} alt="ShareAI Logo" className="h-16 w-auto rounded-full" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your dashboard
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form form={form} onKeyDown={handleKeyPress}>
                <Form.Item name="email" rules={formRules.email}>
                  <Input placeholder="Email" type="email" size="large" />
                </Form.Item>
                <Form.Item name="password" rules={formRules.password}>
                  <Input.Password placeholder="Password" size="large" />
                </Form.Item>

                <div className="flex justify-end">
                  <span
                    onClick={() => setEmailForgetPasswordDrawerOpen(true)}
                    className="text-xs text-red-400 hover:text-red-500 hover:underline underline-offset-2 cursor-pointer p-0 bg-transparent border-none"
                  >
                    Forgot password?
                  </span>
                </div>
              </Form>
              <div className="space-y-2">
                <Button
                  size="large"
                  className="w-full ant-btn-default bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white mt-4"
                  onClick={() => handleSubmit()}
                  loading={loading}
                >
                  Sign In
                </Button>
                <Button
                  type="primary"
                  size="large"
                  className="w-full purple-btn enterprise-login-btn"
                  onClick={() => {
                    window.location.href = getIShareRedirectLoginUrl();
                  }}
                  loading={loading}
                >
                  Enterprise Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Email Verification Drawer */}
      <EmailVerificationDrawer
        open={emailVerificationDrawerOpen}
        onClose={() => handleCloseDrawer()}
        email={userEmail}
        userData={userData}
        handleSucessCloseDrawer={() => handleSucessCloseDrawer()}
        type={type}
        onVerificationSuccess={() => {
          setEmailVerificationDrawerOpen(false);
          // The RegisterDrawer will be opened by EmailVerificationDrawer
        }}
      />

      <EmailForgetPasswordDrawer
        open={emailForgetPasswordDrawerOpen}
        onClose={() => setEmailForgetPasswordDrawerOpen(false)}
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
)(withRouter(LoginPage));
