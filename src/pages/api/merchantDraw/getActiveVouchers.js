import { _base_axios_get, apiUrl, routePrefix } from "..";

export default function getActiveVouchers(query = {}) {
    return _base_axios_get(`${apiUrl}/${routePrefix.merchantDraw}/getActiveVouchers`, query);
}
