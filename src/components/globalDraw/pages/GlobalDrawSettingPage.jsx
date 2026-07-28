import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { useRouter } from "next/router";
import { updateUser } from "@/redux/actions/user-actions";
import GlobalDrawSettingTab from "../components/GlobalDrawSettingTab";

const GlobalDrawSettingPage = ({ user, updateUser: dispatchUpdateUser }) => {
    const router = useRouter();
    const { replace } = router;
    const [selectedOutletId, setSelectedOutletId] = useState(null);

    useEffect(() => {
        if (!router.isReady) return;
        const { userId } = router.query;
        if (userId) setSelectedOutletId(userId);
    }, [router.isReady]);

    const handleOutletChange = useCallback((outletId) => {
        setSelectedOutletId(outletId ?? null);
        replace({
            pathname: "/lucky-draw/setting",
            query: outletId ? { userId: outletId } : {},
        });
    }, [replace]);

    return (
        <div className="p-3 w-full">
            <GlobalDrawSettingTab
                outletId={selectedOutletId}
                onOutletChange={handleOutletChange}
            />
        </div>
    );
};

const mapStateToProps = (state) => ({
    user: state.user,
});

const mapDispatchToProps = {
    updateUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(GlobalDrawSettingPage);
