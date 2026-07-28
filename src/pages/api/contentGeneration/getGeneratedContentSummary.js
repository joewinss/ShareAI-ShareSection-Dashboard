import { apiUrl, routePrefix, _axios_base_get_list } from "..";

const PAGESIZE = 10;

export default function getGeneratedContentSummary(
    limit = PAGESIZE,
    skip = 0,
    query = {}
) {
    return _axios_base_get_list(
        `${apiUrl}/${routePrefix.contentGeneration}/getGeneratedContentSummary`,
        limit,
        skip,
        query,
    );
}
