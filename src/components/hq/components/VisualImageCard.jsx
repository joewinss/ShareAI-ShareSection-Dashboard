import React from "react";

const VisualImageCard = ({
  src,
  alt,
  selected = false,
  selectable = false,
  onClick,
}) => {
  const isSelectable = selectable === true;
  const isSelected = isSelectable && selected;
  const selectedStyles = isSelected ? "ring-2 ring-blue-500 ring-offset-2" : "";
  const indicatorStyles = isSelectable
    ? isSelected
      ? "opacity-100 border-blue-500 bg-blue-500"
      : "opacity-0 border-gray-200 bg-white/90 group-hover:opacity-100"
    : "hidden";

  return (
    <div
      className={`group relative aspect-square overflow-hidden rounded-xl bg-gray-200 transition-transform duration-200 ${isSelectable ? "cursor-pointer hover:-translate-y-0.5" : ""} ${selectedStyles}`}
      onClick={isSelectable ? onClick : undefined}
    >
      <div
        className={`absolute left-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border transition-opacity ${indicatorStyles}`}
      >
        {isSelected ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="h-3 w-3 text-white"
          >
            <path
              fill="currentColor"
              d="M7.5 13.2 4.8 10.5 3.4 11.9 7.5 16l9.1-9.1-1.4-1.4z"
            />
          </svg>
        ) : null}
      </div>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
      )}
    </div>
  );
};

export default VisualImageCard;
