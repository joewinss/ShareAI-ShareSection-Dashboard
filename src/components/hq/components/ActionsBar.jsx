import React from "react";
import { Button } from "antd";

const ActionsBar = ({
    actions = [],
    variant = "inline",
    align = "start",
    size,
    className = "",
    containerClassName = "",
}) => {
    if (!actions.length) return null;

    const isSticky = variant === "sticky";
    const alignClass = align === "center" ? "justify-center" : "justify-start";
    const wrapperClass = isSticky ? "fixed bottom-6 z-40" : "";
    const wrapperStyle = isSticky
        ? { left: "var(--sidebar-width, 0px)", right: 0 }
        : undefined;
    const containerClass = isSticky ? "mx-auto max-w-7xl px-6" : "";
    const barClass = isSticky
        ? "inline-flex flex-wrap items-center gap-3 rounded-xl border border-gray-300 bg-stone-100 px-3 py-2 shadow-lg"
        : "";

    const actionsContent = actions.map((action) => (
        <Button
            key={action.key || action.label}
            className={action.className}
            onClick={action.onClick}
            loading={action.loading}
            disabled={action.disabled}
            icon={action.icon}
            type={action.type}
            size={action.size || size}
        >
            {action.label}
        </Button>
    ));

    if (!isSticky) {
        return (
            <div className={className}>
                <div className={containerClassName}>
                    <div className={`flex flex-wrap items-center gap-3 ${alignClass}`}>
                        {actionsContent}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${wrapperClass} ${className}`.trim()} style={wrapperStyle}>
            <div className={`${containerClass} ${containerClassName}`.trim()}>
                <div className={`flex ${alignClass}`}>
                    <div className={barClass}>{actionsContent}</div>
                </div>
            </div>
        </div>
    );
};

export default ActionsBar;
