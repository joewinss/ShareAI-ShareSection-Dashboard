import React from 'react';
import { Check } from 'lucide-react';

const gradientBorder = "bg-gradient-to-r from-green-500 to-blue-500";

export const SelectionGrid = ({ label, options, selectedId, onSelect, imageSize = "square" }) => {
  const imageContainerClass = imageSize === "portrait"
    ? "aspect-[3/4] w-full"
    : "h-24 w-full";
  const imageObjectClass = imageSize === "portrait"
    ? "w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
    : "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110";

  return (
    <div className="mb-6">
      {label && (
        <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
          {label}
        </h4>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          const hasPreview = !!(option.previewImage || option.previewColor);

          return (
            <div
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`
                relative group cursor-pointer rounded-xl p-[2px] transition-all duration-200 overflow-hidden
                ${isSelected
                  ? `${gradientBorder} shadow-md`
                  : `bg-transparent group-hover:bg-gradient-to-r group-hover:from-green-500 group-hover:to-blue-500`
                }
              `}
            >
              <div
                className={`
                  rounded-[10px] flex flex-col h-full bg-white border-2 transition-all duration-200
                  ${isSelected ? 'border-transparent' : 'border-gray-200 group-hover:border-transparent'}
                `}
              >
                {hasPreview && (
                  <div className={`${imageContainerClass} overflow-hidden bg-gray-200 relative flex items-center justify-center rounded-t-[8px]`}>
                    {option.previewImage ? (
                      <img
                        src={option.previewImage}
                        alt={option.label}
                        className={imageObjectClass}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: option.previewColor }}
                      ></div>
                    )}

                    {isSelected && (
                      <div className="absolute inset-0 bg-black/10 z-10"></div>
                    )}
                  </div>
                )}

                <div
                  className={`p-3 flex items-center justify-between bg-white group-hover:bg-gray-100 flex-1 ${hasPreview ? "rounded-b-[8px]" : "rounded-[8px]"}`}
                >
                  <span
                    className="text-xs font-bold text-gray-900"
                  >
                    {option.label}
                  </span>

                  {isSelected && (
                    <div className="bg-green-600 rounded-full p-0.5 text-white shadow-sm">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
