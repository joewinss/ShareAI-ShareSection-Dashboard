import { _base_axios_get, apiUrl, routePrefix } from "..";

export default function getGlobalShare(query = {}) {
    return _base_axios_get(`${apiUrl}/${routePrefix.globalShare}/share-ai-global`, query);
}
