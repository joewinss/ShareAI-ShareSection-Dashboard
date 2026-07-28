import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function editVoucher(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.voucherDraw}/editVoucher`, query);
}
