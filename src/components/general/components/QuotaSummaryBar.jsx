import React from "react";
import useIsCollapsed from "@/components/useIsCollapsed";

const QuotaSummaryBar = ({
  remainingActive,
  remainingTotal,
  enActive,
  enTotal,
  cnActive,
  cnTotal,
  myActive,
  myTotal,
  showRemaining = true,
  showEn = true,
  showCn = true,
  showMy = true,
}) => {
  const hasRemaining =
    showRemaining && (remainingActive !== undefined || remainingTotal !== undefined);
  const hasEn = showEn && (enActive !== undefined || enTotal !== undefined);
  const hasCn = showCn && (cnActive !== undefined || cnTotal !== undefined);
  const hasMy = showMy && (myActive !== undefined || myTotal !== undefined);
  const isCollapsed = useIsCollapsed();

  const formatCount = (active, total) => {
    if (total === undefined || total === null) {
      return active ?? 0;
    }
    return `${active ?? 0}/${total}`;
  };

  // If nothing is provided, render nothing
  if (!hasRemaining && !hasEn && !hasCn && !hasMy) {
    return null;
  }

  const containerClassName = [
    "rounded-xl border border-[#e1e8ff] bg-[#f5f8ff] px-4 py-3 shadow-sm",
    isCollapsed
      ? "flex items-center justify-between gap-2 overflow-x-auto whitespace-nowrap"
      : "flex flex-col gap-2 md:flex-row md:items-center md:justify-between",
  ].join(" ");

  return (
    <div className="sticky bottom-0 z-10 mt-4">
      <div className={containerClassName}>
        {hasRemaining && (
          <div className="text-sm font-semibold text-gray-900">
            Remaining{" "}
            <span className="font-bold">{formatCount(remainingActive, remainingTotal)}</span>
          </div>
        )}

        {(hasEn || hasCn || hasMy) && (
          <div className="flex items-center gap-3 text-xs text-gray-700 md:text-sm">
            {hasEn && <span className="font-semibold">EN {formatCount(enActive, enTotal)}</span>}
            {hasEn && hasCn && <span className="text-gray-300">|</span>}
            {hasCn && <span className="font-semibold">CN {formatCount(cnActive, cnTotal)}</span>}
            {(hasEn || hasCn) && hasMy && <span className="text-gray-300">|</span>}
            {hasMy && <span className="font-semibold">MY {formatCount(myActive, myTotal)}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotaSummaryBar;
