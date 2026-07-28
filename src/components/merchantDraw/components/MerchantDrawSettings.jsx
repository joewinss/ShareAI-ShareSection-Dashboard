import React, { useEffect, useState, useCallback } from "react";
import { Button, InputNumber, message, Modal, Select, Switch } from "antd";
import { connect } from "react-redux";
import WheelConfiguration from "./WheelConfiguration";
import WheelPreview from "./WheelPreview";
import getMerchantDrawSettings from "@/pages/api/merchantDraw/getMerchantDrawSettings";
import updateMerchantDrawSettings from "@/pages/api/merchantDraw/updateMerchantDrawSettings";
import editVoucher from "@/pages/api/voucherDraw/editVoucher";
import updateRecurring from "@/pages/api/merchantDraw/updateRecurring";
import topUpPrizeCount from "@/pages/api/merchantDraw/topUpPrizeCount";
import toggleMerchantDraw from "@/pages/api/merchantDraw/toggleMerchantDraw";
import getOutletListingsByMasterHQ from "@/pages/api/user/getOutletListingsByMasterHQ";
import { mapOutletOptions } from "@/utility/option-mappers";
import { USER_STATUS } from "@/constants/user";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";

/**
 * MerchantDrawSettings
 * - outlet: loads own settings; panel greyed when isMerchantDraw=0
 * - masterHQ: Select dropdown of all active outlets + per-outlet Lucky Draw toggle;
 *   panel greyed when no outlet selected or the selected outlet has Lucky Draw off
 */
