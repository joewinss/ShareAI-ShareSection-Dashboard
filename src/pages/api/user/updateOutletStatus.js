import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function updateOutletStatus(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.user}/updateOutletStatus`, query);
}