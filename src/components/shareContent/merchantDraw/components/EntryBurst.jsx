import React, { useEffect, useState } from "react";

const COLORS = ["#DC2626", "#F97316", "#FBBF24", "#EF4444", "#FB923C", "#FCD34D"];

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function buildParticles() {
    const out = [];

    // 20 streamers — thin rectangles
    for (let i = 0; i < 20; i++) {
        out.push({
            id: `st${i}`, type: "streamer",
            left: rand(2, 98), top: rand(-80, -5),
            color: COLORS[i % COLORS.length],
            dx: rand(-55, 55), rot: rand(200, 700),
            duration: rand(1.7, 2.3), delay: rand(0, 0.5),
            w: rand(2, 5), h: rand(10, 20),
        });
    }

    // 20 sparkles — 4-point stars
    for (let i = 0; i < 20; i++) {
        out.push({
            id: `sp${i}`, type: "sparkle",
            left: rand(2, 98), top: rand(-80, -5),
            color: COLORS[i % COLORS.length],
            dx: rand(-65, 65), rot: rand(180, 540),
            duration: rand(1.7, 2.3), delay: rand(0, 0.5),
            size: rand(7, 15),
        });
    }

    // 20 dots — filled circles
    for (let i = 0; i < 20; i++) {
        out.push({
            id: `dt${i}`, type: "dot",
            left: rand(2, 98), top: rand(-80, -5),
            color: COLORS[i % COLORS.length],
            dx: rand(-50, 50), rot: rand(0, 360),
            duration: rand(1.7, 2.3), delay: rand(0, 0.5),
            size: rand(5, 11),
        });
    }

    return out;
}

const EntryBurst = () => {
    const [visible, setVisible] = useState(true);
    const [particles] = useState(buildParticles);

    useEffect(() => {
        const t = setTimeout(() => setVisible(false), 2450);
        return () => clearTimeout(t);
    }, []);

    if (!visible) return null;

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none", overflow: "hidden" }}>
                {particles.map((p) => {
                    const base = {
                        position: "absolute",
                        left: `${p.left}%`,
                        top: p.top,
                        "--eb-dx": `${p.dx}px`,
                        "--eb-rot": `${p.rot}deg`,
                        animation: `ldEntryBurst ${p.duration}s ease-in ${p.delay}s forwards`,
                        pointerEvents: "none",
                        willChange: "transform, opacity",
                    };

                    if (p.type === "streamer") {
                        return (
                            <div
                                key={p.id}
                                style={{ ...base, width: p.w, height: p.h, background: p.color, borderRadius: 2 }}
                            />
                        );
                    }

                    if (p.type === "sparkle") {
                        return (
                            <div key={p.id} style={base}>
                                <svg viewBox="0 0 20 20" width={p.size} height={p.size}>
                                    <path d="M10,0 L11.8,8.2 L20,10 L11.8,11.8 L10,20 L8.2,11.8 L0,10 L8.2,8.2 Z" fill={p.color} />
                                </svg>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={p.id}
                            style={{ ...base, width: p.size, height: p.size, borderRadius: "50%", background: p.color }}
                        />
                    );
                })}
            </div>
    );
};

export default EntryBurst;
