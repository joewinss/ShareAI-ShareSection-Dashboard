import { _base_axios_get, apiUrl, routePrefix } from "..";

export default function getOutletDrawFlags(query = {}) {
    return _base_axios_get(`${apiUrl}/${routePrefix.merchantDraw}/getGlobalMerchantDrawStatus`, query);
}