const MerchantDrawSettings = ({ user, outletId, onOutletChange }) => {
    const { t } = useTranslation();
    const userIdentity = user?.role;
    const isMerchantDraw = user?.isMerchantDraw ?? 0;

    // masterHQ outlet picker state
    const [outletOptions, setOutletOptions] = useState([]);
    const [outletListLoading, setOutletListLoading] = useState(false);

    // isMerchantDraw flag of the masterHQ-selected outlet (server-authoritative)
    const [selectedOutletMerchantDraw, setSelectedOutletMerchantDraw] = useState(0);
    const [toggleLoading, setToggleLoading] = useState(false);

    const [segments, setSegments] = useState([]);
    const [isRecurring, setIsRecurring] = useState(0);
    const [recurringLoading, setRecurringLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [voucherEdits, setVoucherEdits] = useState({});
    const [voucherReloadKey, setVoucherReloadKey] = useState(0);

    // Modal for segments that still have no stock set
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [stockModalQtys, setStockModalQtys] = useState({});

    // Disabled when: Lucky Draw off for the relevant outlet, OR masterHQ has no outlet selected
    const isDisabled =
        userIdentity === "outlet"
            ? isMerchantDraw !== 1
            : !outletId || selectedOutletMerchantDraw !== 1;

    // The outletUserId to operate on (null for own outlet)
    const outletUserId = userIdentity === "masterHQ" ? outletId : null;

    // When Auto Recurring is on, every segment must have a reset quantity set
    const recurringQtyMissing = isRecurring === 1 && segments.some((s) => s.recurringInitialItemCount == null);

    // Load all outlets for masterHQ dropdown (label must resolve even when Lucky Draw is off)
    useEffect(() => {
        if (userIdentity !== "masterHQ") return;
        setOutletListLoading(true);
        getOutletListingsByMasterHQ("all", 0, { status: USER_STATUS.ACTIVE })
            .then((res) => {
                if (res?.data) {
                    setOutletOptions(
                        mapOutletOptions(res.data, {
                            extra: (o) => ({ isMerchantDraw: o?.isMerchantDraw ?? 0 }),
                        })
                    );
                }
            })
            .catch(() => { })
            .finally(() => setOutletListLoading(false));
    }, [userIdentity]);

    const fetchSettings = useCallback(async () => {
        if (!userIdentity) return;
        // masterHQ must select an outlet first
        if (userIdentity === "masterHQ" && !outletId) {
            setSegments([]);
            setSelectedOutletMerchantDraw(0);
            return;
        }
        setLoading(true);
        try {
            const query = outletUserId ? { outletUserId } : {};
            const res = await getMerchantDrawSettings(1, 0, query);
            setSegments(res?.data?.settings?.segments || []);
            setIsRecurring(res?.data?.settings?.isRecurring ?? 0);
            if (userIdentity === "masterHQ") {
                setSelectedOutletMerchantDraw(res?.data?.isMerchantDraw ?? 0);
            }
        } catch (err) {
            message.error(err?.response?.data?.message || err?.message || "Failed to load settings");
        } finally {
            setLoading(false);
        }
    }, [userIdentity, outletId, outletUserId]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleToggleOutletMerchantDraw = async (checked) => {
        if (!outletUserId) return;
        const next = checked ? 1 : 0;
        setToggleLoading(true);
        try {
            await toggleMerchantDraw({ isMerchantDraw: next, outletUserId });
            setSelectedOutletMerchantDraw(next);
            // Keep dropdown option in sync so status reflects without a refetch
            setOutletOptions((prev) =>
                prev.map((o) =>
                    o.value === outletUserId ? { ...o, isMerchantDraw: next } : o
                )
            );
            message.success(t(next === 1 ? "merchantDrawEnabledForOutlet" : "merchantDrawDisabledForOutlet", sourceKey.user));
        } catch (err) {
            message.error(err?.response?.data?.message || err?.message || t("failedToUpdateMerchantDrawOutletStatus", sourceKey.user));
        } finally {
            setToggleLoading(false);
        }
    };

    const handleVoucherFieldChange = (voucherId, field, value) => {
        setVoucherEdits(prev => ({
            ...prev,
            [voucherId]: { ...(prev[voucherId] || {}), [field]: value },
        }));
    };

    const doSave = async (segmentsToSave) => {
        setSaving(true);
        try {
            await updateMerchantDrawSettings({
                segments: segmentsToSave,
                isRecurring,
                ...(outletUserId ? { outletUserId } : {}),
            });
            setSegments(segmentsToSave.map(({ _isNew, ...seg }) => seg));

            const voucherEditEntries = Object.entries(voucherEdits).filter(
                ([, edits]) => edits.rebatePercentage != null || edits.maxVoucherValue != null
            );
            if (voucherEditEntries.length > 0) {
                const results = await Promise.allSettled(
                    voucherEditEntries.map(([voucherId, edits]) =>
                        editVoucher({
                            voucherId,
                            ...(edits.rebatePercentage != null ? { rebatePercentage: edits.rebatePercentage } : {}),
                            ...(edits.maxVoucherValue != null ? { maxVoucherValue: edits.maxVoucherValue } : {}),
                            ...(outletUserId ? { outletUserId } : {}),
                        })
                    )
                );
                const failed = results.filter(r => r.status === "rejected");
                if (failed.length > 0) {
                    message.warning(`Settings saved, but ${failed.length} voucher update(s) failed`);
                }
            }
            setVoucherEdits({});
            setVoucherReloadKey(k => k + 1);
            message.success(t("luckyDrawSettingsSaved", sourceKey.user));
        } catch (err) {
            message.error(err?.response?.data?.message || err?.message || t("failedToSaveSettings", sourceKey.user));
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (isDisabled) return;
        if (isRecurring === 1 && segments.some(s => s.recurringInitialItemCount == null)) {
            message.error("Please set a reset quantity per cycle for all segments before saving.");
            return;
        }
        const unlimitedIdxs = segments
            .map((s, i) => i)
            .filter(i => segments[i].itemCount == null);
        if (unlimitedIdxs.length > 0) {
            const initial = {};
            unlimitedIdxs.forEach(i => { initial[i] = null; });
            setStockModalQtys(initial);
            setStockModalOpen(true);
            return;
        }
        await doSave(segments);
    };

    const handleStockModalConfirm = async () => {
        const missing = Object.values(stockModalQtys).some(v => v == null || v < 1);
        if (missing) {
            message.warning("Please set a quantity (minimum 1) for all listed segments");
            return;
        }
        const updatedSegments = segments.map((seg, i) =>
            stockModalQtys[i] != null
                ? { ...seg, itemCount: stockModalQtys[i] }
                : seg
        );
        setSegments(updatedSegments);
        setStockModalOpen(false);
        await doSave(updatedSegments);
    };

    const handleRecurringToggle = async (checked) => {
        const next = checked ? 1 : 0;
        setIsRecurring(next);
        setRecurringLoading(true);
        try {
            await updateRecurring({ isRecurring: next, ...(outletUserId ? { outletUserId } : {}) });
            message.success(next === 1 ? "Auto recurring enabled" : "Auto recurring disabled");
        } catch (err) {
            message.error(err?.response?.data?.message || err?.message || "Failed to update recurring setting");
            setIsRecurring(next === 1 ? 0 : 1);
        } finally {
            setRecurringLoading(false);
        }
    };

    const handleTopUp = async (segmentIndex, addCount) => {
        try {
            const payload = {
                segmentIndex,
                addCount,
                ...(outletUserId ? { outletUserId } : {}),
            };
            const res = await topUpPrizeCount(payload);
            if (res?.data?.data) {
                setSegments(prev =>
                    prev.map((seg, i) =>
                        i === segmentIndex
                            ? { ...seg, itemCount: res.data.data.itemCount, recurringInitialItemCount: res.data.data.recurringInitialItemCount }
                            : seg
                    )
                );
                message.success("Stock updated successfully");
            }
        } catch (err) {
            message.error(err?.response?.data?.message || err?.message || "Failed to update stock");
        }
    };

    return (
        <div className="w-full bg-white rounded-xl border border-gray-200 p-5">
            {/* masterHQ: outlet picker + per-outlet Lucky Draw toggle */}
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
                    {outletId ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">{t("merchantDrawToggleLabel", sourceKey.user)}</span>
                            <Switch
                                checked={selectedOutletMerchantDraw === 1}
                                onChange={handleToggleOutletMerchantDraw}
                                loading={toggleLoading || loading}
                            />
                            <span
                                className={`text-xs font-medium ${selectedOutletMerchantDraw === 1 ? "text-green-600" : "text-gray-400"}`}
                            >
                                {t(selectedOutletMerchantDraw === 1 ? "activeStatus" : "inactiveStatus", sourceKey.user)}
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400">
                            Select an outlet to view and edit its wheel configuration
                        </span>
                    )}
                </div>
            )}

            {/* Settings body — greyed when disabled */}
            <div className={`relative ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}>
                {/* Warning: segments without stock */}
                {segments.some(s => s.itemCount == null) && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700">
                        ⚠️ <strong>{segments.filter(s => s.itemCount == null).length} segment(s) have no stock set.</strong> Use the <strong>Adjust</strong> field on each segment to set a stock quantity. Segments without stock are treated as unlimited.
                    </div>
                )}

                {/* Recurring toggle — auto-saves on change */}
                <div className="mb-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Switch
                        checked={isRecurring === 1}
                        onChange={handleRecurringToggle}
                        loading={recurringLoading}
                        size="small"
                    />
                    <div>
                        <span className="text-sm font-medium text-gray-700">🔁 Auto Recurring</span>
                        <span className="text-xs text-gray-400 ml-2">When all prizes deplete, automatically reset and continue the draw</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left — Wheel Configuration */}
                    <div className="flex flex-col gap-3">
                        <p className="text-sm font-medium text-gray-700">Wheel Configuration</p>
                        <WheelConfiguration
                            segments={segments}
                            onChange={setSegments}
                            disabled={isDisabled}
                            onTopUp={handleTopUp}
                            isRecurring={isRecurring}
                            voucherEdits={voucherEdits}
                            onVoucherFieldChange={handleVoucherFieldChange}
                            voucherReloadKey={voucherReloadKey}
                        />
                    </div>

                    {/* Right — Visual Preview */}
                    <div className="flex flex-col gap-6">
                        <WheelPreview segments={segments} />
                    </div>
                </div>

                <div className="mt-6">
                    <Button
                        onClick={handleSave}
                        loading={saving || loading}
                        disabled={isDisabled || recurringQtyMissing}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-none"
                        size="large"
                    >
                        Save Settings
                    </Button>
                </div>
            </div>

            {/* Stock-required modal — shown when saving with unlimited segments */}
            <Modal
                title="Set Stock Quantity"
                open={stockModalOpen}
                centered
                onOk={handleStockModalConfirm}
                onCancel={() => setStockModalOpen(false)}
                okText="Set & Save"
                cancelText="Cancel"
                confirmLoading={saving}
                okButtonProps={{ disabled: Object.values(stockModalQtys).some(v => v == null || v < 1) }}
            >
                <p className="text-sm text-gray-500 mb-4">
                    The following segments have no stock set. Please enter a quantity for each segment before saving.
                </p>
                <div className="flex flex-col gap-3">
                    {segments.map((seg, i) => {
                        if (stockModalQtys[i] === undefined) return null;
                        return (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{seg.label || `Segment ${i + 1}`}</p>
                                </div>
                                <InputNumber
                                    min={1}
                                    step={1}
                                    placeholder="Qty"
                                    value={stockModalQtys[i]}
                                    onChange={(val) => setStockModalQtys(prev => ({ ...prev, [i]: val }))}
                                    style={{ width: 100 }}
                                    status={stockModalQtys[i] == null ? "error" : ""}
                                />
                            </div>
                        );
                    })}
                </div>
            </Modal>
        </div>
    );
};

const mapStateToProps = (state) => ({
    user: state.user.user,
});

export default connect(mapStateToProps)(MerchantDrawSettings);

