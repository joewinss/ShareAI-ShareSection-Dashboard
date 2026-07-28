import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function updateFirstTimeLogin(query = {}) {
  return _base_axios_post(
    `${apiUrl}/${routePrefix.auth}/updateFirstTimeLogin`,
    query
  );
}
