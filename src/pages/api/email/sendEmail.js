import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function sendEmail(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.email}/sendEmail`, query);
}