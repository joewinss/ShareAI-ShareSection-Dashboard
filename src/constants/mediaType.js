// Numeric media type constants — must match share-ai-api/constants/status.js MEDIA_TYPE.
export const MEDIA_TYPE = {
  IMAGE: 0,
  VIDEO: 1,
};

export const isVideoMedia = (value) =>
  value === MEDIA_TYPE.VIDEO || value === "video";
