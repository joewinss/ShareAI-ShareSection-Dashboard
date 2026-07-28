import { _base_axios_post, apiUrl, routePrefix } from "../..";

export default function createMerchantDrawEntry(body = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.merchantDraw}/public/createMerchantDrawEntry`, body);
}
