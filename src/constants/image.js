export const MODE = {
  CHANGE_MATERIAL: "Change Material",
  CHANGE_BACKGROUND: "Change Background",
  WHITE_BACKGROUND: "White Background",
};


// Visual Category Status Constants
export const VISUAL_CATEGORY_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
  ARCHIVED: 2,
  DELETED: 3,
};

// Image Processing Status Constants
export const IMAGE_PROCESSING_STATUS = {
  QUEUED: 0, // Image uploaded and queued for processing
  PROCESSING: 1, // Image sent to N8N, waiting for callback
  COMPLETED: 2, // Image processing completed successfully
  FAILED: 3, // Image processing failed or timed out
};
