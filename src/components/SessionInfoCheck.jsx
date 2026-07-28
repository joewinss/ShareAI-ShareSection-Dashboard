import { get, isEmpty, toNumber } from "lodash";
import React, { useEffect } from "react";
import { connect } from "react-redux";
import localStorage from "local-storage";
import { message } from "antd";
import Randomstring from "randomstring";
import getSessionInfo from "@/pages/api/session/getSessionInfo";
import { sessionPass } from "@/utility/startUp";

const SessionInfoCheck = (props) => {
    const user = get(props.user, "user");

    let sessionInfo = localStorage.get("sessionInfo");

    useEffect(() => {
        let currentSessionTimestamp = toNumber(sessionInfo?.sessionTime) || 0;

        if ((new Date().getTime() - currentSessionTimestamp) > 60 * 60 * 1000 || currentSessionTimestamp === 0) {
            sessionInfo = Randomstring.generate();
            if (!isEmpty(user)) {
                sessionInfo = user?._id;
            }

            getSessionInfo({ sessionHint: sessionInfo }, { "session-pass": sessionPass })
                .then((res) => {
                    let data = res?.data?.data;
                    localStorage.set("sessionInfo", data);
                    if (props.onSuccess) {
                        props.onSuccess(data);
                    }
                })
                .catch((err) => {
                    message.error("Session error");
                });
        }
    }, []);

    return (
        <>
        </>
    );
};

const mapStateToProps = (state) => ({
    user: state.user,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(SessionInfoCheck); 