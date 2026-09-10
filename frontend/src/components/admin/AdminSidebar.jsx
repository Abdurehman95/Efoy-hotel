import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  DoorClosed,
  UtensilsCrossed,
  Users,
  Clock,
  Settings,
  HelpCircle,
  Home
} from 'lucide-react';

const AdminSidebar = ({ activeTab, onSelectTab, onBackToSite, onShowToast }) => {
  const navMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Bookings', icon: Calendar },
    { name: 'Room Management', icon: DoorClosed },
    { name: 'Menu Management', icon: UtensilsCrossed },
    { name: 'Staff Management', icon: Users },
    { name: 'Activity Logs', icon: Clock },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#111827] text-gray-300 flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-serif font-bold text-lg shadow-md shadow-orange-500/20">
            A
          </div>
          <div>
            <h2 className="text-base font-serif font-semibold tracking-wide text-white leading-tight">
              Aura Grand
            </h2>
            <p className="text-[9px] tracking-[0.25em] text-slate-400 uppercase font-medium">
              Hotel & Suites
            </p>
          </div>
        </div>
      </div>

      {/* Back to Public Website shortcut */}
      <div className="px-4 pt-3 pb-1">
        <button
          onClick={onBackToSite}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/15 rounded-md transition-all border border-amber-400/20 cursor-pointer group"
        >
          <span className="flex items-center gap-2">
            <Home size={14} />
            <span>Public Website</span>
          </span>
          <span className="text-[10px] text-amber-300/80 group-hover:translate-x-0.5 transition-transform">
            Visit →
          </span>
        </button>
      </div>

      {/* Navigation items */}
      <div className="px-3 py-4 flex-1 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 tracking-[0.15em] uppercase">
          Operations
        </div>
        {navMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onSelectTab(item.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-[#f97316] text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Live Occupancy Widget */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-300">
            Live Occupancy
          </span>
          <span className="text-amber-400 font-bold text-xs">84%</span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full w-[84%]"></div>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>142/170 Filled</span>
          <span className="text-emerald-400 font-medium">28 Free</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <button
          onClick={() => onShowToast('Help Center Documentation Loaded')}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
        >
          <HelpCircle size={13} />
          <span>Help Center</span>
        </button>
        <span className="font-mono text-[10px] text-slate-400">v2.4.0</span>
      </div>
    </aside>
  );
};

export default AdminSidebar;
