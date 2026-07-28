import React, { useCallback, useState } from "react";
import { Drawer, Pagination, Spin, message } from "antd";
import { LeftOutlined, ShareAltOutlined, GiftOutlined, LoadingOutlined } from "@ant-design/icons";
import { formatDate, formatDecimalNumber, replaceStringPattern } from "@/utility/common-functions";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import getUserVoucherList from "@/pages/api/voucherDraw/public/getUserVoucherList";
import initiateTransfer from "@/pages/api/voucherDraw/public/initiateTransfer";
import { VOUCHER_DRAW_ACTIVITY_STATUS as ACTIVITY_STATUS, VOUCHER_DRAW_TYPE } from "@/constants/data";
import VoucherDetailsSection from "./VoucherDetailsSection";
import RedemptionVerificationDrawer from "./RedemptionVerificationDrawer";
import client from "../../../../../env";

const { consiChatPhoneNumber } = client.uri;

const normalizeStatus = (status) => String(status || "").replace(/_/g, "").toLowerCase();

const DEFAULT_STATUS_PILL_CLASSNAME = "bg-white/20 backdrop-blur-md text-white border-white/10";

// Matches the app-wide gradient button theme (.ant-btn-default / .gardient-btn in overwrite.css)
const GRADIENT_BUTTON_STYLE = { background: "linear-gradient(to right, #22c55e, #3b82f6)", color: "#fff" };

// Priority: transferred away → transfer in progress → redeemed/expired → active
// pillClassName = translucent pill over a dark banner (main list). badgeClassName = solid light chip on white (sub-list).
const getStatusConfig = (status, t, transferStatus, currentOwnerPhone, phone) => {
    // Transferred to someone else — currentOwnerPhone is set and differs from caller
    if (currentOwnerPhone && phone && currentOwnerPhone !== phone) {
        return { label: "Transferred", borderClassName: "border-gray-200", opacityClassName: "opacity-[0.55]", pillClassName: DEFAULT_STATUS_PILL_CLASSNAME, badgeClassName: "bg-blue-50 text-blue-500" };
    }
    if (transferStatus === ACTIVITY_STATUS.TRANSFER_IN_PROGRESS) {
        return { label: "Transfer In Progress", borderClassName: "border-transparent", opacityClassName: "opacity-100", pillClassName: "bg-yellow-400/90 text-yellow-950 border-yellow-300/40", badgeClassName: "bg-amber-50 text-amber-600 border border-amber-100" };
    }
    const n = normalizeStatus(status);
    if (n === normalizeStatus(ACTIVITY_STATUS.REDEEMED)) {
        return { label: t("redeemed", sourceKey.user), borderClassName: "border-transparent", opacityClassName: "opacity-[0.55]", pillClassName: DEFAULT_STATUS_PILL_CLASSNAME, badgeClassName: "bg-gray-100 text-gray-400" };
    }
    if (n === normalizeStatus(ACTIVITY_STATUS.EXPIRED)) {
        return { label: t("expired", sourceKey.user), borderClassName: "border-transparent", opacityClassName: "opacity-[0.55]", pillClassName: "bg-red-500/90 text-white border-red-300/40", badgeClassName: "bg-red-50 text-red-400" };
    }
    return { label: t("active", sourceKey.user), borderClassName: "border-transparent", opacityClassName: "opacity-100", pillClassName: "bg-green-500 text-white border-green-400/50", badgeClassName: "bg-emerald-50 text-emerald-600" };
};

const FILTER_TABS = [
    { key: "all", labelKey: "allVouchers", fallback: "All" },
    { key: "active", labelKey: "active", fallback: "Active" },
    { key: "inProgress", labelKey: "inProgress", fallback: "In Progress" },
    { key: "redeemed", labelKey: "redeemed", fallback: "Redeemed" },
    { key: "transferred", labelKey: "transferred", fallback: "Transferred" },
];

// SVG Barcode visual helper matching reference stub design
const TicketBarcodeSVG = ({ className = "h-12 w-6 text-slate-900" }) => (
    <svg className={className} viewBox="0 0 40 80" fill="currentColor">
        <rect x="2" y="0" width="3" height="80" />
        <rect x="7" y="0" width="1" height="80" />
        <rect x="10" y="0" width="4" height="80" />
        <rect x="16" y="0" width="2" height="80" />
        <rect x="20" y="0" width="5" height="80" />
        <rect x="27" y="0" width="1" height="80" />
        <rect x="30" y="0" width="3" height="80" />
        <rect x="35" y="0" width="2" height="80" />
    </svg>
);

