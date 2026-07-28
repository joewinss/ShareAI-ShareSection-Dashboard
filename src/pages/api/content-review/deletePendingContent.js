import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function deletePendingContent(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.contentReview}/bin`, query);
}
