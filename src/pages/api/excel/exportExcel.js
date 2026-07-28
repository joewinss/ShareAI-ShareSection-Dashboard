import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function exportExcel(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.excel}/exportExcel`, query);
}
