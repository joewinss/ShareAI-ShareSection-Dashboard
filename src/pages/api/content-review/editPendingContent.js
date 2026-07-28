import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function editPendingContent(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.contentReview}/editContent`, query);
}
