import { _base_axios_post, apiUrl, routePrefix } from "../..";

export default function claimMerchantVoucher(body = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.merchantDraw}/public/claimMerchantVoucher`, body);
}
