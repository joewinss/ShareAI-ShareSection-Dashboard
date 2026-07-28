import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function editVideoPool(query = {}) {
  return _base_axios_post(
    `${apiUrl}/${routePrefix.videoPool}/editVideoPool`,
    query
  );
}
