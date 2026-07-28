import React, { useState, useEffect } from "react";
import { Button, ColorPicker, Input, InputNumber, Select, Tooltip, Modal, Spin } from "antd";
import { DeleteOutlined, PlusOutlined, EditOutlined, MinusOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { DRAW_PRIZE_TYPE } from "@/constants/drawConstants";
import getVoucherList from "@/pages/api/voucherDraw/getVoucherList";
import IconPickerInput from "@/components/general/input/IconPickerInput";

const ADD_NEW_VOUCHER_VALUE = "__ADD_NEW_VOUCHER__";

const PRIZE_TYPE_OPTIONS = [
    { value: DRAW_PRIZE_TYPE.PRODUCT, label: "Product" },
    { value: DRAW_PRIZE_TYPE.VOUCHER, label: "Voucher" },
];

const WheelConfiguration = ({ segments = [], onChange, disabled = false, onTopUp, isRecurring = 0, outletUserId, voucherEdits = {}, onVoucherFieldChange, voucherReloadKey = 0 }) => {
    const router = useRouter();
    const [editingStock, setEditingStock] = useState({});
    const [stockDraft, setStockDraft] = useState({});
    const [topUpLoading, setTopUpLoading] = useState({});
    const [editingRecurring, setEditingRecurring] = useState({});
    const [recurringDraft, setRecurringDraft] = useState({});
    const [prizeTypeModalOpen, setPrizeTypeModalOpen] = useState(false);
    const [vouchers, setVouchers] = useState([]);
    const [vouchersLoading, setVouchersLoading] = useState(false);

    const LOW_STOCK_THRESHOLD = 3;

    useEffect(() => {
        const load = async () => {
            setVouchersLoading(true);
            try {
                const res = await getVoucherList("all", 0, {
                    type: 2,
                    status: "active",
                    ...(outletUserId ? { outletUserId } : {}),
                });
                setVouchers(res?.data || []);
            } catch (_) {
                setVouchers([]);
            } finally {
                setVouchersLoading(false);
            }
        };
        load();
    }, [outletUserId, voucherReloadKey]);

    const handleAdd = () => {
        setPrizeTypeModalOpen(true);
    };

    const confirmAddWithType = (prizeType) => {
        setPrizeTypeModalOpen(false);
        onChange([
            ...segments,
            {
                label: "",
                color: "#3b82f6",
                icon: undefined,
                recurringInitialItemCount: null,
                itemCount: 0,
                prizeType,
                voucherId: null,
                _isNew: true,
            },
        ]);
    };

    const handleRemove = (index) => {
        onChange(segments.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const updated = segments.map((seg, i) =>
            i === index ? { ...seg, [field]: value } : seg
        );
        onChange(updated);
    };

    const handleVoucherSelect = (index, voucherId) => {
        if (voucherId === ADD_NEW_VOUCHER_VALUE) {
            const query = outletUserId ? `?tab=vouchers&openCreate=1&type=2&userId=${outletUserId}` : "?tab=vouchers&openCreate=1&type=2";
            router.push(`/lucky-draw/merchant${query}`);
            return;
        }
        const voucher = vouchers.find((v) => String(v._id) === String(voucherId));
        const updated = segments.map((seg, i) =>
            i === index
                ? { ...seg, voucherId, label: voucher?.voucherTitle || seg.label }
                : seg
        );
        onChange(updated);
    };

    const handlePrizeTypeChange = (index, prizeType) => {
        const updated = segments.map((seg, i) =>
            i === index
                ? { ...seg, prizeType, voucherId: null, label: prizeType === DRAW_PRIZE_TYPE.PRODUCT ? seg.label : "" }
                : seg
        );
        onChange(updated);
    };

    const startEditStock = (index) => {
        setEditingStock(prev => ({ ...prev, [index]: true }));
        setStockDraft(prev => ({ ...prev, [index]: segments[index]?.itemCount ?? 0 }));
    };

    const cancelEditStock = (index) => {
        setEditingStock(prev => ({ ...prev, [index]: false }));
        setStockDraft(prev => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
    };

    const changeStockDraft = (index, delta) => {
        setStockDraft(prev => ({ ...prev, [index]: Math.max(0, (prev[index] ?? 0) + delta) }));
    };

    const setStockDraftValue = (index, val) => {
        setStockDraft(prev => ({ ...prev, [index]: val == null ? 0 : Math.max(0, val) }));
    };

    const confirmEditStock = async (index) => {
        if (!onTopUp) return;
        const original = segments[index]?.itemCount ?? 0;
        const next = stockDraft[index] ?? original;
        const delta = next - original;
        if (delta === 0) {
            cancelEditStock(index);
            return;
        }
        setTopUpLoading(prev => ({ ...prev, [index]: true }));
        try {
            await onTopUp(index, delta);
            cancelEditStock(index);
        } finally {
            setTopUpLoading(prev => ({ ...prev, [index]: false }));
        }
    };

    const startEditRecurring = (index) => {
        setEditingRecurring(prev => ({ ...prev, [index]: true }));
        setRecurringDraft(prev => ({ ...prev, [index]: segments[index]?.recurringInitialItemCount ?? 1 }));
    };

    const cancelEditRecurring = (index) => {
        setEditingRecurring(prev => ({ ...prev, [index]: false }));
        setRecurringDraft(prev => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
    };

    const changeRecurringDraft = (index, delta) => {
        setRecurringDraft(prev => ({ ...prev, [index]: Math.max(1, (prev[index] ?? 1) + delta) }));
    };

    const setRecurringDraftValue = (index, val) => {
        setRecurringDraft(prev => ({ ...prev, [index]: val == null ? 1 : Math.max(1, val) }));
    };

    const confirmEditRecurring = (index) => {
        handleChange(index, "recurringInitialItemCount", recurringDraft[index] ?? 1);
        cancelEditRecurring(index);
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Prize type selection modal */}
            <Modal
                title="Select Prize Type"
                open={prizeTypeModalOpen}
                onCancel={() => setPrizeTypeModalOpen(false)}
                footer={null}
                centered
                width={360}
            >
                <div className="flex gap-3 justify-center py-4">
                    <Button
                        size="large"
                        style={{ minWidth: 130, height: 80, fontSize: 15, fontWeight: 700 }}
                        onClick={() => confirmAddWithType(DRAW_PRIZE_TYPE.PRODUCT)}
                    >
                        🎁 Product
                    </Button>
                    <Button
                        size="large"
                        style={{ minWidth: 130, height: 80, fontSize: 15, fontWeight: 700 }}
                        onClick={() => confirmAddWithType(DRAW_PRIZE_TYPE.VOUCHER)}
                    >
                        🎟️ Voucher
                    </Button>
                </div>
            </Modal>

            {segments.map((segment, index) => {
                const isVoucher = segment.prizeType === DRAW_PRIZE_TYPE.VOUCHER;
                const selectedVoucher = isVoucher
                    ? vouchers.find((v) => String(v._id) === String(segment.voucherId))
                    : null;

                return (
                    <div
                        key={index}
                        className={`border rounded-lg bg-white overflow-hidden ${segment.itemCount === 0 ? "border-red-300" : "border-gray-200"}`}
                    >
                        {/* Main row */}
                        <div className="flex items-center gap-2 p-3 flex-wrap">
                            <span className="text-xs text-gray-400 w-4 shrink-0">{index + 1}</span>

                            {/* Prize type tag/dropdown */}
                            <Select
                                value={segment.prizeType ?? DRAW_PRIZE_TYPE.PRODUCT}
                                onChange={(val) => handlePrizeTypeChange(index, val)}
                                options={PRIZE_TYPE_OPTIONS}
                                disabled={disabled}
                                size="small"
                                style={{ width: 110 }}
                            />

                            {/* Label — text input for product, voucher Select for voucher */}
                            {isVoucher ? (
                                <Select
                                    placeholder="Select voucher"
                                    value={segment.voucherId || undefined}
                                    onChange={(val) => handleVoucherSelect(index, val)}
                                    loading={vouchersLoading}
                                    disabled={disabled}
                                    size="small"
                                    style={{ flex: 1, minWidth: 160 }}
                                    options={[
                                        { value: ADD_NEW_VOUCHER_VALUE, label: "+ Add New Voucher" },
                                        ...vouchers.map((v) => ({
                                            value: String(v._id),
                                            label: v.voucherTitle,
                                        })),
                                    ]}
                                    notFoundContent={
                                        vouchersLoading ? <Spin size="small" /> : "No active vouchers"
                                    }
                                />
                            ) : (
                                <Input
                                    placeholder="Reward Name"
                                    value={segment.label}
                                    onChange={(e) => handleChange(index, "label", e.target.value)}
                                    disabled={disabled}
                                    size="small"
                                    className={`flex-1 ${segment.itemCount === 0 ? "text-gray-400" : ""}`}
                                />
                            )}

                            {/* Icon */}
                            <IconPickerInput
                                value={segment.icon}
                                onChange={(val) => handleChange(index, "icon", val)}
                                disabled={disabled}
                                size="small"
                                style={{ width: 140 }}
                                placeholder="Icon"
                            />

                            {/* Color */}
                            <Tooltip title="Segment color">
                                <ColorPicker
                                    value={segment.color}
                                    onChange={(color) =>
                                        handleChange(index, "color", color.toHexString())
                                    }
                                    disabled={disabled}
                                    size="small"
                                    showText={false}
                                />
                            </Tooltip>

                            {/* Delete */}
                            <Button
                                type="text"
                                danger
                                size="large"
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemove(index)}
                                disabled={disabled}
                            />
                        </div>

                        {/* Voucher info row — only for voucher prize type */}
                        {isVoucher && (
                            <div className="flex flex-wrap items-center gap-3 px-3 py-1.5 bg-purple-50 border-t border-dashed border-purple-100 text-xs text-gray-500">
                                <span className="whitespace-nowrap">Rebate</span>
                                <InputNumber
                                    min={0.01}
                                    max={100}
                                    step={1}
                                    value={voucherEdits[segment.voucherId]?.rebatePercentage ?? selectedVoucher?.rebatePercentage}
                                    onChange={(val) => onVoucherFieldChange?.(segment.voucherId, "rebatePercentage", val)}
                                    disabled={disabled || !segment.voucherId}
                                    size="small"
                                    style={{ width: 80 }}
                                    addonAfter="%"
                                />
                                <span className="whitespace-nowrap">Max Value</span>
                                <InputNumber
                                    min={0.01}
                                    step={0.01}
                                    value={voucherEdits[segment.voucherId]?.maxVoucherValue ?? selectedVoucher?.maxVoucherValue}
                                    onChange={(val) => onVoucherFieldChange?.(segment.voucherId, "maxVoucherValue", val)}
                                    disabled={disabled || !segment.voucherId}
                                    size="small"
                                    style={{ width: 110 }}
                                    addonBefore="RM"
                                />
                            </div>
                        )}

                        {/* Sub-rows: stock controls */}
                        <div className={`flex flex-col gap-2 px-3 pb-3 pt-2 border-t border-dashed ${segment.itemCount === 0 ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50"}`}>
                            <div className="flex flex-wrap items-center gap-3">
                                {segment._isNew ? (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-gray-500 whitespace-nowrap">Stock</span>
                                        <InputNumber
                                            min={0}
                                            step={1}
                                            value={segment.itemCount ?? 0}
                                            onChange={(val) => handleChange(index, "itemCount", val == null ? 0 : Math.max(0, val))}
                                            disabled={disabled}
                                            size="small"
                                            style={{ width: 90 }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-gray-500 whitespace-nowrap">Stock</span>
                                        {editingStock[index] ? (
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="small"
                                                    icon={<MinusOutlined />}
                                                    onClick={() => changeStockDraft(index, -1)}
                                                    disabled={(stockDraft[index] ?? 0) <= 0}
                                                />
                                                <InputNumber
                                                    min={0}
                                                    step={1}
                                                    value={stockDraft[index] ?? 0}
                                                    onChange={(val) => setStockDraftValue(index, val)}
                                                    size="small"
                                                    style={{ width: 64 }}
                                                />
                                                <Button
                                                    size="small"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => changeStockDraft(index, 1)}
                                                />
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={<CheckOutlined />}
                                                    loading={topUpLoading[index]}
                                                    onClick={() => confirmEditStock(index)}
                                                    style={{ color: "#16a34a" }}
                                                />
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={<CloseOutlined />}
                                                    onClick={() => cancelEditStock(index)}
                                                    disabled={topUpLoading[index]}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                {segment.itemCount == null ? (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">∞ Unlimited</span>
                                                ) : segment.itemCount === 0 ? (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">0 — depleted</span>
                                                ) : segment.itemCount <= LOW_STOCK_THRESHOLD ? (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">⚠️ {segment.itemCount} left</span>
                                                ) : (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{segment.itemCount} left</span>
                                                )}
                                                {onTopUp && (
                                                    <Button
                                                        size="small"
                                                        type="text"
                                                        icon={<EditOutlined />}
                                                        onClick={() => startEditStock(index)}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Reset qty per cycle — only shown when Auto Recurring is ON */}
                            {isRecurring === 1 && (
                                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-dashed border-blue-100">
                                    <span className="text-xs text-blue-500 whitespace-nowrap">↩ Reset qty per cycle</span>
                                    {editingRecurring[index] ? (
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="small"
                                                icon={<MinusOutlined />}
                                                onClick={() => changeRecurringDraft(index, -1)}
                                                disabled={(recurringDraft[index] ?? 1) <= 1}
                                            />
                                            <InputNumber
                                                min={1}
                                                step={1}
                                                value={recurringDraft[index] ?? 1}
                                                onChange={(val) => setRecurringDraftValue(index, val)}
                                                size="small"
                                                style={{ width: 64 }}
                                            />
                                            <Button
                                                size="small"
                                                icon={<PlusOutlined />}
                                                onClick={() => changeRecurringDraft(index, 1)}
                                            />
                                            <Button
                                                size="small"
                                                type="text"
                                                icon={<CheckOutlined />}
                                                onClick={() => confirmEditRecurring(index)}
                                                style={{ color: "#16a34a" }}
                                            />
                                            <Button
                                                size="small"
                                                type="text"
                                                icon={<CloseOutlined />}
                                                onClick={() => cancelEditRecurring(index)}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            {segment.recurringInitialItemCount == null ? (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Required</span>
                                            ) : (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{segment.recurringInitialItemCount} set</span>
                                            )}
                                            <Button
                                                size="small"
                                                type="text"
                                                icon={<EditOutlined />}
                                                onClick={() => startEditRecurring(index)}
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Recurring callout */}
            {segments.length > 0 && isRecurring === 1 && (() => {
                const withQty = segments.filter(s => s.recurringInitialItemCount != null);
                const allHaveQty = withQty.length === segments.length;
                const someHaveQty = withQty.length > 0 && !allHaveQty;

                return (
                    <>
                        {allHaveQty && (
                            <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                🔁 <strong>Recurring enabled</strong> — when all segment prizes reach 0, the draw resets automatically and starts a new round.
                            </div>
                        )}
                        {someHaveQty && (
                            <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                                ⚠️ Some segments are <strong>unlimited</strong> — recurring auto-reset won't trigger until all segments have a prize quantity set.
                            </div>
                        )}
                    </>
                );
            })()}

            <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                disabled={disabled}
                className="w-full"
                size="large"
            >
                Add Segment
            </Button>
        </div>
    );
};

export default WheelConfiguration;
