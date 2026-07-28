import React, { useCallback, useEffect, useState } from "react";
import { Tabs } from "antd";
import { useRouter } from "next/router";
import VoucherActivityTab from "../components/VoucherActivityTab";
import { VOUCHER_DRAW_TYPE } from "@/constants/data";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";

const TAB_KEYS = {
    MERCHANT_DRAW: "merchantDraw",
    GLOBAL_CONTRIBUTION: "globalContribution",
};

const TAB_TYPE_MAP = {
    [TAB_KEYS.MERCHANT_DRAW]: VOUCHER_DRAW_TYPE.MERCHANT_DRAW,
    [TAB_KEYS.GLOBAL_CONTRIBUTION]: VOUCHER_DRAW_TYPE.GLOBAL_CONTRIBUTION,
};

const GlobalDrawPage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { replace } = router;
    const [activeTab, setActiveTab] = useState(TAB_KEYS.MERCHANT_DRAW);

    useEffect(() => {
        if (!router.isReady) return;
        const { tab } = router.query;
        if (tab && Object.values(TAB_KEYS).includes(tab)) {
            setActiveTab(tab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady]);

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        replace({ pathname: "/lucky-draw/global", query: { tab } });
    }, [replace]);

    const tabItems = [
        { key: TAB_KEYS.MERCHANT_DRAW, label: t("merchantDraw", sourceKey.user) },
        { key: TAB_KEYS.GLOBAL_CONTRIBUTION, label: t("globalContribution", sourceKey.user) },
    ];

    return (
        <div className="p-3 w-full">
            <Tabs
                type="card"
                activeKey={activeTab}
                onChange={handleTabChange}
                tabBarStyle={{ marginBottom: 0 }}
                items={tabItems}
            />
            <div>
                <VoucherActivityTab voucherType={TAB_TYPE_MAP[activeTab]} />
            </div>
        </div>
    );
};

export default GlobalDrawPage;
