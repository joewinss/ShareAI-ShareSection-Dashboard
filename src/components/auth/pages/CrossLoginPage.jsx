import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { withRouter } from "next/router";
import { get } from "lodash";
import { message, Spin } from "antd";
import crossLoginV2 from "@/pages/api/auth/crossLoginV2";
import { loginSuccessful } from "@/redux/actions/user-actions";
import Head from "next/head";
import { ShareAi } from "../../../../public/assets";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";

const CrossLoginPage = (props) => {
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    useEffect(() => {
        const { token } = props.router.query;

        // Only proceed if router is ready
        if (!props.router.isReady) return;

        if (token) {
            setLoading(true);
            crossLoginV2({ token })
                .then((res) => {
                    const accessKey = get(res, "data.data.accessToken");
                    const user = get(res, "data.data.user");

                    if (accessKey && user) {
                        props.loginSuccessful(user, accessKey);

                        // Small delay to ensure Redux state is persisted
                        setTimeout(() => {
                            message.success("Login successful");
                            props.router.push("/");
                        }, 100);
                    } else {
                        console.error("❌ Missing accessKey or user in response");
                        message.error("Invalid token or login failed");
                        props.router.push("/login");
                    }
                })
                .catch((err) => {
                    console.error("❌ Cross login error:", err);
                    message.error(err?.message || "Cross login failed");
                    props.router.push("/login");
                })
                .finally(() => setLoading(false));
        } else {
            // No token provided, redirect to login
            if (props.router.isReady) {
                props.router.push("/login");
            }
        }
    }, [props.router.query, props.router.isReady]);

    return (
        <>
            <Head>
                <title>Verifying Login - ShareAi</title>
            </Head>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-sm w-full">
                    <div className="mx-auto mb-6 p-2 rounded-full w-fit">
                        <img src={ShareAi} alt="ShareAI Logo" className="h-16 w-auto rounded-full" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("nTverfiyingCredentials", sourceKey.user)}</h2>
                    <p className="text-gray-500 mb-8">{t("nTpleaseWaitWhileWeLogYouInSecurely", sourceKey.user)}</p>
                    <Spin size="large" />
                </div>
            </div>
        </>
    );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
    loginSuccessful,
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CrossLoginPage));
