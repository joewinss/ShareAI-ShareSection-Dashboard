import React, { useState } from "react";
import { Spin, Input, InputNumber, Button, message as antMessage } from "antd";
import { useRouter } from "next/router";
import WheelSpinPage from "./WheelSpinPage";
import WinnerModal from "../components/WinnerModal";
import { MERCHANT_DRAW_STATUS } from "@/constants/user";
import { DRAW_PRIZE_TYPE } from "@/constants/drawConstants";
import { useMerchantDrawInit } from "../useMerchantDrawInit";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import claimMerchantVoucher from "@/pages/api/merchantDraw/public/claimMerchantVoucher";

const MerchantDrawEntryPage = ({ token, userId, phone, platform }) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [prizeResult, setPrizeResult] = useState(null);
    const [particles, setParticles] = useState([]);
    const [voucherClaimState, setVoucherClaimState] = useState(null); // null | "input" | "loading" | "success" | "zero"
    const [merchantCode, setMerchantCode] = useState("");
    const [spentAmount, setSpentAmount] = useState(null);
    const [claimResult, setClaimResult] = useState(null);

    const {
        step,
        setStep,
        settings,
        entryStatus,
        setEntryStatus,
        hasJoinedGlobal,
        isGlobalEnabled,
        phone: resolvedPhone,
        userId: resolvedUserId,
        entryToken,
        platform: resolvedPlatform,
    } = useMerchantDrawInit({ token, userId, phone, platform, resolvedStep: "spin" });

    const handlePrize = (reward, color, prizeType) => {
        setPrizeResult({ reward, color, prizeType });
        setEntryStatus(prev => ({ ...prev, merchantDrawStatus: MERCHANT_DRAW_STATUS.COMPLETED, reward }));
        setParticles(Array.from({ length: 55 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            size: Math.random() * 13 + 5,
            delay: Math.random() * 2.4,
            color: ["#FCD34D", "#EF4444", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6"][i % 6],
            circle: Math.random() > 0.5,
        })));
        if (prizeType === DRAW_PRIZE_TYPE.VOUCHER) {
            setVoucherClaimState("input");
        }
    };

    const handleVoucherClaim = async () => {
        if (!merchantCode || !merchantCode.trim()) {
            antMessage.error("Please enter the merchant code");
            return;
        }
        if (!spentAmount || spentAmount <= 0) {
            antMessage.error("Please enter a valid spent amount");
            return;
        }
        setVoucherClaimState("loading");
        try {
            const res = await claimMerchantVoucher({
                token: entryToken,
                phone: resolvedPhone,
                amountSpent: spentAmount,
                merchantCode: merchantCode.trim(),
            });
            const data = res?.data?.data;
            if (!res?.data?.status) {
                antMessage.error(res?.data?.message || "Claim failed");
                setVoucherClaimState("input");
                return;
            }
            setClaimResult(data);
            setVoucherClaimState(data.totalCount > 0 ? "success" : "zero");
        } catch (err) {
            antMessage.error(err.message || "Network error");
            setVoucherClaimState("input");
        }
    };

    const handleGoToGlobal = () => {
        if (!entryToken) return;
        router.push({
            pathname: "/shareSection/luckyDraw/uploadShareProof",
            query: {
                token: entryToken,
                phone: resolvedPhone || "",
                outletUserId: resolvedUserId || "",
                platform: resolvedPlatform || "",
                businessName: settings?.businessName || "",
            },
        });
    };

    const handleViewDashboard = () => {
        router.push("/shareSection/luckyDraw/dashboard?phone=" + (resolvedPhone || ""));
    };

    if (step === "loading") {
        return (
            <div className="luckydraw-screen-center">
                <Spin size="large" />
            </div>
        );
    }

    if (step === "invalid") {
        return (
            <div className="luckydraw-state-screen">
                <div className="text-5xl mb-4">🔗</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{t("invalidEntryLink", sourceKey.user)}</h2>
                <p className="text-sm text-gray-500 max-w-xs">
                    {t("invalidEntryLinkDesc", sourceKey.user)}
                </p>
            </div>
        );
    }

    if (step === "unavailable") {
        return (
            <div className="luckydraw-state-screen">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{t("luckyDrawNotAvailable", sourceKey.user)}</h2>
                <p className="text-sm text-gray-500 max-w-xs">
                    {t("luckyDrawNotAvailableDesc", sourceKey.user)}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 relative">
            <WheelSpinPage
                outletUserId={resolvedUserId}
                token={entryToken}
                segments={settings?.segments || []}
                businessName={settings?.businessName || ""}
                onPrize={handlePrize}
                showAlreadyClaimed={!prizeResult}
                initialAlreadySpun={entryStatus.merchantDrawStatus === MERCHANT_DRAW_STATUS.COMPLETED}
            />
            {prizeResult && prizeResult.prizeType !== DRAW_PRIZE_TYPE.VOUCHER && (
                <WinnerModal
                    wonPrize={prizeResult}
                    particles={particles}
                    isGlobalAvailable={isGlobalEnabled}
                    hasJoinedGlobal={hasJoinedGlobal}
                    onGlobalDraw={handleGoToGlobal}
                    onViewDashboard={handleViewDashboard}
                    onDashboard={handleViewDashboard}
                    onClose={() => {
                        setPrizeResult(null);
                        setStep("spin");
                    }}
                />
            )}

            {prizeResult && prizeResult.prizeType === DRAW_PRIZE_TYPE.VOUCHER && voucherClaimState && (
                <div
                    style={{
                        position: "fixed", inset: 0, zIndex: 1000,
                        background: "rgba(0,0,0,0.55)", display: "flex",
                        alignItems: "center", justifyContent: "center", padding: 16,
                    }}
                >
                    <div
                        style={{
                            background: "#fff", borderRadius: 22, padding: "32px 24px",
                            maxWidth: 420, width: "100%", textAlign: "center",
                            boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
                        }}
                    >
                        {voucherClaimState === "input" && (
                            <>
                                <div style={{ fontSize: 30, marginBottom: 12 }}>Congratulations!</div>
                                <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>
                                    You won a Voucher!
                                </h2>
                                <p style={{ fontSize: 13, color: "#64748B", marginBottom: 24 }}>
                                    {prizeResult.reward} — Enter the merchant code and your total spent amount to calculate your rebate vouchers.
                                </p>
                                <Input.Password
                                    size="large"
                                    placeholder="Merchant code"
                                    autoComplete="off"
                                    value={merchantCode}
                                    onChange={(e) => setMerchantCode(e.target.value)}
                                    style={{ width: "100%", marginBottom: 16 }}
                                    visibilityToggle={false}
                                />
                                <InputNumber
                                    size="large"
                                    min={0.01}
                                    precision={2}
                                    prefix="RM"
                                    placeholder="e.g. 58.88"
                                    value={spentAmount}
                                    onChange={setSpentAmount}
                                    style={{ width: "100%", marginBottom: 16 }}
                                />
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    onClick={handleVoucherClaim}
                                    style={{ background: "#10B981", borderColor: "#10B981", fontWeight: 700 }}
                                >
                                    Claim My Vouchers
                                </Button>
                            </>
                        )}

                        {voucherClaimState === "loading" && (
                            <>
                                <div style={{ fontSize: 44, marginBottom: 16 }}>⏳</div>
                                <p style={{ color: "#64748B" }}>Calculating your vouchers…</p>
                            </>
                        )}

                        {voucherClaimState === "success" && claimResult && (
                            <>
                                <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>
                                    {claimResult.totalCount} Voucher{claimResult.totalCount !== 1 ? "s" : ""} Issued!
                                </h2>
                                {claimResult.fullVouchers > 0 && (
                                    <p style={{ fontSize: 14, color: "#374151", marginBottom: 4 }}>
                                        {claimResult.fullVouchers} × RM {claimResult.maxVoucherValue}
                                    </p>
                                )}
                                {claimResult.remainingValue > 0 && (
                                    <p style={{ fontSize: 14, color: "#374151", marginBottom: 4 }}>
                                        1 × RM {claimResult.remainingValue}
                                    </p>
                                )}
                                {claimResult.expiredAt && (
                                    <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 8 }}>
                                        Expires: {new Date(claimResult.expiredAt).toLocaleDateString()}
                                    </p>
                                )}
                                <Button
                                    type="primary" size="large" block
                                    onClick={handleViewDashboard}
                                    style={{ marginTop: 20, fontWeight: 700 }}
                                >
                                    View My Vouchers
                                </Button>
                            </>
                        )}

                        {voucherClaimState === "zero" && (
                            <>
                                <div style={{ fontSize: 44, marginBottom: 12 }}>😔</div>
                                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                                    Amount too small
                                </h2>
                                <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
                                    Your spent amount did not earn any rebate vouchers.
                                </p>
                                <Button size="large" block onClick={handleViewDashboard}>
                                    Go to Dashboard
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MerchantDrawEntryPage;