// Pic'Arts Festival-Style 100% Responsive Ticket Card System (Without Outside Border Lines)
const VoucherTicketCard = ({
    as: Component = "div",
    image,
    badgeCount,
    brandLabel,
    valueText,
    subLabel,
    statusLabel,
    statusPillClassName = DEFAULT_STATUS_PILL_CLASSNAME,
    borderClassName = "border-transparent",
    opacityClassName = "opacity-100",
    notchBgClassName = "bg-[#f8f9fc]",
    clickable = false,
    onClick,
    rightExtra,
    className = "",
}) => (
    <Component
        type={Component === "button" ? "button" : undefined}
        className={`relative flex w-full rounded-3xl shadow-[0_10px_30px_rgba(15,23,42,0.05)] border-0 ${opacityClassName} overflow-hidden text-left transition-all duration-300 min-h-[155px] sm:min-h-[165px] group ${
            clickable ? "cursor-pointer hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)] hover:-translate-y-0.5" : ""
        } ${className}`}
        onClick={clickable ? onClick : undefined}
    >
        {badgeCount != null && (
            <span className="absolute -top-1.5 left-3 z-30 min-w-[22px] h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1.5 leading-none shadow-md border-2 border-white animate-pulse">
                {badgeCount}
            </span>
        )}

        {/* Responsive Perforation Notches & Tear Line */}
        <span className={`absolute right-[28%] sm:right-[30%] -top-3 w-6 h-6 ${notchBgClassName} rounded-full z-20 shadow-inner border border-slate-200/50`} />
        <span className={`absolute right-[28%] sm:right-[30%] -bottom-3 w-6 h-6 ${notchBgClassName} rounded-full z-20 shadow-inner border border-slate-200/50`} />
        <span className="absolute right-[28%] sm:right-[30%] top-0 bottom-0 border-r-2 border-dashed border-white/60 z-10 pointer-events-none" />

        {/* LEFT MAIN TICKET AREA (~72% width) */}
        <div
            className="relative w-[72%] sm:w-[70%] shrink-0 p-4 sm:p-5 flex flex-col justify-between text-white overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 bg-cover bg-center shadow-inner"
            style={image ? { backgroundImage: `linear-gradient(to top, rgba(15,23,42,0.85), rgba(15,23,42,0.3)), url(${image})` } : undefined}
        >
            <div className="flex items-center justify-between gap-2 z-10">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-black shadow-inner shrink-0">
                        🎟
                    </span>
                    <p className="text-xs font-black tracking-wide uppercase text-white/95 truncate">
                        {brandLabel || "Share AI Voucher"}
                    </p>
                </div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-200 bg-black/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 shrink-0">
                    PASS VIP
                </span>
            </div>

            <div className="my-2 z-10">
                {subLabel && (
                    <p className="text-[11px] text-white/85 font-medium truncate">
                        {subLabel}
                    </p>
                )}
            </div>

            <div className="flex items-center justify-between gap-2 z-10 pt-1">
                <span className="inline-flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md text-emerald-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border border-white/10 shadow-sm truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    {statusLabel || "ACTIVE VOUCHER"}
                </span>

                <span className="text-[9px] font-extrabold text-white/70 uppercase hidden sm:inline-block">
                    Valid for redemption
                </span>
            </div>
        </div>

        {/* RIGHT STUB AREA (~28% width) - Pure White Action Stub */}
        <div className="w-[28%] sm:w-[30%] bg-white p-3 sm:p-4 flex flex-col justify-between items-center text-center overflow-hidden">
            <div className="w-full flex flex-col items-center justify-center my-auto">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    REBATE
                </span>
                <p className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight truncate max-w-full">
                    {valueText || "RM 12.00"}
                </p>
            </div>

            {clickable ? (
                <div className="w-full bg-slate-900 text-white rounded-xl py-1.5 px-1 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-0.5 group-hover:bg-teal-600 transition-colors shadow-xs">
                    <span>REDEEM</span>
                    <span className="text-[10px]">↗</span>
                </div>
            ) : (
                <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tight">
                    ACTIVE
                </span>
            )}
        </div>
    </Component>
);

