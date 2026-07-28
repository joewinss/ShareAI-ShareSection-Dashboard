import { _base_axios_post, apiUrl } from "..";

export default function regenerateQRCode(query = {}) {
    return _base_axios_post(`${apiUrl}/admin/qr-regenerate`, query);
}
