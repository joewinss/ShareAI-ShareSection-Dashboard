import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function getSessionInfo(query = {}, header) {
    return _base_axios_post(
        `${apiUrl}/${routePrefix.session}/getSessionInfo`,
        query,
        "",
        header
    );
}
