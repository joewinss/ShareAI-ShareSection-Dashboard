import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function editImageName(query = {}) {
  return _base_axios_post(
    `${apiUrl}/${routePrefix.visualGeneration}/saveImageName`,
    query
  );
}
