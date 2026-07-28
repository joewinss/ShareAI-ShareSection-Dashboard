# Session & Authentication Changes - Match share-ai-app

## Summary
Updated share-ai-admin authentication and session management to match share-ai-app exactly.

## Key Changes

### 1. Removed AuthContext Dependency
**share-ai-app does NOT use AuthContext** - it only uses Redux for authentication.

#### Changes Made:
- ✅ Removed `AuthContext` import from `LoginPage.jsx`
- ✅ Removed `useAuth()` hook usage
- ✅ Removed `isAuthenticated` check from LoginPage
- ✅ Removed `authLogin()` call after successful login
- ✅ Removed `localStorage.setItem('authToken', accessKey)` (not needed)
- ✅ Removed `AuthProvider` wrapper from `_app.js`

### 2. Updated _app.js Structure
**Before:**
```javascript
import { AuthProvider } from '@/contexts/AuthContext';

return (
  <Provider store={store}>
    <SessionTimeoutMonitor />
    <AuthProvider>
      {!isLoginPage && !isShareSection}  // <-- Extra line bug
      {isLoginPage || isShareSection ? (
        <Component {...pageProps} />
      ) : (
        <Layout>...</Layout>
      )}
      <Toaster />
    </AuthProvider>
  </Provider>
);
```

**After (matches share-ai-app):**
```javascript
// No AuthContext import

return (
  <Provider store={store}>
    <SessionTimeoutMonitor />
    {isLoginPage || isShareSection ? (
      <Component {...pageProps} />
    ) : (
      <Layout>...</Layout>
    )}
    <Toaster />
  </Provider>
);
```

### 3. Updated LoginPage.jsx
**Before:**
```javascript
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = (props) => {
  const { isAuthenticated, login: authLogin } = useAuth();
  
  if (isAuthenticated) {
    props.router.push('/');
    return null;
  }
  
  // In handleSubmit:
  localStorage.setItem('authToken', accessKey);
  props.loginSuccessful(user, accessKey);
  authLogin();
}
```

**After (matches share-ai-app):**
```javascript
// No AuthContext import

const LoginPage = (props) => {
  // No useAuth hook
  // No isAuthenticated check
  
  // In handleSubmit - only Redux:
  props.loginSuccessful(user, accessKey);
}
```

### 4. SessionTimeoutMonitor
**Updated to match share-ai-app exactly:**
- ✅ Same public pages list: `['/login', '/register', '/register/step2']`
- ✅ Same timeout: 2 hours (TOKEN_EXPIRATION_TIME_MS)
- ✅ Same session checks (Redux only, no AuthContext)
- ✅ Same route change handler logic

## How Authentication Works Now (Redux Only)

### Login Flow:
1. User submits login form
2. API call to `/api/auth/login`
3. On success: `props.loginSuccessful(user, accessKey)`
4. Redux action updates state and calls `persistRedux()`
5. Redux state saved to `localStorage.get('redux')`
6. Router navigates to `/`

### Session Validation (SessionTimeoutMonitor):
1. Checks `localStorage.get('redux').user.isAuthenticated`
2. Checks if user data exists and is valid
3. Checks if token expired (2 hours since loginTime)
4. If any check fails → force logout → redirect to `/login`

### Protected Routes:
- SessionTimeoutMonitor checks authentication on every route change
- Public pages: `/login`, `/register`, `/register/step2`, `/shareSection`
- All other routes require authentication (Redux state)

## Files Modified

1. **src/components/auth/pages/LoginPage.jsx**
   - Removed AuthContext imports and usage
   - Removed localStorage.setItem('authToken')
   - Simplified to Redux-only authentication

2. **src/pages/_app.js**
   - Removed AuthProvider wrapper
   - Removed AuthContext import
   - Fixed extra line bug (`{!isLoginPage && !isShareSection}`)

3. **src/general/SessionTimeoutMonitor.jsx**
   - Updated public pages list to match share-ai-app
   - Already identical to share-ai-app implementation

## Testing Checklist

- [ ] Login functionality works
- [ ] Redirect to `/` after successful login
- [ ] Session persists after page refresh
- [ ] Protected routes redirect to `/login` when not authenticated
- [ ] Session expires after 2 hours
- [ ] Logout clears session properly
- [ ] Public pages accessible without authentication

## Notes

- **AuthContext is still in the codebase** but is NOT used anywhere
- Can be safely deleted: `src/contexts/AuthContext.jsx`
- All authentication is managed through Redux only
- Session timeout: 2 hours (same as share-ai-app)
- No more dual authentication systems (was causing navigation issues)
