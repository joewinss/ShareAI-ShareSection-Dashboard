import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function toggleOutletDrawFlags(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.merchantDraw}/toggleGlobalMerchantDrawControl`, query);
}
