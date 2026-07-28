import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function deleteAutoMode(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.content}/deleteAutoMode`, query);
}