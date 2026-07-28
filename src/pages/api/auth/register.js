import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function register(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.auth}/register`, query);
}
