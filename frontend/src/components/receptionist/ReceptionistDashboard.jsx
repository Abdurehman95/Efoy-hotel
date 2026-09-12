import React, { useState } from 'react';
import {
  Bell,
  Search,
  Users,
  Calendar,
  CreditCard,
  DoorClosed,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  Plus,
  LogOut,
  Home,
  ChevronRight,
  Receipt,
  Sparkles,
  Utensils,
  Bed,
  Check,
  Building2,
  X,
  FileText,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Flame,
  Menu
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import PrintableInvoice from '../shared/PrintableInvoice';

const ReceptionistDashboard = ({ user, onLogout, onBackToSite }) => {
  const {
    rooms,
    bookings,
    orders,
    assignRoom,
    createWalkInBooking,
    getGuestFolio,
    checkoutGuest,
    undoCheckout,
    cleanRoom,
  } = useHotel();

  const [activeTab, setActiveTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [dirtyAlertModal, setDirtyAlertModal] = useState(null); // { room, bookingId }
  const [selectedFolioForInvoice, setSelectedFolioForInvoice] = useState(null);
  const [checkoutConfirmFolio, setCheckoutConfirmFolio] = useState(null); // Folio awaiting confirmation
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState('Visa Signature •••• 4092');
  const [assignModalData, setAssignModalData] = useState(null); // { booking }

  // Walk-in form state
  const [walkInData, setWalkInData] = useState({
    name: '',
    email: '',
    phone: '',
    roomNumber: '201',
    nights: 2,
    paymentMethod: 'Credit Card (Terminal Verified)',
    notes: 'Walk-in arrival • Immediate keys issued',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Metrics
  const inHouseGuests = bookings.filter((b) => b.status === 'In-House');
  const arrivalsToday = bookings.filter((b) => b.status === 'Arriving Today');
  const departuresToday = bookings.filter((b) => b.status === 'Departing Today');
  const dirtyRooms = rooms.filter((r) => r.cleanliness === 'Dirty');
  const cleanRooms = rooms.filter((r) => r.cleanliness === 'Clean' || r.cleanliness === 'Inspected');

  // Handle room assignment with Smart Dirty Alert
  const handleAttemptAssign = (bookingId, roomNumber) => {
    const result = assignRoom(bookingId, roomNumber, false);
    if (result.isDirtyAlert) {
      setDirtyAlertModal({
        room: result.room,
        bookingId,
        message: result.message,
      });
    } else if (result.success) {
      showToast(result.message);
      setAssignModalData(null);
    } else {
      showToast(result.message || 'Assignment failed');
    }
  };

  // Override dirty room alert
  const handleForceAssignDirty = () => {
    if (!dirtyAlertModal) return;
    const result = assignRoom(dirtyAlertModal.bookingId, dirtyAlertModal.room.roomNumber, true);
    showToast(`⚠️ Override warning: Assigned to Dirty Room ${dirtyAlertModal.room.roomNumber}`);
    setDirtyAlertModal(null);
    setAssignModalData(null);
  };

  // Handle Walk-In Submit
  const handleWalkInSubmit = (e) => {
    e.preventDefault();
    const targetRoom = rooms.find((r) => r.roomNumber === walkInData.roomNumber);

    if (targetRoom && targetRoom.cleanliness === 'Dirty') {
      setDirtyAlertModal({
        room: targetRoom,
        bookingId: 'NEW_WALKIN',
        message: `Selected Room ${walkInData.roomNumber} is currently DIRTY! (${targetRoom.dirtyReason || 'Needs cleaning'}).`,
      });
      return;
    }

    createWalkInBooking(walkInData);
    showToast(`Guest ${walkInData.name} checked into Room ${walkInData.roomNumber}!`);
    setIsWalkInModalOpen(false);
    setWalkInData({
      name: '',
      email: '',
      phone: '',
      roomNumber: '201',
      nights: 2,
      paymentMethod: 'Credit Card (Terminal Verified)',
      notes: 'Walk-in arrival • Immediate keys issued',
    });
  };

  // Checkout Flow with Confirmation & Cancellation
  const handleInitiateCheckout = (roomNumber) => {
    const folio = getGuestFolio(roomNumber);
    if (!folio || !folio.booking) {
      showToast(`No active booking found for Room ${roomNumber}`);
      return;
    }
    setCheckoutConfirmFolio(folio);
  };

  const handleExecuteCheckout = (roomNumber, paymentMethod) => {
    const res = checkoutGuest(roomNumber, paymentMethod || 'Visa Signature •••• 4092');
    if (res.success) {
      showToast(`Room ${roomNumber} settled and checked out. Flagged Dirty for Housekeeping!`);
      setSelectedFolioForInvoice(res.folio);
      setCheckoutConfirmFolio(null);
    } else {
      showToast(res.message);
    }
  };

  const handleCancelCheckoutModal = () => {
    setCheckoutConfirmFolio(null);
    showToast('Check-out was cancelled. Guest stay remains active.');
  };

  const handleUndoCheckout = (bookingId, roomNumber) => {
    const res = undoCheckout(bookingId);
    showToast(res.message || `Check-out for Room ${roomNumber} reverted.`);
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (roomFilter === 'Clean') return r.cleanliness === 'Clean' || r.cleanliness === 'Inspected';
    if (roomFilter === 'Dirty') return r.cleanliness === 'Dirty';
    if (roomFilter === 'Occupied') return r.occupancy === 'Occupied';
    if (roomFilter === 'Available') return r.occupancy === 'Available';
    return true;
  });

  const navMenuItems = [
    { name: 'Overview', icon: Home },
    { name: 'Room Rack & Assign', icon: DoorClosed },
    { name: 'Walk-In Booking', icon: UserCheck },
    { name: 'Billing & Checkout', icon: Receipt },
    { name: 'Guest Invoices', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[150] bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-amber-500/40 text-xs flex items-center gap-2 animate-slide-down">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {selectedFolioForInvoice && (
        <PrintableInvoice
          folio={selectedFolioForInvoice}
          onClose={() => setSelectedFolioForInvoice(null)}
        />
      )}

      {/* SMART ALERT: DIRTY ROOM WARNING MODAL */}
      {dirtyAlertModal && (
        <div className="fixed inset-0 z-[130] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-red-500/80 max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 text-slate-800">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Smart Alert: Room is Dirty!
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                  5-Star Hospitality Safeguard
                </span>
              </div>
            </div>

            <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-800 mb-4">
              <p className="font-semibold mb-1">
                Room {dirtyAlertModal.room.roomNumber} ({dirtyAlertModal.room.type})
              </p>
              <p className="text-red-700 leading-relaxed">
                {dirtyAlertModal.message}
              </p>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              To preserve five-star Forbes luxury standards, arriving guests must only enter verified Clean rooms. Would you like to request an instant Housekeeping priority clean or select an alternative clean room?
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  cleanRoom(dirtyAlertModal.room.roomNumber, 'Reception Fast-Track Clean');
                  showToast(`Room ${dirtyAlertModal.room.roomNumber} marked Clean & Inspected!`);
                  setDirtyAlertModal(null);
                }}
                className="flex-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Quick-Clean & Assign</span>
              </button>

              <button
                type="button"
                onClick={() => setDirtyAlertModal(null)}
                className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Pick Clean Room
              </button>

              {dirtyAlertModal.bookingId !== 'NEW_WALKIN' && (
                <button
                  type="button"
                  onClick={handleForceAssignDirty}
                  className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                >
                  Override Warning
                </button>
              )}
            </div>
          </div>
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
                    Front Desk Portal
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
                Front Desk Actions
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
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center">
                  JV
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Julian Vance</div>
                  <div className="text-[10px] text-slate-400">Head Receptionist</div>
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
        {/* Brand Header */}
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
                Front Desk Portal
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
            Front Desk Actions
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

        {/* Live Alerts Widget */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-300">
              Dirty Room Warning
            </span>
            <span className={`font-bold text-xs ${dirtyRooms.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {dirtyRooms.length} Rooms
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
            {dirtyRooms.length > 0
              ? `${dirtyRooms.map((r) => r.roomNumber).join(', ')} require cleaning before check-in.`
              : 'All vacant rooms are sanitized & ready.'}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
            <span>Clean: {cleanRooms.length}</span>
            <span className="text-amber-400 font-medium">In-House: {inHouseGuests.length}</span>
          </div>
        </div>

        {/* User profile & logout */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center">
              JV
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Julian Vance</div>
              <div className="text-[10px] text-slate-400">Head Receptionist</div>
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
        {/* TOP HEADER */}
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
                placeholder="Search guests, rooms..."
                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock size={14} className="text-slate-400" />
              <span>Front Desk • Live</span>
            </div>

            <button
              onClick={() => setIsWalkInModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus size={14} />
              <span className="hidden xs:inline">+ Walk-In</span>
              <span className="xs:hidden">Walk-In</span>
            </button>
          </div>
        </header>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'Overview' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Front Desk Real-Time Dashboard
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Reception Active
                </span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Arrivals, Departures & In-House Roster
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage guest arrivals, checkouts, smart room allocations, and direct folios.
              </p>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Arrivals */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
                  <span>Arrivals Today</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Expected
                  </span>
                </div>
                <div className="font-serif text-3xl font-bold text-slate-900 mb-1">
                  {arrivalsToday.length}
                </div>
                <div className="text-[11px] text-slate-500">
                  VIP limousine arrivals: 1 reserved
                </div>
              </div>

              {/* In-House */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
                  <span>In-House Guests</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
                <div className="font-serif text-3xl font-bold text-slate-900 mb-1">
                  {inHouseGuests.length}
                </div>
                <div className="text-[11px] text-slate-500">
                  Total guest count: {inHouseGuests.length * 2} persons
                </div>
              </div>

              {/* Departures */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
                  <span>Departures Today</span>
                  <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Check-out
                  </span>
                </div>
                <div className="font-serif text-3xl font-bold text-slate-900 mb-1">
                  {departuresToday.length}
                </div>
                <div className="text-[11px] text-slate-500">
                  Late checkout approved: 1 suite
                </div>
              </div>

              {/* Dirty Rooms Safeguard */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
                  <span>Dirty Rooms</span>
                  <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                    Action Req.
                  </span>
                </div>
                <div className="font-serif text-3xl font-bold text-red-600 mb-1">
                  {dirtyRooms.length}
                </div>
                <div className="text-[11px] text-slate-500">
                  Smart alerts active on assignment
                </div>
              </div>
            </div>

            {/* ACTIVE GUEST ROSTER TABLE */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-lg font-bold text-slate-900">
                    Guest Operational Manifest
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time status of arriving, residing, and departing patrons
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWalkInModalOpen(true)}
                    className="px-3 py-1.5 bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create Walk-In</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Guest & Confirmation</th>
                      <th className="py-3 px-4">Room & Type</th>
                      <th className="py-3 px-4">Stay Period</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Folio Total (Room + Dining)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((booking) => {
                      const folio = getGuestFolio(booking.roomNumber);
                      const isDirty = rooms.find((r) => r.roomNumber === booking.roomNumber)?.cleanliness === 'Dirty';

                      return (
                        <tr key={booking.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{booking.guestName}</div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                              <span>{booking.id}</span>
                              <span>•</span>
                              <span>{booking.phone}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">Room {booking.roomNumber}</span>
                              {isDirty && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 border border-red-200">
                                  <AlertTriangle size={10} />
                                  DIRTY
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{booking.roomType}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 font-medium">
                              {booking.checkIn} → {booking.checkOut}
                            </div>
                            <div className="text-[10px] text-slate-500">{booking.nights} Night(s)</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                booking.status === 'In-House'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : booking.status === 'Departing Today'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : booking.status === 'Arriving Today'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {booking.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-slate-900">
                              ${folio.grandTotal.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Room: ${folio.roomTotal} | Food: ${folio.foodTotal}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedFolioForInvoice(folio)}
                                title="Print Invoice"
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Printer size={12} />
                                <span>Invoice</span>
                              </button>

                              {booking.status !== 'Checked Out' ? (
                                <button
                                  onClick={() => handleInitiateCheckout(booking.roomNumber)}
                                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  Checkout
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUndoCheckout(booking.id, booking.roomNumber)}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                                  title="Revert check-out and restore active stay"
                                >
                                  Undo Check-out
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROOM RACK & ASSIGN */}
        {activeTab === 'Room Rack & Assign' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">
                  Room Rack & Smart Allocation
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Live visual grid of all suites with cleanliness safeguards and one-click assignments.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg text-xs font-medium shadow-2xs">
                {['All', 'Available', 'Occupied', 'Clean', 'Dirty'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setRoomFilter(f)}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      roomFilter === f
                        ? 'bg-slate-900 text-white shadow-xs font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {filteredRooms.map((room) => {
                const assignedGuest = bookings.find((b) => b.roomNumber === room.roomNumber && b.status !== 'Checked Out');
                const isDirty = room.cleanliness === 'Dirty';

                return (
                  <div
                    key={room.roomNumber}
                    className={`p-4 rounded-xl border bg-white shadow-2xs transition-all relative ${
                      isDirty ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif text-lg font-bold text-slate-900">
                        Room {room.roomNumber}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          isDirty
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : room.cleanliness === 'Cleaning'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {room.cleanliness.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-700 mb-1">{room.type}</div>
                    <div className="text-[11px] text-slate-500 mb-2 font-mono">${room.rate} / night</div>

                    <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-xs mb-3">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Status:</span>
                        <span className={`font-semibold ${room.occupancy === 'Occupied' ? 'text-orange-700' : 'text-emerald-700'}`}>
                          {room.occupancy}
                        </span>
                      </div>
                      {assignedGuest ? (
                        <div className="font-semibold text-slate-900 truncate">
                          👤 {assignedGuest.guestName}
                        </div>
                      ) : (
                        <div className="text-slate-400 italic">Vacant • Ready for check-in</div>
                      )}
                    </div>

                    {isDirty && (
                      <div className="text-[10px] text-red-600 bg-red-50 p-2 rounded mb-3 flex items-start gap-1">
                        <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                        <span>{room.dirtyReason || 'Cleaning turnover required'}</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      {isDirty ? (
                        <button
                          onClick={() => {
                            cleanRoom(room.roomNumber, 'Reception Instant Override');
                            showToast(`Room ${room.roomNumber} clean status certified!`);
                          }}
                          className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Sparkles size={12} />
                          <span>Mark Cleaned</span>
                        </button>
                      ) : room.occupancy === 'Available' ? (
                        <button
                          onClick={() => {
                            setWalkInData((prev) => ({ ...prev, roomNumber: room.roomNumber }));
                            setIsWalkInModalOpen(true);
                          }}
                          className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Assign Walk-In
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInitiateCheckout(room.roomNumber)}
                          className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors cursor-pointer"
                        >
                          Check Out & Settle
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: WALK-IN BOOKING */}
        {activeTab === 'Walk-In Booking' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 max-w-3xl space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Express Walk-In Reservation
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Create a new guest record, assign a suite, and issue digital keycards in one seamless step.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
              <form onSubmit={handleWalkInSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Guest Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={walkInData.name}
                      onChange={(e) => setWalkInData({ ...walkInData, name: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="eleanor@vance-holdings.com"
                      value={walkInData.email}
                      onChange={(e) => setWalkInData({ ...walkInData, email: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 345-6789"
                      value={walkInData.phone}
                      onChange={(e) => setWalkInData({ ...walkInData, phone: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Room Allocation *
                    </label>
                    <select
                      value={walkInData.roomNumber}
                      onChange={(e) => setWalkInData({ ...walkInData, roomNumber: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                    >
                      {rooms
                        .filter((r) => r.occupancy === 'Available')
                        .map((r) => (
                          <option key={r.roomNumber} value={r.roomNumber}>
                            Room {r.roomNumber} - {r.type} (${r.rate}/nt) {r.cleanliness === 'Dirty' ? '⚠️ [DIRTY]' : '✓ [Clean]'}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Nights of Stay
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={walkInData.nights}
                      onChange={(e) => setWalkInData({ ...walkInData, nights: parseInt(e.target.value) || 1 })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={walkInData.paymentMethod}
                    onChange={(e) => setWalkInData({ ...walkInData, paymentMethod: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                  >
                    <option>Credit Card (Terminal Verified)</option>
                    <option>Corporate Direct Bill</option>
                    <option>Cash Deposit ($500)</option>
                    <option>Horizon Privilege Points</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Special Requests / Concierge Notes
                  </label>
                  <textarea
                    rows={2}
                    value={walkInData.notes}
                    onChange={(e) => setWalkInData({ ...walkInData, notes: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>Confirm Walk-In & Check-In</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: BILLING & CHECKOUT */}
        {activeTab === 'Billing & Checkout' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Automatic Billing & Folio Settlement
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Live aggregation of room tariffs and kitchen room service orders for immediate checkout.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {bookings
                .filter((b) => b.status !== 'Checked Out')
                .map((b) => {
                  const folio = getGuestFolio(b.roomNumber);
                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif text-base font-bold text-slate-900">
                            Room {b.roomNumber}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                            {b.status}
                          </span>
                        </div>

                        <div className="font-semibold text-slate-900 text-sm mb-1">{b.guestName}</div>
                        <div className="text-[11px] text-slate-500 mb-3">{b.roomType} • {b.nights} Night(s)</div>

                        {/* Charges breakdown */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 text-xs mb-4">
                          <div className="flex justify-between text-slate-600">
                            <span>Room Charge:</span>
                            <span className="font-mono font-medium">${folio.roomTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Food & Room Service:</span>
                            <span className="font-mono font-medium text-amber-700">
                              +${folio.foodTotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-500 text-[11px]">
                            <span>Taxes & Luxury Fees (12%):</span>
                            <span className="font-mono">${folio.taxes.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                            <span>Grand Total:</span>
                            <span className="font-mono text-amber-800">${folio.grandTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Food orders preview */}
                        {folio.foodOrders.length > 0 && (
                          <div className="mb-4">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                              Linked In-Room Dining ({folio.foodOrders.length} Order(s))
                            </span>
                            <div className="space-y-1">
                              {folio.foodOrders.map((ord) => (
                                <div key={ord.id} className="text-[11px] text-slate-600 flex justify-between">
                                  <span>#{ord.id} ({ord.status})</span>
                                  <span className="font-mono font-medium">${ord.total.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => setSelectedFolioForInvoice(folio)}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Printer size={13} />
                          <span>View Invoice</span>
                        </button>
                        <button
                          onClick={() => handleInitiateCheckout(b.roomNumber)}
                          className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Check Out
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 5: GUEST INVOICES */}
        {activeTab === 'Guest Invoices' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Archived & Live Guest Invoices
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Generate, download, and print official five-star hotel tax folios.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Invoice / Confirmation</th>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Room</th>
                    <th className="py-3 px-4">Accommodation Total</th>
                    <th className="py-3 px-4">Food & Dining Total</th>
                    <th className="py-3 px-4">Settled Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => {
                    const folio = getGuestFolio(b.roomNumber);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                          INV-{b.id}-2026
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{b.guestName}</td>
                        <td className="py-3 px-4">Room {b.roomNumber}</td>
                        <td className="py-3 px-4 font-mono">${folio.roomTotal.toFixed(2)}</td>
                        <td className="py-3 px-4 font-mono text-amber-700">${folio.foodTotal.toFixed(2)}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ${folio.grandTotal.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedFolioForInvoice(folio)}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Printer size={13} />
                              <span>Print Folio</span>
                            </button>
                            {b.status === 'Checked Out' && (
                              <button
                                onClick={() => handleUndoCheckout(b.id, b.roomNumber)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors cursor-pointer"
                                title="Revert checkout & restore in-house stay"
                              >
                                Reopen Stay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* CHECKOUT CONFIRMATION MODAL WITH CANCEL OPTION */}
      {checkoutConfirmFolio && (
        <div
          className="fixed inset-0 z-[135] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={handleCancelCheckoutModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Confirm Guest Check-Out
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Room {checkoutConfirmFolio.roomNumber} ({checkoutConfirmFolio.roomType})
                  </span>
                </div>
              </div>
              <button
                onClick={handleCancelCheckoutModal}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                title="Cancel & Keep In-House"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to finalize checkout for <strong className="text-slate-900">{checkoutConfirmFolio.guestName}</strong>? You can review all aggregated charges below or cancel this action.
            </p>

            {/* Folio itemization */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Accommodation ({checkoutConfirmFolio.nights} Night(s) @ ${checkoutConfirmFolio.roomRate}/nt):</span>
                <span className="font-mono font-medium">${checkoutConfirmFolio.roomTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>In-Room Dining Food Orders ({checkoutConfirmFolio.foodOrders?.length || 0} order(s)):</span>
                <span className="font-mono font-medium text-amber-700">+${checkoutConfirmFolio.foodTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Hospitality Tax & Luxury Surcharge (12%):</span>
                <span className="font-mono">${checkoutConfirmFolio.taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Grand Total Folio Balance:</span>
                <span className="font-mono text-base text-amber-800">${checkoutConfirmFolio.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment method selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Payment Settlement Method
              </label>
              <select
                value={checkoutPaymentMethod}
                onChange={(e) => setCheckoutPaymentMethod(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
              >
                <option value="Visa Signature •••• 4092">Visa Signature •••• 4092 (Chip & PIN)</option>
                <option value="Amex Centurion •••• 8820">Amex Centurion •••• 8820</option>
                <option value="Mastercard World Elite •••• 1104">Mastercard World Elite •••• 1104</option>
                <option value="Corporate Direct Folio Billing">Corporate Direct Folio Billing</option>
                <option value="Cash Settlement Paid at Desk">Cash Settlement Paid at Desk</option>
              </select>
            </div>

            {/* Note about room turning dirty */}
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800 mb-5 flex items-start gap-1.5">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>Upon confirmation, Room {checkoutConfirmFolio.roomNumber} will be flagged as DIRTY for Housekeeping turnover, and the tax invoice will be generated.</span>
            </div>

            {/* Action buttons: Cancel and Confirm */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelCheckoutModal}
                className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel Check-Out
              </button>
              <button
                type="button"
                onClick={() => handleExecuteCheckout(checkoutConfirmFolio.roomNumber, checkoutPaymentMethod)}
                className="px-5 py-2.5 bg-[#c2410c] hover:bg-[#9a3412] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 size={15} />
                <span>Confirm & Settle Check-Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WALK-IN MODAL */}
      {isWalkInModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsWalkInModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Create Walk-In Reservation
              </h3>
              <button
                onClick={() => setIsWalkInModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Guest Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lord Alexander Wright"
                  value={walkInData.name}
                  onChange={(e) => setWalkInData({ ...walkInData, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Room Assignment *
                  </label>
                  <select
                    value={walkInData.roomNumber}
                    onChange={(e) => setWalkInData({ ...walkInData, roomNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 bg-white"
                  >
                    {rooms.map((r) => (
                      <option key={r.roomNumber} value={r.roomNumber}>
                        Room {r.roomNumber} ({r.type}) {r.cleanliness === 'Dirty' ? '⚠️ DIRTY' : '✓ Clean'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nights of Stay
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={walkInData.nights}
                    onChange={(e) => setWalkInData({ ...walkInData, nights: parseInt(e.target.value) || 1 })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#c2410c] hover:bg-[#9a3412] rounded-lg cursor-pointer shadow-sm"
                >
                  Confirm Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
