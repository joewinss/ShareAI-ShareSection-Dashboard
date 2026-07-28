import axios from "axios";
import { get, isEmpty, isPlainObject } from "lodash";
import client from "../../../../env";

export default async function publicImages(data = {}) {
    if (!isPlainObject(data)) {
        data = {};
    }

    const files = get(data, "images", []);
    // const productId = get(data, "productId");
    // Validate input
    if (isEmpty(data)) {
        return Promise.reject({
            message: "Please provide valid files and id!",
        });
    }

    const formData = new FormData();

    // Append each file as "images"
    files.forEach((file) => {
        if (file instanceof File) {
            formData.append("images[]", file);
        } else {
            console.warn("Skipping invalid file:", file);
        }
    });

    if (!isEmpty(data?.voucherId)) {
        formData.append("voucherId", data?.voucherId);
    }

    if (!isEmpty(data?.userPackageId)) {
        formData.append("userPackageId", data?.userPackageId);
    }


    // This endpoint is public (no auth on the server). Send NO custom headers
    // and let axios set the multipart boundary itself, so this cross-origin
    // request stays a CORS "simple request" with no preflight OPTIONS — which
    // removes the cold first-request failure. Network errors are still retried.
    const url = `${client.uri.apiLink}api/upload/publicImages`;

    // The public lucky-draw page is opened cold from a QR link (usually an in-app
    // webview). The first request to the API on a cold client can fail fast at the
    // network/edge layer (no HTTP response) and then succeed on retry. Retry
    // automatically on network-layer errors only — never on a real server response.
    const MAX_ATTEMPTS = 3;
    let lastError;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const startedAt = Date.now();
        try {
            const response = await axios.post(url, formData);

            if (!response) {
                return Promise.reject({
                    message: "Upload partially or completely failed.",
                });
            }

            return response;
        } catch (error) {
            lastError = error;

            // A network-layer failure has no response (the request never got a reply).
            const isNetworkError = !error.response;

            // Capture diagnostics so Mixpanel can pinpoint the failing layer.
            console.error("Error uploading files:", {
                attempt,
                message: error.message,
                code: error.code,               // ERR_NETWORK | ECONNABORTED | ...
                hadResponse: !!error.response,  // false => request never reached the server
                hadRequest: !!error.request,    // true + !response => died at the network layer
                status: error.response?.status,
                serverData: error.response?.data,
                elapsedMs: Date.now() - startedAt,
                url,
            });

            // Don't retry real server responses (4xx/5xx) — those are deterministic.
            if (!isNetworkError || attempt === MAX_ATTEMPTS) {
                break;
            }

            // Brief backoff, then retry on a freshly warmed connection.
            await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
        }
    }

    return Promise.reject({
        error: lastError,
        message: lastError?.response?.data?.message ||
            lastError?.message ||
            "Failed to upload product files. Please try again.",
    });
}
