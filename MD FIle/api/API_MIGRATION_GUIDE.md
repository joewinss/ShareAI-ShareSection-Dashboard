# 🎉 Share-AI-Admin API Architecture Migration Complete!

## ✅ **What Was Changed:**

Successfully migrated **share-ai-admin** from fetch-based API to axios-based API with encryption (matching i-share-admin pattern).

---

## 📋 **Files Modified:**

### **1. Utility Files**

#### **`src/utility/session.js`** - ✅ Updated
- Added `encrypt()` and `decrypt()` functions
- Uses AES-256-CBC encryption algorithm
- Matches i-share-admin encryption pattern

#### **`src/utility/startUp.js`** - ✅ Already Exists
- Contains `sessionPass` encryption key
- No changes needed

### **2. Core API Files**

#### **`src/pages/api/index.js`** - ✅ Completely Rebuilt
**Added:**
- ✅ `getSessionType()` - Generates encrypted session headers
- ✅ `_base_axios_get()` - GET requests with axios
- ✅ `_base_axios_post()` - POST requests with axios
- ✅ `_axios_base_get_list()` - List/pagination requests with axios
- ✅ Route prefixes for organization
- ✅ Encrypted headers: `auth-code`, `auth-id`, `timestamp`

#### **`src/pages/api/auth/login.js`** - ✅ Updated
- Now uses `_base_axios_post()` helper
- Follows i-share-admin pattern

#### **`src/pages/api/auth/register.js`** - ✅ Updated
- Now uses `_base_axios_post()` helper
- Follows i-share-admin pattern

---

## 🚀 **How to Use the New API Pattern:**

### **Example 1: Simple GET Request**

```javascript
import { apiUrl, routePrefix, _base_axios_get } from "@/pages/api";

export default function getProfile(query = {}) {
  return _base_axios_get(
    `${apiUrl}/${routePrefix.auth}/profile`,
    query
  );
}
```

### **Example 2: Simple POST Request**

```javascript
import { apiUrl, routePrefix, _base_axios_post } from "@/pages/api";

export default function createContent(data = {}) {
  return _base_axios_post(
    `${apiUrl}/${routePrefix.content}/create`,
    data
  );
}
```

### **Example 3: List with Pagination**

```javascript
import { apiUrl, routePrefix, _axios_base_get_list } from "@/pages/api";

const PAGESIZE = 10;

export default function getAllContent(
  limit = PAGESIZE,
  skip = 0,
  query = {}
) {
  return _axios_base_get_list(
    `${apiUrl}/${routePrefix.content}/list`,
    limit,
    skip,
    query
  );
}
```

### **Example 4: Get All Items (No Pagination)**

```javascript
import { apiUrl, routePrefix, _axios_base_get_list } from "@/pages/api";

export default function getAllCategories(query = {}) {
  return _axios_base_get_list(
    `${apiUrl}/${routePrefix.category}/all`,
    "all", // Special: fetches ALL items
    0,
    query
  );
}
```

---

## 📂 **Folder Structure Pattern (from i-share-admin):**

```
src/pages/api/
├── index.js                    # Core helper functions
├── auth/
│   ├── login.js               # Uses _base_axios_post
│   ├── register.js            # Uses _base_axios_post
│   └── getProfile.js          # Uses _base_axios_get
├── content/
│   ├── generate.js            # Uses _base_axios_post
│   ├── presetContent.js       # Uses _axios_base_get_list
│   └── contentReview.js       # Uses _base_axios_post
├── category/
│   └── category.js            # Uses _axios_base_get_list
├── upload/
│   └── images.js              # Uses axios with FormData
├── admin/
│   └── dashboard.js           # Uses _base_axios_get
└── share/
    └── global.js              # Uses _base_axios_post
```

---

## 🔐 **How Authentication Works Now:**

### **1. Login Flow:**

