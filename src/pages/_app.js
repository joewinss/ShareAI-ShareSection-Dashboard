import "@/styles/globals.css";
import "@/styles/overwrite.css";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import { Provider } from 'react-redux';
import { wrapper } from "@/redux/store";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Spin } from 'antd';
import { LoadingOutlined } from "@ant-design/icons";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import SessionTimeoutMonitor from "@/components/general/SessionTimeoutMonitor";
import mixpanel from "mixpanel-browser";
import client, { ENV_VAL } from "../../env";
import Script from "next/script";

// Suppress useLayoutEffect warning for Ant Design SSR
if (typeof window === 'undefined') {
  React.useLayoutEffect = React.useEffect;
}

// Suppress console warnings for useLayoutEffect during SSR
if (typeof window === 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('useLayoutEffect does nothing on the server')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
}

export default function App({ Component, pageProps }) {
  const { store } = wrapper.useWrappedStore({ pageProps });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [queryClient] = useState(() => new QueryClient());
  const { t } = useTranslation();
  const isLoginPage = router.pathname === '/login';
  const isShareSection = router.pathname.startsWith('/shareSection');
  const trackedDistinctIdRef = useRef(null);
  const { mixpanelToken, env } = client.uri;

  useEffect(() => {
    const handleRouteChange = (url) => {
      // Track in Mixpanel
      if (mixpanelToken && (env === ENV_VAL.LIVE || env === ENV_VAL.STAGING)) {
        mixpanel.track("Page View", { path: url });
      }

      // Notify GTM (for GA4)
      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'pageview',
          page_path: url,
        });
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [env, mixpanelToken, router.events]);

  useEffect(() => {
    if (!mixpanelToken || (env !== ENV_VAL.LIVE && env !== ENV_VAL.STAGING)) {
      return;
    }

    mixpanel.init(mixpanelToken, {
      autocapture: true,
      record_sessions_percent: 100,
      record_mask_all_text: false, // unmask text globally
      record_mask_all_inputs: false, // keep inputs show (dl: Password wont show)
      debug: true
    });

    const handleRouteChange = (url) => {
      // send through GTM dataLayer first
      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'page_view', page_path: url });
      }
      mixpanel.track("Page View", { path: url });
    };

    const syncMixpanelIdentity = () => {
      const state = store.getState();
      const userState = state?.user;
      const user = userState?.user || {};
      const isAuthenticated = Boolean(userState?.isAuthenticated);

      if (!isAuthenticated) {
        if (trackedDistinctIdRef.current) {
          console.log("[Mixpanel Debug] unauthenticated -> mixpanel.reset()");
          // push session_end before resetting
          if (typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'session_end', user_id: trackedDistinctIdRef.current });
          }
          mixpanel.reset();
          trackedDistinctIdRef.current = null;
        }
        return;
      }
      const distinctId = user?._id
      if (!distinctId) {
        console.log("[Mixpanel Debug] _id missing, skip identify");
        return;
      }

      if (trackedDistinctIdRef.current === distinctId) {
        return;
      }

      // push login event and session start into dataLayer
      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'user_login',
          user_id: distinctId,
          user_email: user?.businessInfo?.businessEmail,
          user_name: user?.username,
        });
        window.dataLayer.push({ event: 'session_start', user_id: distinctId });
      }

      mixpanel.identify(distinctId);
      mixpanel.people.set({
        $email: user?.businessInfo?.businessEmail,
        $name: user?.username,
      });
      console.log("[Mixpanel Debug] identify + people.set sent for _id:", distinctId);

      trackedDistinctIdRef.current = distinctId;
    };

    handleRouteChange(router.asPath);
    router.events.on("routeChangeComplete", handleRouteChange);

    syncMixpanelIdentity();
    const unsubscribe = store.subscribe(syncMixpanelIdentity);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
      unsubscribe();
    };
  }, [env, mixpanelToken, router, store]);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);
  const gradientSpinIcon = (
    <LoadingOutlined
      style={{
        fontSize: 32,
        background: 'linear-gradient(to right, #22c55e, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: '#22c55e', // fallback for browsers that don't support gradient text
      }}
      spin
    />
  );
  return (
    <Provider store={store}>
      {env === ENV_VAL.LIVE || env === ENV_VAL.STAGING && (
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NJ5VH82X');
          `}
        </Script>
      )}
      <QueryClientProvider client={queryClient}>
        <SessionTimeoutMonitor />
        {isLoginPage || isShareSection ? (
          <Component {...pageProps} />
        ) : (
          <div className="min-h-screen bg-gray-50">
            <Layout>
              <Spin spinning={loading} size="large" tip={t("loading", sourceKey.user)} wrapperClassName="w-full h-full" indicator={gradientSpinIcon}>
                <Component {...pageProps} />
              </Spin>
            </Layout>
          </div>
        )}
        <Toaster />
      </QueryClientProvider>
    </Provider>
  );
}
