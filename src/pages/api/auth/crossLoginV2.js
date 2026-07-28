import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function crossLoginV2(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.auth}/crossLoginV2`, query);
} 