import { apiUrl, routePrefix, _base_axios_post, _base_axios_get } from "..";

// Get QR code dashboard
export const getQRDashboard = async () => {
    return _base_axios_get(`${apiUrl}/admin/qr-dashboard`);
};

// Get shareable links
export const getShareableLinks = async () => {
    return _base_axios_get(`${apiUrl}/admin/shareable-links`);
};

// Regenerate QR code
export const regenerateQRCode = async () => {
    return _base_axios_post(`${apiUrl}/admin/qr-regenerate`);
};

// Get system stats
export const getSystemStats = async () => {
    return _base_axios_get(`${apiUrl}/admin/system-stats`);
};

export default {
    getQRDashboard,
    getShareableLinks,
    regenerateQRCode,
    getSystemStats,
};
