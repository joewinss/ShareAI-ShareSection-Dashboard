import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function generateVoucherImage(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.voucherDraw}/generateVoucherImage`, query);
}
