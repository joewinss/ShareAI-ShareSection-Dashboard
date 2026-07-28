import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function editCategory(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.category}/editCategory`, query);
}
