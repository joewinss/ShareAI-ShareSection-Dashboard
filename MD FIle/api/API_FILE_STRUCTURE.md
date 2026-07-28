# 🎯 Share-AI-Admin API Structure (Matches share-ai-app)

## ✅ **One Function Per File Pattern**

Each API file contains **ONE function only** as the default export, matching share-ai-app exactly.

---

## 📂 **New File Structure:**

```
src/pages/api/
├── index.js                              # Core helper functions
│
├── auth/
│   ├── login.js                          # _base_axios_post
│   └── register.js                       # _base_axios_post
│
├── content/
│   ├── generateContent.js                # _base_axios_post
│   ├── generateRandomContent.js          # _base_axios_post
│   ├── getAllContent.js                  # _base_axios_get
│   ├── restoreContent.js                 # _base_axios_post
│   ├── savePresetContent.js              # _base_axios_post
│   ├── editContent.js                    # _base_axios_post
│   ├── deleteContent.js                  # _base_axios_post
│   ├── getAllPresetContent.js            # _base_axios_get
│   ├── editPendingContent.js             # _base_axios_post
│   ├── deletePendingContent.js           # _base_axios_post
│   ├── publishPendingContent.js          # _base_axios_post
│   └── restoreBinContent.js              # _base_axios_post
│
├── category/
│   ├── createCategory.js                 # _base_axios_post
│   ├── editCategory.js                   # _base_axios_post
│   └── getAllCategories.js               # _base_axios_get
│
├── admin/
│   ├── getQRDashboard.js                 # _base_axios_get
│   ├── getShareableLinks.js              # _base_axios_get
│   ├── regenerateQRCode.js               # _base_axios_post
│   └── getSystemStats.js                 # _base_axios_get
│
├── share/
│   ├── getGlobalShare.js                 # _base_axios_get
│   ├── getGlobalStats.js                 # _base_axios_get
│   └── shareGlobalContent.js             # _base_axios_post
│
├── progress/
│   └── getProgress.js                    # _base_axios_get
│
└── upload/
    └── images.js                         # Custom axios (FormData)
```

---

## 📝 **File Templates:**

### **GET Request Template:**
```javascript
import { _base_axios_get, apiUrl } from "..";

export default function functionName(query = {}) {
    return _base_axios_get(`${apiUrl}/endpoint/path`, query);
}
```

### **POST Request Template:**
```javascript
import { _base_axios_post, apiUrl } from "..";

export default function functionName(query = {}) {
    return _base_axios_post(`${apiUrl}/endpoint/path`, query);
}
```

### **List Request Template (with pagination):**
```javascript
import { apiUrl, routePrefix, _axios_base_get_list } from "..";

const PAGESIZE = 10;

export default function functionName(
    limit = PAGESIZE,
    skip = 0,
    query = {}
) {
    return _axios_base_get_list(
        `${apiUrl}/${routePrefix.content}/endpoint`,
        limit,
        skip,
        query,
    );
}
```

---

## 🔄 **How to Use:**

### **Import Example:**
```javascript
// Import individual functions
import login from "@/pages/api/auth/login";
import getAllContent from "@/pages/api/content/getAllContent";
import createCategory from "@/pages/api/category/createCategory";

// Use them
const response = await login({ email, password });
const content = await getAllContent({ status: "active" });
const category = await createCategory({ name: "New Category" });
```

---

## ✨ **Benefits:**

1. ✅ **Matches share-ai-app exactly** - Same pattern, same structure
2. ✅ **One function per file** - Clear separation of concerns
3. ✅ **Easy to find** - Function name matches file name
4. ✅ **Better organization** - Grouped by feature/domain
5. ✅ **Tree-shakable** - Import only what you need
6. ✅ **Maintainable** - Easy to update individual endpoints
7. ✅ **Consistent** - All files follow the same pattern

---

## 🗑️ **Old Files to Remove:**

These multi-function files are now split into individual files:

- ❌ `content/generate.js` (split into 4 files)
- ❌ `content/presetContent.js` (split into 4 files)
- ❌ `content/contentReview.js` (split into 4 files)
- ❌ `category/category.js` (split into 3 files)
- ❌ `admin/dashboard.js` (split into 4 files)
- ❌ `share/global.js` (split into 3 files)
- ❌ `progress/progress.js` (split into 1 file)

---

## 📊 **Migration Complete:**

✅ Total Files Created: **23 individual API files**
✅ Pattern: **One function per file**
✅ Consistency: **100% matches share-ai-app**

---

**Status: ✅ COMPLETE - All API files now follow share-ai-app pattern!**
