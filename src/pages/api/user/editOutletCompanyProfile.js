import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function editOutletCompanyProfile(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.user}/editOutletCompanyProfile`, query);
}