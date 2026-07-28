import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function editContent(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.contentGeneration}/editContent`, query);
}