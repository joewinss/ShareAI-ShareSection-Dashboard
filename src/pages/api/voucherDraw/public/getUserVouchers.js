import { _axios_base_get_list, apiUrl, routePrefix } from "../..";

export default function getUserVouchers(limit = 10, skip = 0, query = {}) {
    return _axios_base_get_list(
        `${apiUrl}/${routePrefix.voucherDraw}/public/getUserVouchers`,
        limit,
        skip,
        query,
    );
}
