import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { connect } from 'react-redux';
import { Badge, message } from 'antd';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import FullScreenNav from '@/components/FullScreenNav';
import useIsCollapsed from '@/components/useIsCollapsed';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import {
  DashboardIcon,
  KnowledgeBaseIcon,
  OutletIcon,
  SettingIcon,
  ShareAiIcon,
  Upload,
} from '../../public/assets';
import { useCreditBalance } from '@/hooks/useCreditBalance';
import { useOutletBadgeCount } from '@/hooks/useOutletBadgeCount';
import { useStats } from '@/hooks/useStatsInfo';
import {
  logoutSuccessful,
  updateLoginTime,
  updateUser,
} from '@/redux/actions/user-actions';
import { CONTENT_STATUS } from "@/constant/template";
import { USER_SOURCE, USER_STATUS } from '@/constants/user';
import OnboardingSetupDrawer from '@/components/onboarding/OnboardingSetupDrawer';
import CreditLowPopup from '@/components/general/CreditLowPopup';

const Layout = (props) => {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    user,
    logoutSuccessful: onLogoutSuccessful,
  } = props;
  const [loading, setLoading] = useState(false);
  const isCollapsed = useIsCollapsed();
  const [isFullScreenNavOpen, setIsFullScreenNavOpen] = useState(false);
  const userIdentity = user?.user?.role;
  const userId = user?.user?._id;
  const outletUserId = user?._id;
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [onboardingDrawerOpen, setOnboardingDrawerOpen] = useState(false);

  // Show onboarding setup for outlet users who haven't filled business info
  useEffect(() => {
    if (
      userIdentity === "outlet" &&
      userId &&
      !user?.user?.businessInfo?.industry &&
      !user?.user?.businessInfo?.businessDescription
    ) {
      const key = `onboarding_shown_${userId}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        setOnboardingDrawerOpen(true);
      }
    }
  }, [userIdentity, userId, user?.user?.businessInfo?.industry, user?.user?.businessInfo?.businessDescription]);

  const { data: creditData } = useCreditBalance({
    poll: true,
    intervalMs: 30000,
    enabled: Boolean(userId),
  });

  // Hide sidebar/header for pages that use a multi-select full-page layout
  const hideLayout = (router.asPath || router.pathname || '').includes('multi-select');
  const sidebarVisible = !isCollapsed && !hideLayout;
  const shouldPollShareAi = sidebarVisible && expandedMenu === "shareai";
  const shouldPollOutlet = sidebarVisible && expandedMenu === "outlet" && userIdentity === "masterHQ";

  const { data: outletBadgeData } = useOutletBadgeCount({
    poll: shouldPollOutlet,
    intervalMs: 60000,
    enabled: shouldPollOutlet && userIdentity === "masterHQ",
    refetchOnMount: 'always',
    query: { Status: USER_STATUS.INACTIVE },
  });
  const outletBadgeCount = outletBadgeData?.outletBadgeCount || 0;

  const { data: shareAiStatsData } = useStats({
    poll: shouldPollShareAi,
    intervalMs: 60000,
    enabled: shouldPollShareAi,
    refetchOnMount: 'always',
    query: {
      status: CONTENT_STATUS.PENDING_REVIEW,
      ...(userIdentity === "outlet" ? { outletUserId } : {}),
    },
    scopeKey: "sidebar",
  });
  const totalPendingCount = shareAiStatsData?.data?.contentSummary?.totalPending || 0;

  const handleLogout = useCallback(() => {
    // If user is from IShare Enterprise, redirect back to IShare instead of logging out
    if (user?.user?.source === USER_SOURCE.ISHARE_ENTERPRISE) {
      onLogoutSuccessful();
      window.location.href = getIShareRedirectUrl();
      return;
    }

    onLogoutSuccessful();
    router.push('/login');
  }, [onLogoutSuccessful, router]);


  const menuItems = useMemo(() => ([
    {
      icon: DashboardIcon,
      label: 'Dashboard',
      path: '/',
      id: 'dashboard'
    },
    {
      icon: ShareAiIcon,
      label: t("content", sourceKey.user),
      path: "/templates",
      id: "shareai",
      submenu: [
        {
          label: t("live", sourceKey.user),
          path: "/templates/live",
        },
        {
          label: (
            <div className="flex items-center">
              {t("pendingReview", sourceKey.user)}
              {totalPendingCount > 0 && (
                <Badge
                  count={totalPendingCount}
                  size="small"
                  className="ml-2"
                  title="Total Pending Review"
                  style={{
                    boxShadow: "none",
                    border: "none",
                  }}
                />
              )}
            </div>
          ),
          path: "/templates/pending-review",
        },
        {
          label: t("bin", sourceKey.user),
          path: "/templates/bin",
        },
        {
          label: t("presetTemplate", sourceKey.user),
          path: "/templates/preset",
        },
        {
          label: t("categorySetting", sourceKey.user),
          path: "/knowledgeBase/category"
        },
        {
          label: t("autoModeListing", sourceKey.user),
          path: "/autoGen/autoGenListing"
        },
        // ...(hasImage
        //   ? [{
        //     label: t("imagePool", sourceKey.user),
        //     path: "/image-pool/image-pool",
        //   }]
        //   : []),
        { label: t("nTlog", sourceKey.user), path: "/templates/log" }
      ],
    },
    {
      icon: Upload,
      label: t('AiVisual', sourceKey.user),
      path: '/hq',
      id: 'upload',
      submenu: [
        { label: t("visualPool", sourceKey.user), path: '/hq/visual' },
        { label: t("upload", sourceKey.user), path: '/hq/upload' }
      ]
    },
    {
      icon: KnowledgeBaseIcon,
      label: t("luckyDraw", sourceKey.user),
      path: '/lucky-draw',
      id: 'luckydraw',
      submenu: [
        { label: t("luckyDrawManagement", sourceKey.user), path: '/lucky-draw/merchant' },
        { label: t("activityLog", sourceKey.user), path: '/lucky-draw/global' },
        { label: t("globalDrawSetting", sourceKey.user), path: '/lucky-draw/setting' },
      ],
    },
    ...(userIdentity === "masterHQ"
      ? [
        {
          icon: OutletIcon,
          label: t("outlet", sourceKey.user),
          path: "/hq",
          id: "outlet",
          submenu: [
            {
              label: (
                <div className="flex items-center">
                  {t("outlet", sourceKey.user)}
                  {outletBadgeCount > 0 && (
                    <Badge
                      count={outletBadgeCount}
                      size="small"
                      className="ml-2"
                      title="Total Inactive Outlet"
                      style={{
                        boxShadow: "none",
                        border: "none",
                      }}
                    />
                  )}
                </div>
              ),
              path: "/hq/outlet-listing",
            },
          ],
        },
      ] : []),
    {
      icon: SettingIcon,
      label: t("settings", sourceKey.user),
      path: "/settings",
      id: "settings",
      submenu: [
        ...(userIdentity !== "masterHQ"
          ? [
            {
              label: t("platformSetting", sourceKey.user),
              path: "/settings/platform-listing",
            },
          ]
          : []),
        {
          label: t("profileSetting", sourceKey.user),
          path: "/settings/profile",
        },
      ],
    },
  ].filter(Boolean)), [
    // hasImage,
    totalPendingCount, outletBadgeCount, userIdentity]);

  const menuItemsRef = useRef(menuItems);
  useEffect(() => {
    menuItemsRef.current = menuItems;
  }, [menuItems]);

  useEffect(() => {
    if (!isCollapsed) {
      setIsFullScreenNavOpen(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    setIsFullScreenNavOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    const currentPath = router.pathname;
    const activeMenu = menuItemsRef.current.find((item) => {
      if (item.submenu) {
        return item.submenu.some((sub) => {
          const subPathname = sub.path.split("?")[0];
          return currentPath.startsWith(subPathname);
        });
      }
      return currentPath === item.path;
    });

    if (activeMenu && activeMenu.submenu) {
      setExpandedMenu(activeMenu.id);
    }
  }, [router.pathname]);

  // useEffect(() => {
  //   const currentPath = router.pathname;
  //   if (userIdentity === "outlet" && currentPath.includes("/hq")) {
  //     message.error(t('noAccessToThisPage', sourceKey.user) || "You don't have permission to access this page");
  //     router.back();
  //   }
  // }, [router.pathname, userIdentity, t, router]);


  // Add route change event listeners for loading state
  useEffect(() => {
    // Handler to show loading indicator when route begins to change
    const handleRouteChangeStart = () => {
      setLoading(true);
    };

    // Handler to hide loading indicator when route change is complete
    const handleRouteChangeComplete = () => {
      setLoading(false);
    };

    // Handler for route change errors
    const handleRouteChangeError = () => {
      setLoading(false);
    };

    // Subscribe to router events
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    // Cleanup event listeners on component unmount
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);

  const sidebarWidth = !hideLayout && !isCollapsed ? "256px" : "0px";

  return (
    <div
      className="flex h-screen bg-gray-50"
      style={{ "--sidebar-width": sidebarWidth }}
    >
      {!hideLayout && !isCollapsed && (
        <Sidebar
          menuItems={menuItems}
          user={user}
          expandedMenu={expandedMenu}
          onExpandedMenuChange={setExpandedMenu}
        />
      )}
      {!hideLayout && isCollapsed && (
        <FullScreenNav
          isOpen={isFullScreenNavOpen}
          menuItems={menuItems}
          onClose={() => setIsFullScreenNavOpen(false)}
          onLogout={handleLogout}
          user={user}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!hideLayout && (
          <Header
            isCollapsed={isCollapsed}
            onToggleNav={() => setIsFullScreenNavOpen((open) => !open)}
            onLogout={handleLogout}
          />
        )}
        <main
          id="app-scroll-container"
          className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-3"
        >
          {props.children}
        </main>
      </div>
      {userIdentity === "outlet" && (
        <OnboardingSetupDrawer
          open={onboardingDrawerOpen}
          onClose={() => setOnboardingDrawerOpen(false)}
          onSuccess={() => setOnboardingDrawerOpen(false)}
        />
      )}
      <CreditLowPopup
        isCollapsed={isCollapsed}
        credits={creditData?.data || []}
        role={userIdentity}
        userId={userId}
      />
    </div>
  );
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
