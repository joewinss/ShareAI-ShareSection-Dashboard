import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function updateRecurring(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.merchantDraw}/updateRecurring`, query);
}
