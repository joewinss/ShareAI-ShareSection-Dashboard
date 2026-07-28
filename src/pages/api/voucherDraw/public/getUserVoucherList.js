import { _axios_base_get_list, apiUrl, routePrefix } from "../..";

export default function getUserVoucherList(limit = 10, skip = 0, query = {}) {
    return _axios_base_get_list(
        `${apiUrl}/${routePrefix.voucherDraw}/public/getUserVoucherList`,
        limit,
        skip,
        query,
    );
}
