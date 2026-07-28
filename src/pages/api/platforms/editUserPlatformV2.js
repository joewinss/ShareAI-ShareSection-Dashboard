import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function editUserPlatformV2(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.platforms}/editUserPlatformV2`, query);
}
