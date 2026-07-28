import { _base_axios_get, apiUrl } from "..";

export default function getSystemStats(query = {}) {
    return _base_axios_get(`${apiUrl}/admin/system-stats`, query);
}
