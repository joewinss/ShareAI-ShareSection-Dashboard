
export const CONTENT_LIFECYCLE_STATUS = {
    BIN: 0,
    AVAILABLE: 1,      // Available for sharing
    SHARED: 2,         // Shared by public user
    USED: 3,           // Marked as used/consumed
    ADMIN_DELETED: 4,  // Deleted by admin (will become soft deleted)
    PENDING_REVIEW: 5  // Waiting for admin review/approval
};

export const CONTENT_STATUS = {
    PENDING_REVIEW: 0,  // Content pending review/approval
    ACTIVE: 1,          // Content is active and visible (approved)
    DELETED: 2,         // Content is deleted (soft delete) / rejected
    ARCHIVED: 3,        // Content is archived
    EXPIRED: 4          // Content is expired (package/queue expired)
};

export const PLATFORM_STATUS = {
    INACTIVE: 0,
    ACTIVE: 1
};

export const IMAGE_POOL_STATUS = {
    INACTIVE: 0,         // Image pool inactive
    ACTIVE: 1,           // Image pool active
    DELETED: 2           // Image pool deleted
};

export const VIDEO_POOL_STATUS = {
    INACTIVE: 0,         // Video pool inactive
    ACTIVE: 1,           // Video pool active
    DELETED: 2           // Video pool deleted
};


export const PLATFORM_TYPE = {
    URL: 1,
    BLOG: 2,
    OTHER: 3
};

export const PLATFORM_NAME = {
    FACEBOOK: "Facebook",
    INSTAGRAM: "Instagram",
    YELP: "Yelp",
    GOOGLE_REVIEW: "Google Review",
    TIKTOK: "Tiktok",
    RED_NOTE: "Red Note",
    LEMON8: "Lemon8",
    OTHERS: "Others"
}


