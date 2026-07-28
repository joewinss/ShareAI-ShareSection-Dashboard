import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function startChunkGeneration(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.contentGeneration}/startChunkGeneration`, query);
}