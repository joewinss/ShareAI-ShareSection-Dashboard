# VisualPageV2 — Right-Click Menu & Toolbar

## Toolbar

The toolbar lives in the page header (`<header>`). Buttons appear conditionally based on selection state and feature flags.

### Always Visible

| Button | Action |
|---|---|
| **Refresh** | Reloads all four sections (completed, processing, waiting, failed) and clears any selection |

### Visible When ≥1 Image Selected (`hasSelection`)

| Button | Condition | Action |
|---|---|---|
| **View** | always (when selected) | Opens `ViewSelectedVisual` drawer showing selected images |
| **Add Image Pool** | always (when selected) | Opens `TagToImagePool` modal; clears selection on complete |
| **Download** | always (when selected) | Opens `DonwloadAiVisual` modal |
| **Send to Similar** | `isSimilarModeActive && sendToSimilarUrl` | Navigates to `/hq/upload?mode=Similar&preloadUrl=<url>` only when exactly **one selected image** is a product image |

> `isSimilarModeActive` is true when a Visual Category with `title === "Similar"` exists and has status `ACTIVE`.  
> `lastSelectedProductUrl` still keeps the previous behavior: the most recently selected image whose `visualIndustryCode` is `product`.  
> `sendToSimilarUrl` uses the new behavior: it is only valid when exactly one image is selected and that image is a product.

---

## Right-Click Context Menu

A custom context menu that appears over completed visual cards.

### Trigger Conditions

All three must be true for the menu to appear:

1. `isSimilarModeActive` is `true`
2. The card's `visualIndustryCode` is `product` (case-insensitive)
3. User right-clicks the card

### Menu Items

| Item | Action |
|---|---|
| **Send to Similar** | Clears current selection, closes the menu, navigates to `/hq/upload?mode=Similar&preloadUrl=<url>` |

### Close Behaviour

| Trigger | Result |
|---|---|
| Left-click anywhere | Menu closes |
| Right-click another product card | Menu closes and immediately reopens at the new card (single right-click) |
| Right-click a non-product / empty area | Menu closes, native browser menu is suppressed |
| Clicking "Send to Similar" | Menu closes and navigates |

### Implementation Notes

The menu does **not** use an overlay div. Instead, it registers document-level event listeners via `useEffect` that are active only while the menu is visible:

- `click` (bubble phase) — closes the menu on any left-click outside
- `contextmenu` (capture phase) — closes the menu before the card's own `onContextMenu` handler fires

Using **capture phase** for the `contextmenu` listener is what enables single-right-click switching between cards. The sequence when right-clicking card B while card A's menu is open:

1. Document capture listener fires → `setContextMenu({ visible: false })`
2. Card B's `onContextMenu` fires → `setContextMenu({ visible: true, x, y, imageUrl: B })`
3. React 18 batches both updates → final state: menu open at card B

Both listeners are cleaned up when the menu closes (effect cleanup).