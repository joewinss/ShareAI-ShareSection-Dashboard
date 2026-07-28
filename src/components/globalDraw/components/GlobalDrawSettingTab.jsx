import React, { useEffect, useState, useCallback, useRef } from "react";
import { Select, Switch, message, Button, Input, Modal } from "antd";
import { connect } from "react-redux";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import toggleOutletDrawFlags from "@/pages/api/merchantDraw/toggleOutletDrawFlags";
import getOutletDrawFlags from "@/pages/api/merchantDraw/getOutletDrawFlags";
import getMerchantCode from "@/pages/api/voucherDraw/getMerchantCode";
import saveMerchantCode from "@/pages/api/voucherDraw/saveMerchantCode";
import getOutletListingsByMasterHQ from "@/pages/api/user/getOutletListingsByMasterHQ";
import { mapOutletOptions } from "@/utility/option-mappers";
import { USER_STATUS } from "@/constants/user";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";

const GlobalDrawSettingTab = ({ user, outletId, onOutletChange }) => {
    const { t } = useTranslation();
    const userIdentity = user?.role;

    // Outlet picker state (masterHQ only)
    const [outletOptions, setOutletOptions] = useState([]);
    const [outletListLoading, setOutletListLoading] = useState(false);

    // Draw flag state
    const [voucherDrawFlag, setVoucherDrawFlag] = useState(0);
    const [monthlyDrawFlag, setMonthlyDrawFlag] = useState(0);
    const [flagsLoading, setFlagsLoading] = useState(false);
    const [voucherToggleLoading, setVoucherToggleLoading] = useState(false);
    const [monthlyToggleLoading, setMonthlyToggleLoading] = useState(false);

    // Merchant code state
    const [merchantCode, setMerchantCode] = useState(null);
    const [codeLoading, setCodeLoading] = useState(false);
    const [codeRevealed, setCodeRevealed] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editCodeValue, setEditCodeValue] = useState("");
    const [savingCode, setSavingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const revealTimerRef = useRef(null);
    const countdownRef = useRef(null);
    const copyTimerRef = useRef(null);

    // Load outlet options for masterHQ
    useEffect(() => {
        if (userIdentity !== "masterHQ") return;
        setOutletListLoading(true);
        getOutletListingsByMasterHQ("all", 0, { status: USER_STATUS.ACTIVE })
            .then((res) => {
                if (res?.data) {
                    setOutletOptions(mapOutletOptions(res.data));
                }
            })
            .catch(() => { })
            .finally(() => setOutletListLoading(false));
    }, [userIdentity]);

    // Load draw flags when outlet changes
    const fetchFlags = useCallback(async () => {
        if (userIdentity === "masterHQ" && !outletId) {
            setVoucherDrawFlag(0);
            setMonthlyDrawFlag(0);
            return;
        }
        setFlagsLoading(true);
        try {
            const query = userIdentity === "masterHQ" ? { outletUserId: outletId } : {};
            const res = await getOutletDrawFlags(query);
            setVoucherDrawFlag(res?.data?.voucherDraw ?? 0);
            setMonthlyDrawFlag(res?.data?.monthlyDraw ?? 0);
        } catch {
            message.error(t("failedToLoadDrawFlags", sourceKey.user));
        } finally {
            setFlagsLoading(false);
        }
    }, [userIdentity, outletId]);

    useEffect(() => { fetchFlags(); }, [fetchFlags]);

    // Load merchant code
    const fetchMerchantCode = useCallback(async () => {
        setCodeLoading(true);
        try {
            const res = await getMerchantCode();
            setMerchantCode(res?.data?.merchantCode || null);
        } catch {
            setMerchantCode(null);
        } finally {
            setCodeLoading(false);
        }
    }, []);

    useEffect(() => { fetchMerchantCode(); }, [fetchMerchantCode]);

    // Cleanup timers
    useEffect(() => {
        return () => {
            if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        };
    }, []);

    const handleToggleVoucherDraw = async (checked) => {
        const outletUserId = userIdentity === "masterHQ" ? outletId : undefined;
        setVoucherToggleLoading(true);
        try {
            await toggleOutletDrawFlags({ outletUserId, voucherDraw: checked ? 1 : 0 });
            setVoucherDrawFlag(checked ? 1 : 0);
            message.success(`${t("voucherDrawLabel", sourceKey.user)} ${checked ? "enabled" : "disabled"}`);
        } catch {
            message.error(t("failedToUpdateVoucherDrawStatus", sourceKey.user));
        } finally {
            setVoucherToggleLoading(false);
        }
    };

    const handleToggleMonthlyDraw = async (checked) => {
        const outletUserId = userIdentity === "masterHQ" ? outletId : undefined;
        setMonthlyToggleLoading(true);
        try {
            await toggleOutletDrawFlags({ outletUserId, monthlyDraw: checked ? 1 : 0 });
            setMonthlyDrawFlag(checked ? 1 : 0);
            message.success(`${t("monthlyDraw", sourceKey.user)} ${checked ? "enabled" : "disabled"}`);
        } catch {
            message.error(t("failedToUpdateMonthlyDrawStatus", sourceKey.user));
        } finally {
            setMonthlyToggleLoading(false);
        }
    };

    const handleRevealCode = () => {
        if (codeRevealed) {
            setCodeRevealed(false);
            setCountdown(0);
            if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            return;
        }
        setCodeRevealed(true);
        setCodeCopied(false);
        setCountdown(5);
        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        revealTimerRef.current = setTimeout(() => {
            setCodeRevealed(false);
            setCountdown(0);
            if (countdownRef.current) clearInterval(countdownRef.current);
        }, 5000);
    };

    const handleCopyCode = async () => {
        if (!merchantCode || !codeRevealed) return;
        try {
            await navigator.clipboard.writeText(merchantCode);
            setCodeCopied(true);
            message.success(t("copiedToClipboard", sourceKey.user));
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
            copyTimerRef.current = setTimeout(() => setCodeCopied(false), 2000);
        } catch {
            message.error(t("failedToCopy", sourceKey.user));
        }
    };

    const handleSaveCode = async () => {
        if (!editCodeValue.trim()) {
            message.error(t("pleaseEnterMerchantCode", sourceKey.user));
            return;
        }
        setSavingCode(true);
        try {
            await saveMerchantCode({ merchantCode: editCodeValue.trim() });
            setMerchantCode(editCodeValue.trim());
            setEditModalOpen(false);
            setEditCodeValue("");
            message.success(t("merchantCodeSaved", sourceKey.user));
        } catch {
            message.error(t("failedToSaveSettings", sourceKey.user));
        } finally {
            setSavingCode(false);
        }
    };

    const isDisabled = userIdentity === "masterHQ" && !outletId;

    return (
        <div className="w-full bg-white rounded-xl border border-gray-200 p-5">
            {/* masterHQ: outlet picker */}
            {userIdentity === "masterHQ" && (
                <div className="mb-5 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 shrink-0">{t("outletLabel", sourceKey.user)}</span>
                    <Select
                        placeholder={t("selectOutlet", sourceKey.user)}
                        loading={outletListLoading}
                        value={outletId ?? null}
                        onChange={(val) => onOutletChange(val ?? null)}
                        style={{ minWidth: 280 }}
                        options={outletOptions.map((o) => ({ value: o.value, label: o.title }))}
                        showSearch
                        optionFilterProp="label"
                        allowClear
                    />
                    {!outletId && (
                        <span className="text-xs text-gray-400">
                            {t("selectOutletHint", sourceKey.user)}
                        </span>
                    )}
                </div>
            )}

            <div className={`relative ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}>
                {/* Voucher Draw toggle */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                        <div className="text-sm font-medium text-gray-700">{t("voucherDrawLabel", sourceKey.user)}</div>
                        <div className="text-xs text-gray-400">{t("enableVoucherDrawForOutlet", sourceKey.user)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={voucherDrawFlag === 1}
                            onChange={handleToggleVoucherDraw}
                            loading={voucherToggleLoading || flagsLoading}
                        />
                        <span className={`text-xs font-medium ${voucherDrawFlag === 1 ? "text-green-600" : "text-gray-400"}`}>
                            {t(voucherDrawFlag === 1 ? "activeStatus" : "inactiveStatus", sourceKey.user)}
                        </span>
                    </div>
                </div>

                {/* Merchant Code section */}
                <div className="py-4 border-b border-gray-200">
                    <div className="text-sm font-semibold text-gray-700 mb-1">{t("merchantCode", sourceKey.user)}</div>
                    <div className="text-xs text-gray-400 mb-3">
                        {t("merchantCodeRedemptionDesc", sourceKey.user)}
                    </div>

                    {merchantCode ? (
                        <div className="flex items-center gap-3">
                            <div className={`flex-1 border rounded-lg px-4 py-3 flex items-center justify-between transition-colors duration-200 ${codeRevealed ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                                <span className={`font-mono text-sm ${codeRevealed ? "text-green-600 font-semibold tracking-wide" : "text-gray-400 tracking-widest"}`}>
                                    {codeRevealed ? merchantCode : "•••••••"}
                                </span>
                                <div className="flex items-center gap-2">
                                    {codeRevealed && (
                                        <span className="text-xs text-gray-400 font-mono">{countdown}s</span>
                                    )}
                                    <button
                                        onClick={handleRevealCode}
                                        className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
                                        title={t(codeRevealed ? "hideCode" : "revealCode", sourceKey.user)}
                                    >
                                        {codeRevealed
                                            ? <Eye className="w-4 h-4 text-green-600" />
                                            : <EyeOff className="w-4 h-4 text-gray-400" />
                                        }
                                    </button>
                                    <button
                                        onClick={handleCopyCode}
                                        disabled={!codeRevealed}
                                        className={`w-9 h-9 flex items-center justify-center rounded-md border transition-colors ${codeRevealed ? "border-gray-200 hover:bg-gray-100 cursor-pointer" : "border-gray-100 opacity-30 cursor-not-allowed"}`}
                                        title={t(codeRevealed ? "copyToClipboard" : "revealCodeFirstToCopy", sourceKey.user)}
                                    >
                                        {codeCopied
                                            ? <Check className="w-4 h-4 text-green-600" />
                                            : <Copy className="w-4 h-4 text-gray-500" />
                                        }
                                    </button>
                                </div>
                            </div>
                            <Button onClick={() => { setEditCodeValue(merchantCode); setEditModalOpen(true); }}>
                                {t("editCode", sourceKey.user)}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between border border-dashed border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                            <span className="text-sm text-gray-400">{t("noMerchantCodeSetYet", sourceKey.user)}</span>
                            <Button
                                type="primary"
                                className="bg-green-500 hover:bg-green-600 border-none"
                                onClick={() => { setEditCodeValue(""); setEditModalOpen(true); }}
                            >
                                {t("setCode", sourceKey.user)}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Monthly Draw toggle */}
                <div className="flex items-center justify-between py-3">
                    <div>
                        <div className="text-sm font-medium text-gray-700">{t("monthlyDraw", sourceKey.user)}</div>
                        <div className="text-xs text-gray-400">{t("enableMonthlyDrawForOutlet", sourceKey.user)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={monthlyDrawFlag === 1}
                            onChange={handleToggleMonthlyDraw}
                            loading={monthlyToggleLoading || flagsLoading}
                        />
                        <span className={`text-xs font-medium ${monthlyDrawFlag === 1 ? "text-green-600" : "text-gray-400"}`}>
                            {t(monthlyDrawFlag === 1 ? "activeStatus" : "inactiveStatus", sourceKey.user)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Edit/Set merchant code modal */}
            <Modal
                title={t(merchantCode ? "editMerchantCode" : "setMerchantCode", sourceKey.user)}
                open={editModalOpen}
                onOk={handleSaveCode}
                onCancel={() => { setEditModalOpen(false); setEditCodeValue(""); }}
                confirmLoading={savingCode}
                okText={t("save", sourceKey.user)}
            >
                <div className="py-2">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">{t("merchantCode", sourceKey.user)}</label>
                    <Input
                        value={editCodeValue}
                        onChange={(e) => setEditCodeValue(e.target.value)}
                        placeholder={t("enterMerchantCodePlaceholder", sourceKey.user)}
                        size="large"
                    />
                </div>
            </Modal>
        </div>
    );
};

const mapStateToProps = (state) => ({
    user: state.user.user,
});

export default connect(mapStateToProps)(GlobalDrawSettingTab);
