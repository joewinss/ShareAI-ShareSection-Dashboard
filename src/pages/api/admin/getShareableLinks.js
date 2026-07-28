import { _base_axios_get, apiUrl } from "..";

export default function getShareableLinks(query = {}) {
    return _base_axios_get(`${apiUrl}/admin/shareable-links`, query);
}
