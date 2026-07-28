import { _axios_base_get_list, apiUrl, routePrefix } from "..";

const PAGESIZE = 10;

export default function getMerchantDrawSettings(limit = PAGESIZE, skip = 0, query = {}) {
    return _axios_base_get_list(
        `${apiUrl}/${routePrefix.merchantDraw}/getMerchantDrawSettings`,
        limit,
        skip,
        query,
    );
}