// Individual voucher row inside the sub-list drawer (Pic'Arts Ticket Layout)
const UserVoucherRow = ({ item, t, phone, groupImage, groupTitle, onRedeem, onShare, isSharing }) => {
    const transferStatus = item?.transferStatus || null;
    const currentOwnerPhone = item?.currentOwnerPhone || null;
    const isTransferredAway = currentOwnerPhone && phone && currentOwnerPhone !== phone;
    const effectiveStatus = item?.isExpired ? ACTIVITY_STATUS.EXPIRED : item?.status;
    const isAwaitingRedemption = normalizeStatus(effectiveStatus) === normalizeStatus(ACTIVITY_STATUS.AWAITING_REDEMPTION);
    const isCurrentOwner = !currentOwnerPhone || !phone || currentOwnerPhone === phone;
    const canShare = !isTransferredAway && isAwaitingRedemption;
    const canRedeem = isCurrentOwner && isAwaitingRedemption;
    const isActionable = canShare || canRedeem;

    const statusConfig = getStatusConfig(effectiveStatus, t, transferStatus, currentOwnerPhone, phone);
    const isGlobalContribution = item?.voucherType === VOUCHER_DRAW_TYPE.GLOBAL_CONTRIBUTION;
    const isMerchantDraw = item?.voucherType === VOUCHER_DRAW_TYPE.MERCHANT_DRAW;
    const createdLabel = `${t("createdDate", sourceKey.user)} ${formatDate(item?.createdAt, "DD MMM YYYY") || "-"}`;
    const expiredLabel = `${t("expires", sourceKey.user)} ${formatDate(item?.expiredAt, "DD MMM YYYY") || "-"}`;

    const brandLabel = isGlobalContribution ? item?.voucherTitleSnapshot || groupTitle : groupTitle;
    const bannerImage = isGlobalContribution ? groupImage : undefined;
    const showBannerValue = isMerchantDraw && item?.voucherValue != null;
    const bottomBadgeLabel = isTransferredAway ? `Transferred to ${currentOwnerPhone}` : statusConfig.label;

    return (
        <div
            className={`relative flex w-full h-[155px] sm:h-[165px] bg-white rounded-3xl shadow-[0_10px_30px_rgba(15,23,42,0.04)] overflow-hidden transition-all duration-200 ${statusConfig.opacityClassName} ${canRedeem ? "cursor-pointer hover:shadow-md" : ""}`}
            onClick={() => canRedeem && onRedeem?.(item)}
        >
            {/* Cutout Notches & Perforation */}
            <span className="absolute right-[30%] -top-3 w-6 h-6 bg-[#f8f9fc] rounded-full z-20 shadow-inner border border-slate-200/50" />
            <span className="absolute right-[30%] -bottom-3 w-6 h-6 bg-[#f8f9fc] rounded-full z-20 shadow-inner border border-slate-200/50" />
            <span className="absolute right-[30%] top-0 bottom-0 border-r-2 border-dashed border-white/50 z-10 pointer-events-none" />

            {/* Left Banner Area (70%) */}
            <div
                className="relative w-[70%] shrink-0 rounded-l-3xl p-3.5 flex flex-col justify-between text-white font-bold overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 bg-cover bg-center shadow-inner"
                style={bannerImage ? { backgroundImage: `linear-gradient(to top, rgba(15,23,42,0.8), rgba(15,23,42,0.3)), url(${bannerImage})` } : undefined}
            >
                <div className="flex items-center justify-between gap-1 z-10">
                    <span className="text-[10px] uppercase tracking-wider text-white/90 font-black leading-none truncate">
                        {brandLabel}
                    </span>
                    <span className="text-[8px] font-extrabold uppercase bg-black/20 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10">
                        PASS
                    </span>
                </div>

                <div className="z-10">
                    <p className="text-[9px] text-white/80 font-medium truncate">{createdLabel}</p>
                </div>

                <div className="z-10 flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full truncate ${statusConfig.badgeClassName}`}>
                        {statusConfig.label}
                    </span>
                </div>
            </div>

            {/* Right Action Stub (30%) */}
            <div className="w-[30%] min-w-0 p-3 flex flex-col justify-between items-center text-center bg-white rounded-r-3xl">
                <div className="my-auto">
                    {showBannerValue && (
                        <span className="text-sm font-black text-slate-900 tracking-tight block">
                            RM {formatDecimalNumber(item.voucherValue, 2)}
                        </span>
                    )}
                </div>
                {isActionable && canRedeem ? (
                    <button
                        type="button"
                        style={GRADIENT_BUTTON_STYLE}
                        className="w-full text-[9px] font-black py-1.5 rounded-xl shadow-xs flex items-center justify-center gap-0.5"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRedeem?.(item);
                        }}
                    >
                        Redeem ↗
                    </button>
                ) : (
                    <span className="text-[8px] font-bold text-slate-400 uppercase">{bottomBadgeLabel}</span>
                )}
            </div>
        </div>
    );
};

