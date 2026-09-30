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
  X,
  Wrench,
  Play,
  CheckSquare,
  Plus
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

const HousekeepingDashboard = ({ user, onLogout, onBackToSite }) => {
  const {
    rooms,
    housekeepingTasks,
    housekeepingHistory,
    maintenanceTickets,
    cleanRoom,
    markRoomDirty,
    createHousekeepingTask,
    updateHousekeepingTaskStatus,
    createMaintenanceTicket,
    updateMaintenanceTicket,
  } = useHotel();

  const [activeTab, setActiveTab] = useState('Turnover Queue');
  const [queueFilter, setQueueFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [floorFilter, setFloorFilter] = useState('All Floors');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Maintenance report modal state
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    roomNumber: '101',
    issueDescription: '',
    severity: 'MEDIUM',
    inventoryImpact: 'OUT_OF_SERVICE',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const cleanerName = user?.name || 'Maria Santos';

  // Metrics
  const dirtyRooms = rooms.filter(
    (r) => (r.housekeepingStatus || r.cleanliness?.toUpperCase()) === 'DIRTY'
  );
  const cleaningRooms = rooms.filter(
    (r) => (r.housekeepingStatus || r.cleanliness?.toUpperCase()) === 'CLEANING'
  );
  const inspectionRooms = rooms.filter(
    (r) => (r.housekeepingStatus || r.cleanliness?.toUpperCase()) === 'INSPECTION'
  );
  const cleanRooms = rooms.filter(
    (r) => (r.housekeepingStatus || r.cleanliness?.toUpperCase()) === 'CLEAN' || (r.housekeepingStatus || r.cleanliness?.toUpperCase()) === 'INSPECTED'
  );
  const oosRooms = rooms.filter(
    (r) => (r.maintenanceStatus || '').toUpperCase() === 'OUT_OF_SERVICE' || (r.maintenanceStatus || '').toUpperCase() === 'MAINTENANCE'
  );

  // 4-Stage Queue Transitions: DIRTY -> CLEANING -> INSPECTION -> CLEAN
  const handleTransition = async (task, targetStatus) => {
    const res = await updateHousekeepingTaskStatus(task.id, targetStatus, `Updated by ${cleanerName}`);
    if (targetStatus === 'CLEAN') {
      showToast(`✨ Room ${task.roomNumber} certified CLEAN! Instantly available for Front Desk check-in.`);
    } else if (targetStatus === 'CLEANING') {
      showToast(`▶️ Started cleaning Room ${task.roomNumber}. Timer active.`);
    } else if (targetStatus === 'INSPECTION') {
      showToast(`🔍 Room ${task.roomNumber} moved to Inspection queue.`);
    }
  };

  // Submit maintenance problem
  const handleReportMaintenance = (e) => {
    e.preventDefault();
    if (!maintenanceForm.issueDescription) {
      showToast('Please describe the problem.');
      return;
    }

    createMaintenanceTicket({
      roomNumber: maintenanceForm.roomNumber,
      issueDescription: maintenanceForm.issueDescription,
      severity: maintenanceForm.severity,
      inventoryImpact: maintenanceForm.inventoryImpact,
      reportedBy: cleanerName,
    });

    showToast(`⚠️ Maintenance ticket created. Room ${maintenanceForm.roomNumber} set to OUT OF SERVICE.`);
    setIsMaintenanceModalOpen(false);
    setMaintenanceForm({
      roomNumber: '101',
      issueDescription: '',
      severity: 'MEDIUM',
      inventoryImpact: 'OUT_OF_SERVICE',
    });
  };

  // Filter queue tasks
  const filteredQueue = housekeepingTasks.filter((task) => {
    const status = (task.status || '').toUpperCase();
    if (queueFilter === 'Dirty') return status === 'DIRTY' || status === 'PENDING';
    if (queueFilter === 'Cleaning') return status === 'CLEANING';
    if (queueFilter === 'Inspection') return status === 'INSPECTION';
    if (queueFilter === 'Clean') return status === 'CLEAN' || status === 'COMPLETED';
    return true;
  });

  const navMenuItems = [
    { name: 'Turnover Queue', icon: AlertTriangle, count: dirtyRooms.length + cleaningRooms.length + inspectionRooms.length },
    { name: 'All Rooms Status', icon: DoorClosed, count: rooms.length },
    { name: 'Maintenance Issues', icon: Wrench, count: oosRooms.length },
    { name: 'Personal History', icon: History },
    { name: 'Supplies & Restock', icon: PackageCheck },
  ];

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[150] bg-dark-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-gold-500/40 text-xs flex items-center gap-2 animate-slide-down">
          <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* REPORT MAINTENANCE PROBLEM MODAL */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 z-[140] bg-dark-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full p-5 sm:p-6 text-dark-900 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2 text-rose-600">
                <Wrench size={20} />
                <h3 className="font-serif font-bold text-lg text-dark-900">
                  Report Room Problem
                </h3>
              </div>
              <button
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="text-gray-400 hover:text-dark-900 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReportMaintenance} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                  Room Allocation
                </label>
                <select
                  value={maintenanceForm.roomNumber}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-dark-900 font-bold"
                >
                  {rooms.map((r) => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} ({r.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                  Problem Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Broken shower cartridge, clogged drainage, cracked window latch, AC coil leaking"
                  value={maintenanceForm.issueDescription}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, issueDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                    Severity Level
                  </label>
                  <select
                    value={maintenanceForm.severity}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, severity: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg"
                  >
                    <option value="LOW">Low (Cosmetic)</option>
                    <option value="MEDIUM">Medium (Service required)</option>
                    <option value="HIGH">High (Urgent)</option>
                    <option value="CRITICAL">Critical (Safety hazard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                    Room Impact
                  </label>
                  <select
                    value={maintenanceForm.inventoryImpact}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, inventoryImpact: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-semibold text-rose-700"
                  >
                    <option value="OUT_OF_SERVICE">OUT_OF_SERVICE (Block check-ins)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Inspection)</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-[11px] text-rose-800">
                Flagging this room will immediately set its maintenance status to <strong>OUT OF SERVICE</strong>, preventing Reception from checking in any new guests until resolved.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsMaintenanceModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium shadow-xs"
                >
                  Submit & Set Out of Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE SIDEBAR DRAWER (<lg) */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-dark-900/70 backdrop-blur-xs flex animate-fade-in"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-dark-900 shadow-2xl flex flex-col animate-slide-right border-r border-dark-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-dark-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-xl px-2.5 py-1.5 shadow-md flex items-center justify-center shrink-0">
                  <img
                    src="/images/logo.png"
                    alt="Efoy Hotel"
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="font-serif text-base font-bold tracking-wider text-white uppercase">
                    Efoy Cleaning
                  </h1>
                  <p className="text-[9px] tracking-[0.25em] text-gold-400 uppercase font-medium">
                    Housekeeping Hub
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-dark-800"
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
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gold-400 bg-gold-500/10 rounded-md border border-gold-500/20"
              >
                <span className="flex items-center gap-2">
                  <Home size={14} />
                  <span>Public Website</span>
                </span>
                <span className="text-[10px] text-gold-300">Visit →</span>
              </button>
            </div>

            <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-gold-500 text-white font-semibold shadow-xs'
                        : 'text-gray-300 hover:text-white hover:bg-dark-800/60'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={16} />
                      <span>{item.name}</span>
                    </span>
                    {item.count !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-800 text-gray-300">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:w-64 bg-dark-900 border-r border-dark-800 flex-col shrink-0 text-white select-none">
        <div className="p-5 border-b border-dark-800 flex items-center gap-3">
          <div className="bg-white rounded-xl px-2.5 py-1.5 shadow-md flex items-center justify-center shrink-0">
            <img
              src="/images/logo.png"
              alt="Efoy Hotel"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="font-serif text-base font-bold tracking-wider text-white uppercase">
              Efoy Cleaning
            </h1>
            <p className="text-[9px] tracking-[0.25em] text-gold-400 uppercase font-medium">
              Housekeeping Hub
            </p>
          </div>
        </div>

        <div className="px-4 pt-3 pb-1">
          <button
            onClick={onBackToSite}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gold-400 bg-gold-500/10 hover:bg-gold-500/15 rounded-md transition-all border border-gold-500/20 cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <Home size={14} />
              <span>Public Website</span>
            </span>
            <span className="text-[10px] text-gold-300 group-hover:translate-x-0.5 transition-transform">
              Visit →
            </span>
          </button>
        </div>

        <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
            Turnover Operations
          </div>
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-gold-500 hover:bg-gold-600 text-white font-semibold shadow-xs'
                    : 'text-gray-300 hover:text-white hover:bg-dark-800/60'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
                  <span>{item.name}</span>
                </span>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-gold-600 text-white' : 'bg-dark-800 text-gray-400'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Cleaning Progress Widget */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-dark-800/70 border border-dark-700/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-300">
              Cleanliness Index
            </span>
            <span className="text-gold-400 font-bold text-xs">
              {Math.round((cleanRooms.length / rooms.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-dark-900 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-gold-500 to-amber-400 rounded-full"
              style={{ width: `${(cleanRooms.length / rooms.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>{cleanRooms.length} Clean</span>
            <span className="text-rose-400 font-medium">{dirtyRooms.length} Dirty</span>
          </div>
        </div>

        {/* Staff Profile */}
        <div className="p-4 border-t border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-dark-800 text-gold-500 border border-gold-500/30 font-semibold text-xs flex items-center justify-center">
              HK
            </div>
            <div>
              <div className="text-xs font-semibold text-white">{cleanerName}</div>
              <div className="text-[10px] text-gray-400">Executive Housekeeper</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log out"
            className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg cursor-pointer shrink-0"
              aria-label="Open navigation drawer"
            >
              <Menu size={20} />
            </button>

            <div className="relative w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms, tasks, housekeepers..."
                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 bg-[#fafafa] border border-gray-200 rounded-lg text-xs text-dark-900 placeholder-gray-400 focus:outline-none focus:border-gold-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setIsMaintenanceModalOpen(true)}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Wrench size={13} />
              <span>Report Problem</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <Clock size={14} className="text-gold-500" />
              <span>Shift Active</span>
            </div>
          </div>
        </header>

        {/* TAB 1: TURNOVER QUEUE (4-Stage Lifecycle: DIRTY -> CLEANING -> INSPECTION -> CLEAN) */}
        {activeTab === 'Turnover Queue' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-dark-900 bg-gray-100 px-2 py-0.5 rounded">
                  Live Operations
                </span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  Automatic Reception Checkout Integration
                </span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                4-Stage Turnover Queue
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                Follows standard: <strong>DIRTY → CLEANING → INSPECTION → CLEAN</strong>. When marked CLEAN, suites immediately become available for Front Desk check-ins.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs">
                <div className="text-[10px] text-rose-700 font-bold uppercase tracking-wider mb-1">
                  1. Dirty Suites
                </div>
                <div className="font-serif text-2xl font-bold text-rose-600">
                  {dirtyRooms.length}
                </div>
                <div className="text-[10px] text-gray-500">Awaiting turnover</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
                <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider mb-1">
                  2. Cleaning In Progress
                </div>
                <div className="font-serif text-2xl font-bold text-blue-600">
                  {cleaningRooms.length}
                </div>
                <div className="text-[10px] text-gray-500">Timer active</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
                <div className="text-[10px] text-purple-700 font-bold uppercase tracking-wider mb-1">
                  3. Inspection Audit
                </div>
                <div className="font-serif text-2xl font-bold text-purple-600">
                  {inspectionRooms.length}
                </div>
                <div className="text-[10px] text-gray-500">Ready for sign-off</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
                <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mb-1">
                  4. Certified Clean
                </div>
                <div className="font-serif text-2xl font-bold text-emerald-700">
                  {cleanRooms.length}
                </div>
                <div className="text-[10px] text-emerald-600">Available across PMS</div>
              </div>
            </div>

            {/* Queue Filter Pills */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 p-1 rounded-lg text-xs">
                {['All', 'Dirty', 'Cleaning', 'Inspection', 'Clean'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setQueueFilter(filter)}
                    className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      queueFilter === filter
                        ? 'bg-dark-900 text-white shadow-xs'
                        : 'text-gray-600 hover:text-dark-900'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  const room = prompt('Enter Room Number to dispatch task for:');
                  if (!room) return;
                  createHousekeepingTask({
                    roomNumber: room,
                    priority: 'HIGH',
                    assignedStaff: cleanerName,
                    notes: 'Priority turnover requested',
                  });
                  showToast(`✓ Housekeeping task created for Room ${room}.`);
                }}
                className="px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus size={13} />
                <span>+ Create Task</span>
              </button>
            </div>

            {/* QUEUE TASKS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQueue.map((task) => {
                const currentStatus = (task.status || 'DIRTY').toUpperCase();
                const roomObj = rooms.find((r) => r.roomNumber === task.roomNumber);

                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-serif text-lg font-bold text-dark-900">
                            Room {task.roomNumber}
                          </span>
                          <span className="text-[11px] text-gray-500 block">{roomObj?.type || 'Luxury Suite'}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            task.priority === 'CHECKOUT' || task.priority === 'CRITICAL'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : task.priority === 'HIGH'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {task.priority || 'NORMAL'}
                        </span>
                      </div>

                      {/* 4-Stage Progress Stepper */}
                      <div className="my-3 p-2 bg-[#fafafa] rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                          <span className={currentStatus === 'DIRTY' ? 'text-red-600' : ''}>DIRTY</span>
                          <span>→</span>
                          <span className={currentStatus === 'CLEANING' ? 'text-blue-600' : ''}>CLEANING</span>
                          <span>→</span>
                          <span className={currentStatus === 'INSPECTION' ? 'text-purple-600' : ''}>INSPECTION</span>
                          <span>→</span>
                          <span className={currentStatus === 'CLEAN' ? 'text-emerald-600' : ''}>CLEAN</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              currentStatus === 'DIRTY'
                                ? 'w-1/4 bg-red-500'
                                : currentStatus === 'CLEANING'
                                ? 'w-2/4 bg-blue-500'
                                : currentStatus === 'INSPECTION'
                                ? 'w-3/4 bg-purple-500'
                                : 'w-full bg-emerald-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Task details */}
                      <div className="text-xs text-gray-600 space-y-1 mb-4">
                        <div><strong>Assigned:</strong> {task.assignedStaff || cleanerName}</div>
                        <div><strong>Start:</strong> {task.startTime || 'Not started'}</div>
                        <div><strong>Notes:</strong> {task.notes || 'Full five-star turnover'}</div>
                      </div>
                    </div>

                    {/* Stage Transition Action Buttons */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col gap-1.5 text-xs">
                      {currentStatus === 'DIRTY' && (
                        <button
                          onClick={() => handleTransition(task, 'CLEANING')}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Play size={13} />
                          <span>Start Cleaning (Step 2)</span>
                        </button>
                      )}

                      {currentStatus === 'CLEANING' && (
                        <button
                          onClick={() => handleTransition(task, 'INSPECTION')}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <CheckSquare size={13} />
                          <span>Request Inspection (Step 3)</span>
                        </button>
                      )}

                      {currentStatus === 'INSPECTION' && (
                        <button
                          onClick={() => handleTransition(task, 'CLEAN')}
                          className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-medium flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Sparkles size={13} />
                          <span>Certify Clean & Ready (Step 4)</span>
                        </button>
                      )}

                      {currentStatus === 'CLEAN' && (
                        <div className="w-full py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-center font-medium flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={14} />
                          <span>Clean & Ready for Guests</span>
                        </div>
                      )}

                      {/* Quick Report Issue */}
                      <button
                        onClick={() => {
                          setMaintenanceForm((prev) => ({ ...prev, roomNumber: task.roomNumber }));
                          setIsMaintenanceModalOpen(true);
                        }}
                        className="w-full py-1 text-[11px] text-gray-500 hover:text-rose-600 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Wrench size={11} />
                        <span>Report Maintenance Defect</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ALL ROOMS STATUS */}
        {activeTab === 'All Rooms Status' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-dark-900">
                  Full Property 3-Status Grid
                </h1>
                <p className="text-xs text-gray-500 mt-1 font-light">
                  Real-time status across all rooms: <strong>Occupancy</strong>, <strong>Housekeeping</strong>, and <strong>Maintenance</strong>.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-white border border-gray-200 p-1 rounded-lg text-xs shadow-xs">
                {['All Floors', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5'].map((fl) => (
                  <button
                    key={fl}
                    onClick={() => setFloorFilter(fl)}
                    className={`px-3 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                      floorFilter === fl
                        ? 'bg-dark-900 text-white font-medium shadow-xs'
                        : 'text-gray-600 hover:text-dark-900'
                    }`}
                  >
                    {fl}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rooms
                .filter((r) => floorFilter === 'All Floors' || r.floor?.includes(floorFilter.replace('Floor ', '')))
                .map((room) => {
                  const occ = (room.occupancyStatus || room.occupancy?.toUpperCase() || 'VACANT');
                  const hk = (room.housekeepingStatus || room.cleanliness?.toUpperCase() || 'CLEAN');
                  const maint = (room.maintenanceStatus || 'AVAILABLE').toUpperCase();
                  const isClean = hk === 'CLEAN' || hk === 'INSPECTED';

                  return (
                    <div
                      key={room.roomNumber}
                      className="p-4 rounded-xl border bg-white border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif text-base font-bold text-dark-900">
                            Room {room.roomNumber}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">{room.floor}</span>
                        </div>

                        <div className="text-xs text-dark-900 font-medium mb-3">{room.type}</div>

                        {/* 3 Status Pills */}
                        <div className="space-y-1 p-2 bg-gray-50 rounded-lg text-[10px] mb-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Occupancy:</span>
                            <span className="font-bold">{occ}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Housekeeping:</span>
                            <span className={`font-bold ${isClean ? 'text-emerald-700' : 'text-red-700'}`}>{hk}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Maintenance:</span>
                            <span className={`font-bold ${maint === 'AVAILABLE' ? 'text-emerald-700' : 'text-red-700'}`}>{maint}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex gap-2">
                        {isClean ? (
                          <button
                            onClick={() => {
                              markRoomDirty(room.roomNumber, 'Manual Housekeeping turnover flagged');
                              showToast(`Room ${room.roomNumber} marked DIRTY`);
                            }}
                            className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-dark-900 rounded text-xs transition-colors cursor-pointer"
                          >
                            Flag Dirty
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              cleanRoom(room.roomNumber, cleanerName);
                              showToast(`Room ${room.roomNumber} marked CLEAN!`);
                            }}
                            className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-medium transition-colors cursor-pointer shadow-xs"
                          >
                            Clean & Ready
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 3: MAINTENANCE ISSUES */}
        {activeTab === 'Maintenance Issues' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-dark-900">
                  Maintenance & Out-of-Service Queue
                </h1>
                <p className="text-xs text-gray-500 mt-1 font-light">
                  Rooms under maintenance are strictly prevented from new guest check-ins.
                </p>
              </div>

              <button
                onClick={() => setIsMaintenanceModalOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Report Room Problem</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {maintenanceTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white p-5 rounded-xl border border-rose-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif text-base font-bold text-dark-900">
                        Room {ticket.roomNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          ticket.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    <div className="font-semibold text-dark-900 text-sm mb-1">{ticket.issueDescription}</div>
                    <div className="text-[11px] text-gray-500 mb-3 font-light">
                      Severity: <span className="font-bold text-rose-600">{ticket.severity}</span> • Reported by: {ticket.reportedBy}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex gap-2">
                    {ticket.status !== 'RESOLVED' ? (
                      <button
                        onClick={() => {
                          updateMaintenanceTicket(ticket.id, 'RESOLVED', `Problem resolved by ${cleanerName}`);
                          cleanRoom(ticket.roomNumber, 'Post-maintenance turnover');
                          showToast(`✓ Ticket #${ticket.id} resolved! Room ${ticket.roomNumber} returned to AVAILABLE.`);
                        }}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-medium cursor-pointer shadow-xs"
                      >
                        Mark Problem Resolved (Return Available)
                      </button>
                    ) : (
                      <div className="w-full py-1 text-center text-xs text-emerald-700 font-medium">
                        ✓ Problem Resolved
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PERSONAL HISTORY */}
        {activeTab === 'Personal History' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                Personal Cleaning History ({cleanerName})
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                Certified record of suites sanitized, turnover durations, and inspection sign-offs.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-[#fbfbfb] border-b border-gray-200 text-gray-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Task ID</th>
                      <th className="py-3 px-4">Room & Type</th>
                      <th className="py-3 px-4">Sanitization Action</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Completed At</th>
                      <th className="py-3 px-4">Inspection Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {housekeepingHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-dark-900">{item.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-dark-900">Room {item.roomNumber}</div>
                          <div className="text-[11px] text-gray-500">{item.type}</div>
                        </td>
                        <td className="py-3 px-4 text-dark-900">{item.action}</td>
                        <td className="py-3 px-4 font-mono text-gray-600">{item.duration}</td>
                        <td className="py-3 px-4 text-gray-600">{item.completedAt}</td>
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

        {/* TAB 5: SUPPLIES & RESTOCK */}
        {activeTab === 'Supplies & Restock' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                Housekeeping Linen & Chemical Supplies
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                Linen inventory, luxury amenities, and cleaning supply levels on cart #4.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Egyptian Cotton Sheets (King)', level: '48 sets', status: 'Optimal' },
                { name: 'Plush Bathrobes & Towels', level: '72 pairs', status: 'Optimal' },
                { name: 'Hermes Eau d\'Orange Verte Kits', level: '18 sets', status: 'Low Stock' },
                { name: 'Hospital-Grade Sanitizing Solution', level: '12 Gal', status: 'Optimal' },
                { name: 'Feather Down Pillows', level: '30 units', status: 'Optimal' },
                { name: 'Nespresso Pods & Luxury Teas', level: '120 pods', status: 'Optimal' },
              ].map((sup, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-dark-900">{sup.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sup.status === 'Optimal' ? 'bg-emerald-50 text-emerald-700' : 'bg-gold-50 text-gold-700 border border-gold-200'
                    }`}>
                      {sup.status}
                    </span>
                  </div>
                  <div className="font-mono text-lg font-bold text-dark-900 mb-3">{sup.level}</div>
                  <button
                    onClick={() => showToast(`Restock request sent for ${sup.name}`)}
                    className="w-full py-1.5 bg-gold-500 hover:bg-gold-600 text-white rounded text-xs font-semibold transition-colors cursor-pointer shadow-xs"
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
