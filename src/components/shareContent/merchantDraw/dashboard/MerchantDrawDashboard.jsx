import React, { useEffect, useState } from "react";
import { Pagination, Spin } from "antd";
import { useRouter } from "next/router";
import getMerchantDrawPublicHistory from "@/pages/api/merchantDraw/public/history";
import getGlobalCampaign from "@/pages/api/merchantDraw/public/globalCampaign";
import getGlobalEntryCount from "@/pages/api/merchantDraw/public/globalEntryCount";
import getTotalGlobalEntryCount from "@/pages/api/merchantDraw/public/totalGlobalEntryCount";
import getGlobalHistory from "@/pages/api/merchantDraw/public/globalHistory";
import getUserStats from "@/pages/api/voucherDraw/public/getUserStats";
import getUserVouchers from "@/pages/api/voucherDraw/public/getUserVouchers";
import PrizeList from "./PrizeList";
import GlobalHistoryList from "./GlobalHistoryList";
import DashboardHeader from "./DashboardHeader";
import UserVoucherTab from "./UserVoucherTab";
import BottomNavbar from "./BottomNavbar";
import HomeTab from "./HomeTab";
import ProfileTab from "./ProfileTab";
import MerchantTab from "./MerchantTab";
import { formatDate, replaceStringPattern } from "@/utility/common-functions";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { MERCHANT_DRAW_STATUS } from "@/constants/user";

/**
 * MerchantDrawDashboard
 * Reads phone from router.query.phone
 */
