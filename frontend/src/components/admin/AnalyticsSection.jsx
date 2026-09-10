import React from 'react';
import { HelpCircle } from 'lucide-react';

const AnalyticsSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Chart 1: Revenue & Occupancy Trend */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-serif text-base font-bold text-slate-900">
              Revenue & Occupancy Trend
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mb-4">
            ADR and RevPAR dynamic comparative analytics (Last 7 Days)
          </p>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[11px] text-slate-600 mb-4 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>ADR ($345)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
              <span>RevPAR ($288)</span>
            </span>
          </div>

          {/* Dual Bar Chart Graphic */}
          <div className="relative pt-6 pb-2">
            <div className="absolute top-0 right-2 bg-amber-100 text-amber-900 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
              Peak: $465.9k
            </div>
            <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-100">
              {[
                { day: 'Thu', adr: 58, rev: 45 },
                { day: 'Fri', adr: 72, rev: 60 },
                { day: 'Sat', adr: 92, rev: 80 },
                { day: 'Sun', adr: 68, rev: 55 },
                { day: 'Mon', adr: 54, rev: 42 },
                { day: 'Tue', adr: 64, rev: 52 },
                { day: 'Wed', adr: 85, rev: 74 },
              ].map((item) => (
                <div key={item.day} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full flex items-end justify-center gap-1 h-32">
                    <div
                      style={{ height: `${item.adr}%` }}
                      className="w-2 sm:w-2.5 bg-amber-500 rounded-t-xs hover:opacity-80 transition-opacity"
                      title={`ADR: ${item.adr}%`}
                    ></div>
                    <div
                      style={{ height: `${item.rev}%` }}
                      className="w-2 sm:w-2.5 bg-slate-900 rounded-t-xs hover:opacity-80 transition-opacity"
                      title={`RevPAR: ${item.rev}%`}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart footer stats */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div>
            <span className="text-slate-500">Average Daily Rate (ADR): </span>
            <span className="font-bold text-slate-800">$345.00</span>
          </div>
          <div>
            <span className="text-slate-500">RevPAR: </span>
            <span className="font-bold text-slate-800">$288.08</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            +8.4% vs benchmark
          </span>
        </div>
      </div>

      {/* Chart 2: Room Category Yield */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-serif text-base font-bold text-slate-900">
              Room Category Yield
            </h3>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">
              Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-4">
            Inventory category distribution and revenue contribution
          </p>

          {/* Progress bars list */}
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Double Executive (55 keys)</span>
                <span className="text-amber-700">88% Occ</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-amber-500 w-[88%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>$360 / night</span>
                <span className="font-medium text-slate-700">$28,500 contribution</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Single Deluxe (45 keys)</span>
                <span className="text-amber-700">82% Occ</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-amber-500 w-[82%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>$220 / night</span>
                <span className="font-medium text-slate-700">$8,140 contribution</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Luxury Suite (32 keys)</span>
                <span className="text-amber-700">78% Occ</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-amber-500 w-[78%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>$650 / night</span>
                <span className="font-medium text-slate-700">$16,250 contribution</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Penthouse (8 keys)</span>
                <span className="text-amber-700">87.5% Occ</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-amber-500 w-[87.5%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>$1,250 / night</span>
                <span className="font-medium text-slate-700">$8,750 contribution</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 flex justify-between text-[11px] text-slate-600 font-medium">
          <span>Total Occupied: <strong className="text-slate-900">142 keys</strong></span>
          <span>Rev Max: <strong className="text-emerald-600">94.2%</strong></span>
        </div>
      </div>

      {/* Chart 3: Booking Acquisition */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-serif text-base font-bold text-slate-900">
              Booking Acquisition
            </h3>
            <HelpCircle size={14} className="text-slate-400 cursor-pointer" />
          </div>
          <p className="text-[11px] text-slate-500 mb-4">
            Channel distribution & direct margin share
          </p>

          {/* Donut Chart Visual representation */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Circle 1 - Direct Web 45% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#0f172a"
                  strokeWidth="4"
                  strokeDasharray="45 55"
                  strokeDashoffset="0"
                />
                {/* Circle 2 - Corp Direct 25% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#f97316"
                  strokeWidth="4"
                  strokeDasharray="25 75"
                  strokeDashoffset="-45"
                />
                {/* Circle 3 - OTA GDS 22% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#06b6d4"
                  strokeWidth="4"
                  strokeDasharray="22 78"
                  strokeDashoffset="-70"
                />
                {/* Circle 4 - Walk-in 8% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#84cc16"
                  strokeWidth="4"
                  strokeDasharray="8 92"
                  strokeDashoffset="-92"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-serif font-bold text-xl text-slate-900 leading-none">
                  45%
                </span>
                <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 mt-0.5">
                  Direct
                </span>
              </div>
            </div>

            {/* Channel Breakdown Legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] mt-4 w-full">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                <span className="text-slate-600">Direct Web (45%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span className="text-slate-600">Corp Direct (25%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <span className="text-slate-600">OTA GDS (22%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-500"></span>
                <span className="text-slate-600">Walk-in (8%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Savings Badge */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-lg mt-2">
          <span className="text-slate-600 font-medium">OTA Commission Saved:</span>
          <span className="font-bold text-emerald-600">$6,480</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
