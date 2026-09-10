import React from 'react';
import { Search, Clock, Building2, ChevronDown, Bell, LogOut } from 'lucide-react';

const AdminTopNav = ({
  searchQuery,
  onSearchChange,
  onShowToast,
  currentUser,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search guest"
            className="w-full pl-9 pr-14 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium bg-slate-200/60 px-1.5 py-0.5 rounded border border-slate-300/60">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right Header items */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Live Clock / Date */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Clock size={14} className="text-slate-400" />
          <span>Wednesday, Oct 24 • 10:45AM</span>
        </div>

        {/* Property Switcher */}
        <div
          onClick={() => onShowToast('Property switcher: Aura Grand Downtown (Main)')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <Building2 size={14} className="text-slate-500" />
          <span>Aura Grand Downtown (Main)</span>
          <ChevronDown size={13} className="text-slate-400" />
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => onShowToast('3 New operational notifications')}
          aria-label="Notifications"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Admin Profile & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-serif font-semibold text-xs flex items-center justify-center border border-amber-400/30">
            AS
          </div>
          <div className="hidden xl:block text-left leading-tight">
            <div className="text-xs font-semibold text-slate-900">
              {currentUser?.name || 'Alexander Sterling'}
            </div>
            <div className="text-[10px] text-slate-500">
              {currentUser?.title || 'General Manager'}
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            title="Log Out to Public Site"
            aria-label="Log Out to Public Site"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminTopNav;
