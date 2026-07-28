import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function updateAutoMode(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.content}/updateAutoMode`, query);
}