// Sub-list drawer that fetches and paginates individual vouchers for a voucherId
const UserVoucherListDrawer = ({ open, group, phone, onClose, onRedeemed }) => {
    const { t } = useTranslation();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [sharingId, setSharingId] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [redemptionDrawerOpen, setRedemptionDrawerOpen] = useState(false);
    const pageSize = 10;

    const fetchActivities = useCallback(
        async (pageNum, filterKey) => {
            if (!group?._id || !phone) return;
            setLoading(true);
            try {
                const res = await getUserVoucherList(pageSize, (pageNum - 1) * pageSize, {
                    phone,
                    voucherId: String(group._id),
                    filter: filterKey,
                });
                if (res?.status) {
                    setActivities(res.data || []);
                    setTotal(res.total || 0);
                } else {
                    message.error(res?.message || t("failedToLoadVoucherDetail", sourceKey.user));
                }
            } catch {
                message.error(t("failedToLoadVoucherDetail", sourceKey.user));
            } finally {
                setLoading(false);
            }
        },
        [group?._id, phone, t]
    );

    // Fetch when drawer opens or group changes
    React.useEffect(() => {
        if (open && group) {
            setPage(1);
            setActiveFilter("all");
            setActivities([]);
            fetchActivities(1, "all");
        }
    }, [open, group]);

    const handlePageChange = (nextPage) => {
        setPage(nextPage);
        fetchActivities(nextPage, activeFilter);
    };

    const handleFilterChange = (filterKey) => {
        if (filterKey === activeFilter) return;
        setActiveFilter(filterKey);
        setPage(1);
        fetchActivities(1, filterKey);
    };

    const handleRedeemClick = (item) => {
        setSelectedActivity(item);
        setRedemptionDrawerOpen(true);
    };

    const handleRedeemed = () => {
        setRedemptionDrawerOpen(false);
        fetchActivities(page, activeFilter);
        onRedeemed?.();
    };

    const handleShareToFriend = async (item) => {
        const activityId = item?._id;
        if (!activityId || !phone) return;

        setSharingId(String(activityId));
        try {
            const res = await initiateTransfer({ userVoucherDrawId: activityId, phone });
            if (!res?.data?.status) {
                message.error(res?.data?.message || "Failed to initiate transfer");
                return;
            }
            const { voucherCode, transferRef } = res.data.data;

            const waText = `🎉Hello Share Ai!\nI'd like to claim my voucher.\n\n(Voucher Code: ${voucherCode} | Ref: ${transferRef})`;
            const waLink = `https://wa.me/${consiChatPhoneNumber}?text=${encodeURIComponent(waText)}`;
            const shareMsg = `🎉 Guess what?\n Your friend just sent you a special voucher from Share Ai! \n Claim it here before it expires: ${waLink}`;
            // Optimistically update this row to show transfer in progress
            setActivities((prev) =>
                prev.map((a) =>
                    String(a._id) === String(activityId)
                        ? { ...a, transferStatus: ACTIVITY_STATUS.TRANSFER_IN_PROGRESS }
                        : a
                )
            );

            if (navigator?.share) {
                await navigator.share({ text: shareMsg });
            } else {
                await navigator.clipboard.writeText(shareMsg);
                message.success("Share link copied to clipboard!");
            }
        } catch (err) {
            message.error(err?.message || "Failed to share voucher");
        } finally {
            setSharingId(null);
        }
    };

    return (
        <>
            <Drawer
                open={open}
                placement="left"
                width="100%"
                destroyOnClose={true}
                closeIcon={<LeftOutlined style={{ color: "#643300", fontSize: "12px" }} />}
                onClose={() => { setActivities([]); setPage(1); onClose?.(); }}
                title={
                    <div className="flex items-center text-sm font-normal">
                        {t("back", sourceKey.user)}
                    </div>
                }
            >
                <div className="flex flex-col gap-5">
                    <VoucherDetailsSection
                        voucherImage={group?.voucherImage}
                        title={group?.voucherTitle}
                        tncText={group?.voucherTnC}
                    />

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {FILTER_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${activeFilter === tab.key
                                    ? "bg-slate-600 text-white"
                                    : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                                    }`}
                                onClick={() => handleFilterChange(tab.key)}
                            >
                                {t(tab.labelKey, sourceKey.user) || tab.fallback}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-3.5">
                                {activities.map((item) => (
                                    <UserVoucherRow
                                        key={String(item._id)}
                                        item={item}
                                        t={t}
                                        phone={phone}
                                        groupImage={group?.voucherImage}
                                        groupTitle={group?.voucherTitle}
                                        onRedeem={handleRedeemClick}
                                        onShare={handleShareToFriend}
                                        isSharing={sharingId === String(item._id)}
                                    />
                                ))}
                                {!activities.length && (
                                    <p className="text-center text-gray-400 py-8 text-sm">
                                        {t("noVouchersYet", sourceKey.user)}
                                    </p>
                                )}
                            </div>

                            {total > pageSize && (
                                <div className="mt-2 flex justify-center">
                                    <Pagination
                                        current={page}
                                        pageSize={pageSize}
                                        total={total}
                                        onChange={handlePageChange}
                                        showSizeChanger={false}
                                        simple={true}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Drawer>

            <RedemptionVerificationDrawer
                open={redemptionDrawerOpen}
                voucher={selectedActivity}
                phone={phone}
                onClose={() => setRedemptionDrawerOpen(false)}
                onRedeemed={handleRedeemed}
            />
        </>
    );
};

const UserVoucherTab = ({
    vouchers = [],
    loading = false,
    page = 1,
    total = 0,
    pageSize = 5,
    phone,
    onPageChange,
    onRedeemed,
}) => {
    const { t } = useTranslation();
    const [activitiesDrawerOpen, setActivitiesDrawerOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const handleGroupClick = (group) => {
        setSelectedGroup(group);
        setActivitiesDrawerOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Spin size="large" />
            </div>
        );
    }

    if (!vouchers.length) {
        return (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                <p className="text-gray-400">{t("noVouchersYet", sourceKey.user)}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="space-y-3">
                {vouchers.map((item) => {
                    const isGroup = item.totalCount > 1;
                    const isActive = item.activeCount > 0;
                    // Group cards only show active vs. all-redeemed — transfer states live inside the sub-list
                    const statusConfig = getStatusConfig(isActive ? ACTIVITY_STATUS.AWAITING_REDEMPTION : ACTIVITY_STATUS.REDEEMED, t, null, null, null);
                    const title = item.voucherTitle || t("voucher", sourceKey.user);
                    const voucherImage = item.voucherImage;

                    return (
                        <VoucherTicketCard
                            key={String(item._id)}
                            as="button"
                            image={voucherImage}
                            badgeCount={isGroup && isActive ? item.activeCount : null}
                            brandLabel={title}
                            valueText={item.totalValue > 0 ? `RM ${Number(item.totalValue).toFixed(2)}` : null}
                            // subLabel={isGroup ? `${item.activeCount} of ${item.totalCount} available` : null}
                            statusLabel={statusConfig.label}
                            statusPillClassName={statusConfig.pillClassName}
                            borderClassName={statusConfig.borderClassName}
                            opacityClassName={isActive ? "opacity-100" : "opacity-[0.55]"}
                            notchBgClassName="bg-gray-50"
                            clickable
                            onClick={() => handleGroupClick(item)}
                        />
                    );
                })}
            </div>

            <div className="mt-6 flex justify-center">
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    onChange={(nextPage) => onPageChange?.(nextPage)}
                    showSizeChanger={false}
                    simple={true}
                    showTotal={(totalCount) => replaceStringPattern(t("vouchersTotal", sourceKey.user), { total: totalCount })}
                />
            </div>

            <UserVoucherListDrawer
                open={activitiesDrawerOpen}
                group={selectedGroup}
                phone={phone}
                onClose={() => setActivitiesDrawerOpen(false)}
                onRedeemed={onRedeemed}
            />
        </div>
    );
};

export default UserVoucherTab;
