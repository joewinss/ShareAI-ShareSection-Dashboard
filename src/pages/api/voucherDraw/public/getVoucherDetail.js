import { _axios_base_get_list, apiUrl, routePrefix } from "../..";

export default function getVoucherDetail(limit = 1, skip = 0, query = {}) {
    return _axios_base_get_list(
        `${apiUrl}/${routePrefix.voucherDraw}/public/getVoucherDetail`,
        limit,
        skip,
        query,
    );
}
