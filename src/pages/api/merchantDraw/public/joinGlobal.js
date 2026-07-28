import { _base_axios_post, apiUrl, routePrefix } from "../..";

export default function joinGlobal(body = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.merchantDraw}/public/joinGlobal`, body);
}
