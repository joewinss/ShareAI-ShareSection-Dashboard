import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FancyWheel from "@/components/shareContent/merchantDraw/components/FancyWheel";

const WHEEL_MAX_SIZE = 360;
const WHEEL_MIN_SIZE = 260;

/**
 * Pick a random segment index weighted by itemCount (stock) values.
 */
function weightedRandom(segs) {
    const total = segs.reduce((sum, s) => sum + (Number(s.itemCount) || 0), 0);
    if (total <= 0) return 0;
    let r = Math.random() * total;
    for (let i = 0; i < segs.length; i++) {
        r -= Number(segs[i].itemCount) || 0;
        if (r <= 0) return i;
    }
    return segs.length - 1;
}


/**
 * WheelPreview
 * Responsive FancyWheel preview with optional test-spin.
 * Works with 1+ valid segments.
 *
 * Props:
 *   segments: Array<{ label: string, color: string, itemCount?: number }>
 */
const WheelPreview = ({ segments = [] }) => {
    const containerRef = useRef(null);
    const [wheelSize, setWheelSize] = useState(WHEEL_MAX_SIZE);
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeIndex, setPrizeIndex] = useState(0);
    const [winner, setWinner] = useState(null);

    // Size the shared FancyWheel to fit the settings preview column.
    useEffect(() => {
        if (!containerRef.current) return;
        if (typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(([entry]) => {
            const availableWidth = entry.contentRect.width - 32;
            const nextSize = Math.min(WHEEL_MAX_SIZE, Math.max(WHEEL_MIN_SIZE, availableWidth));
            setWheelSize(nextSize);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Reset spin result whenever segment config changes
    useEffect(() => {
        setMustSpin(false);
        setWinner(null);
    }, [segments]);

    const validSegments = useMemo(
        () => segments.filter((s) => s.label),
        [segments],
    );
    // Only non-depleted segments can be picked by the test spin
    const spinnableSegments = useMemo(
        () => validSegments.filter((s) => s.itemCount == null || s.itemCount > 0),
        [validSegments],
    );
    const hasSegments = validSegments.length >= 1;
    const hasSpinnable = spinnableSegments.length >= 1;

    const handleSpin = useCallback(() => {
        if (mustSpin || !hasSegments || !hasSpinnable) return;
        setWinner(null);
        const pickedIdx = weightedRandom(spinnableSegments);
        const winnerLabel = spinnableSegments[pickedIdx]?.label;
        // Map winner back to its index in validSegments (what FancyWheel renders)
        const displayIdx = validSegments.findIndex((s) => s.label === winnerLabel);
        const finalIdx = displayIdx >= 0 ? displayIdx : 0;
        setPrizeIndex(validSegments.length === 1 ? 0 : finalIdx);
        setMustSpin(true);
    }, [hasSegments, hasSpinnable, mustSpin, validSegments, spinnableSegments]);

    const handleStopSpin = useCallback(() => {
        setMustSpin(false);
        setWinner(spinnableSegments.find((s) => s.label === validSegments[prizeIndex]?.label) || spinnableSegments[0]);
    }, [prizeIndex, validSegments, spinnableSegments]);

    return (
        <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-gray-600">Visual Preview</p>

            {/* Responsive wheel container */}
            <div
                ref={containerRef}
                className="w-full flex justify-center items-center py-8 px-4"
                style={{
                    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2f1 100%)",
                    borderRadius: "16px",
                    minHeight: hasSegments ? wheelSize + 120 : wheelSize + 40,
                }}
            >
                {hasSegments ? (
                    <div className="w-full flex justify-center">
                        <FancyWheel
                            segments={validSegments}
                            mustStartSpinning={mustSpin}
                            prizeNumber={prizeIndex}
                            onStopSpinning={handleStopSpin}
                            onSpinClick={handleSpin}
                            spinning={mustSpin}
                            disabled={!hasSpinnable}
                            size={wheelSize}
                        />
                    </div>
                ) : (
                    <div
                        className="rounded-full border-4 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-sm text-center p-4"
                        style={{ width: wheelSize, height: wheelSize }}
                    >
                        Add at least 1 segment to preview
                    </div>
                )}
            </div>

            {hasSegments && (
                <div className="flex flex-col items-center gap-2 w-full">
                    {/* Winner result */}
                    {winner && (
                        <div className="px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                            🎉 Result: {winner.label}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WheelPreview;
