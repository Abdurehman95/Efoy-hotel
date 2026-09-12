import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Home,
  LogOut,
  Bed,
  Check,
  ShieldCheck,
  Layers,
  History,
  PackageCheck,
  DoorClosed,
  ArrowRight,
  Filter,
  Menu,
  X
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

const HousekeepingDashboard = ({ user, onLogout, onBackToSite }) => {
  const {
    rooms,
    cleanRoom,
    markRoomDirty,
    housekeepingHistory,
  } = useHotel();

  const [activeTab, setActiveTab] = useState('Dirty Rooms Queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [floorFilter, setFloorFilter] = useState('All');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const cleanerName = user?.name || 'Maria Santos';

  const dirtyRooms = rooms.filter((r) => r.cleanliness === 'Dirty');
  const cleaningRooms = rooms.filter((r) => r.cleanliness === 'Cleaning');
  const cleanRooms = rooms.filter((r) => r.cleanliness === 'Clean' || r.cleanliness === 'Inspected');

  // Handle One-Click Clean
  const handleOneClickClean = (roomNumber) => {
    cleanRoom(roomNumber, cleanerName);
    showToast(`✨ Room ${roomNumber} marked Clean! Receptionist view updated instantly.`);
  };

  const navMenuItems = [
    { name: 'Dirty Rooms Queue', icon: AlertTriangle },
    { name: 'All Rooms Status', icon: DoorClosed },
    { name: 'Personal History', icon: History },
    { name: 'Supplies & Restock', icon: PackageCheck },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[150] bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-amber-500/40 text-xs flex items-center gap-2 animate-slide-down">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE SIDEBAR DRAWER (<lg) */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex animate-fade-in"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-slate-900 shadow-2xl flex flex-col animate-slide-right border-r border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-serif font-bold text-sm shadow-md">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h1 className="font-serif text-sm font-bold tracking-wider text-white uppercase">
                    Housekeeping
                  </h1>
                  <p className="text-[9px] tracking-[0.25em] text-slate-400 uppercase font-medium">
                    Sanitization & Turnover
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pt-3 pb-1">
              <button
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  onBackToSite();
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/15 rounded-md transition-all border border-amber-400/20 cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Home size={14} />
                  <span>Public Website</span>
                </span>
                <span className="text-[10px] text-amber-300/80">Visit →</span>
              </button>
            </div>

            <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
              <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 tracking-[0.15em] uppercase">
                Turnover Tasks
              </div>
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      setIsMobileSidebarOpen(false);
                    }}
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

            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center">
                  MS
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{cleanerName}</div>
                  <div className="text-[10px] text-slate-400">Senior Housekeeper</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Log out"
                className="p-1.5 text-slate-400 hover:text-red-400 rounded transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:w-64 bg-slate-900 border-r border-slate-800 flex-col shrink-0">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-serif font-bold text-sm shadow-md">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="font-serif text-sm font-bold tracking-wider text-white uppercase">
                Housekeeping
              </h1>
              <p className="text-[9px] tracking-[0.25em] text-slate-400 uppercase font-medium">
                Sanitization & Turnover
              </p>
            </div>
          </div>
        </div>

        {/* Public Website Button */}
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

        {/* Navigation Items */}
        <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 tracking-[0.15em] uppercase">
            Turnover Tasks
          </div>
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
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

        {/* Cleaning Progress Widget */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-300">
              Property Cleanliness
            </span>
            <span className="text-emerald-400 font-bold text-xs">
              {Math.round((cleanRooms.length / rooms.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              style={{ width: `${(cleanRooms.length / rooms.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{cleanRooms.length} Clean</span>
            <span className="text-red-400 font-medium">{dirtyRooms.length} Dirty</span>
          </div>
        </div>

        {/* Staff Profile */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center">
              MS
            </div>
            <div>
              <div className="text-xs font-semibold text-white">{cleanerName}</div>
              <div className="text-[10px] text-slate-400">Senior Housekeeper</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-red-400 rounded transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
            {/* Hamburger Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Open navigation drawer"
            >
              <Menu size={20} />
            </button>

            <div className="relative w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms, floors, notes..."
                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Clock size={14} className="text-slate-400" />
              <span>Shift: 08:00 - 16:30</span>
            </div>

            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              <span className="hidden xs:inline">1-Click</span> Sync
            </span>
          </div>
        </header>

        {/* TAB 1: DIRTY ROOMS QUEUE */}
        {activeTab === 'Dirty Rooms Queue' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Housekeeping Operations
                </span>
                <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  {dirtyRooms.length} Rooms Awaiting Turnover
                </span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Dirty Room Dashboard & Instant Clean
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Marking a room clean instantly removes the Front Desk dirty alert and permits new guest check-ins.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-red-200 shadow-2xs">
                <div className="text-xs text-red-700 font-semibold uppercase tracking-wider mb-1">
                  Dirty Suites Pending
                </div>
                <div className="font-serif text-3xl font-bold text-red-600 mb-1">
                  {dirtyRooms.length}
                </div>
                <div className="text-[11px] text-slate-500">
                  Priority turnover required before 3:00 PM arrivals
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                  Cleaning in Progress
                </div>
                <div className="font-serif text-3xl font-bold text-amber-600 mb-1">
                  {cleaningRooms.length}
                </div>
                <div className="text-[11px] text-slate-500">
                  Turnover time avg: 22 minutes
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-2xs">
                <div className="text-xs text-emerald-700 font-semibold uppercase tracking-wider mb-1">
                  Clean & Ready
                </div>
                <div className="font-serif text-3xl font-bold text-emerald-700 mb-1">
                  {cleanRooms.length}
                </div>
                <div className="text-[11px] text-slate-500">
                  Sanitized according to Forbes 5-star standard
                </div>
              </div>
            </div>

            {/* DIRTY ROOMS LIST */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-slate-900">
                  Turnover Action List ({dirtyRooms.length})
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  Sorted by priority arrivals
                </span>
              </div>

              {dirtyRooms.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-dashed border-emerald-300 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 mb-1">
                    All Rooms Sanitized & Ready!
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    There are no dirty rooms remaining. Great work! All vacant rooms are ready for front desk check-in.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dirtyRooms.map((room) => (
                    <div
                      key={room.roomNumber}
                      className="bg-white rounded-xl border-2 border-red-200 p-5 shadow-2xs flex flex-col justify-between hover:border-red-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif text-xl font-bold text-slate-900">
                            Room {room.roomNumber}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded-full border border-red-200">
                            DIRTY / TURNOVER
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-800 mb-1">{room.type}</div>
                        <div className="text-[11px] text-slate-500 mb-3">{room.floor}</div>

                        <div className="p-3 bg-red-50/70 border border-red-200/70 rounded-lg text-xs text-red-800 mb-4">
                          <div className="font-semibold flex items-center gap-1 mb-0.5">
                            <AlertTriangle size={13} />
                            <span>Housekeeping Reason:</span>
                          </div>
                          <p className="text-[11px] text-red-700 leading-relaxed">
                            {room.dirtyReason || 'Standard turnover & sanitation required'}
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-500 mb-4 space-y-1">
                          <div>• Bedding: Fresh Egyptian cotton sheets</div>
                          <div>• Bathroom: Sanitized + Hermes amenity kit</div>
                          <div>• Minibar: Re-stock & check seal</div>
                        </div>
                      </div>

                      {/* ONE CLICK CLEAN ACTION */}
                      <button
                        onClick={() => handleOneClickClean(room.roomNumber)}
                        className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
                      >
                        <Sparkles size={15} className="group-hover:rotate-12 transition-transform" />
                        <span>One-Click Clean (Mark Ready)</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ALL ROOMS STATUS */}
        {activeTab === 'All Rooms Status' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">
                  Full Property Cleanliness Grid
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Overall status of every room across all floors of Grand Horizon.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg text-xs shadow-2xs">
                {['All Floors', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5'].map((fl) => (
                  <button
                    key={fl}
                    onClick={() => setFloorFilter(fl)}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      floorFilter === fl
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {fl}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {rooms.map((room) => {
                const isDirty = room.cleanliness === 'Dirty';
                return (
                  <div
                    key={room.roomNumber}
                    className={`p-4 rounded-xl border bg-white shadow-2xs transition-all ${
                      isDirty ? 'border-red-300' : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif text-base font-bold text-slate-900">
                        Room {room.roomNumber}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          isDirty
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {room.cleanliness.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 font-medium mb-1">{room.type}</div>
                    <div className="text-[11px] text-slate-500 mb-3">{room.floor}</div>

                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mb-3">
                      Occupancy: <span className="font-semibold">{room.occupancy}</span>
                    </div>

                    {isDirty ? (
                      <button
                        onClick={() => handleOneClickClean(room.roomNumber)}
                        className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Check size={12} />
                        <span>Clean Room</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          markRoomDirty(room.roomNumber, 'Manual Housekeeping turnover flagged');
                          showToast(`Room ${room.roomNumber} flagged as Dirty`);
                        }}
                        className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors cursor-pointer"
                      >
                        Flag Dirty
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: PERSONAL HISTORY */}
        {activeTab === 'Personal History' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Personal Cleaning History ({cleanerName})
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Certified record of suites sanitized, durations, and inspection sign-offs.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Task ID</th>
                      <th className="py-3 px-4">Room & Type</th>
                      <th className="py-3 px-4">Sanitization Action</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Completed At</th>
                      <th className="py-3 px-4">Inspection Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {housekeepingHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">Room {item.roomNumber}</div>
                          <div className="text-[11px] text-slate-500">{item.type}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-800">{item.action}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{item.duration}</td>
                        <td className="py-3 px-4 text-slate-600">{item.completedAt}</td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <ShieldCheck size={11} /> {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SUPPLIES & RESTOCK */}
        {activeTab === 'Supplies & Restock' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Housekeeping Linen & Chemical Supplies
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Linen inventory, luxury amenities, and cleaning supply levels on cart #4.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Egyptian Cotton Sheets (King)', level: '48 sets', status: 'Optimal', color: 'emerald' },
                { name: 'Plush Bathrobes & Towels', level: '72 pairs', status: 'Optimal', color: 'emerald' },
                { name: 'Hermes Eau d\'Orange Verte Kits', level: '18 sets', status: 'Low Stock', color: 'amber' },
                { name: 'Hospital-Grade Sanitizing Solution', level: '12 Gal', status: 'Optimal', color: 'emerald' },
                { name: 'Feather Down Pillows', level: '30 units', status: 'Optimal', color: 'emerald' },
                { name: 'Nespresso Pods & Luxury Teas', level: '120 pods', status: 'Optimal', color: 'emerald' },
              ].map((sup, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-900">{sup.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sup.status === 'Optimal' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {sup.status}
                    </span>
                  </div>
                  <div className="font-mono text-lg font-bold text-slate-900 mb-3">{sup.level}</div>
                  <button
                    onClick={() => showToast(`Restock request sent for ${sup.name}`)}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors cursor-pointer"
                  >
                    Request Restock
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HousekeepingDashboard;
