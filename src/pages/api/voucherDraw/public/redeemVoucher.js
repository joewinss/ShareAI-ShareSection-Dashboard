import { _base_axios_post, apiUrl, routePrefix } from "../..";

export default function redeemVoucher(body = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.voucherDraw}/public/redeemVoucher`, body);
}
