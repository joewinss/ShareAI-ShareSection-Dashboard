import { _base_axios_get, apiUrl, routePrefix } from "..";

export default function getGenerationConfig() {
    return _base_axios_get(
        `${apiUrl}/${routePrefix.generationConfiguration}/getConfig`,
        {}
    );
}