const MerchantDrawDashboard = () => {
    const router = useRouter();
    const phone = router.isReady ? router.query?.phone : null;

    const [prizes, setPrizes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("voucher");
    const [activeNav, setActiveNav] = useState("voucher");
    const [activeCampaign, setActiveCampaign] = useState(null);
    const [globalEntryCount, setGlobalEntryCount] = useState(0);
    const [totalGlobalEntryCount, setTotalGlobalEntryCount] = useState(0);
    const [globalHistory, setGlobalHistory] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [existingVoucherCount, setExistingVoucherCount] = useState(0);

    // Pagination states
    const [merchantPage, setMerchantPage] = useState(1);
    const [globalPage, setGlobalPage] = useState(1);
    const [voucherPage, setVoucherPage] = useState(1);
    const [pageSize] = useState(5);

    // Totals
    const [merchantTotal, setMerchantTotal] = useState(0);
    const [globalTotal, setGlobalTotal] = useState(0);
    const [voucherTotal, setVoucherTotal] = useState(0);

    const { t } = useTranslation();

    // Fetch Merchant History
    useEffect(() => {
        if (!phone || (activeTab !== "merchant" && activeNav !== "merchant")) return;

        setLoading(true);
        getMerchantDrawPublicHistory(pageSize, (merchantPage - 1) * pageSize, { phone })
            .then((res) => {
                if (res?.status) {
                    setPrizes(res.data || []);
                    setMerchantTotal(res.total || 0);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [phone, merchantPage, pageSize, activeTab, activeNav]);

    // Fetch Global History
    useEffect(() => {
        if (!phone || activeTab !== "global") return;

        setLoading(true);
        getGlobalHistory(pageSize, (globalPage - 1) * pageSize, { phone })
            .then((res) => {
                if (res?.status) {
                    setGlobalHistory(res.data || []);
                    setGlobalTotal(res.total || 0);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [phone, globalPage, pageSize, activeTab]);

    // Fetch Voucher List
    useEffect(() => {
        if (!phone || (activeTab !== "voucher" && activeNav !== "voucher")) return;

        setLoading(true);
        getUserVouchers(pageSize, (voucherPage - 1) * pageSize, { phone })
            .then((res) => {
                if (res?.status) {
                    setVouchers(res.data || []);
                    setVoucherTotal(res.total || 0);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [phone, voucherPage, pageSize, activeTab, activeNav]);

    // Fetch Campaign and Entry Info
    useEffect(() => {
        if (!phone) return;

        // Load active campaign + entry count
        getGlobalCampaign(1, 0, {})
            .then(async (res) => {
                const campaign = res?.data;
                if (campaign?._id) {
                    setActiveCampaign(campaign);
                    if (phone) {
                        const countRes = await getGlobalEntryCount(1, 0, { phone, campaignId: campaign._id });
                        setGlobalEntryCount(countRes?.data?.entryCount ?? countRes?.data?.count ?? 0);
                    }
                }
            })
            .catch(() => { });

        // Load total global entries (one-time or phone change)
        getTotalGlobalEntryCount(1, 0, { phone })
            .then((res) => {
                setTotalGlobalEntryCount(res?.data?.entryCount ?? 0);
            })
            .catch(() => { });

        getUserStats(1, 0, { phone })
            .then((res) => {
                setExistingVoucherCount(res?.data?.existingVoucherCount ?? 0);
            })
            .catch(() => { });
    }, [phone]);

    const refreshVoucherData = () => {
        setVoucherPage(1);
        getUserVouchers(pageSize, 0, { phone }).then((res) => {
            if (res?.status) {
                setVouchers(res.data || []);
                setVoucherTotal(res.total || 0);
            }
        });
        getUserStats(1, 0, { phone }).then((res) => {
            setExistingVoucherCount(res?.data?.existingVoucherCount ?? 0);
        });
    };

    const handleNavChange = (navKey) => {
        setActiveNav(navKey);
        if (navKey === "voucher") {
            setActiveTab("voucher");
        } else if (navKey === "merchant") {
            setActiveTab("merchant");
        }
    };

    const merchantPrizes = prizes.filter((p) => p.merchantDrawStatus === MERCHANT_DRAW_STATUS.COMPLETED || p.reward);
    const totalDrawCount = merchantTotal + totalGlobalEntryCount;
    const activeCampaignTitle =
        typeof activeCampaign?.name === "string" && activeCampaign.name.trim()
            ? activeCampaign.name.trim()
            : t("globalRewardsCampaign", sourceKey.user);

    return (
        <div className="min-h-screen bg-[#f8f9fc] pb-28">
            {/* Dashboard Header - Hidden on Profile and Merchant tabs */}
            {(activeNav === "home" || activeNav === "voucher") && (
                <DashboardHeader
                    phone={phone}
                    totalCount={totalDrawCount}
                    merchantCount={merchantTotal}
                    totalGlobalEntryCount={totalGlobalEntryCount}
                    existingVoucherCount={existingVoucherCount}
                    loading={loading}
                />
            )}

            {/* Main Content Area based on Active Bottom Nav */}
            <div className={`max-w-md mx-auto px-4 ${activeNav === "profile" || activeNav === "merchant" ? "pt-6" : "mt-6"}`}>
                {activeNav === "home" ? (
                    <HomeTab
                        phone={phone}
                        totalCount={totalDrawCount}
                        merchantCount={merchantTotal}
                        totalGlobalEntryCount={totalGlobalEntryCount}
                        existingVoucherCount={existingVoucherCount}
                        activeCampaign={activeCampaign}
                        globalEntryCount={globalEntryCount}
                        onNavigateNav={handleNavChange}
                    />
                ) : activeNav === "merchant" ? (
                    <MerchantTab
                        prizes={merchantPrizes}
                        loading={loading}
                        phone={phone}
                    />
                ) : activeNav === "profile" ? (
                    <ProfileTab
                        phone={phone}
                        totalCount={totalDrawCount}
                        merchantCount={merchantTotal}
                        totalGlobalEntryCount={totalGlobalEntryCount}
                        existingVoucherCount={existingVoucherCount}
                        onNavigateNav={handleNavChange}
                    />
                ) : (
                    <>
                        {/* Pill Tab Bar (Design System matching screenshot) */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
                            <button
                                type="button"
                                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                                    activeTab === "voucher"
                                        ? "bg-teal-600 text-white shadow-md border border-teal-600"
                                        : "bg-white text-slate-700 border border-slate-100 shadow-sm shadow-slate-100 hover:bg-slate-50"
                                }`}
                                onClick={() => {
                                    setActiveTab("voucher");
                                    setActiveNav("voucher");
                                }}
                            >
                                🎟 {t("voucher", sourceKey.user) || "Voucher"}
                            </button>

                            <button
                                type="button"
                                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                                    activeTab === "merchant"
                                        ? "bg-teal-600 text-white shadow-md border border-teal-600"
                                        : "bg-white text-slate-700 border border-slate-100 shadow-sm shadow-slate-100 hover:bg-slate-50"
                                }`}
                                onClick={() => {
                                    setActiveTab("merchant");
                                    setActiveNav("merchant");
                                }}
                            >
                                {t("merchantDraw", sourceKey.user) || "Merchant Draw"}
                            </button>

                            <button
                                type="button"
                                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                                    activeTab === "global"
                                        ? "bg-teal-600 text-white shadow-md border border-teal-600"
                                        : "bg-white text-slate-700 border border-slate-100 shadow-sm shadow-slate-100 hover:bg-slate-50"
                                }`}
                                onClick={() => setActiveTab("global")}
                            >
                                Monthly Mega Rewards
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-16">
                                <Spin size="large" />
                            </div>
                        ) : activeTab === "voucher" ? (
                            <UserVoucherTab
                                vouchers={vouchers}
                                loading={loading}
                                page={voucherPage}
                                total={voucherTotal}
                                pageSize={pageSize}
                                phone={phone}
                                onPageChange={(p) => setVoucherPage(p)}
                                onRedeemed={refreshVoucherData}
                            />
                        ) : activeTab === "global" ? (
                            <div>
                                {activeCampaign && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-3xl p-4 mb-4 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] text-purple-500 font-bold uppercase tracking-wider mb-1">{t("currentCampaign", sourceKey.user)}</p>
                                                <p className="font-extrabold text-purple-900 text-base">{activeCampaignTitle}</p>
                                                <p className="text-xs text-purple-600 mt-0.5 font-medium">{formatDate(activeCampaign.startDate, "DD MMM YYYY")} – {formatDate(activeCampaign.endDate, "DD MMM YYYY")}</p>
                                            </div>
                                            <div className="bg-purple-200 text-purple-900 px-3 py-1 rounded-full text-xs font-bold">
                                                {globalEntryCount} {globalEntryCount === 1 ? t("entry", sourceKey.user) : t("entries", sourceKey.user)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">{t("campaignHistory", sourceKey.user)}</h3>
                                <GlobalHistoryList history={globalHistory} />

                                <div className="mt-6 flex justify-center">
                                    <Pagination
                                        current={globalPage}
                                        pageSize={pageSize}
                                        total={globalTotal}
                                        onChange={(nextPage) => setGlobalPage(nextPage)}
                                        showSizeChanger={false}
                                        simple={true}
                                        showTotal={(total) => replaceStringPattern(t("campaignsTotal", sourceKey.user), { total })}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <PrizeList prizes={merchantPrizes} activeTab={activeTab} />
                                <div className="mt-6 flex justify-center">
                                    <Pagination
                                        current={merchantPage}
                                        pageSize={pageSize}
                                        total={merchantTotal}
                                        onChange={(nextPage) => setMerchantPage(nextPage)}
                                        showSizeChanger={false}
                                        simple={true}
                                        showTotal={(total) => replaceStringPattern(t("merchantDrawsTotal", sourceKey.user), { total })}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Fixed Bottom Navigation Bar */}
            <BottomNavbar
                activeNav={activeNav}
                onChangeNav={handleNavChange}
                voucherBadgeCount={existingVoucherCount}
            />
        </div>
    );
};

export default MerchantDrawDashboard;
