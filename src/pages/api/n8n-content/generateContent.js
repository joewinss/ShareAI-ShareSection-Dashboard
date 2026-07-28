import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function generateContent(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix?.n8nContent}/generate`, query);
}
