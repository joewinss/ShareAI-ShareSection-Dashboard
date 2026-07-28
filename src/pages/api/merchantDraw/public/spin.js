import { _base_axios_post, apiUrl, routePrefix } from "../..";

export default function getMerchantDrawPublicSpin(body = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.merchantDraw}/public/spin`, body);
}
