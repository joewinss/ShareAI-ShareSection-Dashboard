import { apiUrl, routePrefix, _axios_base_get_list } from "..";

const PAGESIZE = 10;

export default function getOutletStats(
    limit = PAGESIZE,
    skip = 0,
    query = {}
) {
    return _axios_base_get_list(
        `${apiUrl}/${routePrefix.dashboard}/getOutletStats`,
        limit,
        skip,
        query,
    );
}
