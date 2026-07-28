import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function shareContent(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.content}/shareContent`, query);
}
