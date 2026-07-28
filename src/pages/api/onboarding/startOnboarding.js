import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function startOnboarding(query = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.onboarding}/startOnboarding`, query);
}
