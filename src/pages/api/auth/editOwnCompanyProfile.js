import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function editOwnCompanyProfile(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.auth}/editOwnCompanyProfile`, query);
} 