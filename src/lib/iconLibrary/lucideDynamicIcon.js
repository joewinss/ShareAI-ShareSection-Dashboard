import dynamic from "next/dynamic";
import dynamicIconImports from "lucide-react/dynamicIconImports";

export const LUCIDE_ICON_NAMES = Object.keys(dynamicIconImports);

const componentCache = {};

export function getLucideIconComponent(name) {
    if (!name || !dynamicIconImports[name]) return null;
    if (!componentCache[name]) {
        componentCache[name] = dynamic(dynamicIconImports[name]);
    }
    return componentCache[name];
}

export function LucideIcon({ name, ...props }) {
    const Icon = getLucideIconComponent(name);
    if (!Icon) return null;
    return <Icon {...props} />;
}

function toTitleCase(kebabName) {
    return kebabName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export const LUCIDE_ICON_OPTIONS = LUCIDE_ICON_NAMES
    .map((name) => ({ value: name, title: toTitleCase(name) }))
    .sort((a, b) => a.title.localeCompare(b.title));
