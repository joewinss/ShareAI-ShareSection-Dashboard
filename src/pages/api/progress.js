import { _axios_base_get_list } from ".";


const PAGESIZE = 10;

export default function progress(
    limit = PAGESIZE,
    skip = 0,
    query = {}
) {
    return _axios_base_get_list(
        `${apiUrl}/progress`,
        limit,
        skip,
        query,
    );
}