```javascript
// 1. User logs in
const response = await login({ email, password });

// 2. Backend returns accessKey/token
const accessKey = response.data.accessKey;

// 3. Store in Redux (already handled by your app)
localStorage.set("redux", { user: { accessKey } });

// 4. Store session info for encryption
localStorage.set("sessionInfo", {
  sessionId: "...",
  sessionUse: "...",
  sessionTime: Date.now()
});
```

### **2. Every API Request:**

```javascript
// 1. Get accessKey from Redux/localStorage
const accessKey2 = localStorage.get("redux")?.user?.accessKey 
                || localStorage.getItem('authToken');

// 2. Generate encrypted session
const session = getSessionType("GET", url);
// Returns: { authCode, timestamp, authId }

// 3. Send headers
headers: {
  Authorization: "Bearer " + accessKey2,
  "auth-code": session?.authCode,      // Encrypted
  "auth-id": session?.authId,          // Timestamp-based ID
  timestamp: session?.timestamp,        // Current timestamp
}
```

---

## 🎨 **Available Route Prefixes:**

```javascript
export const routePrefix = {
  auth: "auth",          // /api/auth/...
  session: "session",    // /api/session/...
  admin: "admin",        // /api/admin/...
  content: "content",    // /api/content/...
  category: "category",  // /api/category/...
  upload: "upload",      // /api/upload/...
  share: "share",        // /api/share/...
  progress: "progress",  // /api/progress/...
};
```

---

## 📝 **Next Steps for Full Migration:**

You need to update the remaining API files to use the new helper functions:

### **Files to Update:**

1. ✅ `src/pages/api/auth/login.js` - DONE
2. ✅ `src/pages/api/auth/register.js` - DONE
3. ⏳ `src/pages/api/content/generate.js` - TODO
4. ⏳ `src/pages/api/content/presetContent.js` - TODO
5. ⏳ `src/pages/api/content/contentReview.js` - TODO
6. ⏳ `src/pages/api/category/category.js` - TODO
7. ⏳ `src/pages/api/upload/images.js` - TODO (special: FormData)
8. ⏳ `src/pages/api/admin/dashboard.js` - TODO
9. ⏳ `src/pages/api/share/global.js` - TODO
10. ⏳ `src/pages/api/progress/progress.js` - TODO

### **Template for Migration:**

**Before (fetch-based):**
```javascript
const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  // ... handling
};

export const getData = async () => {
  return await apiRequest('/data', { method: 'GET' });
};
```

**After (axios-based):**
```javascript
import { apiUrl, routePrefix, _base_axios_get } from "..";

export default function getData(query = {}) {
  return _base_axios_get(
    `${apiUrl}/${routePrefix.auth}/data`,
    query
  );
}
```

---

## ⚙️ **Dependencies Installed:**

```bash
npm install axios local-storage crypto-js
```

---

## ✨ **Benefits of New Architecture:**

1. ✅ **Consistent with i-share-admin** - Same pattern across admin apps
2. ✅ **Encrypted session headers** - Added security layer
3. ✅ **Centralized helpers** - DRY principle, less code duplication
4. ✅ **Better error handling** - Structured error responses
5. ✅ **Pagination support** - Built-in list fetching with "all" option
6. ✅ **Type safety** - Better parameter validation
7. ✅ **Maintainable** - Easy to update and extend

---

## 🐛 **Testing Checklist:**

- [ ] Login works and stores accessKey
- [ ] Session encryption generates properly
- [ ] API requests include encrypted headers
- [ ] Error handling works correctly
- [ ] Pagination works with `_axios_base_get_list`
- [ ] "Get all" works with `limit="all"`
- [ ] File uploads work (after migrating upload/images.js)

---

## 📞 **Need Help?**

If you encounter issues:
1. Check browser console for errors
2. Verify `sessionInfo` exists in localStorage
3. Ensure Redux has `accessKey` stored
4. Check network tab for request headers
5. Verify backend accepts these headers (even if it ignores them)

---

**Migration Status: 🟡 Partial (2/10 files migrated)**

Would you like me to migrate the remaining API files now?
