import { _base_axios_post, apiUrl, routePrefix } from "..";

export default function editContentStatus(query = {}) {
  return _base_axios_post(
    `${apiUrl}/${routePrefix.contentGeneration}/editContentStatusV2`,
    query
  );
}
