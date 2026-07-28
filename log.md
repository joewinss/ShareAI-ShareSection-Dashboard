# Changelog & Update History

## [Unreleased] - 2026-07-28

### 🎨 Design System & Visual Redesign
- **Light Mode UI**: Converted dark slate containers to a clean, bright light design system using slate accents (`text-slate-900`, `text-slate-500`), soft background surfaces (`bg-[#f8f9fc]`, `bg-white`), and `rounded-3xl` (24px) container corners.
- **Pill Sub-Navigation Tab Bar**: Implemented a horizontal Pill Tab Bar (`[ 🎟 Voucher ] [ Merchant Draw ] [ Monthly Mega Rewards ]`) in `MerchantDrawDashboard.jsx`.
- **Floating Bottom Navbar**: Styled floating `BottomNavbar.jsx` with active teal highlight (`bg-teal-600 text-white`).

---

### 🏪 Merchant Tab & Credit Points Pairing
- **Discount Vouchers**: Converted food item purchases into store discount vouchers (`RM10 OFF`, `RM5 OFF`, `20% OFF`) with minimum spend conditions and credit cost tags.
- **Paired Merchant Credits**: Added store paired credit points balance (`🪙 250 Pts Available`) on merchant headers, credit cost tags, and top **My Merchant Credits** summary banner.
- **Header Alignment**: Adjusted top ribbon padding and alignment (`px-3.5 py-2`) to prevent credit pill clipping.

---

### 🎟 Responsive Pic'Arts Voucher Ticket System (`UserVoucherTab.jsx`)
- **2-Part Ticket Layout**: Implemented a responsive 70%/30% ticket card split (70% main banner / 30% white action stub).
- **Responsive Tear Line & Cutouts**: Positioned tear-line perforation cutouts dynamically at `right-[28%] / right-[30%]` for seamless alignment on mobile and tablet screens.
- **Outer Border Removal**: Removed outside border lines (`border-none` / `border-transparent`) and replaced them with soft drop shadows (`shadow-[0_10px_30px_rgba(15,23,42,0.05)]`).
- **Cleaned Left Banner & Stub**:
  - Removed duplicate `RM 12.00` text overlay from left image banner; rebate value is cleanly focused on the right stub.
  - Removed text clutter (`TICKET STUB`, SVG barcode graphic, `#B555K207`) from the right stub.

---

### 🏠 Home Tab Enhancements (`HomeTab.jsx`)
- **Teal/Emerald Hero Card**: Updated hero banner from dark slate to bright teal/emerald gradient (`from-teal-700 via-emerald-600 to-teal-600`).
- **3-Step Lucky Draw Guide**: Added a **How to Join Lucky Draw** quick guide card:
  1. *Visit & Share Store Content* 📱
  2. *Spin the Wheel for Vouchers* 🎡
  3. *Redeem Instant Cash Rebates* 🎟

---

### 🏪 Merchant Detail & Drop Review Feature (`MerchantDetailModal.jsx`)
- **Store Detail View**: Clicking any merchant card opens a full detail modal view with store info, ratings (`2.5 ⭐`), distance, and open status.
- **Full-Width Hero Cover Banner**: Replaced small 3-photo grid boxes with a full-width **Merchant Hero Cover Banner** showcasing food categories (Burgers 🍔, Fries 🍟, Nuggets 🍗, Drinks 🥤).
- **Dual Sub-Tabs**: Added `Voucher` (list of active discount vouchers) vs `Reviews` (customer review list and rating stats).
- **Interactive Drop a Review**:
  - Added a **"How was your experience? Write a review"** callout box.
  - Interactive **Drop a Review Modal** featuring a 5-star rating selector (`⭐ ⭐ ⭐ ⭐ ⭐`), user display name, comment textarea, and dynamic submit handler.
- **Fixed Icon Overflow**: Replaced cramped `<span>Voucher</span>` text in `w-12 h-12` icon boxes with a centered `<Ticket className="w-6 h-6 text-white" />`.

---

### 📁 Modified Files
- [`src/components/shareContent/merchantDraw/dashboard/MerchantDrawDashboard.jsx`](file:///Users/joewintan/Documents/share-ai-app-staging/src/components/shareContent/merchantDraw/dashboard/MerchantDrawDashboard.jsx)
- [`src/components/shareContent/merchantDraw/dashboard/HomeTab.jsx`](file:///Users/joewintan/Documents/share-ai-app-staging/src/components/shareContent/merchantDraw/dashboard/HomeTab.jsx)
- [`src/components/shareContent/merchantDraw/dashboard/MerchantTab.jsx`](file:///Users/joewintan/Documents/share-ai-app-staging/src/components/shareContent/merchantDraw/dashboard/MerchantTab.jsx)
- [`src/components/shareContent/merchantDraw/dashboard/UserVoucherTab.jsx`](file:///Users/joewintan/Documents/share-ai-app-staging/src/components/shareContent/merchantDraw/dashboard/UserVoucherTab.jsx)
- [`src/components/shareContent/merchantDraw/dashboard/BottomNavbar.jsx`](file:///Users/joewintan/Documents/share-ai-app-staging/src/components/shareContent/merchantDraw/dashboard/BottomNavbar.jsx)
- [`src/components/shareContent/merchantDraw/dashboard/MerchantDetailModal.jsx`](file:///Users/joewintan/Documents/share-ai-app-staging/src/components/shareContent/merchantDraw/dashboard/MerchantDetailModal.jsx) *(NEW)*

---

### 🎯 LuckyDraw Flow Page Redesign & Mission Flow (`/shareSection/luckyDraw`)
- **Flow Bottom Navbar (`FlowBottomNavbar.jsx`)**: Implemented floating glassmorphic navigation bar with `[ 🏠 Home ]` and `[ 📄 Details ]` tab buttons.
- **Mission Flow Home Tab (`MerchantDrawFlowPage.jsx`)**:
  - **1. Monthly Mega Draw**: Added mission cards container (`Submit spending proof`, `Spin Merchant Wheel`, `Draw Voucher Capsule`, `Check Prize Wallet`) with `Click here to view full Campaign Details & Prize List >` link pill.
  - **2. Instant Win Rewards**: Embedded games section (Lucky Wheel & Capsule Machine) and Flash Voucher Highlights cards (`RM5 Off Rebate`, `15% Storewide Promo`).
  - **3D Animated Gift Icon**: Integrated floating SVG `<GiftIcon>` animation with bobbing lid movement, glowing ribbon shimmer, and interactive click handler.
- **UX-Enhanced Details Tab**:
  - Added campaign hero banner image (`public/campaign-hero.png`).
  - Implemented Touch 'n Go style structured Prize List table (`No.` | `Prize` | `Type`).
  - Added expandable Accordion cards for **Terms & Conditions** and **FAQ**.
  - Added primary blue `Join Now` action button linking back to the Home tab.

---

### 📁 Newly Modified Files
- [`src/components/shareContent/merchantDraw/components/FlowBottomNavbar.jsx`](file:///Users/joewintan/Documents/share-ai-app-staging/src/components/shareContent/merchantDraw/components/FlowBottomNavbar.jsx) *(NEW)*
- [`src/components/shareContent/merchantDraw/page/MerchantDrawFlowPage.jsx`](file:///Users/joewintan/Documents/share-ai-app-staging/src/components/shareContent/merchantDraw/page/MerchantDrawFlowPage.jsx)
- [`public/campaign-hero.png`](file:///Users/joewintan/Documents/share-ai-app-staging/public/campaign-hero.png) *(NEW)*
- [`log.md`](file:///Users/joewintan/Documents/share-ai-app-staging/log.md)

