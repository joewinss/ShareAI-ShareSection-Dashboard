import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function publishPendingContent(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.contentReview}/publish`, query);
}
