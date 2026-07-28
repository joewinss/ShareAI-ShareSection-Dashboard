import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function createAutoMode(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.content}/createAutoMode`, query);
}