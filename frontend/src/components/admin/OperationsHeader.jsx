import React from 'react';
import { Plus, CheckCircle2, Download } from 'lucide-react';

const OperationsHeader = ({
  timeRange,
  onTimeRangeChange,
  onOpenModal,
  onShowToast
}) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Aura Grand Operations • Live Portal
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              System Optimal
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Property Overview & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">
            Real-time hotel performance, key inventory occupancy, and departmental status overview.
          </p>
        </div>

        {/* Time filters & Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Date ranges */}
          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-lg text-xs font-medium shadow-2xs">
            {['Today', 'Last 7 Days', 'MTD', 'YTD'].map((t) => (
              <button
                key={t}
                onClick={() => onTimeRangeChange(t)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  timeRange === t
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <button
            onClick={() => onOpenModal('reservation')}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus size={15} />
            <span>Reservation</span>
          </button>

          <button
            onClick={() => onOpenModal('checkin')}
            className="bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <CheckCircle2 size={15} />
            <span>Check-in</span>
          </button>

          <button
            onClick={() => onShowToast('Exporting operations report as CSV...')}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OperationsHeader;
