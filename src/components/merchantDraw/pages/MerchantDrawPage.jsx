import React, { useState, useEffect, useCallback } from "react";
import { Badge, message, Switch, Tabs } from "antd";
import { connect } from "react-redux";
import { useRouter } from "next/router";
import toggleMerchantDraw from "@/pages/api/merchantDraw/toggleMerchantDraw";
import MerchantDrawActivity from "../components/MerchantDrawActivity";
import MerchantDrawSettings from "../components/MerchantDrawSettings";
import VoucherListTab from "@/components/globalDraw/components/VoucherListTab";
import { updateUser } from "@/redux/actions/user-actions";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";

const TAB_KEYS = {
    ACTIVITY: "activity",
    VOUCHERS: "vouchers",
    SETTINGS: "settings",
};

/**
 * MerchantDrawPage — thin orchestrator, like LogPage.
 * - outlet: toggle at top (from Redux); each tab is self-contained
 * - masterHQ: no page-level toggle; each tab manages its own outlet selector
 */
const MerchantDrawPage = ({ user, updateUser: dispatchUpdateUser }) => {
    const { t } = useTranslation();
    const userObj = user?.user;
    const userIdentity = userObj?.role;
    const reduxIsMerchantDraw = userObj?.isMerchantDraw ?? 0;
    const isConsiChat = userObj?.isConsiChat ?? 0;
    const canToggle = userIdentity === "outlet";

    // Activity tab is gated by Consi Chat entitlement for both masterHQ and outlets.
    const showActivityTab = isConsiChat === 1;
    const router = useRouter();
    const { replace } = router;
    const [selectedOutletId, setSelectedOutletId] = useState(null);
    const [toggleLoading, setToggleLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(showActivityTab ? TAB_KEYS.ACTIVITY : TAB_KEYS.SETTINGS);
    const [autoOpenCreate, setAutoOpenCreate] = useState(false);
    const [autoOpenCreateType, setAutoOpenCreateType] = useState(null);

    useEffect(() => {
        if (!router.isReady) return;
        const { tab, userId, openCreate, type } = router.query;
        if (tab === TAB_KEYS.ACTIVITY && showActivityTab) {
            setActiveTab(TAB_KEYS.ACTIVITY);
        } else if (tab === TAB_KEYS.VOUCHERS) {
            setActiveTab(TAB_KEYS.VOUCHERS);
        } else {
            setActiveTab(TAB_KEYS.SETTINGS);
        }
        if (userId) setSelectedOutletId(userId);
        if (openCreate === "1") {
            setAutoOpenCreate(true);
            setAutoOpenCreateType(type ? Number(type) : null);
            router.replace({ pathname: "/lucky-draw/merchant", query: { tab: tab || TAB_KEYS.VOUCHERS, ...(userId ? { userId } : {}) } }, undefined, { shallow: true });
        }
    }, [router.isReady, router.query.tab, router.query.userId, router.query.openCreate, router.query.type]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        const query = { tab };
        if ((tab === TAB_KEYS.SETTINGS || tab === TAB_KEYS.VOUCHERS) && selectedOutletId) {
            query.userId = selectedOutletId;
        }
        replace({ pathname: "/lucky-draw/merchant", query });
    }, [selectedOutletId, replace]);

    const handleOutletChange = useCallback((outletId) => {
        setSelectedOutletId(outletId ?? null);
        replace({
            pathname: "/lucky-draw/merchant",
            query: outletId
                ? { tab: TAB_KEYS.SETTINGS, userId: outletId }
                : { tab: TAB_KEYS.SETTINGS },
        });
    }, [replace]);

    const handleToggle = async (checked) => {
        if (!canToggle) return;
        setToggleLoading(true);
        try {
            await toggleMerchantDraw({ isMerchantDraw: checked ? 1 : 0 });
            dispatchUpdateUser({ isMerchantDraw: checked ? 1 : 0 });
            message.success(t(checked ? "merchantDrawEnabled" : "merchantDrawDisabled", sourceKey.user));
        } catch (err) {
            message.error(t("failedToUpdateMerchantDrawStatus", sourceKey.user));
        } finally {
            setToggleLoading(false);
        }
    };

    const tabItems = [
        { key: TAB_KEYS.SETTINGS, label: t("merchantDrawSettings", sourceKey.user) },
        { key: TAB_KEYS.VOUCHERS, label: t("voucherList", sourceKey.user) },
        ...(showActivityTab
            ? [{ key: TAB_KEYS.ACTIVITY, label: t("merchantDrawActivity", sourceKey.user) }]
            : []),
    ];

    let tabContent = null;
    if (activeTab === TAB_KEYS.ACTIVITY && showActivityTab) {
        tabContent = <MerchantDrawActivity />;
    } else if (activeTab === TAB_KEYS.VOUCHERS) {
        tabContent = (
            <VoucherListTab
                outletId={selectedOutletId}
                autoOpenCreate={autoOpenCreate}
                autoOpenCreateType={autoOpenCreateType}
                onAutoOpenCreateHandled={() => setAutoOpenCreate(false)}
            />
        );
    } else if (activeTab === TAB_KEYS.SETTINGS) {
        tabContent = (
            <MerchantDrawSettings
                outletId={selectedOutletId}
                onOutletChange={handleOutletChange}
            />
        );
    }

    return (
        <div className="p-3 w-full">
            {/* Header: title + outlet toggle (outlet users only) */}
            <div className="flex items-center w-full mb-4">

                {userIdentity === "outlet" && (
                    <div className="w-full bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
                        {/* Toggle row */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-gray-700">{t("merchantLuckyDraw", sourceKey.user)}</span>
                                <span className="text-xs text-gray-500">
                                    Enable or disable the participation of your storefront in global draws.
                                </span>
                            </div>
                            <Badge
                                status={reduxIsMerchantDraw === 1 ? "success" : "default"}
                                text={
                                    <span className={`text-xs font-medium ${reduxIsMerchantDraw === 1 ? "text-green-600" : "text-gray-400"}`}>
                                        {t(reduxIsMerchantDraw === 1 ? "merchantDrawActive" : "merchantDrawInactive", sourceKey.user)}
                                    </span>
                                }
                            />
                            <Switch
                                checked={reduxIsMerchantDraw === 1}
                                onChange={handleToggle}
                                loading={toggleLoading}
                                disabled={!canToggle}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs — content re-mounts on each switch (like LogPage pattern) */}
            <div>
                <Tabs
                    type="card"
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    tabBarStyle={{ marginBottom: 0 }}
                    items={tabItems}
                />
                <div>{tabContent}</div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    user: state.user,
});

const mapDispatchToProps = {
    updateUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(MerchantDrawPage);
