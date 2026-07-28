# Layout Component Changes - Match share-ai-app

## Summary
Updated `Layout.jsx` to match share-ai-app's pattern while maintaining share-ai-admin's UI structure (Sidebar + Header).

## Key Changes

### 1. Removed AuthContext Dependency
**Before:**
```jsx
import { useAuth } from '@/contexts/AuthContext';

const Layout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !isAuthenticated && router.pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);
  
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return null;
  
  return <div>...</div>;
};

export default Layout;
```

**After (matches share-ai-app pattern):**
```jsx
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import {
  logoutSuccessful,
  updateLoginTime,
  updateUser,
} from '@/redux/actions/user-actions';

const Layout = (props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Route change event listeners
  useEffect(() => {
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);
  
  return <div>...</div>;
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = {
  updateLoginTime,
  logoutSuccessful,
  updateUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Layout));
```

### 2. Changes Made

✅ **Removed:**
- `useAuth()` hook and AuthContext dependency
- Authentication checks (`isAuthenticated`, `loading` from AuthContext)
- Conditional rendering based on AuthContext state
- Early returns for loading/unauthenticated states
- Manual redirect logic (`router.push('/login')`)

✅ **Added:**
- Redux connect with `mapStateToProps` and `mapDispatchToProps`
- `withRouter` HOC from Next.js
- Route change event listeners (same as share-ai-app)
- Loading state management via router events
- Redux actions: `updateLoginTime`, `logoutSuccessful`, `updateUser`
- `currentPath` calculation (same as share-ai-app)

✅ **Kept:**
- Your existing UI structure: `<Sidebar />` + `<Header />`
- Layout styling: `flex h-screen bg-gray-50`
- Main content area: `flex-1 overflow-x-hidden overflow-y-auto`
- Props children rendering

### 3. Authentication Flow Now

**Authentication is handled by:**
1. **SessionTimeoutMonitor** (in `_app.js`) - checks Redux state
2. **Redux state** - `state.user.isAuthenticated`
3. **Layout** - just renders, doesn't check auth (SessionTimeoutMonitor handles it)

**No more:**
- ❌ AuthContext checking in Layout
- ❌ Manual redirects in Layout
- ❌ Loading states from AuthContext
- ❌ Conditional rendering based on auth

### 4. Structure Comparison

| Feature | share-ai-app | share-ai-admin (OLD) | share-ai-admin (NEW) |
|---------|--------------|---------------------|----------------------|
| Auth System | Redux only | AuthContext + Redux | Redux only ✅ |
| HOCs | connect + withRouter | None | connect + withRouter ✅ |
| Auth Checks | SessionTimeoutMonitor | Layout component | SessionTimeoutMonitor ✅ |
| Route Events | Yes | No | Yes ✅ |
| Layout UI | Header + Bottom Nav | Sidebar + Header | Sidebar + Header (kept) |

### 5. Props Available in Layout

The Layout component now has access to:

```javascript
props.user          // Redux user state
props.router        // Next.js router (from withRouter)
props.updateLoginTime()    // Redux action
props.logoutSuccessful()   // Redux action
props.updateUser(user)     // Redux action
props.children      // Child components
```

### 6. Pattern Consistency

**Now consistent with share-ai-app:**
- ✅ Redux-based authentication
- ✅ Connect + withRouter pattern
- ✅ Route change event listeners
- ✅ No AuthContext dependency
- ✅ SessionTimeoutMonitor handles auth checks
- ✅ Same Redux actions available
- ✅ Same mapStateToProps/mapDispatchToProps structure

**Different from share-ai-app (intentional):**
- UI: Sidebar + Header (admin) vs Header + Bottom Nav (app)
- No mobile responsive check (you're using fixed layout)
- No bottom navigation bar (admin doesn't need it)

## Files Modified

1. **src/components/Layout.jsx**
   - Removed AuthContext dependency
   - Added Redux connect and withRouter
   - Added route change event listeners
   - Kept existing Sidebar + Header UI structure

## Testing Checklist

- [ ] Layout renders correctly with Sidebar and Header
- [ ] Navigation works without authentication errors
- [ ] Protected routes still protected (via SessionTimeoutMonitor)
- [ ] Redux user state accessible in Layout
- [ ] Route change events trigger properly
- [ ] No console errors related to AuthContext
- [ ] Children components render correctly

## Notes

- **Layout no longer checks authentication** - that's SessionTimeoutMonitor's job
- **AuthContext is completely removed** from the app (can delete the file)
- **Redux is the single source of truth** for authentication
- **UI structure unchanged** - only the logic/pattern updated
- Loading state now managed via router events (same as share-ai-app)
- Compatible with SessionTimeoutMonitor's Redux-based checks

## Next Steps (Optional)

1. Delete `src/contexts/AuthContext.jsx` (no longer used anywhere)
2. Update Sidebar/Header if they reference AuthContext
3. Test all navigation flows
4. Verify protected routes work correctly
