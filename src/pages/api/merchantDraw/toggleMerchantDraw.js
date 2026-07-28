import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function toggleMerchantDraw(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.merchantDraw}/toggleMerchantDraw`, query);
}
