import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import localStorage from "local-storage";
import { message } from "antd";
import { logoutSuccessful } from "@/redux/actions/user-actions";
import { USER_SOURCE } from "@/constants/user";
import { getIShareRedirectUrl } from "@/utility/common-functions";

// Constants
const TOKEN_EXPIRATION_TIME_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const PUBLIC_PAGE = ['/login', '/register', '/register/step2', '/cross-login', '/shareSection', '/share/luckyDraw', '/share/luckyDraw/dashboard', '/share/luckyDraw/uploadShareProof'];

/**
 * Check if the user's token is expired based on loginTime in redux
 * @returns {boolean} True if token is expired, false otherwise
 */
const isTokenExpired = () => {
  try {
    const reduxState = localStorage.get("redux");

    if (!reduxState || !reduxState.user || !reduxState.user.loginTime) {
      return true; // No login time found, consider expired
    }

    const loginTime = new Date(reduxState.user.loginTime);
    const currentTime = new Date();
    const elapsedTime = currentTime - loginTime;

    return elapsedTime >= TOKEN_EXPIRATION_TIME_MS;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true; // If there's an error, consider token expired
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
const isAuthenticated = () => {
  try {
    const reduxState = localStorage.get("redux");
    return reduxState && reduxState.user && reduxState.user.isAuthenticated;
  } catch (error) {
    return false;
  }
};

/**
 * Check if redux user data is empty or missing
 * @returns {boolean} True if user data is empty/missing
 */
const isReduxUserEmpty = () => {
  try {
    const reduxState = localStorage.get("redux");

    if (!reduxState || !reduxState.user) {
      return true;
    }

    const { user, isAuthenticated, accessKey } = reduxState.user;

    // Check if user claims to be authenticated but has no data
    if (isAuthenticated) {
      // Check if user object is empty or missing
      if (!user || typeof user !== "object" || Object.keys(user).length === 0) {
        return true;
      }

      // Check if access key is missing
      if (!accessKey || accessKey.trim() === "") {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking user data validity:", error);
    return true; // If there's an error, consider user data invalid
  }
};

/**
 * Clear all session and cache data
 */
const clearAllSessionData = () => {
  try {
    // Clear localStorage redux data
    const reduxState = localStorage.get("redux");
    if (reduxState) {
      reduxState.user = {
        user: {},
        isAuthenticated: false,
        accessKey: "",
        loginTime: null,
      };
      localStorage.set("redux", reduxState);
    }

    // Clear any other session storage if needed
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }
  } catch (error) {
    console.error("Error clearing session data:", error);
  }
};

/**
 * Session timeout monitor component
 * This component monitors session validity and logs out the user if needed
 */
export const SessionTimeoutMonitor = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  /**
   * Check if current page requires authentication
   * Excludes: /login, /register, /register/step2 (with or without query parameters)
   * @returns {boolean} True if page requires authentication
   */
  const requiresAuth = () => {
    const currentPath = router.pathname; // This gives us just the pathname without query params
    const isPublicPage = PUBLIC_PAGE.some(p => currentPath === p || currentPath.startsWith(p + '/'));

    // Debug logging to see what path we're checking
    // console.log('🔍 Session check - Current pathname:', currentPath);
    // console.log('🔍 Session check - Is public page?', isPublicPage);
    // console.log('🔍 Session check - Requires auth?', !isPublicPage);

    return !isPublicPage;
  };

  /**
   * Force logout with message and redirect
   * @param {string} reason - Reason for logout
   */
  const handleLogout = (reason = "sessionExpired") => {
    // console.warn(`Force logout triggered: ${reason}`);

    // Check if user is Enterprise from IShare before clearing data
    const reduxState = localStorage.get("redux");
    const isEnterpriseFromIShare = reduxState?.user?.user?.source === USER_SOURCE.ISHARE_ENTERPRISE;

    // Clear all session data
    clearAllSessionData();

    // Dispatch Redux actions
    dispatch(logoutSuccessful());

    // Show appropriate message based on reason
    const messages = {
      sessionExpired: "Your session has expired. Please login again.",
      userDataMissing: "User data is missing. Please login again.",
      tokenExpired: "Your login token has expired. Please login again.",
      sessionCleared: "Session data was cleared. Please login again.",
      apiTokenExpired: "Your session has expired. Please login again.",
    };

    message.error(messages[reason] || messages.sessionExpired);

    // Redirect
    if (isEnterpriseFromIShare) {
      window.location.href = getIShareRedirectUrl();
    } else {
      router.push("/login");
    }
  };

  /**
   * Main session validation function
   */
  const checkSession = () => {
    // Don't check if router is not ready
    if (!router.isReady) {
      // console.log('⏳ Router not ready, skipping session check');
      return;
    }

    // Only check if we're on a page that requires authentication
    if (!requiresAuth()) {
      // console.log('✅ Page does not require auth, skipping session check');
      return;
    }

    // console.log('🔒 Checking session for protected page:', router.pathname);

    const reduxState = localStorage.get("redux");

    // Check 1: If localStorage has been completely cleared
    if (!reduxState) {
      // console.warn('LocalStorage was cleared - redirecting to login');
      handleLogout("sessionCleared");
      return;
    }

    const userData = reduxState.user.user;

    // Force logout if user data is missing or businessInfo is missing
    // EXCEPTION: Enterprise users from IShare can have empty businessDescription and firstTimeLogin=0
    const isEnterpriseFromIShare = userData?.source === USER_SOURCE.ISHARE_ENTERPRISE && userData?.iShareInfo?.iShareUserId;

    if (!userData || !userData.businessInfo) {
      handleLogout("userDataMissing"); // Redirects to /login with message
      return;
    }

    // Only check firstTimeLogin for non-Enterprise users
    if (!isEnterpriseFromIShare && userData.firstTimeLogin == 0) {
      handleLogout("userDataMissing"); // Redirects to /login with message
      return;
    }

    // Check 2: If user data exists in redux state
    if (!reduxState.user) {
      // console.warn('Redux user state is missing');
      handleLogout("sessionCleared");
      return;
    }

    // Check 3: If user claims to be authenticated
    if (isAuthenticated()) {
      // Check 3a: If redux user data is empty (requirement 1)
      if (isReduxUserEmpty()) {
        // console.warn('Redux user data is empty - forcing logout');
        handleLogout("userDataMissing");
        return;
      }

      // Check 3b: If token is expired - 45 minutes (requirement 2)
      if (isTokenExpired()) {
        // console.warn('User token has expired (45 minutes) - forcing logout');
        handleLogout("tokenExpired");
        return;
      }
    } else {
      // User is not authenticated but trying to access protected page
      // console.warn('User not authenticated on protected page');
      handleLogout("sessionExpired");
      return;
    }
  };

  // Main effect for session monitoring
  useEffect(() => {
    // Only run if router is ready
    if (!router.isReady) {
      return;
    }

    // Get initial user ID when component mounts or router is ready
    const initialReduxState = localStorage.get("redux");
    const initialUserId = initialReduxState?.user?.user?._id || null;

    // Check session immediately
    checkSession();

    // Set up interval to check session validity every 30 seconds
    const interval = setInterval(() => {
      checkSession();
    }, 30000); // Check every 30 seconds

    // Listen for localStorage changes from other tabs/windows
    const handleStorageChange = (e) => {
      // console.log('🔄 Storage changed in another tab:', e.key);

      // Don't check if we're on a public page
      if (!requiresAuth()) {
        return;
      }

      // If redux state was cleared or changed in another tab
      if (e.key === "redux" || e.key === null) {
        // console.log('🔄 Redux state changed in another tab, checking session...');

        // Small delay to ensure localStorage is updated
        setTimeout(() => {
          const reduxState = localStorage.get("redux");

          // If localStorage was cleared (logout in another tab)
          if (!reduxState || !reduxState.user || !isAuthenticated()) {
            // console.warn('❌ Session cleared in another tab - logging out this tab');
            handleLogout("sessionCleared");
            return;
          }

          // Check if a different user logged in (user ID changed)
          const currentUserId = reduxState?.user?.user?._id;
          if (
            currentUserId &&
            initialUserId &&
            currentUserId !== initialUserId
          ) {
            // console.warn('🔄 Different user logged in another tab - switching to new user');

            // Show message that account is switching
            message.info("Account switched. Reloading...");

            // Force page reload to pick up the new user's data from localStorage
            // This will re-initialize the app with the new user's Redux state
            window.location.reload();
            return;
          }
        }, 100);
      }
    };

    // Add storage event listener for cross-tab synchronization
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router.pathname, router.isReady]); // Re-run when route changes or router becomes ready

  // Effect to handle route changes
  useEffect(() => {
    const handleRouteChange = (url) => {
      // console.log('🚀 Route changed to:', url);

      // Check session immediately on route change for protected pages
      setTimeout(() => {
        // Extract pathname without query parameters for comparison
        const pathname = url.split("?")[0];
        const isPublicRoute = PUBLIC_PAGE.some(p => pathname === p || pathname.startsWith(p + '/'));

        // console.log('🔍 Route change check - URL:', url);
        // console.log('🔍 Route change check - Pathname:', pathname);
        // console.log('🔍 Route change check - Is public?', isPublicRoute);

        if (!isPublicRoute) {
          // console.log('🔒 Protected route detected, checking session...');
          const reduxState = localStorage.get("redux");
          if (!reduxState || !reduxState.user || !isAuthenticated()) {
            // console.warn('❌ Session check failed on route change');
            handleLogout("sessionCleared");
          } else {
            // console.log('✅ Session valid on route change');
          }
        } else {
          // console.log('✅ Public route, no session check needed');
        }
      }, 100);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  // This component doesn't render anything visible
  return null;
};

// Global function to handle API token expiration (requirement 3)
// This will be used by the API interceptor
export const handleApiTokenExpiration = () => {
  if (typeof window !== "undefined") {
    // console.warn('API returned "Token has expired" - forcing logout');

    // Check if user is Enterprise from IShare before clearing data
    const reduxState = localStorage.get("redux");
    const isEnterpriseFromIShare = reduxState?.user?.user?.source === USER_SOURCE.ISHARE_ENTERPRISE;

    // Clear all session data
    clearAllSessionData();

    // Show message
    message.error("Your session has expired. Please login again.");

    // Redirect to login
    if (isEnterpriseFromIShare) {
      window.location.href = getIShareRedirectUrl();
    } else {
      window.location.href = "/login";
    }
  }
};

export default SessionTimeoutMonitor;
