import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function shareGlobalContent(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.globalShare}/share-content`, query);
}
