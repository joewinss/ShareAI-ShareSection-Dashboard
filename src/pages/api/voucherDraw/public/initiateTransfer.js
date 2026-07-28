import { _base_axios_post, apiUrl, routePrefix } from "../..";

export default function initiateTransfer(body = {}) {
    return _base_axios_post(`${apiUrl}/${routePrefix.voucherDraw}/public/initiateTransfer`, body);
}
