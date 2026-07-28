import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function completeOutletProfile(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.auth}/completeOutletProfile`, query);
} 