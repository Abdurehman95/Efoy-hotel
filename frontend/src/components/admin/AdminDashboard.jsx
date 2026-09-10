import React, { useState, useEffect } from 'react';
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
  Bell,
  LogOut,
  ChevronDown,
  Plus,
  ArrowUpRight,
  Download,
  CheckCircle2,
  AlertCircle,
  Check,
  Filter,
  ExternalLink,
  Edit2,
  CalendarDays,
  MoreVertical,
  Utensils,
  Bed,
  CreditCard,
  Building2,
  ShieldCheck,
  RefreshCw,
  Home
} from 'lucide-react';

const AdminDashboard = ({ user, onLogout, onBackToSite }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [timeRange, setTimeRange] = useState('Today');
  const [roomTypeFilter, setRoomTypeFilter] = useState('All');
  const [roomStatusFilter, setRoomStatusFilter] = useState('All Status');
  const [staffDeptFilter, setStaffDeptFilter] = useState('All Staff');
  const [diningCategoryFilter, setDiningCategoryFilter] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive dish stock toggles
  const [dishes, setDishes] = useState([
    {
      id: 1,
      name: 'Truffle Wagyu Burger',
      category: 'All-Day Dining',
      inStock: true,
      description: 'Brioche bun, caramelized onion, Gruyere, black truffle aioli, rosemary fries.',
      prepTime: '20-25 mins',
      orderedToday: 24,
      price: '$36.00',
    },
    {
      id: 2,
      name: 'Belgian Waffle Stack',
      category: 'Breakfast',
      inStock: true,
      description: 'Organic berry compote, Madagascar vanilla bean cream, Canadian maple syrup.',
      prepTime: '15 mins',
      orderedToday: 38,
      price: '$24.00',
    },
    {
      id: 3,
      name: 'Chilean Sea Bass',
      category: 'Chef Special',
      inStock: true,
      description: 'Pan-seared with saffron emulsion, baby fennel, and fingerling potato crisps.',
      prepTime: '25-30 mins',
      orderedToday: 19,
      price: '$48.00',
    },
    {
      id: 4,
      name: 'Valrhona Fondant',
      category: 'Desserts',
      inStock: true,
      description: 'Warm molten chocolate center, hazelnut praline gelato, edible 24k gold leaf.',
      prepTime: '12 mins',
      orderedToday: 15,
      price: '$18.00',
    },
  ]);

  // Modals for actions
  const [modalType, setModalType] = useState(null); // 'reservation', 'checkin', 'addRoom', 'addStaff', 'addFood', 'export'
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const toggleDishStock = (id) => {
    setDishes((prev) =>
      prev.map((dish) => {
        if (dish.id === id) {
          const updated = !dish.inStock;
          showToast(`${dish.name} marked ${updated ? 'In Stock' : 'Unavailable'}`);
          return { ...dish, inStock: updated };
        }
        return dish;
      })
    );
  };

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

  // Room Inventory items matching admin.png
  const roomInventory = [
    {
      roomNumber: '402',
      type: 'Double Executive',
      keycard: '#AURA-402-9',
      floor: 'Floor 4 (East Wing)',
      features: 'King Bed • Oceanfront',
      rate: '$360/nt',
      capacity: '2 Adults, 1 Child',
      status: 'Occupied',
      statusColor: 'bg-orange-50 text-orange-700 border-orange-200',
      guestDetails: {
        name: 'Elena Rostova',
        time: 'Check-out: Tomorrow, 11:00 AM',
        hasFolio: true,
        hasService: true,
      },
      actionText: 'Assign Guest',
      actionStyle: 'text-gray-600 hover:bg-gray-100 border border-gray-300',
    },
    {
      roomNumber: '510',
      type: 'Luxury Suite',
      keycard: '#AURA-510-1',
      floor: 'Floor 5 (North Panorama)',
      features: '2 King Beds • Terrace & Jacuzzi',
      rate: '$650/nt',
      capacity: '4 Persons',
      status: 'Available Clean',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      guestDetails: {
        name: 'Inspected & Sanitized',
        time: 'Ready for Instant Check-in',
        highlight: true,
      },
      actionText: 'Assign Guest',
      actionStyle: 'bg-[#92400e] text-white hover:bg-[#78350f] font-medium shadow-xs',
    },
    {
      roomNumber: '204',
      type: 'Single Deluxe',
      keycard: '#AURA-204-4',
      floor: 'Floor 2 (Courtyard View)',
      features: 'Queen Bed • Work Desk',
      rate: '$220/nt',
      capacity: '1–2 Persons',
      status: 'Housekeeping',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      guestDetails: {
        name: 'Turn-down in progress',
        time: 'Attendant: Maria G. (Est. 12 mins)',
      },
      actionText: 'Inspect Room',
      actionStyle: 'text-gray-700 hover:bg-gray-100 border border-gray-300 font-medium',
    },
    {
      roomNumber: '701',
      type: 'Penthouse',
      isVIP: true,
      keycard: 'Private Elevator Access',
      floor: 'Floor 7 (Penthouse Level)',
      features: '3 Bed Master • Butler Suite',
      rate: '$1,250/nt',
      capacity: '6 Persons',
      status: 'VIP In-House',
      statusColor: 'bg-rose-50 text-rose-700 border-rose-200',
      guestDetails: {
        name: 'Lord Henry Montgomery',
        time: 'Concierge Dedicated: Jean-Luc',
      },
      actionText: 'Concierge VIP',
      actionStyle: 'bg-[#831843] text-white hover:bg-[#701a75] font-medium shadow-xs',
    },
    {
      roomNumber: '315',
      type: 'Double Deluxe',
      keycard: 'Keycard Inactive',
      floor: 'Floor 3 (West Garden)',
      features: 'Queen Bed • Balcony',
      rate: '$340/nt',
      capacity: '2 Persons',
      status: 'Maintenance',
      statusColor: 'bg-red-50 text-red-700 border-red-200',
      guestDetails: {
        name: 'HVAC Inspection & Filter',
        time: 'Tech Assigned: Marcus R.',
      },
      actionText: 'Work Order',
      actionStyle: 'text-gray-700 hover:bg-gray-100 border border-gray-300 font-medium',
    },
  ];

  // Staff list matching admin.png
  const staffList = [
    {
      id: 'EMP-6321',
      name: 'Jean-Luc Laurent',
      station: 'Front Desk',
      department: 'Guest Experience',
      deptBg: 'bg-purple-50 text-purple-700 border-purple-200',
      role: 'Senior Concierge Lead',
      subRole: 'Lobby Concierge Desk',
      shift: 'Morning (07:00 - 15:30)',
      status: 'Active Duty',
      avatar: 'JL',
      avatarColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'EMP-6042',
      name: 'Guillaume Vane',
      station: 'F&B Division',
      department: 'Kitchen & Culinary',
      deptBg: 'bg-orange-50 text-orange-700 border-orange-200',
      role: 'Executive Head Chef',
      subRole: 'Main Production Kitchen',
      shift: 'Morning/Split (10:00 - 22:00)',
      status: 'Active Duty',
      avatar: 'GV',
      avatarColor: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'EMP-7193',
      name: 'Maya Thorne',
      station: 'F&B Division',
      department: 'Kitchen & Culinary',
      deptBg: 'bg-orange-50 text-orange-700 border-orange-200',
      role: 'Sous Chef (In-Room Dining)',
      subRole: 'Expedite Station 1',
      shift: 'Evening (14:00 - 22:30)',
      status: 'On Break (15m)',
      avatar: 'MT',
      avatarColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'EMP-4211',
      name: 'Maria Gutierrez',
      station: 'Housekeeping',
      department: 'Housekeeping',
      deptBg: 'bg-blue-50 text-blue-700 border-blue-200',
      role: 'Floor Supervisor',
      subRole: 'Floors 2 & 3 East',
      shift: 'Morning (06:30 - 15:00)',
      status: 'Active Duty',
      avatar: 'MG',
      avatarColor: 'bg-emerald-100 text-emerald-800',
    },
  ];

  // Operational Logs matching admin.png
  const operationalLogs = [
    {
      id: 1,
      title: 'Guest Check-in Completed',
      tag: 'FRONT DESK',
      description: 'Room 402 guest Mr. Marcus Vance checked in by Receptionist Sarah Jenkins. Folio pre-authorized ($1,500).',
      time: '8 mins ago',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500 bg-emerald-50 border-emerald-200',
    },
    {
      id: 2,
      title: 'Room Service Order Placed',
      tag: 'KITCHEN POS',
      description: 'Room 701 placed order #RS-2094 (2x Chilean Sea Bass, 1x Chablis Premier Cru). Expedited to Station 1.',
      time: '14 mins ago',
      icon: UtensilsCrossed,
      iconColor: 'text-orange-500 bg-orange-50 border-orange-200',
    },
    {
      id: 3,
      title: 'Housekeeping Update',
      tag: 'TURNOVER',
      description: 'Room 204 marked "Cleaning In-Progress" by Housekeeper Maria Gutierrez. Linens replaced.',
      time: '22 mins ago',
      icon: Bed,
      iconColor: 'text-blue-500 bg-blue-50 border-blue-200',
    },
    {
      id: 4,
      title: 'Online Direct Reservation',
      tag: 'AURA BOOKING ENGINE',
      description: 'Direct reservation confirmed for Luxury Suite (Nov 1-5, total $3,250) via Web Portal. CC Verified.',
      time: '41 mins ago',
      icon: Calendar,
      iconColor: 'text-teal-500 bg-teal-50 border-teal-200',
    },
    {
      id: 5,
      title: 'Guest Departure & Folio Settled',
      tag: 'CASHIERING',
      description: 'Room 118 guest departed. Folio settled ($1,420.50). Keycard revoked; room flagged for full turnover.',
      time: '55 mins ago',
      icon: CreditCard,
      iconColor: 'text-slate-500 bg-slate-50 border-slate-200',
    },
  ];

  const filteredDishes = dishes.filter((dish) => {
    if (diningCategoryFilter === 'All Items') return true;
    if (diningCategoryFilter === 'Breakfast') return dish.category === 'Breakfast';
    if (diningCategoryFilter === 'All-Day Dining') return dish.category === 'All-Day Dining';
    if (diningCategoryFilter === 'Desserts') return dish.category === 'Desserts';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row text-slate-800 font-sans antialiased selection:bg-orange-100 selection:text-orange-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-slide-up border border-slate-700">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR */}
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

        {/* Live Occupancy Widget at bottom of Sidebar */}
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

        {/* Footer info in sidebar */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <button
            onClick={() => showToast('Help Center Documentation Loaded')}
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
              <Building2 size={14} className="text-slate-500" />
              <span>Aura Grand Downtown (Main)</span>
              <ChevronDown size={13} className="text-slate-400" />
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => showToast('3 New operational notifications')}
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
                  Alexander Sterling
                </div>
                <div className="text-[10px] text-slate-500">General Manager</div>
              </div>

              {/* Logout button */}
              <button
                onClick={onLogout}
                title="Log Out to Public Site"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* OPERATIONS OVERVIEW SUBHEADER */}
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
                    onClick={() => setTimeRange(t)}
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
                onClick={() => {
                  setModalType('reservation');
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus size={15} />
                <span>Reservation</span>
              </button>

              <button
                onClick={() => {
                  setModalType('checkin');
                }}
                className="bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <CheckCircle2 size={15} />
                <span>Check-in</span>
              </button>

              <button
                onClick={() => {
                  showToast('Exporting operations report as CSV...');
                }}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Download size={14} className="text-slate-500" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN DASHBOARD BODY */}
        <div className="px-4 sm:px-6 lg:px-8 pb-12 space-y-6">
          {/* STAT CARDS (2 rows x 3 columns) */}
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

          {/* MIDDLE ANALYTICS SECTION (3 Columns) */}
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

          {/* SECTION 1: ROOM INVENTORY & LIVE RACK */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Table Header Controls */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-lg font-bold text-slate-900">
                      Room Inventory & Live Rack
                    </h2>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      170 Keys
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time room occupancy, status codes, housekeeping workflow, and folio assignment.
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModalType('addRoom')}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus size={14} />
                    <span>Add Room</span>
                  </button>
                  <button
                    onClick={() => showToast('Batch pricing editor opened')}
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Batch Price
                  </button>
                  <button
                    onClick={() => showToast('Displaying 8-Floor architectural map')}
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Floor Map
                  </button>
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {/* Room Types */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {['All (170)', 'Single (45)', 'Double (55)', 'Suites (40)'].map((opt) => {
                    const cleanOpt = opt.split(' ')[0];
                    const isSelected = roomTypeFilter === cleanOpt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setRoomTypeFilter(cleanOpt)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Status Types */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {['All Status', 'Available (24)', 'Occupied (142)', 'Housekeeping (4)'].map((st) => {
                    const cleanSt = st.split(' ')[0];
                    const isSelected = roomStatusFilter === cleanSt;
                    return (
                      <button
                        key={st}
                        onClick={() => setRoomStatusFilter(cleanSt)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-600 text-white font-semibold'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Room / Key</th>
                    <th className="py-3 px-4">Type & Floor</th>
                    <th className="py-3 px-4">Nightly Rate</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Guest / Turn Details</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roomInventory.map((room) => (
                    <tr key={room.roomNumber} className="hover:bg-slate-50/70 transition-colors">
                      {/* Room / Key */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {room.roomNumber}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{room.type}</span>
                              {room.isVIP && (
                                <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded">
                                  VIP
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Keycard {room.keycard}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type & Floor */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-medium text-slate-800">{room.floor}</div>
                        <div className="text-[11px] text-slate-500">{room.features}</div>
                      </td>

                      {/* Nightly Rate */}
                      <td className="py-4 px-4 align-top">
                        <span className="font-semibold text-slate-900">{room.rate}</span>
                      </td>

                      {/* Capacity */}
                      <td className="py-4 px-4 align-top text-slate-600">
                        {room.capacity}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${room.statusColor}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {room.status}
                        </span>
                      </td>

                      {/* Guest / Turn Details */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-medium text-slate-800">{room.guestDetails.name}</div>
                        <div className="text-[11px] text-slate-500">{room.guestDetails.time}</div>
                        {room.guestDetails.hasFolio && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <button
                              onClick={() => showToast(`Folio for Room ${room.roomNumber} opened`)}
                              className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              Folio
                            </button>
                            <button
                              onClick={() => showToast(`Service Request for Room ${room.roomNumber} submitted`)}
                              className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              Service Request
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right">
                        <button
                          onClick={() => {
                            showToast(`Action executed: ${room.actionText} for Room ${room.roomNumber}`);
                          }}
                          className={`text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${room.actionStyle}`}
                        >
                          {room.actionText}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>Showing 5 of 170 active units</span>
                <div className="hidden md:flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Occupied
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Housekeeping
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Maintenance
                  </span>
                </div>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-1">
                <button className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-40">
                  Previous
                </button>
                <button className="px-2.5 py-1 rounded bg-slate-900 text-white font-bold cursor-pointer">
                  1
                </button>
                <button className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
                  2
                </button>
                <button className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
                  3
                </button>
                <button className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: STAFF DIRECTORY & ROSTER */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg font-bold text-slate-900">
                    Staff Directory & Roster
                  </h2>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    58 Active On-Premises
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Departmental staffing, shift allocations, real-time duty status, and operational contact.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalType('addStaff')}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus size={14} />
                  <span>Add Staff</span>
                </button>
                <button
                  onClick={() => showToast('Department shift schedule opened')}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Shift Schedule
                </button>
                <button
                  onClick={() => showToast('Staff logs exported')}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Dept Logs
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-2 text-xs">
              {['All Staff (58)', 'Reception (16)', 'Kitchen & F&B (22)', 'Housekeeping (20)'].map(
                (dept) => {
                  const cleanDept = dept.split(' ')[0];
                  const isSelected = staffDeptFilter === cleanDept;
                  return (
                    <button
                      key={dept}
                      onClick={() => setStaffDeptFilter(cleanDept)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {dept}
                    </button>
                  );
                }
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Employee & ID</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Role & Station</th>
                    <th className="py-3 px-4">Shift Allocation</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffList.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Employee & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full ${staff.avatarColor} font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0`}
                          >
                            {staff.avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{staff.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {staff.id} • {staff.station}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-medium border ${staff.deptBg}`}
                        >
                          {staff.department}
                        </span>
                      </td>

                      {/* Role & Station */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{staff.role}</div>
                        <div className="text-[10px] text-slate-500">{staff.subRole}</div>
                      </td>

                      {/* Shift */}
                      <td className="py-3.5 px-4 text-slate-600">{staff.shift}</td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            staff.status === 'Active Duty'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {staff.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 text-slate-400">
                          <button
                            onClick={() => showToast(`Editing details for ${staff.name}`)}
                            title="Edit"
                            className="p-1.5 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => showToast(`Schedule for ${staff.name} opened`)}
                            title="Calendar Schedule"
                            className="p-1.5 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <CalendarDays size={14} />
                          </button>
                          <button
                            onClick={() => showToast(`Options for ${staff.name}`)}
                            title="More"
                            className="p-1.5 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: IN-ROOM DINING & CULINARY INVENTORY */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg font-bold text-slate-900">
                    In-Room Dining & Culinary Inventory
                  </h2>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Room Service 24/7
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage live dish availability, prepare time estimates, pricing structures, and daily order volumes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalType('addFood')}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus size={14} />
                  <span>Add Food Item</span>
                </button>
              </div>
            </div>

            {/* Category filters */}
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-2 text-xs">
              {['All Items', 'Breakfast', 'All-Day Dining', 'Beverages', 'Desserts'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setDiningCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    diningCategoryFilter === cat
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 4 Culinary Cards Grid */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${
                    dish.inStock
                      ? 'bg-white border-slate-200/90 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">
                        {dish.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          dish.inStock
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {dish.inStock ? '● In Stock' : '● Sold Out'}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-slate-900 mb-1">
                      {dish.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-3">
                      {dish.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-3">
                      <span>⏱ {dish.prepTime}</span>
                      <span>{dish.orderedToday} ordered today</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-serif font-bold text-base text-slate-900">
                      {dish.price}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showToast(`Editing recipe & price for ${dish.name}`)}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors cursor-pointer"
                        title="Edit dish"
                      >
                        <Edit2 size={13} />
                      </button>
                      {/* Interactive toggle */}
                      <button
                        type="button"
                        onClick={() => toggleDishStock(dish.id)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          dish.inStock ? 'bg-amber-600' : 'bg-slate-300'
                        }`}
                        title={dish.inStock ? 'Click to mark Sold Out' : 'Click to mark In Stock'}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                            dish.inStock ? 'right-1' : 'left-1'
                          }`}
                        ></div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: OPERATIONAL LOGS & AUDIT TRAIL */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-slate-900">
                  Operational Logs & Audit Trail
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live synchronized system events across front desk, F&B, and housekeeping
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Sync Frequency: 1.5s
                </span>
                <button
                  onClick={() => showToast('Log filters active: All events')}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Filter Logs
                </button>
              </div>
            </div>

            {/* Event rows */}
            <div className="divide-y divide-slate-100">
              {operationalLogs.map((log) => {
                const Icon = log.icon;
                return (
                  <div
                    key={log.id}
                    className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${log.iconColor}`}
                      >
                        <Icon size={15} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900">
                            {log.title}
                          </span>
                          <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                            {log.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {log.description}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                      {log.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTION MODALS */}
      {modalType && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setModalType(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif font-bold text-lg text-slate-900 capitalize">
                {modalType === 'reservation' && 'Create New Reservation'}
                {modalType === 'checkin' && 'Front Desk Check-in'}
                {modalType === 'addRoom' && 'Add Room Unit to Inventory'}
                {modalType === 'addStaff' && 'Add Staff Member'}
                {modalType === 'addFood' && 'Add Culinary Menu Item'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Enter operational parameters to update live property records.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast(`Successfully processed ${modalType} record!`);
                setModalType(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reference / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Guest or Item Name"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Department / Type
                </label>
                <select className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 bg-white">
                  <option>Executive Suite / Front Desk</option>
                  <option>Deluxe King / Housekeeping</option>
                  <option>Penthouse / Concierge</option>
                  <option>F&B Culinary / Room Service</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer shadow-sm"
                >
                  Confirm & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
