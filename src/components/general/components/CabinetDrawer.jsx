import React from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, Edit2 } from 'lucide-react';

export const CabinetDrawer = ({
    step,
    title,
    icon: Icon,
    isActive,
    isCompleted,
    disabled = false,
    summary,
    children,
    onSelect
}) => {
    const showCompleted = isCompleted && !disabled;

    return (
        <div
            className={`
        bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden mb-4
        ${isActive ? 'border-blue-500 ring-4 ring-blue-50 shadow-xl' : 'border-gray-200'}
        ${disabled ? 'opacity-60 grayscale cursor-not-allowed' : 'opacity-100'}
      `}
        >
            {/* Header */}
            <div
                onClick={() => !disabled && !isActive && onSelect(step)}
                className={`
          flex items-center justify-between p-6 transition-colors
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
          ${isActive ? 'bg-white' : 'bg-gray-50'}
        `}
            >
                <div className="flex items-center gap-4">
                    <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors
            ${isActive ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' : showCompleted ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white' : 'bg-gray-200 text-gray-500'}
          `}>
                        {showCompleted ? <CheckCircle2 size={20} /> : step}
                    </div>

                    <div>
                        <h3 className={`font-bold text-lg ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                            {title}
                        </h3>

                        {!isActive && summary && (
                            <p className="text-sm text-gray-500 mt-0.5">{summary}</p>
                        )}
                    </div>
                </div>

                <div className="text-gray-400">
                    {isActive ? <ChevronDown /> : showCompleted ? <Edit2 size={18} /> : <ChevronRight />}
                </div>
            </div>

            {/* Content */}
            <div
                className={`
          transition-all duration-500 ease-in-out
          ${isActive ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
            >
                <div className="p-6 pt-0 border-t border-gray-100">
                    <div className="mt-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
