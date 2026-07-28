import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function resetPassword(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.auth}/resetPassword`, query);
} 