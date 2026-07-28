// utils/detectOS.js
export const detectOS = () => {
  if (typeof window === "undefined") return "Other";

  const ua = navigator.userAgent || navigator.vendor || window.opera || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  // Normalize once for easier matching
  const userAgent = ua.toLowerCase();
  const devicePlatform = platform.toLowerCase();

  // iPhone / iPad / iPod
  if (/iphone|ipad|ipod/.test(userAgent)) return "iOS";

  // iPadOS 13+ (Safari reports MacIntel)
  if (devicePlatform === "macintel" && maxTouchPoints > 1) {
    return "iOS";
  }

  // HarmonyOS
  if (/harmonyos|openharmony/.test(userAgent)) return "HarmonyOS";

  // MagicOS (HONOR)
  // Some devices may expose MAGICOS / MagicUI / HONOR-related identifiers
  if (/magicos|magicui/.test(userAgent)) return "MagicOS";

  // Samsung OS layer
  // Samsung devices are still Android underneath, but this gives you a branded result
  if (/samsungbrowser|sm-|galaxy/.test(userAgent)) return "Samsung";

  // Xiaomi / HyperOS / MIUI
  if (/hyperos|miui|redmi|mi |poco/.test(userAgent)) return "Xiaomi";

  // OPPO / ColorOS / Realme
  if (/coloros|oppo|cph|realme|rmx/.test(userAgent)) return "ColorOS";

  // vivo / iQOO / FuntouchOS / OriginOS
  if (/funtouch|originos|vivo|iqoo|pd[0-9]/.test(userAgent)) return "FuntouchOS";

  // OnePlus / OxygenOS
  if (/oxygenos|oneplus|hd19|le2|cp[h0-9]/.test(userAgent)) return "OxygenOS";

  // Huawei EMUI (non-Harmony branding)
  if (/emui|huawei/.test(userAgent)) return "EMUI";

  // Generic Android fallback
  if (/android|linux/.test(userAgent)) return "Android";

  // Desktop / unknown fallback
  return "Other";
};