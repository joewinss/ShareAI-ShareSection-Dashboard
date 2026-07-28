import axios from "axios";
import localStorage from "local-storage";
import { get, isEmpty, isPlainObject } from "lodash";
import { getSessionType } from "..";
import client from "../../../../env";

export default async function uploadAndQueue(data = {}) {
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

    const accessKey = localStorage.get("redux")?.user?.accessKey;
    const session = getSessionType("POST", `${client.uri.apiLink}api/imageProcessing/uploadAndQueue`);

    // if (!accessKey || !session) {
    //     return Promise.reject({
    //         message: "Authentication information is missing.",
    //     });
    // }

    const formData = new FormData();

    // Append each file as "images"
    files.forEach((file) => {
        if (file instanceof File) {
            formData.append("images[]", file);
        } else {
            console.warn("Skipping invalid file:", file);
        }
    });

    if (data?.imgOut > 0) {
        formData.append("imgOut", data?.imgOut);
    }

    if (!isEmpty(data?.coordinationKey)) {
        formData.append("coordinationKey", data?.coordinationKey);
    }

    if (!isEmpty(data?.productId)) {
        formData.append("productId", data?.productId);
    }

    if (!isEmpty(data?.userPackageId)) {
        formData.append("userPackageId", data?.userPackageId);
    }

    if (!isEmpty(data?.productName)) {
        formData.append("productName", data?.productName);
    }

    if (data?.enablePhasedGeneration === true) {
        formData.append("enablePhasedGeneration", true);
    }

    // Configure headers
    const headers = {
        Authorization: `Bearer ${accessKey}`,
        "Content-Type": "multipart/form-data",
        "auth-code": session.authCode,
        "auth-id": session.authId,
        timestamp: session.timestamp,
    };

    try {

        const response = await axios.post(`${client.uri.apiLink}api/imageProcessing/uploadAndQueue`, formData, { headers });

        // Check for server-side validation errors
        if (!response) {
            return Promise.reject({
                message: response.message || "Upload partially or completely failed.",
                details: response.data.errors || [],
            });
        }

        return response;
    } catch (error) {
        // Log detailed error information for debugging
        console.error("Error uploading files:", error.response?.data || error.message);
        return Promise.reject({
            error,
            message: error.response?.data?.message || "Failed to upload product files. Please try again.",
        });
    }
}
