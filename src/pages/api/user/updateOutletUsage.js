import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function updateOutletUsage(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.user}/updateOutletUsage`, query);
}