import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function saveMerchantCode(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.voucherDraw}/saveMerchantCode`, query);
}
