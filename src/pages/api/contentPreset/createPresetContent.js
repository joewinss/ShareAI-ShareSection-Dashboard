import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function createPresetContent(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.contentPreset}/createPresetContent`, query);
}
