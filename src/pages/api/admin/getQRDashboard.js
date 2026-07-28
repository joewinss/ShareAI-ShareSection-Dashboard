import { _base_axios_get, apiUrl } from "..";

export default function getQRDashboard(query = {}) {
    return _base_axios_get(`${apiUrl}/admin/qr-dashboard`, query);
}
