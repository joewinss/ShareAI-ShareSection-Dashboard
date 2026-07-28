
import { _base_axios_post, apiUrl, routePrefix } from "../..";

export default function restoreBinContent(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.contentReview}/bin/restore`, query);
}
