import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function createCategory(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.category}/createCategory`, query);
}
