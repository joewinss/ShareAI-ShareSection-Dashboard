import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function login(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.auth}/login`, query);
} 