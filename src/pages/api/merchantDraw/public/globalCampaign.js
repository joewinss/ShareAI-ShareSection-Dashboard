import { _axios_base_get_list, apiUrl, routePrefix } from "../..";

export default function getGlobalCampaign(limit = 1, skip = 0, query = {}) {
    return _axios_base_get_list(
        `${apiUrl}/${routePrefix.merchantDraw}/public/globalCampaign`,
        limit,
        skip,
        query,
    );
}
