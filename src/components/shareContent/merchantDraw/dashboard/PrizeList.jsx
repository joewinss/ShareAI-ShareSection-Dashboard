import React from "react";
import PrizeCard from "./PrizeCard";

/**
 * PrizeList
 * Props: { prizes, activeTab }
 * activeTab: "merchant" | "global"
 */
const PrizeList = ({ prizes = [], activeTab }) => {
    const filtered = prizes.filter((p) => (p.drawType || "merchant") === activeTab);

    // if (filtered.length === 0) {
    //     return (
    //         <div className="flex flex-col items-center py-12 text-center">
    //             <div className="text-4xl mb-3">🎟️</div>
    //             <p className="text-gray-500 text-sm">No prizes yet in this category.</p>
    //         </div>
    //     );
    // }

    return (
        <div className="flex flex-col gap-3">
            {filtered.map((prize) => (
                <PrizeCard
                    key={prize._id}
                    reward={prize.reward}
                    drawType={prize.drawType || "merchant"}
                    outletName={prize.outletBusinessName || prize.merchantBusinessName}
                    createdAt={prize.createdAt}
                />
            ))}
        </div>
    );
};

export default PrizeList;
