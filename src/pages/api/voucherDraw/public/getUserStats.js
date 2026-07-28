import { _axios_base_get_list, apiUrl, routePrefix } from "../..";

export default function getUserStats(limit = 1, skip = 0, query = {}) {
    return _axios_base_get_list(
        `${apiUrl}/${routePrefix.voucherDraw}/public/getUserStats`,
        limit,
        skip,
        query,
    );
}
