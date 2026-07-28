# Polling & Interval Mindmap (Repo-Wide)

`Polling & Intervals (repo-wide)`
├─ React Query polling (refetchInterval)
│  ├─ useCreditBalance (`src/hooks/useCreditBalance.js`)
│  │  ├─ default intervalMs: 3000 (when poll=true)
│  │  ├─ `Layout.jsx`: poll=true, intervalMs=30000, enabled=Boolean(userId)
│  │  ├─ `CreditLogPage.jsx`: poll=false (no interval)
│  │  └─ `CreditBalance.jsx`: poll=false (no interval)
│  │  └─ Credit display rules (UI):
│  │     MasterHQ: show `amount - totalUsedbyOutlet`
│  │     Outlet: if `limit` is null → show `amount`, else show `used / limit Used`
│  ├─ useOutletBadgeCount (`src/hooks/useOutletBadgeCount.js`)
│  │  └─ `Layout.jsx`: poll=shouldPollOutlet, intervalMs=60000,
│  │     enabled=shouldPollOutlet && userIdentity==="masterHQ"
│  │     start when: sidebarVisible && expandedMenu==="outlet" && masterHQ
│  └─ useStats (`src/hooks/useStatsInfo.js`)
│     ├─ `Layout.jsx` (sidebar pending): poll=shouldPollShareAi, intervalMs=60000,
│     │  enabled=shouldPollShareAi
│     │  start when: sidebarVisible && expandedMenu==="shareai"
│     ├─ `TemplatesPage.jsx`: poll=true, intervalMs=60000, enabled=true
│     ├─ `PendingContentPage.jsx`: poll=true, intervalMs=30000, enabled=true
│     ├─ `BinPage.jsx`: poll=true, intervalMs=60000, enabled=true
│     └─ (no `DashboardPage.jsx` usage of useStats; it fetches counts in `getData()` on query change)
│
├─ Manual setInterval loops (data refresh / monitoring)
│  ├─ `TemplatesPage.jsx`: 60000ms; useEffect deps [page, filterGroup];
│  │  always while mounted; calls getData(...)
│  │
│  ├─ `PendingContentPage.jsx`: 30000ms; deps [page, filterGroup];
│  │  always while mounted; calls getData(...) + refreshSidebarStats()
│  │
│  ├─ `BinPage.jsx`: 60000ms; deps [page, filterGroup];
│  │  always while mounted; calls getData(...)
│  │
│  ├─ `CreditLogPage.jsx`: 30000ms; deps [page, selectedTab, user];
│  │  always while mounted; calls getData(...)
│  │
│  ├─ `SessionTimeoutMonitor.jsx`: 30000ms; starts when router.isReady;
│  │  checks session validity; re-initializes on route change
│  │
│  └─ `EmailVerificationDrawer.jsx`: 1000ms countdown; runs only while
│     countdown > 0; cleared when countdown hits 0 or unmount
│
└─ Recursive setTimeout polling
   └─ `AIAssistantFormV2.jsx`:
      ├─ pollProgress starts immediately
      ├─ interval starts at 1000ms
      ├─ after 30 polls -> 2000ms; after 60 polls -> 3000ms
      └─ on error: backoff up to 10000ms; stops on completed/failed/cancelled


> Note: There are additional one-off setTimeout UI delays (50–300ms, etc.)
> across the repo; these are not recurring polling loops.
