import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function deleteContent(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.contentPresets}/deleteContent`, query);
}
