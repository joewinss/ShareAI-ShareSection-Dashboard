import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function updateMerchantDrawSettings(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.merchantDraw}/updateSettings`, query);
}
