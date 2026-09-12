import React, { useState } from 'react';
import {
  Key,
  Calendar,
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  Search,
  Home,
  LogOut,
  ShoppingBag,
  Bell,
  Bed,
  CreditCard,
  Phone,
  Plus,
  Minus,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Send,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

const GuestDashboard = ({ user, onLogout, onBackToSite }) => {
  const {
    rooms,
    bookings,
    menuItems,
    orders,
    placeFoodOrder,
    createGuestOnlineBooking,
    getGuestFolio,
  } = useHotel();

  const [activeTab, setActiveTab] = useState('My Stay & Key');
  const [toastMessage, setToastMessage] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Cart state for room service
  const [cart, setCart] = useState([]);
  const [foodCategory, setFoodCategory] = useState('All');
  const [orderNotes, setOrderNotes] = useState('');

  // Online booking state
  const [bookingForm, setBookingForm] = useState({
    roomType: 'Luxury Suite',
    checkIn: '2026-09-15',
    checkOut: '2026-09-18',
    guests: '2 Adults',
    notes: 'High floor preferred • Non-smoking',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Find user's active booking (or fallback to demo booking)
  const userBooking =
    bookings.find(
      (b) =>
        b.email?.toLowerCase() === user?.email?.toLowerCase() &&
        b.status !== 'Checked Out'
    ) ||
    bookings.find((b) => b.status === 'In-House') ||
    bookings[0];

  const assignedRoomNumber = userBooking ? userBooking.roomNumber : '101';
  const folio = getGuestFolio(assignedRoomNumber);

  // User's room food orders
  const guestOrders = orders.filter((o) => o.roomNumber === assignedRoomNumber);

  // Cart functions
  const addToCart = (dish) => {
    if (!dish.inStock) {
      showToast('Sorry, this dish is currently out of stock.');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.id === dish.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...dish, qty: 1 }];
    });
    showToast(`Added ${dish.name} to dining tray`);
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Submit food order
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Your dining tray is empty.');
      return;
    }

    placeFoodOrder({
      roomNumber: assignedRoomNumber,
      guestName: user?.name || userBooking?.guestName || 'Valued Guest',
      items: cart,
      notes: orderNotes,
    });

    setCart([]);
    setOrderNotes('');
    setActiveTab('Order Tracking');
    showToast('🍽️ Order sent to Kitchen! Charged to your room folio.');
  };

  // Submit online room booking
  const handleBookRoomSubmit = (e) => {
    e.preventDefault();
    const availableRoom = rooms.find(
      (r) => r.type === bookingForm.roomType && r.occupancy === 'Available'
    ) || rooms.find((r) => r.occupancy === 'Available');

    if (!availableRoom) {
      showToast('No available rooms matching this type currently. Please try another category.');
      return;
    }

    const d1 = new Date(bookingForm.checkIn);
    const d2 = new Date(bookingForm.checkOut);
    const nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));

    createGuestOnlineBooking({
      guestName: user?.name || 'Alexander Wright',
      email: user?.email || 'guest@efoyhotel.com',
      phone: '+1 (555) 234-5678',
      roomNumber: availableRoom.roomNumber,
      checkIn: bookingForm.checkIn,
      checkOut: bookingForm.checkOut,
      nights,
      notes: bookingForm.notes,
    });

    showToast(`🎉 Reservation confirmed! Room ${availableRoom.roomNumber} assigned to you.`);
    setActiveTab('My Stay & Key');
  };

  const filteredMenu = menuItems.filter((dish) => {
    if (foodCategory === 'All') return true;
    return dish.category === foodCategory;
  });

  const navMenuItems = [
    { name: 'My Stay & Key', icon: Key },
    { name: 'Book a Room', icon: Bed },
    { name: 'Room Service Dining', icon: UtensilsCrossed },
    { name: 'Order Tracking', icon: ShoppingBag },
    { name: 'Concierge Services', icon: Phone },
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
                  GH
                </div>
                <div>
                  <h1 className="font-serif text-sm font-bold tracking-wider text-white uppercase">
                    Grand Horizon
                  </h1>
                  <p className="text-[9px] tracking-[0.25em] text-slate-400 uppercase font-medium">
                    Guest Experience Portal
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
                Guest Privileges
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
                    {item.name === 'Room Service Dining' && cart.length > 0 && (
                      <span className="ml-auto bg-amber-500 text-slate-900 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                        {cart.reduce((s, i) => s + i.qty, 0)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-semibold text-xs flex items-center justify-center">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AW'}
                </div>
                <div className="truncate max-w-[130px]">
                  <div className="text-xs font-semibold text-white truncate">
                    {user?.name || 'Alexander Wright'}
                  </div>
                  <div className="text-[10px] text-amber-400/90 font-medium">Horizon Member</div>
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
              GH
            </div>
            <div>
              <h1 className="font-serif text-sm font-bold tracking-wider text-white uppercase">
                Grand Horizon
              </h1>
              <p className="text-[9px] tracking-[0.25em] text-slate-400 uppercase font-medium">
                Guest Experience Portal
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
            Guest Privileges
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
                {item.name === 'Room Service Dining' && cart.length > 0 && (
                  <span className="ml-auto bg-amber-500 text-slate-900 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                    {cart.reduce((s, i) => s + i.qty, 0)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Room Card Widget */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/30 shadow-md">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">
              Current Stay
            </span>
            <span className="text-[10px] font-mono text-slate-400">#AURA-KEY</span>
          </div>
          <div className="font-serif text-lg font-bold text-white mb-0.5">
            Room {assignedRoomNumber}
          </div>
          <div className="text-[11px] text-slate-400 mb-2">
            {userBooking?.roomType || 'Luxury Suite'}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-700/60 text-slate-300">
            <span>Folio Balance:</span>
            <span className="font-mono font-bold text-amber-400">${folio.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Guest Profile */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-semibold text-xs flex items-center justify-center">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AW'}
            </div>
            <div className="truncate max-w-[120px]">
              <div className="text-xs font-semibold text-white truncate">
                {user?.name || 'Alexander Wright'}
              </div>
              <div className="text-[10px] text-amber-400/90 font-medium">Horizon Member</div>
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
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Open navigation drawer"
            >
              <Menu size={20} />
            </button>
            <div className="truncate">
              <span className="text-xs text-slate-500 hidden sm:inline">Welcome to Grand Horizon, </span>
              <span className="text-xs font-bold text-slate-900">{user?.name || 'Alexander Wright'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('Room Service Dining')}
              className="px-2.5 sm:px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UtensilsCrossed size={14} className="text-amber-700" />
              <span className="hidden sm:inline">Order Room Service</span>
              <span className="sm:hidden">Dining</span>
              {cart.length > 0 && (
                <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('Book a Room')}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bed size={14} />
              <span className="hidden sm:inline">Book Another Room</span>
              <span className="sm:hidden">Book</span>
            </button>
          </div>
        </header>

        {/* TAB 1: MY STAY & KEY */}
        {activeTab === 'My Stay & Key' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Forbes Five-Star Suite Access
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active In-House Stay
                </span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Your Suite, Digital Key & Current Charges
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage your in-room preferences, unlock doors with mobile key, and view folio charges.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* DIGITAL KEYCARD (Interactive) */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between relative overflow-hidden border border-amber-500/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>

                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-serif text-sm tracking-widest uppercase text-amber-400 font-bold">
                      Grand Horizon
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-xs font-mono text-amber-200">
                      NFC KEYCARD
                    </span>
                  </div>

                  <div className="text-[10px] uppercase text-slate-400 tracking-wider">Suite Assignment</div>
                  <div className="font-serif text-4xl font-bold text-white mb-2">
                    Room {assignedRoomNumber}
                  </div>
                  <div className="text-xs text-slate-300 mb-6">
                    {userBooking?.roomType || 'Luxury Oceanfront Suite'}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pt-4 border-t border-white/10">
                    <div>
                      <span className="text-[9px] uppercase block text-slate-500">Guest</span>
                      <span className="font-semibold text-white">{user?.name || userBooking?.guestName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase block text-slate-500">Check-out</span>
                      <span className="font-semibold text-white">{userBooking?.checkOut || 'Sep 15, 2026'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => showToast('🔑 NFC Digital Key emitted! Room door unlocked.')}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-98"
                  >
                    <Key size={16} />
                    <span>Hold Phone to Door Lock</span>
                  </button>
                </div>
              </div>

              {/* STAY DETAILS & CHARGES */}
              <div className="lg:col-span-2 space-y-4">
                {/* Folio preview */}
                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-lg font-bold text-slate-900">
                      Live Folio & Room Charges
                    </h2>
                    <span className="text-xs text-slate-500">
                      Syncs with Reception & Kitchen
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Suite Accommodation
                      </span>
                      <div className="font-mono text-lg font-bold text-slate-900">
                        ${folio.roomTotal.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">{folio.nights} nights @ ${folio.roomRate}/nt</div>
                    </div>

                    <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/60">
                      <span className="text-[10px] uppercase font-bold text-amber-800 block mb-1">
                        Room Service Dining
                      </span>
                      <div className="font-mono text-lg font-bold text-amber-900">
                        ${folio.foodTotal.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-amber-700">{folio.foodOrders.length} order(s) placed</div>
                    </div>

                    <div className="p-3 bg-slate-900 text-white rounded-lg shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                        Total Balance Due
                      </span>
                      <div className="font-mono text-lg font-bold text-white">
                        ${folio.grandTotal.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">Incl. taxes & service</div>
                    </div>
                  </div>

                  {/* Orders list */}
                  {guestOrders.length > 0 ? (
                    <div>
                      <span className="text-xs uppercase font-bold text-slate-500 block mb-2">
                        Recent In-Room Dining Tickets
                      </span>
                      <div className="space-y-2">
                        {guestOrders.map((ord) => (
                          <div
                            key={ord.id}
                            className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-semibold text-slate-900">Order #{ord.id}</div>
                              <div className="text-[11px] text-slate-500">
                                {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                  ord.status === 'Pending'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : ord.status === 'Cooking'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : ord.status === 'Ready'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {ord.status}
                              </span>
                              <div className="font-mono font-bold text-slate-900 mt-1">
                                ${ord.total.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 py-3 text-center border-t border-slate-100">
                      No room service orders placed yet today.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOK A ROOM */}
        {activeTab === 'Book a Room' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 max-w-4xl space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Online Suite Reservation
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Select room categories, dates, and instantly reserve your stay with direct member privileges.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
              <form onSubmit={handleBookRoomSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingForm.checkIn}
                      onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingForm.checkOut}
                      onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Select Suite Category
                    </label>
                    <select
                      value={bookingForm.roomType}
                      onChange={(e) => setBookingForm({ ...bookingForm, roomType: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 bg-white"
                    >
                      <option value="Single Classic">Single Classic ($180/nt)</option>
                      <option value="Double Deluxe">Double Deluxe ($280/nt)</option>
                      <option value="Double Executive">Double Executive ($340/nt)</option>
                      <option value="Luxury Suite">Luxury Suite ($520/nt)</option>
                      <option value="Penthouse Panoramic">Penthouse Panoramic ($850/nt)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Guests
                    </label>
                    <select
                      value={bookingForm.guests}
                      onChange={(e) => setBookingForm({ ...bookingForm, guests: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 bg-white"
                    >
                      <option>1 Adult</option>
                      <option>2 Adults</option>
                      <option>2 Adults, 1 Child</option>
                      <option>Family (4 Persons)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Special In-Room Requests
                  </label>
                  <textarea
                    rows={2}
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="e.g. Feather pillows, late arrival, anniversary celebration"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Direct booking includes complimentary valet & welcome champagne.
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Confirm & Reserve Suite
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: ROOM SERVICE DINING */}
        {activeTab === 'Room Service Dining' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">
                  In-Room Culinary Dining
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Order dishes freshly prepared by Executive Chef Marco Bellini. Delivered straight to Room {assignedRoomNumber}.
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg text-xs shadow-2xs overflow-x-auto max-w-full">
                {['All', 'Breakfast', 'All-Day Dining', 'Chef Special', 'Beverages', 'Desserts'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFoodCategory(cat)}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      foodCategory === cat
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Menu Catalog (2 cols) */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredMenu.map((dish) => (
                  <div
                    key={dish.id}
                    className={`bg-white rounded-xl border p-4 shadow-2xs flex flex-col justify-between transition-all ${
                      dish.inStock ? 'border-slate-200/80 hover:border-slate-300' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          {dish.category}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          ⏱ {dish.prepTime}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-base text-slate-900 mb-1">
                        {dish.name}
                      </h3>
                      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                        {dish.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-mono text-base font-bold text-slate-900">
                        ${dish.price.toFixed(2)}
                      </span>

                      {dish.inStock ? (
                        <button
                          onClick={() => addToCart(dish)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>Add to Tray</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-red-600 font-semibold italic">
                          86 / Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* In-Room Dining Tray (Cart) */}
              <div id="dining-tray-section" className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs sticky top-20">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={18} className="text-amber-600" />
                    <h3 className="font-serif font-bold text-base text-slate-900">
                      Room {assignedRoomNumber} Dining Tray
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    {cart.reduce((s, i) => s + i.qty, 0)} items
                  </span>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Your dining tray is empty.<br />Click "+ Add to Tray" on dishes above.
                  </div>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <div className="truncate max-w-[140px]">
                            <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                            <div className="font-mono text-slate-500">${item.price.toFixed(2)} each</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.id, -1)}
                              className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="font-mono font-bold w-4 text-center">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.id, 1)}
                              className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Dietary Notes / Delivery Instructions
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dressing on side, heated domes"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                      />
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Dishes Subtotal:</span>
                        <span className="font-mono">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-slate-900 pt-1">
                        <span>Total to Room Folio:</span>
                        <span className="font-mono text-amber-800">${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Send size={13} />
                      <span>Place Order to Kitchen</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Mobile Floating Cart Summary Bar */}
            {cart.length > 0 && (
              <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl border border-amber-500/40 flex items-center justify-between animate-slide-up">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ShoppingBag size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {cart.reduce((s, i) => s + i.qty, 0)} Item(s) in Tray
                    </span>
                    <span className="text-[11px] font-mono text-amber-400 font-bold">
                      ${cartTotal.toFixed(2)} total
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const trayElem = document.getElementById('dining-tray-section');
                    if (trayElem) trayElem.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-colors"
                >
                  Review Tray ↓
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ORDER TRACKING */}
        {activeTab === 'Order Tracking' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Live In-Room Dining Tracker
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Real-time tracking of culinary orders prepared by the brigade and delivered to Room {assignedRoomNumber}.
              </p>
            </div>

            {guestOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No active orders found for Room {assignedRoomNumber}.
              </div>
            ) : (
              <div className="space-y-4">
                {guestOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="font-mono font-bold text-sm text-slate-900">Order #{ord.id}</div>
                        <div className="text-[11px] text-slate-500">Ordered at {ord.createdAt}</div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                          ord.status === 'Pending'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : ord.status === 'Cooking'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : ord.status === 'Ready'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="grid grid-cols-4 gap-2 mb-4 text-center text-[10px] font-semibold">
                      <div className={`p-1.5 rounded ${ord.status === 'Pending' || ord.status === 'Cooking' || ord.status === 'Ready' || ord.status === 'Delivered' ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                        1. Received
                      </div>
                      <div className={`p-1.5 rounded ${ord.status === 'Cooking' || ord.status === 'Ready' || ord.status === 'Delivered' ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                        2. Cooking
                      </div>
                      <div className={`p-1.5 rounded ${ord.status === 'Ready' || ord.status === 'Delivered' ? 'bg-blue-100 text-blue-900 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                        3. Runner Plated
                      </div>
                      <div className={`p-1.5 rounded ${ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                        4. Delivered
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1 mb-3">
                      {ord.items.map((i, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{i.qty}x {i.name}</span>
                          <span className="font-mono text-slate-500">${(i.price * i.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-900 pt-2 border-t border-slate-100">
                      <span>Total Added to Room Folio:</span>
                      <span>${ord.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CONCIERGE SERVICES */}
        {activeTab === 'Concierge Services' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                24/7 White-Glove Concierge Requests
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                One-tap requests dispatched directly to Front Desk and Housekeeping attendants.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Extra Egyptian Linens & Pillows', desc: 'Hypoallergenic feather pillows + 600 thread count linens', time: '10 mins' },
                { title: 'Valet Car Retrieval', desc: 'Request your vehicle brought to the private front courtyard', time: '12 mins' },
                { title: 'Late Checkout Request (2:00 PM)', desc: 'Complimentary for Horizon Club elite members', time: 'Instant' },
                { title: 'Turn Down Service', desc: 'Evening turn down with artisanal chocolates and scented mist', time: 'Scheduled' },
                { title: 'Luggage & Bellman Assistance', desc: 'Assistance packing or luggage transfer for departure', time: '5 mins' },
                { title: 'Airport Limousine Transfer', desc: 'Private Mercedes S-Class to SFO International Airport', time: 'Advance booking' },
              ].map((svc, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 mb-1">{svc.title}</h3>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">{svc.desc}</p>
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Est: {svc.time}
                    </span>
                  </div>

                  <button
                    onClick={() => showToast(`Concierge dispatched: ${svc.title} for Room ${assignedRoomNumber}`)}
                    className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Request Service
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

export default GuestDashboard;
