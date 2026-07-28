import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function createVoucher(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.voucherDraw}/createVoucher`, query);
}
