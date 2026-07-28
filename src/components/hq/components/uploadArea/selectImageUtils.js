const IMAGE_PROXY_PATH = "/api/images/proxy-image";

const MIME_BY_EXTENSION = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

function extractGeneratedVisualImageUrls(response) {
  const list = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  return list
    .flatMap((item) => {
      if (Array.isArray(item?.resultImageUrls)) return item.resultImageUrls;
      if (typeof item?.resultImageUrls === "string") return [item.resultImageUrls];
      return [];
    })
    .filter((url) => typeof url === "string" && url.trim())
    .map((url) => url.trim());
}

function buildProxyImageUrl(imageUrl) {
  return `${IMAGE_PROXY_PATH}?url=${encodeURIComponent(imageUrl)}`;
}

function getFileNameFromUrl(imageUrl, index) {
  const fallback = `generated-image-${index + 1}.jpg`;
  if (typeof imageUrl !== "string") return fallback;

  const lastPath = imageUrl.split("/").pop()?.split("?")[0];
  return lastPath || fallback;
}

function resolveMimeType(fileName, blobType) {
  if (blobType && blobType !== "application/octet-stream") return blobType;
  const ext = fileName.split(".").pop()?.toLowerCase();
  return MIME_BY_EXTENSION[ext] || "image/jpeg";
}

async function convertGeneratedImageUrlsToFiles(imageUrls, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;

  const files = await Promise.all(
    (Array.isArray(imageUrls) ? imageUrls : []).map(async (imageUrl, index) => {
      const response = await fetchImpl(buildProxyImageUrl(imageUrl));
      if (!response.ok) {
        throw new Error(`Failed to fetch selected image ${index + 1}`);
      }

      const blob = await response.blob();
      const fileName = getFileNameFromUrl(imageUrl, index);
      const mimeType = resolveMimeType(fileName, blob.type);
      return new File([blob], fileName, { type: mimeType });
    })
  );

  return files;
}

module.exports = {
  buildProxyImageUrl,
  convertGeneratedImageUrlsToFiles,
  extractGeneratedVisualImageUrls,
  getFileNameFromUrl,
  resolveMimeType,
};
