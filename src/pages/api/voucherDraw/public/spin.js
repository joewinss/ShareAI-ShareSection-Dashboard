import { _base_axios_post, apiUrl, routePrefix } from "../..";

export default function getVoucherDrawPublicSpin(body = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.voucherDraw}/public/spin`, body);
}
