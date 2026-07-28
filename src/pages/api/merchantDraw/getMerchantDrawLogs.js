import { _axios_base_get_list, apiUrl, routePrefix } from "..";

const PAGESIZE = 10;

export default function getMerchantDrawLogs(limit = PAGESIZE, skip = 0, query = {}) {
    return _axios_base_get_list(
        `${apiUrl}/${routePrefix.merchantDraw}/getLogs`,
        limit,
        skip,
        query,
    );
}
