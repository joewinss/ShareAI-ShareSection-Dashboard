import { sourceKey } from "@/locales/config";
import { MousePointer2, Pointer } from "lucide-react";
import { useEffect, useState } from "react";

const DEFAULT_GUIDE_POS = { x: -140, y: -140 };
const GUIDE_INTERACTIVE_SELECTOR = "button, textarea, img, [data-guide-interactive='true']";
const BUBBLE_WIDTH = 170;
const BUBBLE_HEIGHT = 52;
const SCREEN_PADDING = 10;

const interpolateGuideTemplate = (template, values = {}) =>
  String(template || "").replace(/\$\{(\w+)\}/g, (_, key) => String(values?.[key] ?? ""));

export const getGuideCopy = (t, key, fallback, values = {}) => {
  const translated = t(key, sourceKey.user);
  const template = translated && translated !== key ? translated : fallback;
  return interpolateGuideTemplate(template, values);
};

export const getGuideLanguageName = (t, languageKey) => {
  switch (languageKey) {
    case "english":
      return getGuideCopy(t, "nTguideLanguageEnglish", "ENGLISH");
    case "chinese":
      return getGuideCopy(t, "nTguideLanguageChinese", "CHINESE");
    case "malay":
      return getGuideCopy(t, "nTguideLanguageMalay", "MALAY");
    default:
      return String(languageKey || "").toUpperCase();
  }
};

export const getGuideStepName = (t, stepKey) => {
  switch (stepKey) {
    case "platform":
      return getGuideCopy(t, "nTguideStepPlatform", "PLATFORM");
    case "language":
      return getGuideCopy(t, "nTguideStepLanguage", "LANGUAGE");
    case "category":
      return getGuideCopy(t, "nTguideStepCategory", "CATEGORY");
    case "image":
      return getGuideCopy(t, "nTguideStepImage", "IMAGE");
    case "content":
      return getGuideCopy(t, "nTguideStepContent", "MESSAGE");
    case "publish":
      return getGuideCopy(t, "nTguideStepPublish", "PUBLISH");
    default:
      return String(stepKey || "").toUpperCase();
  }
};

export const useReferenceGuidePosition = ({
  active = true,
  targetId = null,
  forceBubbleDir = null,
  scrollContainerId = null,
  resetOnInactive = true,
  watch = [],
}) => {
  const [guidePos, setGuidePos] = useState(DEFAULT_GUIDE_POS);
  const [bubbleDir, setBubbleDir] = useState("top");
  const [isFlying, setIsFlying] = useState(false);

  useEffect(() => {
    if (!active || !targetId || typeof window === "undefined") {
      if (resetOnInactive) {
        setGuidePos(DEFAULT_GUIDE_POS);
      }
      setIsFlying(false);
      return undefined;
    }

    let animationFrameId;
    let flyTimer;
    let safeDirection = null;
    let cancelled = false;
    const startTime = performance.now();

    const updatePosition = () => {
      if (cancelled) return;

      const element = document.getElementById(targetId);

      if (element) {
        const rect = element.getBoundingClientRect();
        const isSmallTarget = rect.width < 100;
        const isLeftAnchoredTarget = targetId === "btn-save-current" && forceBubbleDir !== "bottom";
        const targetX =
          isLeftAnchoredTarget
            ? rect.left + (isSmallTarget ? 15 : 25)
            : rect.right - (isSmallTarget ? 15 : 25);
        const targetY = rect.bottom - (isSmallTarget ? 10 : 20);

        setGuidePos({ x: targetX, y: targetY });

        if (forceBubbleDir) {
          safeDirection = forceBubbleDir;
          setBubbleDir(forceBubbleDir);
        } else if (!safeDirection) {
          const candidates = {
            top: {
              left: targetX - BUBBLE_WIDTH / 2,
              right: targetX + BUBBLE_WIDTH / 2,
              top: targetY - BUBBLE_HEIGHT - 30,
              bottom: targetY - 30,
            },
            left: {
              left: targetX - BUBBLE_WIDTH - 30,
              right: targetX - 30,
              top: targetY - BUBBLE_HEIGHT / 2,
              bottom: targetY + BUBBLE_HEIGHT / 2,
            },
            right: {
              left: targetX + 40,
              right: targetX + BUBBLE_WIDTH + 40,
              top: targetY - BUBBLE_HEIGHT / 2,
              bottom: targetY + BUBBLE_HEIGHT / 2,
            },
            bottom: {
              left: targetX - BUBBLE_WIDTH / 2,
              right: targetX + BUBBLE_WIDTH / 2,
              top: targetY + 40,
              bottom: targetY + BUBBLE_HEIGHT + 40,
            },
          };

          const interactiveRects = Array.from(document.querySelectorAll(GUIDE_INTERACTIVE_SELECTOR))
            .filter((node) => node?.id && node.id !== targetId && node.getClientRects().length > 0)
            .map((node) => node.getBoundingClientRect());

          const isWithinViewport = (box) =>
            box.left > SCREEN_PADDING &&
            box.right < window.innerWidth - SCREEN_PADDING &&
            box.top > SCREEN_PADDING &&
            box.bottom < window.innerHeight - SCREEN_PADDING;

          const avoidsObstacles = (box) =>
            !interactiveRects.some(
              (rectBox) =>
                !(box.right < rectBox.left || box.left > rectBox.right || box.bottom < rectBox.top || box.top > rectBox.bottom)
            );

          const preferenceOrder = ["top", "left", "right", "bottom"];

          for (const direction of preferenceOrder) {
            if (isWithinViewport(candidates[direction]) && avoidsObstacles(candidates[direction])) {
              safeDirection = direction;
              break;
            }
          }

          if (!safeDirection) {
            for (const direction of preferenceOrder) {
              if (isWithinViewport(candidates[direction])) {
                safeDirection = direction;
                break;
              }
            }
          }

          setBubbleDir(safeDirection || "top");
        }
      }

      if (performance.now() - startTime < 400) {
        animationFrameId = requestAnimationFrame(updatePosition);
      }
    };

    setIsFlying(true);
    updatePosition();

    flyTimer = window.setTimeout(() => {
      if (!cancelled) {
        setIsFlying(false);
      }
    }, 600);

    const scrollElement = scrollContainerId ? document.getElementById(scrollContainerId) : null;
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    if (scrollElement) {
      scrollElement.addEventListener("scroll", updatePosition);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(flyTimer);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", updatePosition);
      }
    };
  }, [active, forceBubbleDir, resetOnInactive, scrollContainerId, targetId, ...watch]);

  return {
    bubbleDir,
    guidePos,
    isFlying,
  };
};

export const ReferenceGuideOverlay = ({
  active = true,
  bubbleDir = "top",
  guidePos = DEFAULT_GUIDE_POS,
  gradientId = "guide-gradient",
  isFlying = false,
  text = "",
  zIndex = 9999,
}) => {
  if (!active || !text) {
    return null;
  }

  let bubbleClass = "";
  let tailClass = "";

  switch (bubbleDir) {
    case "bottom":
      bubbleClass = "top-[45px] left-1/2 -translate-x-1/2 origin-top";
      tailClass =
        "absolute bottom-full -mb-[2px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-t-2 border-l-2 border-slate-700 rotate-45";
      break;
    case "left":
      bubbleClass = "right-full mr-6 top-[-5px] -translate-y-1/2 origin-right";
      tailClass =
        "absolute left-full -ml-[2px] top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 border-t-2 border-r-2 border-slate-700 rotate-45";
      break;
    case "right":
      bubbleClass = "left-[45px] top-[-5px] -translate-y-1/2 origin-left";
      tailClass =
        "absolute right-full -mr-[2px] top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 border-b-2 border-l-2 border-slate-700 rotate-45";
      break;
    case "top":
    default:
      bubbleClass = "bottom-full mb-6 left-1/2 -translate-x-1/2 origin-bottom";
      tailClass =
        "absolute top-full -mt-[2px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-b-2 border-r-2 border-slate-700 rotate-45";
      break;
  }

  return (
    <>
      <style>
        {`
          @keyframes guide-hover {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-guide-hover {
            animation: guide-hover 2s ease-in-out infinite;
          }
        `}
      </style>
      <div
        className="fixed pointer-events-none"
        style={{
          top: 0,
          left: 0,
          zIndex,
          transform: `translate(${guidePos.x}px, ${guidePos.y}px)`,
          transition: isFlying ? "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)" : "none",
        }}
      >
        <div className={isFlying ? "" : "animate-guide-hover"}>
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop stopColor="#15803d" offset="0%" />
                <stop stopColor="#06b6d4" offset="50%" />
                <stop stopColor="#1e40af" offset="100%" />
              </linearGradient>
            </defs>
          </svg>

          <div
            className={`absolute bg-slate-900 text-white px-4 py-2 border-2 border-slate-700 rounded-xl font-extrabold uppercase tracking-wide text-xs shadow-xl whitespace-nowrap transition-all duration-300 ${bubbleClass} ${isFlying ? "opacity-0 scale-50" : "opacity-100 scale-100"}`}
          >
            {text}
            <div className={tailClass}></div>
          </div>

          <div className="relative">
            <div
              className={`absolute top-0 left-0 transition-all duration-300 origin-top-left drop-shadow-2xl ${isFlying ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-12"}`}
              style={{ transform: "translate(-8px, -8px)" }}
            >
              <MousePointer2 size={40} fill={`url(#${gradientId})`} color="white" strokeWidth={1.5} />
            </div>
            <div
              className={`absolute top-0 left-0 transition-all duration-300 origin-top-left drop-shadow-2xl ${isFlying ? "opacity-0 scale-50 -rotate-12" : "opacity-100 scale-100 rotate-0"}`}
              style={{ transform: "translate(-15px, -3px)" }}
            >
              <Pointer size={40} fill={`url(#${gradientId})`} color="white" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
