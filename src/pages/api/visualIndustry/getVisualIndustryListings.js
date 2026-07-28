import { apiUrl, routePrefix, _axios_base_get_list } from "..";

const PAGESIZE = 10;

export default function getVisualIndustryListings(
    limit = PAGESIZE,
    skip = 0,
    query = {}
) {
    return _axios_base_get_list(
        `${apiUrl}/${routePrefix.visualIndustry}/getVisualIndustryListings`,
        limit,
        skip,
        query,
    );
}
