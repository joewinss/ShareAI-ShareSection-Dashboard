import axios from "axios";
import localStorage from "local-storage";
import { get, isEmpty, isPlainObject } from "lodash";
import { getSessionType } from "..";
import client from "../../../../env";

export default async function videos(data = {}) {
    if (!isPlainObject(data)) {
        data = {};
    }

    const files = get(data, "videos", []);
    if (isEmpty(data)) {
        return Promise.reject({
            message: "Please provide valid files!",
        });
    }

    const accessKey = localStorage.get("redux")?.user?.accessKey;
    const session = getSessionType("POST", `${client.uri.apiLink}api/upload/videos`);

    const formData = new FormData();

    files.forEach((file) => {
        if (file instanceof File) {
            formData.append("videos[]", file);
        } else {
            console.warn("Skipping invalid file:", file);
        }
    });

    const headers = {
        Authorization: `Bearer ${accessKey}`,
        "Content-Type": "multipart/form-data",
        "auth-code": session.authCode,
        "auth-id": session.authId,
        timestamp: session.timestamp,
    };

    try {
        const response = await axios.post(`${client.uri.apiLink}api/upload/videos`, formData, { headers });

        if (!response) {
            return Promise.reject({
                message: response.message || "Upload partially or completely failed.",
            });
        }

        return response;
    } catch (error) {
        console.error("Error uploading videos:", error.response?.data || error.message);
        return Promise.reject({
            error,
            message: error.response?.data?.message || "Failed to upload video files. Please try again.",
        });
    }
}
