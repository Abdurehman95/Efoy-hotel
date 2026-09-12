import React, { useState, useEffect, useRef } from 'react';
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
  Search,
  LogOut,
  Plus,
  Edit2,
  Home,
  Trash2,
  Menu,
  X
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { useHotel } from '../../context/HotelContext';
import ConfirmModal from '../shared/ConfirmModal';

Chart.register(...registerables);

const AdminDashboard = ({ user, onLogout, onBackToSite }) => {
  const {
    rooms,
    bookings,
    menuItems,
    orders,
    staffList,
    activityLogs,
    addMenuItem,
    editMenuItem,
    deleteMenuItem,
    toggleDishStock,
    addStaff,
    editStaff,
    deleteStaff,
    updateRoom,
    addRoom,
    deleteRoom,
    resetDemoData,
  } = useHotel();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget) return;
    if (deleteConfirmTarget.type === 'room') {
      deleteRoom(deleteConfirmTarget.id);
      showToast(`Room ${deleteConfirmTarget.id} removed from inventory`);
    } else if (deleteConfirmTarget.type === 'dish') {
      deleteMenuItem(deleteConfirmTarget.id);
      showToast(`"${deleteConfirmTarget.name || 'Dish'}" removed from menu`);
    } else if (deleteConfirmTarget.type === 'staff') {
      deleteStaff(deleteConfirmTarget.id);
      showToast('Staff member removed from directory');
    }
    setDeleteConfirmTarget(null);
  };
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');

  // Modals state
  const [modalType, setModalType] = useState(null); // 'addStaff', 'editStaff', 'addRoom', 'editRoom', 'addFood', 'editFood', 'reservation'
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);

  // Forms
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    department: 'Front Desk',
    role: 'Receptionist',
    shift: 'Morning (07:00 - 15:30)',
    status: 'Active Duty',
  });

  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    type: 'Single Classic',
    floor: 'Floor 1 (West Wing)',
    capacity: '1 Person',
    rate: 180,
    features: 'Single Bed • City View',
  });

  const [foodForm, setFoodForm] = useState({
    name: '',
    category: 'All-Day Dining',
    price: 25.0,
    prepTime: '15-20 mins',
    description: '',
  });

  // Chart Canvas Refs
  const revenueChartRef = useRef(null);
  const occupancyChartRef = useRef(null);
  const roomTypeChartRef = useRef(null);

  const chartInstances = useRef({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Filtered queries across tabs based on searchQuery
  const q = searchQuery.trim().toLowerCase();

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = bookingStatusFilter === 'All' || b.status === bookingStatusFilter;
    if (!matchesFilter) return false;
    if (!q) return true;
    return (
      b.id?.toLowerCase().includes(q) ||
      b.guestName?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.roomNumber?.toString().toLowerCase().includes(q) ||
      b.roomType?.toLowerCase().includes(q) ||
      b.status?.toLowerCase().includes(q)
    );
  });

  const filteredRooms = rooms.filter((r) => {
    if (!q) return true;
    return (
      r.roomNumber?.toString().toLowerCase().includes(q) ||
      r.type?.toLowerCase().includes(q) ||
      r.capacity?.toLowerCase().includes(q) ||
      r.cleanliness?.toLowerCase().includes(q) ||
      r.occupancy?.toLowerCase().includes(q) ||
      r.floor?.toLowerCase().includes(q) ||
      r.features?.toLowerCase().includes(q)
    );
  });

  const filteredMenuItems = menuItems.filter((dish) => {
    if (!q) return true;
    return (
      dish.name?.toLowerCase().includes(q) ||
      dish.category?.toLowerCase().includes(q) ||
      dish.description?.toLowerCase().includes(q) ||
      dish.prepTime?.toLowerCase().includes(q)
    );
  });

  const filteredStaff = staffList.filter((staff) => {
    if (!q) return true;
    return (
      staff.name?.toLowerCase().includes(q) ||
      staff.email?.toLowerCase().includes(q) ||
      staff.department?.toLowerCase().includes(q) ||
      staff.role?.toLowerCase().includes(q) ||
      staff.shift?.toLowerCase().includes(q) ||
      staff.status?.toLowerCase().includes(q)
    );
  });

  const filteredActivityLogs = activityLogs.filter((log) => {
    if (!q) return true;
    return (
      log.title?.toLowerCase().includes(q) ||
      log.description?.toLowerCase().includes(q) ||
      log.tag?.toLowerCase().includes(q) ||
      log.category?.toLowerCase().includes(q)
    );
  });

  // Nav Menu items
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

  // Initialize or re-render Chart.js when on Analytics or Dashboard tab
  useEffect(() => {
    if (activeTab !== 'Analytics' && activeTab !== 'Dashboard') return;

    const instances = chartInstances.current;

    // Destroy previous charts safely
    if (instances.revenue) {
      instances.revenue.destroy();
      instances.revenue = null;
    }
    if (instances.occupancy) {
      instances.occupancy.destroy();
      instances.occupancy = null;
    }
    if (instances.roomType) {
      instances.roomType.destroy();
      instances.roomType = null;
    }

    // Dynamic counts for room types
    const singleCount = rooms.filter((r) => r.type?.toLowerCase().includes('single')).length || 1;
    const doubleCount = rooms.filter((r) => r.type?.toLowerCase().includes('double')).length || 1;
    const suiteCount = rooms.filter((r) => r.type?.toLowerCase().includes('suite')).length || 1;
    const penthouseCount = rooms.filter((r) => r.type?.toLowerCase().includes('penthouse')).length || 1;

    // 1. Revenue Chart
    if (revenueChartRef.current) {
      Chart.getChart(revenueChartRef.current)?.destroy();
      const ctx = revenueChartRef.current.getContext('2d');
      instances.revenue = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Room Tariffs ($)',
              data: [32400, 38500, 44200, 48920, 56200, 64000, 58900],
              borderColor: '#f97316',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              tension: 0.35,
              fill: true,
              borderWidth: 2.5,
              pointRadius: 4,
              pointBackgroundColor: '#ea580c',
            },
            {
              label: 'In-Room Dining ($)',
              data: [8200, 9400, 11200, 12800, 15400, 17900, 14800],
              borderColor: '#0284c7',
              backgroundColor: 'rgba(2, 132, 199, 0.08)',
              tension: 0.35,
              fill: true,
              borderWidth: 2,
              pointRadius: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: { size: 11, family: 'sans-serif' } } },
            tooltip: { padding: 10 },
          },
          scales: {
            y: {
              grid: { color: '#f1f5f9' },
              ticks: { font: { size: 10 }, callback: (v) => `$${v / 1000}k` },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 } },
            },
          },
        },
      });
    }

    // 2. Occupancy Rate Chart
    if (occupancyChartRef.current) {
      Chart.getChart(occupancyChartRef.current)?.destroy();
      const ctx = occupancyChartRef.current.getContext('2d');
      instances.occupancy = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Occupancy %',
              data: [72, 78, 83.5, 88, 94, 96, 85],
              backgroundColor: '#0f172a',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              max: 100,
              grid: { color: '#f1f5f9' },
              ticks: { font: { size: 10 }, callback: (v) => `${v}%` },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 } },
            },
          },
        },
      });
    }

    // 3. Room Type Trends (Doughnut)
    if (roomTypeChartRef.current) {
      Chart.getChart(roomTypeChartRef.current)?.destroy();
      const ctx = roomTypeChartRef.current.getContext('2d');
      instances.roomType = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Single Rooms', 'Double Deluxe', 'Executive Suites', 'Penthouse'],
          datasets: [
            {
              data: [singleCount, doubleCount, suiteCount, penthouseCount],
              backgroundColor: ['#3b82f6', '#f59e0b', '#f97316', '#0f172a'],
              borderWidth: 2,
              borderColor: '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
          },
        },
      });
    }

    return () => {
      if (instances.revenue) {
        instances.revenue.destroy();
        instances.revenue = null;
      }
      if (instances.occupancy) {
        instances.occupancy.destroy();
        instances.occupancy = null;
      }
      if (instances.roomType) {
        instances.roomType.destroy();
        instances.roomType = null;
      }
    };
  }, [activeTab, rooms]);

  // Handle Staff Form
  const handleSaveStaff = (e) => {
    e.preventDefault();
    if (modalType === 'editStaff' && selectedItemForEdit) {
      editStaff({ ...selectedItemForEdit, ...staffForm });
      showToast(`Updated staff profile for ${staffForm.name}`);
    } else {
      addStaff(staffForm);
      showToast(`Added ${staffForm.name} to hotel directory`);
    }
    setModalType(null);
    setSelectedItemForEdit(null);
  };

  // Handle Room Form
  const handleSaveRoom = (e) => {
    e.preventDefault();
    const rateNum = parseFloat(roomForm.rate) || 0;
    if (modalType === 'editRoom' && selectedItemForEdit) {
      updateRoom({
        ...selectedItemForEdit,
        ...roomForm,
        rate: rateNum,
      });
      showToast(`Updated Room ${roomForm.roomNumber} parameters`);
    } else {
      if (rooms.some((r) => r.roomNumber.toString() === roomForm.roomNumber.toString())) {
        showToast(`Room ${roomForm.roomNumber} already exists in inventory!`);
        return;
      }
      addRoom({
        ...roomForm,
        rate: rateNum,
      });
      showToast(`Room ${roomForm.roomNumber} added to inventory`);
    }
    setModalType(null);
    setSelectedItemForEdit(null);
  };

  // Handle Food Form
  const handleSaveFood = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(foodForm.price) || 0;
    if (modalType === 'editFood' && selectedItemForEdit) {
      editMenuItem({
        ...selectedItemForEdit,
        ...foodForm,
        price: priceNum,
      });
      showToast(`Updated dish ${foodForm.name}`);
    } else {
      addMenuItem({
        ...foodForm,
        price: priceNum,
        image: selectedItemForEdit?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
      });
      showToast(`Added ${foodForm.name} to in-room dining catalog`);
    }
    setModalType(null);
    setSelectedItemForEdit(null);
  };

  // Occupancy calc
  const occupiedCount = rooms.filter((r) => r.occupancy === 'Occupied').length;
  const occupancyPercentage = rooms.length > 0 ? Math.round((occupiedCount / rooms.length) * 100) : 0;

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
                  GH
                </div>
                <div>
                  <h1 className="font-serif text-sm font-bold tracking-wider text-white uppercase">
                    Grand Horizon
                  </h1>
                  <p className="text-[9px] tracking-[0.25em] text-slate-400 uppercase font-medium">
                    Hotel & Suites
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
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
                Operations & Admin
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

            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="text-white font-semibold text-xs truncate max-w-[140px]">
                {user?.name || 'Alexander Sterling'}
              </div>
              <button
                onClick={onLogout}
                className="text-red-400 hover:text-red-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR (lg:flex) */}
      <aside className="hidden lg:flex lg:w-64 bg-slate-900 border-r border-slate-800 flex-col shrink-0">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-serif font-bold text-sm shadow-md">
              GH
            </div>
            <div>
              <h1 className="font-serif text-sm font-bold tracking-wider text-white uppercase">
                Grand Horizon
              </h1>
              <p className="text-[9px] tracking-[0.25em] text-slate-400 uppercase font-medium">
                Hotel & Suites
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

        {/* Navigation items */}
        <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 tracking-[0.15em] uppercase">
            Operations & Admin
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

        {/* Live Occupancy Widget */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-300">
              Live Occupancy
            </span>
            <span className="text-amber-400 font-bold text-xs">{occupancyPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
              style={{ width: `${occupancyPercentage}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{occupiedCount}/{rooms.length} Filled</span>
            <span className="text-emerald-400 font-medium">{rooms.length - occupiedCount} Free</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <button
            onClick={() => showToast('Help Center Documentation v2.4.0')}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <HelpCircle size={13} />
            <span>Help Center</span>
          </button>
          <span className="font-mono text-[10px] text-slate-400">v2.4.0</span>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP NAVIGATION BAR */}
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
                placeholder="Search portal (guests, rooms, menu, staff)..."
                className="w-full pl-8 sm:pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock size={14} className="text-slate-400" />
              <span>Wednesday, Oct 24 • 10:45AM</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-serif font-semibold text-xs flex items-center justify-center border border-amber-400/30 shrink-0">
                AS
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                  {user?.name || 'Alexander Sterling'}
                </div>
                <div className="text-[10px] text-slate-500">General Manager</div>
              </div>

              <button
                onClick={onLogout}
                title="Log Out"
                className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'Dashboard' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Property Operations
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    System Optimal
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  Property Overview & Operations
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Real-time hotel performance, key inventory occupancy, and departmental status.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setStaffForm({
                      name: '',
                      email: '',
                      department: 'Front Desk',
                      role: 'Receptionist',
                      shift: 'Morning (07:00 - 15:30)',
                      status: 'Active Duty',
                    });
                    setModalType('addStaff');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus size={14} />
                  <span>+ Staff</span>
                </button>
                <button
                  onClick={() => {
                    setRoomForm({
                      roomNumber: '601',
                      type: 'Luxury Suite',
                      floor: 'Floor 6 (Penthouse)',
                      capacity: '4 Persons',
                      rate: 650,
                      features: '2 King Beds • Sky Terrace',
                    });
                    setModalType('addRoom');
                  }}
                  className="bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus size={14} />
                  <span>+ Room</span>
                </button>
                <button
                  onClick={() => setActiveTab('Analytics')}
                  className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <BarChart3 size={14} />
                  <span>View Chart.js Analytics</span>
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Total Revenue (Today)
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    +14.2%
                  </span>
                </div>
                <div className="font-serif text-3xl font-bold text-slate-900 mb-1">
                  $48,920
                </div>
                <div className="text-[11px] text-slate-500">
                  Accommodation: $38,500 • Culinary: {orders.length} orders ({orders.filter((o) => o.status === 'Pending' || o.status === 'Cooking').length} active)
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Live Occupancy
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Optimal
                  </span>
                </div>
                <div className="font-serif text-3xl font-bold text-slate-900 mb-1">
                  {occupancyPercentage}%
                </div>
                <div className="text-[11px] text-slate-500">
                  {occupiedCount} of {rooms.length} Suites Occupied
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Active Staff On Duty
                  </span>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    All Stations
                  </span>
                </div>
                <div className="font-serif text-3xl font-bold text-slate-900 mb-1">
                  {staffList.filter((s) => s.status === 'Active Duty').length}
                </div>
                <div className="text-[11px] text-slate-500">
                  Front Desk, Culinary Kitchen & Housekeeping
                </div>
              </div>
            </div>

            {/* Quick Chart.js preview in Dashboard */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-serif text-lg font-bold text-slate-900">
                    Revenue & Financial Trajectory (Chart.js)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Weekly performance comparing room charges vs in-room dining volume
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('Analytics')}
                  className="text-xs font-semibold text-[#c2410c] hover:underline"
                >
                  Full Analytics →
                </button>
              </div>
              <div className="h-64 w-full">
                <canvas ref={revenueChartRef}></canvas>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS (CHART.JS: REVENUE, OCCUPANCY, ROOM TYPE TRENDS) */}
        {activeTab === 'Analytics' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Executive Intelligence
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Chart.js Powered
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Analytics & Performance Trends
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Revenue streams, daily occupancy rates, and room type revenue popularity trends.
              </p>
            </div>

            {/* Top Chart: Revenue Stream */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
                <div>
                  <h2 className="font-serif text-lg font-bold text-slate-900">
                    Revenue Performance Curve
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time room tariff vs food & beverage receipts across the past 7 days
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Gross: $342,800 MTD
                  </span>
                </div>
              </div>
              <div className="h-72 w-full">
                <canvas ref={revenueChartRef}></canvas>
              </div>
            </div>

            {/* Bottom Row: Occupancy Bar + Room Type Doughnut */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Occupancy Bar */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs">
                <h2 className="font-serif text-base font-bold text-slate-900 mb-1">
                  Daily Occupancy Rate (%)
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Capacity utilization across the property keys
                </p>
                <div className="h-60 w-full">
                  <canvas ref={occupancyChartRef}></canvas>
                </div>
              </div>

              {/* Room Type Trends */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs">
                <h2 className="font-serif text-base font-bold text-slate-900 mb-1">
                  Room Type Revenue Share
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Single, Double Deluxe, Executive Suite, and Penthouse proportions
                </p>
                <div className="h-60 w-full">
                  <canvas ref={roomTypeChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BOOKINGS */}
        {activeTab === 'Bookings' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">
                  Reservations & Master Folios
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  All guest reservations, stay durations, and room assignments.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'In-House', 'Arriving Today', 'Departing Today', 'Checked Out'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setBookingStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      bookingStatusFilter === status
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Room & Type</th>
                    <th className="py-3 px-4">Stay Dates</th>
                    <th className="py-3 px-4">Tariff / Night</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        No reservations found matching your criteria.
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="ml-2 text-amber-600 underline font-medium cursor-pointer"
                          >
                            Clear search
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{b.guestName}</div>
                          <div className="text-[11px] text-slate-500">{b.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">Room {b.roomNumber}</div>
                          <div className="text-[11px] text-slate-500">{b.roomType}</div>
                        </td>
                        <td className="py-3 px-4">
                          {b.checkIn} → {b.checkOut} ({b.nights}n)
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ${b.roomRate}/nt
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              b.status === 'In-House'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : b.status === 'Arriving Today'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : b.status === 'Departing Today'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ROOM MANAGEMENT (PRICING, CAPACITY, ROOM TYPE) */}
        {activeTab === 'Room Management' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">
                  Room Inventory & Pricing Configuration
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Manage nightly tariffs, capacities, and room types (Single/Double/Suite).
                </p>
              </div>
              <button
                onClick={() => {
                  setRoomForm({
                    roomNumber: `${Math.floor(100 + Math.random() * 899)}`,
                    type: 'Luxury Suite',
                    floor: 'Floor 4 (North Panorama)',
                    capacity: '4 Persons',
                    rate: 450,
                    features: 'King Bed • Terrace View',
                  });
                  setModalType('addRoom');
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Room Unit</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Room #</th>
                    <th className="py-3 px-4">Type (Single / Double / Suite)</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Nightly Rate</th>
                    <th className="py-3 px-4">Cleanliness</th>
                    <th className="py-3 px-4">Occupancy</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRooms.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                        No rooms match your search query.
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="ml-2 text-amber-600 underline font-medium cursor-pointer"
                          >
                            Clear search
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredRooms.map((r) => (
                      <tr key={r.roomNumber} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-serif font-bold text-slate-900">
                          Room {r.roomNumber}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{r.type}</td>
                        <td className="py-3 px-4 text-slate-600">{r.capacity}</td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-700">
                          ${r.rate} / night
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.cleanliness === 'Clean' || r.cleanliness === 'Inspected'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {r.cleanliness}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{r.occupancy}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedItemForEdit(r);
                                setRoomForm({
                                  roomNumber: r.roomNumber,
                                  type: r.type,
                                  floor: r.floor || 'Floor 1 (West Wing)',
                                  capacity: r.capacity || '2 Persons',
                                  rate: r.rate || 180,
                                  features: r.features || 'Single Bed • City View',
                                });
                                setModalType('editRoom');
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded cursor-pointer"
                              title="Edit Pricing & Capacity"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirmTarget({
                                  type: 'room',
                                  id: r.roomNumber,
                                  name: `Room ${r.roomNumber}`,
                                  title: 'Delete Room',
                                  message: `Are you sure you want to delete Room ${r.roomNumber} (${r.type})? This will permanently remove the suite from active inventory.`,
                                });
                              }}
                              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded cursor-pointer transition-colors"
                              title="Delete Room"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: MENU MANAGEMENT */}
        {activeTab === 'Menu Management' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">
                  Culinary Room Service Catalog
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Add, modify, or remove in-room dining dishes, pricing, and stock status.
                </p>
              </div>
              <button
                onClick={() => {
                  setFoodForm({
                    name: '',
                    category: 'All-Day Dining',
                    price: 28.0,
                    prepTime: '20 mins',
                    description: '',
                  });
                  setModalType('addFood');
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Add Culinary Item</span>
              </button>
            </div>

            {filteredMenuItems.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center text-slate-500 text-xs col-span-full">
                No culinary dishes match your search query.
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-amber-600 underline font-medium cursor-pointer"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMenuItems.map((dish) => (
                  <div
                    key={dish.id}
                    className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {dish.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            dish.inStock
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {dish.inStock ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 mb-1">{dish.name}</h3>
                      <p className="text-xs text-slate-500 mb-3 leading-relaxed">{dish.description}</p>
                      <div className="flex justify-between text-xs font-mono font-bold mb-4">
                        <span className="text-slate-500 font-normal">⏱ {dish.prepTime || '15 mins'}</span>
                        <span className="text-amber-700 text-sm">${Number(dish.price || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => toggleDishStock(dish.id)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                      >
                        {dish.inStock ? 'Mark Out of Stock' : 'Mark Available'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedItemForEdit(dish);
                            setFoodForm({
                              name: dish.name,
                              category: dish.category,
                              price: dish.price,
                              prepTime: dish.prepTime || '15-20 mins',
                              description: dish.description || '',
                            });
                            setModalType('editFood');
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirmTarget({
                              type: 'dish',
                              id: dish.id,
                              name: dish.name,
                              title: 'Delete Menu Item',
                              message: `Are you sure you want to delete "${dish.name}" from the in-room dining catalog?`,
                            });
                          }}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer transition-colors"
                          title="Delete Dish"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: STAFF MANAGEMENT (RECEPTIONISTS, CHEFS, CLEANERS) */}
        {activeTab === 'Staff Management' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">
                  Staff Personnel Directory
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Add, edit, or remove Receptionists, Chefs, Cleaners, and Management staff.
                </p>
              </div>
              <button
                onClick={() => {
                  setStaffForm({
                    name: '',
                    email: '',
                    department: 'Front Desk',
                    role: 'Receptionist',
                    shift: 'Morning (07:00 - 15:30)',
                    status: 'Active Duty',
                  });
                  setModalType('addStaff');
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Add Staff Member</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Staff Name & Contact</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Shift</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        No staff members match your search query.
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="ml-2 text-amber-600 underline font-medium cursor-pointer"
                          >
                            Clear search
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => (
                      <tr key={staff.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{staff.name}</div>
                          <div className="text-[11px] text-slate-500">{staff.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {staff.department}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">{staff.role}</td>
                        <td className="py-3 px-4 text-slate-600">{staff.shift}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              staff.status === 'Active Duty'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {staff.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedItemForEdit(staff);
                                setStaffForm({
                                  name: staff.name,
                                  email: staff.email,
                                  department: staff.department,
                                  role: staff.role,
                                  shift: staff.shift || 'Morning (07:00 - 15:30)',
                                  status: staff.status || 'Active Duty',
                                });
                                setModalType('editStaff');
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                              title="Edit Staff"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirmTarget({
                                  type: 'staff',
                                  id: staff.id,
                                  name: staff.name,
                                  title: 'Remove Staff Member',
                                  message: `Are you sure you want to remove ${staff.name} (${staff.role}) from the staff directory?`,
                                });
                              }}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer transition-colors"
                              title="Delete Staff"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: ACTIVITY LOGS */}
        {activeTab === 'Activity Logs' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Live Activity Logs & Audit Trail
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Real-time synchronized events across Front Desk bookings, Housekeeping turnovers, and Kitchen orders.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
              {filteredActivityLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No activity logs match your search query.
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-2 text-amber-600 underline font-medium cursor-pointer"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                filteredActivityLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/70">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-slate-900">{log.title}</span>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {log.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{log.description}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">{log.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS */}
        {activeTab === 'Settings' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 max-w-3xl space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Hotel System & Property Settings
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Configure taxation rates, default currency, and operational protocols.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Property Name
                </label>
                <input
                  type="text"
                  defaultValue="Grand Horizon Hotel & Suites"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  readOnly
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    State Hospitality Surcharge & Tax (%)
                  </label>
                  <input
                    type="number"
                    defaultValue={12}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Default Currency
                  </label>
                  <select className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all hotel data (rooms, bookings, orders, staff, menu) to default demo state?')) {
                      resetDemoData();
                      showToast('Hotel system reset to original demo state');
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset Demo Data
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Hotel settings updated successfully!')}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* STAFF MODAL */}
      {(modalType === 'addStaff' || modalType === 'editStaff') && (
        <div
          className="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setModalType(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                {modalType === 'addStaff' ? 'Add Staff Member' : 'Edit Staff Details'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="e.g. Maria Santos"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="name@efoyhotel.com"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Department
                  </label>
                  <select
                    value={staffForm.department}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 bg-white"
                  >
                    <option>Front Desk</option>
                    <option>Kitchen / F&B</option>
                    <option>Housekeeping</option>
                    <option>Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    required
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    placeholder="e.g. Receptionist, Chef, Cleaner"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Assigned Shift
                  </label>
                  <input
                    type="text"
                    value={staffForm.shift}
                    onChange={(e) => setStaffForm({ ...staffForm, shift: e.target.value })}
                    placeholder="e.g. Morning (07:00 - 15:30)"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Duty Status
                  </label>
                  <select
                    value={staffForm.status}
                    onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 bg-white"
                  >
                    <option value="Active Duty">Active Duty</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm cursor-pointer"
                >
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROOM MODAL */}
      {(modalType === 'addRoom' || modalType === 'editRoom') && (
        <div
          className="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setModalType(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                {modalType === 'addRoom' ? 'Add Room to Inventory' : 'Edit Room Parameters'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={modalType === 'editRoom'}
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    className={`w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none ${
                      modalType === 'editRoom' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'focus:border-slate-800'
                    }`}
                  />
                  {modalType === 'editRoom' && (
                    <span className="text-[10px] text-slate-400">Fixed room identifier</span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Nightly Rate ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={roomForm.rate}
                    onChange={(e) => setRoomForm({ ...roomForm, rate: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Room Type
                  </label>
                  <select
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 bg-white"
                  >
                    <option value="Single Classic">Single Classic</option>
                    <option value="Single Deluxe">Single Deluxe</option>
                    <option value="Double Deluxe">Double Deluxe</option>
                    <option value="Double Executive">Double Executive</option>
                    <option value="Luxury Suite">Luxury Suite</option>
                    <option value="Penthouse Panoramic">Penthouse Panoramic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Floor Location
                  </label>
                  <input
                    type="text"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                    placeholder="e.g. Floor 2 (East Wing)"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Capacity
                </label>
                <input
                  type="text"
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                  placeholder="e.g. 2 Adults, 1 Child"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Features & Amenities
                </label>
                <input
                  type="text"
                  value={roomForm.features}
                  onChange={(e) => setRoomForm({ ...roomForm, features: e.target.value })}
                  placeholder="e.g. King Bed • Balcony • Marble Bath"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm cursor-pointer"
                >
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOD MODAL */}
      {(modalType === 'addFood' || modalType === 'editFood') && (
        <div
          className="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setModalType(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                {modalType === 'addFood' ? 'Add Culinary Item' : 'Edit Culinary Item'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Dish / Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={foodForm.category}
                    onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 bg-white"
                  >
                    <option>Breakfast</option>
                    <option>All-Day Dining</option>
                    <option>Chef Special</option>
                    <option>Beverages</option>
                    <option>Desserts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Preparation Time
                </label>
                <input
                  type="text"
                  value={foodForm.prepTime}
                  onChange={(e) => setFoodForm({ ...foodForm, prepTime: e.target.value })}
                  placeholder="e.g. 15-20 mins"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DELETIONS */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmTarget)}
        onClose={() => setDeleteConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteConfirmTarget?.title || 'Confirm Deletion'}
        message={
          deleteConfirmTarget?.message ||
          'Are you sure you want to delete this item? This action cannot be undone.'
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        icon="trash"
      />
    </div>
  );
};

export default AdminDashboard;
