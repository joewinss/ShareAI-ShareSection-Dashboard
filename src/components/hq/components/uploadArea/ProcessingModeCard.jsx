import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronsLeftRight,
  Clock,
  Coins,
} from "lucide-react";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";

const selectedGradient = "bg-gradient-to-r from-green-500 to-blue-500";

const ProcessingModeCard = ({
  modeOption,
  isSelected,
  isLoading,
  onSelect,
  onProceed,
}) => {
  const [sliderPosition, setSliderPosition] = useState(15);
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sliderDragActiveRef = useRef(false);
  const sliderTrackRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Reset slider when a new card is selected
    if (isSelected) {
      setSliderPosition(15);
    }
  }, [isSelected]);

  const updateSliderFromEvent = (event) => {
    const track = sliderTrackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (!rect.width) return;
    const next = ((event.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(100, Math.max(0, next));
    setSliderPosition(clamped);
  };

  const handleSliderPointerDown = (event) => {
    if (!isSelected) return;
    event.stopPropagation();
    sliderDragActiveRef.current = true;
    setIsSliderDragging(true);
    sliderTrackRef.current = event.currentTarget.closest("[data-slider-track]");
    event.currentTarget.setPointerCapture(event.pointerId);
    updateSliderFromEvent(event);
  };

  const handleSliderPointerMove = (event) => {
    if (!isSelected || !sliderDragActiveRef.current) return;
    updateSliderFromEvent(event);
  };

  const handleSliderPointerUp = (event) => {
    if (!isSelected || !sliderDragActiveRef.current) return;
    sliderDragActiveRef.current = false;
    setIsSliderDragging(false);
    sliderTrackRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const afterImage = modeOption.after;
  const beforeImage = modeOption.before;
  const sliderValue = isSelected ? sliderPosition : 75;
  const effectiveSliderValue = isSelected ? sliderPosition : isHovered ? 15 : 75;
  const isShowingGenerated = effectiveSliderValue < 50;
  const creditSuffix =
    typeof modeOption.credits === "number" && modeOption.credits > 1
      ? "Credits"
      : "Credit";

  return (
    <div
      className={`group relative h-full rounded-xl transition-all duration-300 fade-in ${isSelected ? "p-[2px]" : "p-[1px]"
        } ${isSelected
          ? "bg-gradient-to-r from-green-500 to-blue-500 shadow-lg"
          : "bg-transparent"
        } hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500 ${isSelected ? "" : "slider-hover"} ${isSelected && isSliderDragging ? "slider-dragging" : ""}`}
      onClick={() => {
        if (!isSelected && onSelect) {
          onSelect();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative h-full bg-card rounded-[11px] border border-border shadow-sm transition-all overflow-hidden flex flex-col ${isSelected ? "border-transparent shadow-lg" : ""
          } group-hover:border-transparent group-hover:shadow-xl`}
      >
        {isSelected && (
          <span
            className={`absolute top-3 left-3 z-20 text-[10px] font-semibold uppercase tracking-wider ${selectedGradient} text-white px-2 py-1 rounded-full shadow`}
          >
            Selected
          </span>
        )}

        <div
          className="h-40 w-full relative overflow-hidden bg-muted"
          data-slider-track
        >
          <div className="absolute inset-0 bg-muted">
            {afterImage ? (
              <img
                src={afterImage}
                alt={`${modeOption.title} generated preview`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                No preview
              </div>
            )}
          </div>

          <div
            className="before-layer absolute inset-0 bg-muted flex items-center justify-center border-r-2 border-black/60 z-10"
            style={{
              clipPath: `polygon(0 0, ${sliderValue}% 0, ${sliderValue}% 100%, 0 100%)`,
            }}
          >
            {beforeImage ? (
              <img
                src={beforeImage}
                alt={`${modeOption.title} original preview`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                Original
              </div>
            )}
          </div>

          <span
            className={`absolute bottom-2 z-30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm backdrop-blur-sm transition-all ${isShowingGenerated
              ? "right-3 bg-white/80 text-gray-800"
              : "left-3 bg-black/60 text-white"
              }`}
          >
            {isShowingGenerated ? "Generated" : "Original"}
          </span>

          <div
            className={`slider-handle absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center z-20 ${isSelected ? "pointer-events-auto cursor-grab active:cursor-grabbing touch-none" : "pointer-events-none"}`}
            style={{ left: `${sliderValue}%` }}
            onPointerDown={handleSliderPointerDown}
            onPointerMove={handleSliderPointerMove}
            onPointerUp={handleSliderPointerUp}
            onPointerCancel={handleSliderPointerUp}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200">
              <ChevronsLeftRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div
          className="p-5 flex-1 flex flex-col cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();
            if (isSelected) {
              if (!isLoading && onProceed) {
                onProceed();
              }
              return;
            }
            if (onSelect) {
              onSelect();
            }
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <h3
              className={`font-bold transition-colors text-lg ${isSelected
                ? "bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent"
                : "text-foreground"
                } group-hover:bg-gradient-to-r group-hover:from-green-500 group-hover:to-blue-500 group-hover:bg-clip-text group-hover:text-transparent`}
            >
              {t(modeOption.title, sourceKey.user)}
            </h3>
          </div>

          <p className="text-sm text-muted-foreground mb-4 flex-1 leading-relaxed">
            {modeOption.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
            <div className="flex gap-3 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1 bg-muted/60 px-2 py-1 rounded">
                <Coins className="w-3 h-3 text-yellow-500" />
                {modeOption.credits} {creditSuffix}
              </span>
              <span className="flex items-center gap-1 bg-muted/60 px-2 py-1 rounded">
                <Clock className="w-3 h-3" />
                {modeOption.estimatedTime}
              </span>
            </div>
            <button
              type="button"
              aria-label="Proceed to upload"
              disabled={!isSelected || isLoading}
              onClick={(event) => {
                event.stopPropagation();
                if (isSelected && !isLoading && onProceed) {
                  onProceed();
                }
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSelected
                ? "bg-gradient-to-r from-green-100 to-blue-100 text-emerald-700 shadow-sm opacity-100 translate-x-0 cursor-pointer"
                : "bg-muted/60 text-muted-foreground opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none"
                }`}
            >
              <ArrowRight
                className={`w-4 h-4 ${isSelected ? "text-emerald-700" : "text-muted-foreground"}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingModeCard;