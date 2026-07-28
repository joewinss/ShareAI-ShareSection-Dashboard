import { _axios_base_get_list, apiUrl, routePrefix } from "../..";

export default function getVoucherDrawSettings(limit = 1, skip = 0, query = {}) {
    return _axios_base_get_list(
        `${apiUrl}/${routePrefix.voucherDraw}/public/getDrawSettings`,
        limit,
        skip,
        query,
    );
}
