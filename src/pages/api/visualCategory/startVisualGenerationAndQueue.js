import axios from "axios";
import localStorage from "local-storage";
import { get, isEmpty, isPlainObject } from "lodash";
import { getSessionType } from "..";
import client from "../../../../env";
import { VISUAL_INDUSTRY_CODES } from "@/constants/visualMode";

const baseEndpoint = `${client.uri.apiLink}api/visualGeneration/startVisualGenerationAndQueueV2`;
const VALID_VISUAL_INDUSTRY_CODES = VISUAL_INDUSTRY_CODES;

const normalizeIndustryCode = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export default async function startVisualGenerationAndQueue(
  data = {},
  visualIndustry = "",
  options = {}
) {
  const requireImages = options?.requireImages !== false;
  const normalizedIndustryCode = normalizeIndustryCode(visualIndustry);
  if (!normalizedIndustryCode) {
    return Promise.reject({
      message: "Visual industry is missing for this mode.",
    });
  }
  if (!VALID_VISUAL_INDUSTRY_CODES.includes(normalizedIndustryCode)) {
    return Promise.reject({
      message: "Visual industry is invalid for this mode.",
    });
  }

  const endpoint = `${baseEndpoint}/${encodeURIComponent(normalizedIndustryCode)}`;
  const accessKey = localStorage.get("redux")?.user?.accessKey;
  const session = getSessionType("POST", endpoint);

  // If caller already passes FormData, forward as-is.
  const formData =
    typeof FormData !== "undefined" && data instanceof FormData
      ? data
      : buildFormDataFromPayload(data);

  // Basic validation: require at least one image entry.
  if (requireImages) {
    const hasImages =
      formData.getAll("images[]") && formData.getAll("images[]").length > 0;
    if (!hasImages) {
      return Promise.reject({
        message: "Please provide at least one image.",
      });
    }
  }

  const headers = {
    Authorization: `Bearer ${accessKey}`,
    "Content-Type": "multipart/form-data",
    "auth-code": session.authCode,
    "auth-id": session.authId,
    timestamp: session.timestamp,
  };

  try {
    const response = await axios.post(endpoint, formData, { headers });
    if (!response) {
      return Promise.reject({
        message: response?.message || "Upload partially or completely failed.",
        details: response?.data?.errors || [],
      });
    }
    return response;
  } catch (error) {
    console.error("Error uploading files:", error.response?.data || error.message);
    return Promise.reject({
      error,
      message:
        error.response?.data?.message ||
        "Failed to upload product files. Please try again.",
    });
  }
}

function buildFormDataFromPayload(payload) {
  const form = new FormData();
  if (!isEmpty(payload) && isPlainObject(payload)) {
    const images =
      get(payload, "images[]");
    (Array.isArray(images) ? images : [images]).forEach((img) => {
      if (img !== undefined && img !== null && img !== "") {
        form.append("images[]", img);
      }
    });

    const type = get(payload, "type")
    const mode = get(payload, "mode")

    if (type) form.append("type", type);
    if (mode) form.append("mode", mode);
  }
  return form;
}
