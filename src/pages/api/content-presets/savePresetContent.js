import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function savePresetContent(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.contentPresets}/saveContent`, query);
}
