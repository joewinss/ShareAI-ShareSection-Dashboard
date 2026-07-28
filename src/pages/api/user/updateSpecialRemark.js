import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function updateSpecialRemark(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.user}/updateSpecialRemark`, query);
}
