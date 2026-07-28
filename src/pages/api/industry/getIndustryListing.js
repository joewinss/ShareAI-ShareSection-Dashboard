import { apiUrl, routePrefix, _axios_base_get_list } from "..";

export default function getIndustryListing(limit = 100, skip = 0, query = {}) {
    return _axios_base_get_list(
        `${apiUrl}/${routePrefix.industry}/getIndustryListing`,
        limit,
        skip,
        query,
    );
}
