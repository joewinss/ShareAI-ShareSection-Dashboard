import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function editPresetContent(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.contentPreset}/editPresetContent`, query);
}
