import React from 'react';
import { Layers } from 'lucide-react';
import { formatDecimalNumber } from '@/utility/common-functions';

const DetailCreditCard = ({
  label,
  icon,
  gradient,
  available = 0,
  total = 0,
  used = 0,
  usedLabel = 'Used',
  showChart = false,
}) => {
  const formatNumber = (value) => formatDecimalNumber(value ?? 0, 0);
  const safeTotal = Number.isFinite(Number(total)) ? Number(total) : 0;
  const safeAvailable = Number.isFinite(Number(available)) ? Number(available) : 0;
  const percentage = safeTotal > 0
    ? Math.max(Math.min((safeAvailable / safeTotal) * 100, 100), 0)
    : 0;

  const chartSize = 156;
  const chartCenter = chartSize / 2;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col gap-6">
      <div className={`relative overflow-hidden rounded-[2rem] px-10 py-8 text-white shadow-xl bg-gradient-to-r ${gradient} group hover:scale-[1.01] transition-transform duration-300`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Layers size={120} />
        </div>

        <div className="relative z-10 flex justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4 opacity-90">
              {icon}
              <span className="text-xs font-bold tracking-wide">{label}</span>
            </div>

            <h2 className="text-4xl font-black tracking-tight mb-6 shadow-sm">
              {formatNumber(safeAvailable)}
            </h2>

            <div className="flex items-center gap-6 text-[11px]">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold opacity-70 tracking-widest mb-1">Total Amount</span>
                <span className="font-bold text-sm">{formatNumber(safeTotal)}</span>
              </div>
              <div className="w-[1px] h-8 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold opacity-70 tracking-widest mb-1">{usedLabel}</span>
                <span className="font-bold text-sm">{formatNumber(used)}</span>
              </div>
            </div>
          </div>

          {showChart ? (
            <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center bg-black/10 rounded-full border border-white/10 shadow-inner backdrop-blur-sm">
              <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${chartSize} ${chartSize}`}>
                <circle
                  cx={chartCenter}
                  cy={chartCenter}
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/20"
                />
                <circle
                  cx={chartCenter}
                  cy={chartCenter}
                  r={radius}
                  stroke="white"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out drop-shadow-md"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{Math.round(percentage)}%</span>
                <span className="text-[9px] font-bold opacity-80 uppercase tracking-widest">Available</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DetailCreditCard;
