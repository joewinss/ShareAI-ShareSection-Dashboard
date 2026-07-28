import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function registerOutlet(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.user}/registerOutlet`, query);
}