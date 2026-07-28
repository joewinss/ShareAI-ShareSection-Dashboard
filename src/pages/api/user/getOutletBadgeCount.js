import { _axios_base_get_list, apiUrl, routePrefix } from "..";

const PAGESIZE = 0;

export default function getOutletBadgeCount(
    limit = PAGESIZE,
    skip = 0,
    query = {}
) {
    return _axios_base_get_list(
        `${apiUrl}/${routePrefix.user}/getOutletBadgeCount`,
        limit,
        skip,
        query,
    );
}
