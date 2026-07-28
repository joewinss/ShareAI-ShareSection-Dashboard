import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function editImagePool(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.imagePool}/editImagePool`, query);
}
