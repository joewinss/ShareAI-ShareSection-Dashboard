import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function validateEmailCode(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.email}/validateEmailCode`, query);
}