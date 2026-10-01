import React, { useState, useEffect } from 'react';
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
  X,
  Check,
  Tag,
  Receipt,
  Car,
  Package,
  Compass
} from 'lucide-react';
import PrintableInvoice from '../shared/PrintableInvoice';
import { useHotel } from '../../context/HotelContext';

const GuestDashboard = ({ user, onLogout, onBackToSite }) => {
  const {
    rooms,
    roomCategories,
    bookings,
    menuItems,
    orders,
    serviceRequests,
    placeFoodOrder,
    createGuestOnlineBooking,
    getGuestFolio,
    createServiceRequest,
    checkoutGuest,
  } = useHotel();

  const [activeTab, setActiveTab] = useState('My Stay & Key');
  const [toastMessage, setToastMessage] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [keyUnlocked, setKeyUnlocked] = useState(false);

  // Express Check-Out State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState('Visa Signature •••• 4092');
  const [checkoutSuccessFolio, setCheckoutSuccessFolio] = useState(null);
  const [selectedFolioForInvoice, setSelectedFolioForInvoice] = useState(null);
  const [checkoutAgreed, setCheckoutAgreed] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Cart state for room service
  const [cart, setCart] = useState([]);
  const [foodCategory, setFoodCategory] = useState('All');
  const [orderNotes, setOrderNotes] = useState('');

  // Custom concierge request state
  const [customRequest, setCustomRequest] = useState({
    serviceType: 'Extra Pillows',
    details: '',
  });

  // Helper for dynamic guest initials
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'VG';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const guestEmail = user?.email?.trim().toLowerCase();
  const guestName = user?.name?.trim().toLowerCase();
  const isDemoGuest = !user?.email || guestEmail === 'guest@efoyhotel.com';

  // Online booking state (pre-filled with current guest details)
  const [bookingForm, setBookingForm] = useState(() => ({
    guestName: user?.name || '',
    email: user?.email || (isDemoGuest ? 'guest@efoyhotel.com' : ''),
    phone: user?.phone || '',
    roomType: 'Luxury Suite',
    checkIn: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    guests: '2 Adults',
    notes: 'High floor preferred • Non-smoking',
  }));

  // Sync form state if user prop loads
  useEffect(() => {
    if (user) {
      setBookingForm((prev) => ({
        ...prev,
        guestName: prev.guestName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Filter bookings that strictly belong to THIS authenticated guest
  const myBookings = bookings.filter((b) => {
    if (!guestEmail && !guestName) return false;
    const matchEmail = guestEmail && b.email?.trim().toLowerCase() === guestEmail;
    const matchName = guestName && b.guestName?.trim().toLowerCase() === guestName;
    return matchEmail || matchName;
  });

  // Active stay for this user:
  // 1. In-House / Checked In booking belonging to this user
  // 2. Confirmed / Pending reservation belonging to this user
  // 3. Fallback to demo booking ONLY if explicitly logged in as demo guest account (guest@efoyhotel.com)
  const userBooking =
    myBookings.find((b) => b.status === 'In-House' || b.status === 'CHECKED_IN') ||
    myBookings.find((b) => b.status === 'CONFIRMED' || b.status === 'PENDING' || b.status === 'Arriving Today') ||
    (isDemoGuest
      ? (bookings.find((b) => b.email?.toLowerCase() === 'guest@efoyhotel.com') ||
         bookings.find((b) => b.status === 'In-House' || b.status === 'CHECKED_IN'))
      : null);

  const isCheckedIn = Boolean(userBooking && (userBooking.status === 'In-House' || userBooking.status === 'CHECKED_IN'));
  const isConfirmedAwaitingCheckIn = Boolean(userBooking && !isCheckedIn && (userBooking.status === 'CONFIRMED' || userBooking.status === 'PENDING' || userBooking.status === 'Arriving Today'));

  const assignedRoomNumber = isCheckedIn ? userBooking?.roomNumber : null;
  const folio = assignedRoomNumber ? getGuestFolio(assignedRoomNumber) : null;

  // User's room food orders: isolated to this guest's assigned room and name
  const guestOrders = orders.filter((o) => {
    if (assignedRoomNumber && o.roomNumber === assignedRoomNumber) {
      if (!guestName) return true;
      return !o.guestName || o.guestName.toLowerCase() === guestName || (isDemoGuest && o.guestName.toLowerCase() === 'lord alexander wright');
    }
    if (guestName && o.guestName) {
      return o.guestName.toLowerCase() === guestName;
    }
    return false;
  });

  // User's concierge service requests: isolated to this guest's assigned room and name
  const guestServiceRequests = serviceRequests.filter((s) => {
    if (assignedRoomNumber && s.roomNumber === assignedRoomNumber) {
      if (!guestName) return true;
      return !s.guestName || s.guestName.toLowerCase() === guestName || (isDemoGuest && s.guestName.toLowerCase() === 'lord alexander wright');
    }
    if (guestName && s.guestName) {
      return s.guestName.toLowerCase() === guestName;
    }
    return false;
  });

  // Digital key simulation
  const handleSimulateKey = () => {
    setKeyUnlocked(true);
    showToast(`🔑 NFC Key Verified! Room ${assignedRoomNumber || 'Suite'} door unlocked.`);
    setTimeout(() => setKeyUnlocked(false), 4000);
  };

  // Cart functions
  const addToCart = (dish) => {
    if (!dish.inStock) {
      showToast('⚠️ Sorry, this item is marked 86 / Out of Stock by the Kitchen.');
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

  // Submit food order to Kitchen KDS
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!assignedRoomNumber) {
      showToast('⚠️ In-room dining requires an active suite reservation.');
      return;
    }
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
    showToast('🍽️ Order sent to Kitchen KDS! Charges will post automatically upon delivery.');
  };

  // Submit Concierge Service Request
  const handleRequestService = (serviceType, details = '', chargeAmount = 0, department = 'Front Desk') => {
    const targetRoom = assignedRoomNumber || userBooking?.roomNumber || 'Pre-Arrival';
    createServiceRequest({
      roomNumber: targetRoom,
      guestName: user?.name || userBooking?.guestName || 'Valued Guest',
      serviceType,
      details: details || `Requested via Guest Portal for ${user?.name || 'Valued Guest'}`,
      department,
      chargeAmount,
    });

    showToast(`🛎️ Request logged: "${serviceType}". Attendants notified.`);
  };

  // Submit online room booking
  const handleBookRoomSubmit = (e) => {
    e.preventDefault();
    const availableRoom = rooms.find(
      (r) => r.type === bookingForm.roomType && (r.occupancyStatus === 'VACANT' || r.occupancy === 'Available')
    ) || rooms.find((r) => r.occupancyStatus === 'VACANT' || r.occupancy === 'Available');

    if (!availableRoom) {
      showToast('No available rooms matching this category currently. Please try another selection.');
      return;
    }

    const d1 = new Date(bookingForm.checkIn);
    const d2 = new Date(bookingForm.checkOut);
    const nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));

    const guestFullName = (bookingForm.guestName || user?.name || 'Valued Guest').trim();
    const guestEmailAddress = (bookingForm.email || user?.email || (isDemoGuest ? 'guest@efoyhotel.com' : '')).trim().toLowerCase();
    const guestPhoneNumber = (bookingForm.phone || user?.phone || '+1 (555) 234-5678').trim();

    createGuestOnlineBooking({
      guestName: guestFullName,
      email: guestEmailAddress,
      phone: guestPhoneNumber,
      roomNumber: availableRoom.roomNumber,
      roomType: availableRoom.type,
      checkIn: bookingForm.checkIn,
      checkOut: bookingForm.checkOut,
      nights,
      notes: bookingForm.notes,
    });

    showToast(`🎉 Reservation confirmed! Room ${availableRoom.roomNumber} allocated to you.`);
    setActiveTab('My Stay & Key');
  };

  // Execute Express Check-Out directly from Guest Portal
  const handleGuestCheckout = async () => {
    if (!assignedRoomNumber) {
      showToast('⚠️ No active room stay found to check out.');
      return;
    }
    setIsCheckingOut(true);
    try {
      const res = await checkoutGuest(assignedRoomNumber, checkoutPaymentMethod);
      if (res && res.success) {
        setCheckoutSuccessFolio(res.folio);
        setShowCheckoutModal(false);
        showToast(`✓ Check-Out complete! Room ${assignedRoomNumber} settled and released to Housekeeping.`);
      } else {
        showToast(res?.message || 'Check-out could not be completed.');
      }
    } catch (err) {
      showToast(err.message || 'Error processing check-out.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filteredMenu = menuItems.filter((dish) => {
    if (foodCategory === 'All') return true;
    return dish.category === foodCategory;
  });

  const navMenuItems = [
    { name: 'My Stay & Key', icon: Key },
    { name: 'Book a Room', icon: Bed },
    { name: 'Room Service Dining', icon: UtensilsCrossed },
    { name: 'Order Tracking', icon: ShoppingBag, count: guestOrders.length },
    { name: 'Concierge Services', icon: Phone, count: guestServiceRequests.filter(s => s.status !== 'COMPLETED').length },
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
                    Efoy Hotel
                  </h1>
                  <p className="text-[9px] tracking-[0.25em] text-gold-400 uppercase font-medium">
                    Guest Portal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white"
              >
                ✕
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
                        ? 'bg-gold-500 text-white font-semibold'
                        : 'text-gray-300 hover:text-white hover:bg-dark-800/60'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={16} />
                      <span>{item.name}</span>
                    </span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-dark-800 text-gold-400 font-bold">
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
              Efoy Hotel
            </h1>
            <p className="text-[9px] tracking-[0.25em] text-gold-400 uppercase font-medium">
              Guest Portal
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
            Guest Privileges
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
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-gold-600 text-white' : 'bg-dark-800 text-gold-400'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Room Card Widget */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-dark-800/70 border border-gold-500/30 shadow-md">
          {assignedRoomNumber && folio ? (
            <>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[10px] font-bold text-gold-400 tracking-wider uppercase">
                  Current Stay
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">● In-House</span>
              </div>
              <div className="font-serif text-lg font-bold text-white mb-0.5">
                Room {assignedRoomNumber}
              </div>
              <div className="text-[11px] text-gray-400 mb-2 truncate">
                {userBooking?.roomType || 'Luxury Suite'}
              </div>
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-dark-700/60 text-gray-300">
                <span>Live Balance:</span>
                <span className="font-mono font-bold text-gold-400">${folio.grandTotal.toFixed(2)}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(true)}
                className="w-full mt-2.5 py-1.5 bg-gold-500/20 hover:bg-gold-500 text-gold-300 hover:text-white border border-gold-500/40 font-semibold text-[11px] rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut size={12} />
                <span>Express Check-Out</span>
              </button>
            </>
          ) : isConfirmedAwaitingCheckIn ? (
            <>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">
                  Reservation
                </span>
                <span className="text-[10px] font-mono text-amber-300 font-semibold">● Confirmed</span>
              </div>
              <div className="font-serif text-base font-bold text-white mb-0.5">
                {userBooking?.roomNumber ? `Room ${userBooking.roomNumber}` : userBooking?.roomType || 'Reserved Suite'}
              </div>
              <div className="text-[11px] text-gray-400 mb-2 truncate">
                Awaiting Front Desk Check-In
              </div>
              <div className="text-[10px] text-amber-200/90 bg-amber-500/15 p-2 rounded-lg border border-amber-500/30 mb-1 leading-snug">
                Front desk verifies room readiness upon arrival & issues keys.
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[10px] font-bold text-gold-400 tracking-wider uppercase">
                  Horizon Club
                </span>
                <span className="text-[10px] text-gray-400">VIP Member</span>
              </div>
              <div className="font-serif text-base font-bold text-white mb-0.5">
                No Active Room
              </div>
              <div className="text-[11px] text-gray-400 mb-2.5 leading-relaxed font-light">
                Check in or reserve a suite to access mobile digital NFC keys and in-room dining.
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('Book a Room')}
                className="w-full py-1.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold text-[11px] rounded-lg transition-all shadow-xs cursor-pointer text-center"
              >
                Reserve a Suite →
              </button>
            </>
          )}
        </div>

        {/* Guest Profile */}
        <div className="p-4 border-t border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-dark-800 text-gold-500 border border-gold-500/30 font-semibold text-xs flex items-center justify-center">
              {getInitials(user?.name || userBooking?.guestName || 'Valued Guest')}
            </div>
            <div className="truncate max-w-[120px]">
              <div className="text-xs font-semibold text-white truncate">
                {user?.name || userBooking?.guestName || 'Valued Guest'}
              </div>
              <div className="text-[10px] text-gold-400 truncate">
                {user?.email || 'Horizon Elite'}
              </div>
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

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg cursor-pointer shrink-0"
              aria-label="Open navigation drawer"
            >
              <Menu size={20} />
            </button>
            <div className="truncate">
              <span className="text-xs text-gray-500 hidden sm:inline">Welcome to Efoy Hotel, </span>
              <span className="text-xs font-bold text-dark-900">{user?.name || userBooking?.guestName || 'Valued Guest'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('Room Service Dining')}
              className="px-2.5 sm:px-3 py-1.5 bg-gold-50 hover:bg-gold-100 text-gold-900 border border-gold-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UtensilsCrossed size={14} className="text-gold-600" />
              <span className="hidden sm:inline">In-Room Dining</span>
              <span className="sm:hidden">Dining</span>
              {cart.length > 0 && (
                <span className="bg-gold-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('Book a Room')}
              className="bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Bed size={14} />
              <span className="hidden sm:inline">Reserve Suite</span>
            </button>
          </div>
        </header>

        {/* TAB 1: MY STAY & KEY */}
        {activeTab === 'My Stay & Key' && (
          checkoutSuccessFolio ? (
            /* CHECK-OUT COMPLETED SCREEN */
            <div className="p-4 sm:px-6 lg:px-8 py-10 max-w-2xl mx-auto space-y-6 animate-fade-in text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Stay Concluded & Settled
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-dark-900 mt-3 mb-2">
                  Check-Out Successfully Completed
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed font-light">
                  Thank you for staying with us at Efoy Hotel, <span className="font-semibold text-dark-900">{checkoutSuccessFolio.guestName}</span>. Room {checkoutSuccessFolio.roomNumber} has been released and dispatched to Housekeeping for immediate turnover.
                </p>
              </div>

              {/* Settlement Summary Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs text-left max-w-md mx-auto text-xs space-y-2">
                <div className="flex justify-between text-gray-500 pb-2 border-b border-gray-100">
                  <span>Suite Departure:</span>
                  <span className="font-bold text-dark-900">Room {checkoutSuccessFolio.roomNumber}</span>
                </div>
                <div className="flex justify-between text-gray-500 pb-2 border-b border-gray-100">
                  <span>Total Settled:</span>
                  <span className="font-mono font-bold text-emerald-700">${checkoutSuccessFolio.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Payment Settlement:</span>
                  <span className="font-medium text-dark-900">{checkoutPaymentMethod}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFolioForInvoice(checkoutSuccessFolio)}
                  className="px-5 py-2.5 bg-dark-900 hover:bg-gold-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Receipt size={15} />
                  <span>Download / Print Tax Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutSuccessFolio(null);
                    setActiveTab('Book a Room');
                  }}
                  className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Bed size={15} />
                  <span>Reserve Another Stay</span>
                </button>
              </div>
            </div>
          ) : !userBooking ? (
            <div className="p-4 sm:px-6 lg:px-8 py-12 max-w-2xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 bg-gold-50 text-gold-700 rounded-2xl flex items-center justify-center mx-auto border border-gold-200 shadow-xs">
                <Bed size={32} />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gold-700 bg-gold-50 px-2.5 py-1 rounded-full border border-gold-200">
                  Efoy Privilege Portal
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-dark-900 mt-3 mb-2">
                  No Active Checked-In Stay
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  Welcome, <span className="font-semibold text-dark-900">{user?.name || 'Valued Guest'}</span>. Your digital mobile keycard, dining service, and live folio will activate as soon as your reservation is checked in.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('Book a Room')}
                  className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Plus size={15} />
                  <span>Reserve a Suite</span>
                </button>
              </div>

              {/* Past stays or other bookings belonging to this guest */}
              {myBookings.length > 0 && (
                <div className="mt-8 text-left max-w-2xl mx-auto space-y-3 pt-6 border-t border-gray-200">
                  <h3 className="font-serif text-sm font-bold text-dark-900 uppercase tracking-wider flex items-center gap-2">
                    <Receipt size={16} className="text-gold-600" />
                    <span>My Past Stays & Folios</span>
                  </h3>
                  <div className="space-y-2.5">
                    {myBookings.map((b) => (
                      <div
                        key={b.id}
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-dark-900">Confirmation #{b.id}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-gray-100 text-gray-700">
                              {b.status}
                            </span>
                          </div>
                          <div className="text-gray-500 mt-1">
                            {b.roomType} (Room {b.roomNumber}) • {b.checkIn} → {b.checkOut} ({b.nights} nights)
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const pastFolio = getGuestFolio(b.roomNumber) || {
                              booking: b,
                              guestName: b.guestName,
                              email: b.email,
                              phone: b.phone,
                              roomNumber: b.roomNumber,
                              roomType: b.roomType,
                              nights: b.nights,
                              roomRate: b.roomRate,
                              roomTotal: b.roomRate * b.nights,
                              foodOrders: [],
                              foodTotal: 0,
                              serviceRequests: [],
                              serviceTotal: 0,
                              subtotal: b.roomRate * b.nights,
                              taxes: (b.roomRate * b.nights) * 0.12,
                              grandTotal: (b.roomRate * b.nights) * 1.12,
                            };
                            setSelectedFolioForInvoice(pastFolio);
                          }}
                          className="px-3.5 py-1.5 bg-dark-900 hover:bg-gold-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                        >
                          <Receipt size={13} />
                          <span>View Invoice</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : isConfirmedAwaitingCheckIn ? (
            /* RESERVATION CONFIRMED - AWAITING RECEPTION CHECK-IN CARD */
            <div className="p-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-amber-300 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-gold-500 to-amber-500" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block mb-2">
                      Reservation Confirmed • Awaiting Front Desk Check-In
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-dark-900">
                      Welcome, {userBooking.guestName || user?.name || 'Valued Guest'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Confirmation #{userBooking.id} • Registered in Hotel Database
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Assigned Suite</span>
                    <span className="font-serif text-xl font-bold text-dark-900">
                      {userBooking.roomNumber ? `Room ${userBooking.roomNumber}` : 'Allocated upon Check-In'}
                    </span>
                    <span className="text-xs text-gray-500 block">{userBooking.roomType || 'Deluxe Suite'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
                  <div className="p-3 bg-[#fafafa] rounded-lg border border-gray-100 text-xs">
                    <span className="text-[10px] uppercase text-gray-400 block mb-0.5">Check-In Date</span>
                    <span className="font-semibold text-dark-900">{userBooking.checkIn}</span>
                  </div>
                  <div className="p-3 bg-[#fafafa] rounded-lg border border-gray-100 text-xs">
                    <span className="text-[10px] uppercase text-gray-400 block mb-0.5">Check-Out Date</span>
                    <span className="font-semibold text-dark-900">{userBooking.checkOut}</span>
                  </div>
                  <div className="p-3 bg-[#fafafa] rounded-lg border border-gray-100 text-xs">
                    <span className="text-[10px] uppercase text-gray-400 block mb-0.5">Duration</span>
                    <span className="font-semibold text-dark-900">{userBooking.nights} Night(s)</span>
                  </div>
                </div>

                {/* 3-Step Hospitality Check-in explanation */}
                <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 text-xs space-y-2 mb-5">
                  <div className="font-bold text-amber-900 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-amber-700 shrink-0" />
                    <span>How Check-In Works at Efoy Hotel:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-amber-950 font-light leading-relaxed pl-1">
                    <li><strong>Arrival & Reception Greeting:</strong> Present your booking confirmation or ID to the Front Desk Receptionist upon arrival.</li>
                    <li><strong>Suitability & Inspection Check:</strong> Reception verifies that your suite is certified CLEAN and available before check-in.</li>
                    <li><strong>Instant Activation:</strong> Once reception confirms your check-in, your <strong>Mobile NFC Digital Keycard</strong>, in-room dining, and live folio will activate automatically on this screen!</li>
                  </ol>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                  <span className="text-gray-500 font-light">Need airport limousine transfer or special arrivals assistance?</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('Concierge Services')}
                    className="px-4 py-2 bg-gold-50 hover:bg-gold-100 text-gold-900 border border-gold-300 rounded-lg font-semibold transition-colors cursor-pointer"
                  >
                    Contact Concierge Desk →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-dark-900 bg-gray-100 px-2 py-0.5 rounded">
                    Active Stay Handoff
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Digital Key & Portal Active
                  </span>
                </div>
                <h1 className="font-serif text-2xl font-bold text-dark-900">
                  Your Suite, Digital NFC Key & Live Folio
                </h1>
                <p className="text-xs text-gray-500 mt-1 font-light">
                  Continuous live synchronization with Reception desk and Executive Kitchen.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* DIGITAL KEYCARD SIMULATION */}
                <div className="bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between relative overflow-hidden border border-gold-500/30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl" />

                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div className="bg-white rounded-lg px-2.5 py-1 flex items-center shadow-xs">
                        <img
                          src="/images/logo.png"
                          alt="Efoy Hotel"
                          className="h-9 w-auto object-contain"
                        />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-xs font-mono text-gold-300">
                        {userBooking.digitalKeyCode || `AURA-${assignedRoomNumber}-901`}
                      </span>
                    </div>

                    <div className="text-[10px] uppercase text-gray-400 tracking-wider">Suite Assignment</div>
                    <div className="font-serif text-4xl font-bold text-white mb-2">
                      Room {assignedRoomNumber}
                    </div>
                    <div className="text-xs text-gray-300 mb-6">
                      {userBooking?.roomType || 'Luxury Suite'}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pt-4 border-t border-white/10">
                      <div>
                        <span className="text-[9px] uppercase block text-gray-500">Guest</span>
                        <span className="font-semibold text-white">{userBooking?.guestName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase block text-gray-500">Departure</span>
                        <span className="font-semibold text-white">{userBooking?.checkOut}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSimulateKey}
                      className={`w-full py-3 text-white font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98 ${
                        keyUnlocked
                          ? 'bg-emerald-600'
                          : 'bg-gold-500 hover:bg-gold-600'
                      }`}
                    >
                      <Key size={16} />
                      <span>{keyUnlocked ? '✓ Door Lock Unlocked!' : 'Hold Phone to Door Lock (NFC)'}</span>
                    </button>
                  </div>
                </div>

                {/* STAY DETAILS & LIVE FOLIO ACCRUAL */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="font-serif text-lg font-bold text-dark-900">
                          Live Folio Accrual
                        </h2>
                        <p className="text-xs text-gray-500 font-light">
                          Connected: Guest → Reservation → Stay → Folio
                        </p>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {folio?.paymentStatus || 'ACTIVE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                      {/* Room charges */}
                      <div className="p-3 bg-[#fafafa] rounded-lg border border-gray-100">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                          Room Charges
                        </span>
                        <div className="font-mono text-base font-bold text-dark-900">
                          ${folio?.roomTotal.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-gray-500">{folio?.nights} nights @ ${folio?.roomRate}/nt</div>
                      </div>

                      {/* Dining */}
                      <div className="p-3 bg-[#fafafa] rounded-lg border border-gray-100">
                        <span className="text-[10px] uppercase font-bold text-gold-700 block mb-1">
                          Delivered Dining
                        </span>
                        <div className="font-mono text-base font-bold text-gold-700">
                          +${folio?.foodTotal.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-gray-500">{folio?.foodOrders.length} order(s) delivered</div>
                      </div>

                      {/* Concierge Services */}
                      <div className="p-3 bg-[#fafafa] rounded-lg border border-gray-100">
                        <span className="text-[10px] uppercase font-bold text-blue-700 block mb-1">
                          Concierge Services
                        </span>
                        <div className="font-mono text-base font-bold text-blue-700">
                          +${(folio?.serviceTotal || 0).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-gray-500">{folio?.serviceCharges?.length || 0} service(s)</div>
                      </div>

                      {/* Grand Total */}
                      <div className="p-3 bg-dark-900 text-white rounded-lg shadow-xs">
                        <span className="text-[10px] uppercase font-bold text-gold-400 block mb-1">
                          Total Folio Balance
                        </span>
                        <div className="font-mono text-base font-bold text-gold-400">
                          ${folio?.grandTotal.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-gray-400">Incl. 12% luxury taxes</div>
                      </div>
                    </div>

                    {/* Breakdown details */}
                    <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1 text-gray-600">
                      <div className="flex justify-between">
                        <span>Hospitality Tax & Luxury Surcharge (12%):</span>
                        <span className="font-mono">${folio?.taxes.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-dark-900 pt-1 border-t border-gray-200">
                        <span>Net Balance Due at Checkout:</span>
                        <span className="font-mono text-gold-700 text-sm">${(folio?.balanceDue !== undefined ? folio?.balanceDue : folio?.grandTotal).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Guest Express Check-Out Action */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-[11px] text-gray-500 font-light flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-gold-600 shrink-0" />
                        <span>Instant digital folio settlement with printable official tax invoice.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCheckoutModal(true)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider active:scale-98"
                      >
                        <LogOut size={14} />
                        <span>Settle & Express Check-Out</span>
                      </button>
                    </div>
                  </div>

                  {/* Active dining & services quick row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-dark-900">Recent Dining Orders</span>
                        <button onClick={() => setActiveTab('Order Tracking')} className="text-gold-600 hover:underline text-[11px]">
                          View Tracker →
                        </button>
                      </div>
                      {guestOrders.length > 0 ? (
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Latest: Order #{guestOrders[0].id} ({guestOrders[0].status})</div>
                          <div className="font-mono font-bold text-dark-900">${guestOrders[0].total.toFixed(2)}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 font-light">No dining orders placed yet.</div>
                      )}
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-dark-900">Concierge Requests</span>
                        <button onClick={() => setActiveTab('Concierge Services')} className="text-gold-600 hover:underline text-[11px]">
                          Request More →
                        </button>
                      </div>
                      {guestServiceRequests.length > 0 ? (
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Latest: {guestServiceRequests[0].serviceType}</div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                            {guestServiceRequests[0].status}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 font-light">No open requests.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* TAB 2: BOOK A ROOM */}
        {activeTab === 'Book a Room' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 max-w-4xl space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                Online Suite Reservation
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                Direct booking with guaranteed availability and instant member folio activation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
              <form onSubmit={handleBookRoomSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Guest Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingForm.guestName}
                      onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                      placeholder="e.g. Abebe Kebede"
                      className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      placeholder="e.g. guest@example.com"
                      className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingForm.checkIn}
                      onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingForm.checkOut}
                      onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Select Suite Category
                    </label>
                    <select
                      value={bookingForm.roomType}
                      onChange={(e) => setBookingForm({ ...bookingForm, roomType: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                    >
                      {roomCategories && roomCategories.length > 0 ? (
                        roomCategories.map((cat) => (
                          <option key={cat.id || cat.name} value={cat.name}>
                            {cat.name} (${cat.baseRate}/nt)
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Single Classic">Single Classic ($180/nt)</option>
                          <option value="Single Deluxe">Single Deluxe ($220/nt)</option>
                          <option value="Double Deluxe">Double Deluxe ($280/nt)</option>
                          <option value="Double Executive">Double Executive ($340/nt)</option>
                          <option value="Luxury Suite">Luxury Suite ($520/nt)</option>
                          <option value="Penthouse Panoramic">Penthouse Panoramic ($850/nt)</option>
                          <option value="Presidential Penthouse">Presidential Penthouse ($1200/nt)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Guests
                    </label>
                    <select
                      value={bookingForm.guests}
                      onChange={(e) => setBookingForm({ ...bookingForm, guests: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                    >
                      <option>1 Adult</option>
                      <option>2 Adults</option>
                      <option>2 Adults, 1 Child</option>
                      <option>Family (4 Persons)</option>
                      <option>6 Persons (Penthouse)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Special In-Room Requests
                  </label>
                  <textarea
                    rows={2}
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="e.g. Feather pillows, late arrival, celebration champagne"
                    className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Complimentary valet & private lounge access included.
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Confirm & Reserve Suite
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: ROOM SERVICE DINING (Connected directly to Kitchen KDS + 86 Out-of-Stock system) */}
        {activeTab === 'Room Service Dining' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-dark-900">
                  In-Room Culinary Dining
                </h1>
                <p className="text-xs text-gray-500 mt-1 font-light">
                  Order dishes freshly prepared by the kitchen brigade. Live sync with <strong>Kitchen KDS</strong> and <strong>86 Out-of-Stock</strong> inventory.
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 p-1 rounded-lg text-xs shadow-xs overflow-x-auto max-w-full">
                {['All', 'Breakfast', 'All-Day Dining', 'Chef Special', 'Beverages', 'Desserts'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFoodCategory(cat)}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      foodCategory === cat
                        ? 'bg-dark-900 text-white font-medium shadow-xs'
                        : 'text-gray-600 hover:text-dark-900 font-light'
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
                {filteredMenu.map((dish) => {
                  const isAvailable = dish.inStock !== false;

                  return (
                    <div
                      key={dish.id}
                      className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                        isAvailable ? 'border-gray-100 hover:shadow-md' : 'border-red-200 bg-red-50/15'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase text-gold-700 bg-gold-50 px-2 py-0.5 rounded">
                            {dish.category}
                          </span>
                          <span className="font-mono text-xs font-semibold text-gray-500">
                            ⏱ {dish.prepTime || '15-20m'}
                          </span>
                        </div>

                        <h3 className="font-serif font-bold text-base text-dark-900 mb-1">
                          {dish.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-3 leading-relaxed font-light">
                          {dish.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="font-mono text-base font-bold text-dark-900">
                          ${dish.price.toFixed(2)}
                        </span>

                        {isAvailable ? (
                          <button
                            onClick={() => addToCart(dish)}
                            className="px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          >
                            <Plus size={13} />
                            <span>Add to Tray</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            86 / Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* In-Room Dining Tray (Cart) */}
              <div id="dining-tray-section" className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs sticky top-20">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={18} className="text-gold-600" />
                    <h3 className="font-serif font-bold text-base text-dark-900">
                      {assignedRoomNumber ? `Room ${assignedRoomNumber} Dining Tray` : 'Guest Dining Tray'}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-semibold text-gray-500">
                    {cart.reduce((s, i) => s + i.qty, 0)} items
                  </span>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-400">
                    Your dining tray is empty.<br />Click "+ Add to Tray" on dishes above.
                  </div>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <div className="truncate max-w-[140px]">
                            <div className="font-semibold text-dark-900 truncate">{item.name}</div>
                            <div className="font-mono text-gray-500">${item.price.toFixed(2)} each</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.id, -1)}
                              className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gold-100 transition-colors"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="font-mono font-bold w-4 text-center text-dark-900">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.id, 1)}
                              className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gold-100 transition-colors"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                        Dietary Notes / Delivery Instructions
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Extra napkins, no cilantro"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    <div className="pt-3 border-t border-gray-100 space-y-1 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Dishes Subtotal:</span>
                        <span className="font-mono">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-dark-900 pt-1">
                        <span>Posted upon Delivery:</span>
                        <span className="font-mono text-gold-700">${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {!assignedRoomNumber ? (
                      <div className="p-2.5 bg-gold-50 border border-gold-200 rounded-lg text-[11px] text-gold-800 leading-tight">
                        ℹ️ Please reserve and check into a suite to enable in-room dining billing.
                      </div>
                    ) : (
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send size={13} />
                        <span>Place Order to Kitchen</span>
                      </button>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ORDER TRACKING (KDS: PENDING -> COOKING -> READY -> DELIVERED) */}
        {activeTab === 'Order Tracking' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                Live Kitchen KDS Order Tracker
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                Lifecycle: <strong>PENDING → COOKING → READY → DELIVERED</strong>. Folio charge is strictly posted once DELIVERED.
              </p>
            </div>

            {guestOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400 shadow-xs">
                No active orders found{assignedRoomNumber ? ` for Room ${assignedRoomNumber}` : ''}.
              </div>
            ) : (
              <div className="space-y-4">
                {guestOrders.map((ord) => {
                  const s = (ord.status || 'Pending').toLowerCase();
                  const isDelivered = s === 'delivered';
                  const isReady = s === 'ready';
                  const isCooking = s === 'cooking';

                  return (
                    <div
                      key={ord.id}
                      className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                        <div>
                          <div className="font-mono font-bold text-sm text-dark-900">Ticket #{ord.id}</div>
                          <div className="text-[11px] text-gray-500">{ord.createdAt || 'Just now'}</div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                            isDelivered
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isReady
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : isCooking
                              ? 'bg-gold-50 text-gold-700 border-gold-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      {/* 4-Stage KDS Stepper */}
                      <div className="grid grid-cols-4 gap-2 mb-4 text-center text-[10px] font-semibold">
                        <div className={`p-1.5 rounded ${s === 'pending' || isCooking || isReady || isDelivered ? 'bg-gold-100 text-gold-900 font-bold' : 'bg-gray-100 text-gray-400'}`}>
                          1. PENDING
                        </div>
                        <div className={`p-1.5 rounded ${isCooking || isReady || isDelivered ? 'bg-gold-100 text-gold-900 font-bold' : 'bg-gray-100 text-gray-400'}`}>
                          2. COOKING
                        </div>
                        <div className={`p-1.5 rounded ${isReady || isDelivered ? 'bg-blue-100 text-blue-900 font-bold' : 'bg-gray-100 text-gray-400'}`}>
                          3. READY
                        </div>
                        <div className={`p-1.5 rounded ${isDelivered ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-gray-100 text-gray-400'}`}>
                          4. DELIVERED
                        </div>
                      </div>

                      <div className="text-xs text-dark-900 space-y-1 mb-3">
                        {ord.items.map((i, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{i.qty}x {i.name}</span>
                            <span className="font-mono text-gray-500">${(i.price * i.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-xs font-mono font-bold text-dark-900 pt-2 border-t border-gray-100">
                        <span>{isDelivered ? '✓ Charged to Folio:' : 'Total (Pending Delivery):'}</span>
                        <span className={isDelivered ? 'text-emerald-700' : 'text-gold-700'}>${ord.total.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CONCIERGE SERVICES (REQUESTED -> ACCEPTED -> IN_PROGRESS -> COMPLETED) */}
        {activeTab === 'Concierge Services' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                24/7 White-Glove Concierge Requests
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                Request hotel services directly: <strong>REQUESTED → ACCEPTED → IN_PROGRESS → COMPLETED</strong>. Dispatches instantly to Front Desk & Housekeeping.
              </p>
            </div>

            {/* Quick Request Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Extra Pillows & Egyptian Linens', desc: 'Hypoallergenic feather pillows + 600-thread count sheets', dept: 'Housekeeping' },
                { title: 'Turn-Down Service', desc: 'Evening turn-down with artisanal chocolates and room scenting', dept: 'Housekeeping' },
                { title: 'Valet Retrieval', desc: 'Bring vehicle to private hotel courtyard entrance', dept: 'Front Desk' },
                { title: 'Airport Limousine Transfer', desc: 'Private Mercedes S-Class chauffeured airport transfer', dept: 'Concierge', charge: 95 },
                { title: 'Luggage & Bellman Assistance', desc: 'Luggage transfer or packing assistance', dept: 'Front Desk' },
                { title: 'Late Checkout Request (2:00 PM)', desc: 'Subject to availability; complimentary for Horizon elite', dept: 'Front Desk' },
              ].map((svc, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-dark-900 mb-1">{svc.title}</h3>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed font-light">{svc.desc}</p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>Dept: {svc.dept}</span>
                      {svc.charge ? <span className="font-mono font-bold text-gold-700">${svc.charge}</span> : <span className="text-emerald-600 font-semibold">Complimentary</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRequestService(svc.title, svc.desc, svc.charge || 0, svc.dept)}
                    className="mt-4 w-full py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    Request Service
                  </button>
                </div>
              ))}
            </div>

            {/* ACTIVE REQUESTS TRACKER */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
              <h2 className="font-serif text-lg font-bold text-dark-900 mb-3">
                My Active Service Requests Tracker
              </h2>

              {guestServiceRequests.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 font-light">
                  No active concierge requests currently open. Click above to request hotel amenities.
                </div>
              ) : (
                <div className="space-y-3">
                  {guestServiceRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-dark-900">{req.serviceType}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800'
                                : req.status === 'ACCEPTED'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 font-light">{req.details}</div>
                      </div>

                      {/* 4-Stage Stepper for Service Request */}
                      <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        <span className={req.status === 'REQUESTED' ? 'text-amber-600' : 'text-gray-400'}>REQUESTED</span>
                        <span>→</span>
                        <span className={req.status === 'ACCEPTED' ? 'text-purple-600' : 'text-gray-400'}>ACCEPTED</span>
                        <span>→</span>
                        <span className={req.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-gray-400'}>IN_PROGRESS</span>
                        <span>→</span>
                        <span className={req.status === 'COMPLETED' ? 'text-emerald-600 font-bold' : 'text-gray-400'}>COMPLETED</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PRINTABLE INVOICE MODAL */}
      {selectedFolioForInvoice && (
        <PrintableInvoice
          folio={selectedFolioForInvoice}
          onClose={() => setSelectedFolioForInvoice(null)}
        />
      )}

      {/* EXPRESS CHECK-OUT MODAL */}
      {showCheckoutModal && folio && (
        <div className="fixed inset-0 z-[120] bg-dark-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gold-500/30 max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 text-dark-900 relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center border border-gold-200">
                  <LogOut size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-dark-900">
                    Express Check-Out
                  </h3>
                  <p className="text-[11px] text-gray-500 font-light">
                    Suite {assignedRoomNumber} • {userBooking?.roomType || 'Luxury Suite'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="p-1 text-gray-400 hover:text-dark-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Guest details summary */}
            <div className="my-4 p-3 bg-gray-50 rounded-xl text-xs space-y-1.5 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Guest Name:</span>
                <span className="font-bold text-dark-900">{folio.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stay Duration:</span>
                <span className="font-medium text-dark-900">{folio.nights} Night(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Scheduled Departure:</span>
                <span className="font-medium text-dark-900">{userBooking?.checkOut || 'Today'}</span>
              </div>
            </div>

            {/* Itemized Folio Table */}
            <div className="space-y-2 mb-4 text-xs">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Itemized Final Folio Charges
              </div>

              <div className="p-3.5 bg-[#fafafa] rounded-xl border border-gray-200 divide-y divide-gray-100 space-y-2">
                <div className="flex justify-between pt-1">
                  <div>
                    <span className="font-semibold text-dark-900 block">Suite Accommodation</span>
                    <span className="text-[10px] text-gray-500">{folio.nights} nights @ ${folio.roomRate.toFixed(2)}/nt</span>
                  </div>
                  <span className="font-mono font-bold text-dark-900">${folio.roomTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between pt-2">
                  <div>
                    <span className="font-semibold text-dark-900 block">In-Room Culinary Dining</span>
                    <span className="text-[10px] text-gray-500">{folio.foodOrders?.length || 0} kitchen order(s) delivered</span>
                  </div>
                  <span className="font-mono font-bold text-gold-700">+${folio.foodTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between pt-2">
                  <div>
                    <span className="font-semibold text-dark-900 block">Concierge & White-Glove Services</span>
                    <span className="text-[10px] text-gray-500">{folio.serviceRequests?.length || 0} service request(s)</span>
                  </div>
                  <span className="font-mono font-bold text-blue-700">+${(folio.serviceTotal || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between pt-2 text-gray-600">
                  <span>Hospitality & Luxury Tax (12%):</span>
                  <span className="font-mono font-medium">${folio.taxes.toFixed(2)}</span>
                </div>

                <div className="flex justify-between pt-2.5 text-sm font-bold text-dark-900">
                  <span>Total Amount Due:</span>
                  <span className="font-mono text-base text-gold-700">${folio.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 mb-5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Select Settlement Payment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'Visa Signature •••• 4092', label: 'Card on File (•••• 4092)' },
                  { id: 'Apple Pay / Digital Wallet', label: 'Apple Pay / Digital Wallet' },
                  { id: 'American Express Centurion •••• 8820', label: 'Amex Centurion (•••• 8820)' },
                  { id: 'Settle at Front Desk (Cash/Card)', label: 'Settle in Person at Desk' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setCheckoutPaymentMethod(pm.id)}
                    className={`p-2.5 rounded-lg border text-left flex items-center justify-between cursor-pointer transition-all ${
                      checkoutPaymentMethod === pm.id
                        ? 'bg-gold-50 border-gold-500 text-gold-950 font-semibold shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{pm.label}</span>
                    {checkoutPaymentMethod === pm.id && (
                      <Check size={14} className="text-gold-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox agreement */}
            <label className="flex items-start gap-2 text-[11px] text-gray-600 mb-5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={checkoutAgreed}
                onChange={(e) => setCheckoutAgreed(e.target.checked)}
                className="mt-0.5 rounded text-gold-600 focus:ring-gold-500"
              />
              <span className="leading-tight">
                I authorize final payment of <strong>${folio.grandTotal.toFixed(2)}</strong> for room folio charges and confirm that my digital NFC keycard will be deactivated upon checkout.
              </span>
            </label>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
              >
                Keep Stay Active
              </button>
              <button
                type="button"
                disabled={!checkoutAgreed || isCheckingOut}
                onClick={handleGuestCheckout}
                className="flex-1 py-2.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <LogOut size={14} />
                <span>{isCheckingOut ? 'Processing...' : `Confirm Check-Out ($${folio.grandTotal.toFixed(2)})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestDashboard;
