import React from 'react';

const StatCardsGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Card 1: Total Revenue */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Revenue
          </span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            +14.2%
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-serif text-3xl font-bold text-slate-900">
            $48,920
          </span>
          <span className="text-xs text-slate-500 font-medium">today</span>
        </div>
        <div className="text-[11px] text-slate-500 mb-3">
          MTD: <span className="font-semibold text-slate-700">$342,800</span>
        </div>
        <div className="pt-2 border-t border-slate-100">
          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
            <span>Progress to Goal ($55k)</span>
            <span className="font-bold text-slate-700">88.9%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 w-[88.9%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Card 2: Occupancy Rate */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Occupancy Rate
          </span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            +5.1%
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-serif text-3xl font-bold text-slate-900">
            83.5%
          </span>
          <span className="text-xs text-slate-500 font-medium">capacity</span>
        </div>
        <div className="text-[11px] text-slate-500 mb-3">
          Occupied: <span className="font-semibold text-slate-700">142 of 170 keys</span>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-sm ${
                i <= 6 ? 'bg-amber-600' : 'bg-slate-200'
              }`}
            ></div>
          ))}
          <div className="h-2 flex-1 rounded-sm bg-[#c2410c]"></div>
        </div>
      </div>

      {/* Card 3: Inventory Keys */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Inventory Keys
          </span>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            8 Floors
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-serif text-3xl font-bold text-slate-900">
            170
          </span>
          <span className="text-xs text-slate-500 font-medium">Total</span>
        </div>
        <div className="text-[11px] text-emerald-600 font-medium mb-3">
          Operational: 100% Available
        </div>
        <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
          <span>Physical Rooms: 170</span>
          <span className="text-slate-400">Out of Order: 0</span>
        </div>
      </div>

      {/* Card 4: Ready Available */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Ready Available
          </span>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Immediate
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-serif text-3xl font-bold text-slate-900">
            24
          </span>
          <span className="text-xs text-slate-500 font-medium">clean</span>
        </div>
        <div className="text-[11px] text-slate-500 mb-3">
          Turn-down/Clean: 4 in housekeeping
        </div>
        <div className="pt-2 border-t border-slate-100">
          <div className="flex justify-between text-[11px] text-emerald-600 font-medium mb-1">
            <span>24 ready</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[70%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Card 5: Today's Bookings */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Today's Bookings
          </span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            +18%
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-serif text-3xl font-bold text-slate-900">
            38
          </span>
          <span className="text-xs text-slate-500 font-medium">reservations</span>
        </div>
        <div className="text-[11px] text-slate-500 mb-3">
          Channel split: <span className="font-semibold text-slate-700">18 Web / 20 OTA</span>
        </div>
        <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
          <span>Avg Stay: 2.8 nights</span>
          <span className="font-semibold text-slate-700">Direct: 47%</span>
        </div>
      </div>

      {/* Card 6: In-House Guests */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            In-House Guests
          </span>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            VIP: 12
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-serif text-3xl font-bold text-slate-900">
            216
          </span>
          <span className="text-xs text-slate-500 font-medium">heads</span>
        </div>
        <div className="text-[11px] text-slate-500 mb-3">
          Turnover: <span className="font-semibold text-slate-700">42 Arrive / 31 Depart</span>
        </div>
        <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
          <span>Front Desk Load</span>
          <span className="font-semibold text-amber-700">Peak: 2 – 4 PM</span>
        </div>
      </div>
    </div>
  );
};

export default StatCardsGrid;
