import { _base_axios_get, apiUrl, routePrefix } from "..";

export default function getVoucherImageGenerationStatus(query = {}) {
    return _base_axios_get(`${apiUrl}/${routePrefix.voucherDraw}/getVoucherImageGenerationStatus`, query);
}
