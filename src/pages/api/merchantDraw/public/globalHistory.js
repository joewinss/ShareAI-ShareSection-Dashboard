import { _axios_base_get_list, apiUrl, routePrefix } from "../..";

export default function getGlobalHistory(limit = 100, skip = 0, query = {}) {
    return _axios_base_get_list(
        `${apiUrl}/${routePrefix.merchantDraw}/public/globalHistory`,
        limit,
        skip,
        query,
    );
}
