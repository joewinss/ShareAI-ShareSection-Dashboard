function getSelectedIndexFromAngle(angle, segmentCount) {
    if (!segmentCount) return 0;
    const segmentAngle = 360 / segmentCount;
    const normalized = ((angle % 360) + 360) % 360;
    return Math.floor(((360 - normalized) % 360) / segmentAngle) % segmentCount;
}

function getFinalSpinAngle({ currentAngle = 0, selectedIndex = 0, segmentCount = 1, extraTurns = 5 }) {
    const safeCount = Math.max(1, segmentCount);
    const safeIndex = Math.min(Math.max(0, selectedIndex), safeCount - 1);
    const segmentAngle = 360 / safeCount;
    const targetMidpoint = safeIndex * segmentAngle + segmentAngle / 2;
    const targetAngle = (360 - targetMidpoint + 360) % 360;
    const currentNormalized = ((currentAngle % 360) + 360) % 360;
    const delta = (targetAngle - currentNormalized + 360) % 360;

    return currentAngle + Math.max(1, extraTurns) * 360 + delta;
}

export {
    getFinalSpinAngle,
    getSelectedIndexFromAngle,
};
