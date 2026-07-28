import { apiUrl, routePrefix, _axios_base_get_list } from "..";

const PAGESIZE = 10;

export default function getBusinessContentById(
  limit = PAGESIZE,
  skip = 0,
  query = {}
) {
  return _axios_base_get_list(
    `${apiUrl}/${routePrefix.content}/getBusinessContentById`,
    limit,
    skip,
    query,
  );
}
