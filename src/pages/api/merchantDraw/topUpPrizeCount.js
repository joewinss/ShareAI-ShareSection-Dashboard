import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function topUpPrizeCount(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.merchantDraw}/topUpPrizeCount`, query);
}
