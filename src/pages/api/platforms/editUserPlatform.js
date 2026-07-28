import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function editUserPlatform(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.platforms}/editUserPlatform`, query);
}
