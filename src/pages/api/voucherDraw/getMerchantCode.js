import { _base_axios_get, apiUrl, routePrefix } from "..";

export default function getMerchantCode(query = {}) {
    return _base_axios_get(`${apiUrl}/${routePrefix.voucherDraw}/getMerchantCode`, query);
}
