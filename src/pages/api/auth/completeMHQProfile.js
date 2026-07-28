import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function completeMHQProfile(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.auth}/completeMHQProfile`, query);
} 