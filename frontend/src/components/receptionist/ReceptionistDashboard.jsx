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
  Menu,
  Wrench,
  XCircle,
  UserX,
  Edit2,
  DollarSign,
  Tag,
  Filter,
  RefreshCw,
  Phone,
  Mail
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import PrintableInvoice from '../shared/PrintableInvoice';

const ReceptionistDashboard = ({ user, onLogout, onBackToSite }) => {
  const {
    rooms,
    bookings,
    orders,
    serviceRequests,
    housekeepingTasks,
    maintenanceTickets,
    assignRoom,
    checkInGuest,
    modifyBooking,
    cancelBooking,
    markNoShow,
    createWalkInBooking,
    getGuestFolio,
    checkoutGuest,
    undoCheckout,
    cleanRoom,
    updateServiceRequestStatus,
    createMaintenanceTicket,
    updateMaintenanceTicket,
  } = useHotel();

  const [activeTab, setActiveTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState('All');
  const [bookingFilter, setBookingFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [checkInModalData, setCheckInModalData] = useState(null); // { booking, targetRoomNumber }
  const [modifyModalData, setModifyModalData] = useState(null); // { booking, roomNumber, nights, notes }
  const [maintenanceModalData, setMaintenanceModalData] = useState(null); // { roomNumber }
  const [dirtyAlertModal, setDirtyAlertModal] = useState(null); // { room, bookingId, message }
  const [selectedFolioForInvoice, setSelectedFolioForInvoice] = useState(null);
  const [checkoutConfirmFolio, setCheckoutConfirmFolio] = useState(null); // Folio awaiting confirmation
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState('Visa Signature •••• 4092');
  const [checkoutPaymentStatus, setCheckoutPaymentStatus] = useState('PAID');

  // Walk-in form state
  const [walkInData, setWalkInData] = useState({
    name: '',
    email: '',
    phone: '',
    roomNumber: '102',
    nights: 2,
    paymentMethod: 'Credit Card (Terminal Verified)',
    notes: 'Walk-in arrival • Immediate keys issued',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Metrics
  const inHouseGuests = bookings.filter((b) => b.status === 'In-House' || b.status === 'CHECKED_IN');
  const arrivalsToday = bookings.filter((b) => b.status === 'Arriving Today' || b.status === 'CONFIRMED' || b.status === 'PENDING');
  const departuresToday = bookings.filter((b) => b.status === 'Departing Today');
  const dirtyRooms = rooms.filter((r) => (r.housekeepingStatus || r.cleanliness?.toUpperCase()) === 'DIRTY');
  const outOfServiceRooms = rooms.filter((r) => (r.maintenanceStatus || '').toUpperCase() === 'OUT_OF_SERVICE' || (r.maintenanceStatus || '').toUpperCase() === 'MAINTENANCE');
  const cleanRooms = rooms.filter((r) => (r.housekeepingStatus || r.cleanliness?.toUpperCase()) === 'CLEAN' && (r.maintenanceStatus || 'AVAILABLE') === 'AVAILABLE');

  // Handle Check-In from booking
  const handleInitiateCheckIn = (booking) => {
    setCheckInModalData({
      booking,
      targetRoomNumber: booking.roomNumber || (rooms.find(r => (r.occupancyStatus || r.occupancy?.toUpperCase()) === 'VACANT' && (r.housekeepingStatus || r.cleanliness?.toUpperCase()) === 'CLEAN' && (r.maintenanceStatus || 'AVAILABLE') === 'AVAILABLE')?.roomNumber || '102'),
    });
  };

  const handleConfirmCheckIn = async () => {
    if (!checkInModalData) return;
    const { booking, targetRoomNumber } = checkInModalData;
    const targetRoom = rooms.find((r) => r.roomNumber === targetRoomNumber);

    if (!targetRoom) {
      showToast(`Selected room ${targetRoomNumber} not found.`);
      return;
    }

    // Guardrail: Maintenance Status must be AVAILABLE
    const maint = (targetRoom.maintenanceStatus || 'AVAILABLE').toUpperCase();
    if (maint === 'OUT_OF_SERVICE' || maint === 'MAINTENANCE') {
      showToast(`⚠️ Cannot check in: Room ${targetRoomNumber} is ${maint} (${targetRoom.dirtyReason || 'Maintenance in progress'})`);
      return;
    }

    // Guardrail: Housekeeping Status must be CLEAN
    const hk = (targetRoom.housekeepingStatus || targetRoom.cleanliness?.toUpperCase() || 'CLEAN');
    if (hk !== 'CLEAN' && hk !== 'INSPECTED') {
      setDirtyAlertModal({
        room: targetRoom,
        bookingId: booking.id,
        message: `Room ${targetRoomNumber} is currently ${hk}! 5-Star standard strictly requires verified CLEAN suites for guest check-in.`,
      });
      return;
    }

    const res = await checkInGuest(booking.id, targetRoomNumber);
    if (res.success) {
      showToast(`✓ Check-In confirmed! ${booking.guestName} assigned to Room ${targetRoomNumber}. Digital Key issued.`);
      setCheckInModalData(null);
    } else {
      showToast(res.message || 'Check-in failed');
    }
  };

  // Handle Walk-In Submit
  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    const targetRoom = rooms.find((r) => r.roomNumber === walkInData.roomNumber);

    if (targetRoom) {
      const maint = (targetRoom.maintenanceStatus || 'AVAILABLE').toUpperCase();
      if (maint === 'OUT_OF_SERVICE' || maint === 'MAINTENANCE') {
        showToast(`Cannot check in to Room ${walkInData.roomNumber}: Room is ${maint}.`);
        return;
      }

      const hk = (targetRoom.housekeepingStatus || targetRoom.cleanliness?.toUpperCase() || 'CLEAN');
      if (hk !== 'CLEAN' && hk !== 'INSPECTED') {
        setDirtyAlertModal({
          room: targetRoom,
          bookingId: 'NEW_WALKIN',
          message: `Selected Room ${walkInData.roomNumber} is currently ${hk}! (${targetRoom.dirtyReason || 'Cleaning required'}).`,
        });
        return;
      }
    }

    const res = await createWalkInBooking(walkInData);
    if (res.success) {
      showToast(`✓ Walk-In Guest ${walkInData.name} checked into Room ${walkInData.roomNumber}! Digital Key active.`);
      setIsWalkInModalOpen(false);
      setWalkInData({
        name: '',
        email: '',
        phone: '',
        roomNumber: '102',
        nights: 2,
        paymentMethod: 'Credit Card (Terminal Verified)',
        notes: 'Walk-in arrival • Immediate keys issued',
      });
    } else {
      showToast(res.message || 'Walk-in creation failed');
    }
  };

  // Checkout Flow with Confirmation
  const handleInitiateCheckout = (roomNumber) => {
    const folio = getGuestFolio(roomNumber);
    if (!folio || !folio.booking) {
      showToast(`No active booking found for Room ${roomNumber}`);
      return;
    }
    setCheckoutConfirmFolio(folio);
    setCheckoutPaymentStatus('PAID');
  };

  const handleExecuteCheckout = async (roomNumber, paymentMethod) => {
    const res = await checkoutGuest(roomNumber, paymentMethod || 'Visa Signature •••• 4092');
    if (res.success) {
      showToast(`✓ Room ${roomNumber} settled and checked out! Automatically marked DIRTY & dispatched to Housekeeping queue.`);
      setSelectedFolioForInvoice(res.folio);
      setCheckoutConfirmFolio(null);
    } else {
      showToast(res.message || 'Checkout failed');
    }
  };

  const handleCancelCheckoutModal = () => {
    setCheckoutConfirmFolio(null);
    showToast('Check-out cancelled. Guest stay remains active.');
  };

  const handleUndoCheckout = (bookingId, roomNumber) => {
    const res = undoCheckout(bookingId);
    showToast(res.message || `Check-out for Room ${roomNumber} reverted.`);
  };

  // Filtered rooms for Room Rack
  const filteredRooms = rooms.filter((r) => {
    const occ = (r.occupancyStatus || r.occupancy?.toUpperCase() || 'VACANT');
    const hk = (r.housekeepingStatus || r.cleanliness?.toUpperCase() || 'CLEAN');
    const maint = (r.maintenanceStatus || 'AVAILABLE').toUpperCase();

    if (roomFilter === 'Vacant') return occ === 'VACANT' || occ === 'AVAILABLE';
    if (roomFilter === 'Occupied') return occ === 'OCCUPIED';
    if (roomFilter === 'Clean') return hk === 'CLEAN' || hk === 'INSPECTED';
    if (roomFilter === 'Dirty') return hk === 'DIRTY';
    if (roomFilter === 'Cleaning') return hk === 'CLEANING';
    if (roomFilter === 'Inspection') return hk === 'INSPECTION';
    if (roomFilter === 'Out of Service') return maint === 'OUT_OF_SERVICE' || maint === 'MAINTENANCE';
    if (roomFilter === 'Ready') return (occ === 'VACANT' || occ === 'AVAILABLE') && (hk === 'CLEAN' || hk === 'INSPECTED') && maint === 'AVAILABLE';
    return true;
  });

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      b.guestName?.toLowerCase().includes(query) ||
      b.roomNumber?.toString().includes(query) ||
      b.id?.toLowerCase().includes(query) ||
      b.phone?.includes(query);

    if (!matchesSearch) return false;

    if (bookingFilter === 'Arrivals') return b.status === 'Arriving Today' || b.status === 'CONFIRMED' || b.status === 'PENDING';
    if (bookingFilter === 'In-House') return b.status === 'In-House' || b.status === 'CHECKED_IN';
    if (bookingFilter === 'Departures') return b.status === 'Departing Today';
    if (bookingFilter === 'Checked Out') return b.status === 'Checked Out' || b.status === 'CHECKED_OUT';
    if (bookingFilter === 'Cancelled') return b.status === 'CANCELLED' || b.status === 'NO_SHOW';
    return true;
  });

  const navMenuItems = [
    { name: 'Overview', icon: Home, count: arrivalsToday.length + inHouseGuests.length },
    { name: 'Room Rack & Assign', icon: DoorClosed, count: rooms.length },
    { name: 'Walk-In Booking', icon: UserCheck },
    { name: 'Billing & Checkout', icon: Receipt, count: inHouseGuests.length },
    { name: 'Concierge Requests', icon: Bell, count: serviceRequests.filter(s => s.status !== 'COMPLETED').length },
    { name: 'Guest Invoices', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[150] bg-dark-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-gold-500/40 text-xs flex items-center gap-2 animate-slide-down">
          <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
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
        <div className="fixed inset-0 z-[130] bg-dark-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-red-300 max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 text-dark-900 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />
            <div className="flex items-center gap-3 text-red-600 mb-3 pt-1">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-200">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-dark-900">
                  Room Cleanliness Safeguard
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                  5-Star Forbes Standard Enforced
                </span>
              </div>
            </div>

            <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-800 mb-4">
              <p className="font-semibold mb-1">
                Room {dirtyAlertModal.room.roomNumber} ({dirtyAlertModal.room.type})
              </p>
              <p className="text-red-700 leading-relaxed font-light">
                {dirtyAlertModal.message}
              </p>
            </div>

            <p className="text-xs text-gray-600 mb-5 leading-relaxed font-light">
              Front desk check-in is restricted to verified CLEAN rooms. Would you like to fast-track an instant certification or select an alternative clean room?
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  cleanRoom(dirtyAlertModal.room.roomNumber, 'Reception Fast-Track Clean');
                  showToast(`✓ Room ${dirtyAlertModal.room.roomNumber} certified CLEAN! You may now proceed with check-in.`);
                  setDirtyAlertModal(null);
                }}
                className="flex-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Sparkles size={14} />
                <span>Fast-Track Clean & Assign</span>
              </button>

              <button
                type="button"
                onClick={() => setDirtyAlertModal(null)}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-light transition-colors cursor-pointer"
              >
                Pick Another Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECK-IN VERIFICATION MODAL */}
      {checkInModalData && (
        <div className="fixed inset-0 z-[125] bg-dark-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 text-dark-900 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-amber-500" />
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gold-50 text-gold-700 border border-gold-200 flex items-center justify-center font-bold">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-dark-900">
                    Front Desk Guest Check-In
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                    Reservation #{checkInModalData.booking.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCheckInModalData(null)}
                className="text-gray-400 hover:text-dark-900 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Guest Summary */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 mb-4 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-500 uppercase text-[10px]">Guest Name</span>
                <span className="font-bold text-dark-900 text-sm">{checkInModalData.booking.guestName}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Contact Phone</span>
                <span className="font-mono">{checkInModalData.booking.phone || '+1 (555) 019-2831'}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Stay Dates</span>
                <span className="font-medium text-dark-900">{checkInModalData.booking.checkIn} → {checkInModalData.booking.checkOut} ({checkInModalData.booking.nights} nights)</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Room Category</span>
                <span className="font-medium text-gold-700">{checkInModalData.booking.roomType}</span>
              </div>
            </div>

            {/* Room Selection & Verification */}
            <div className="space-y-3 mb-5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Assigned Suite Allocation
              </label>
              <select
                value={checkInModalData.targetRoomNumber}
                onChange={(e) => setCheckInModalData({ ...checkInModalData, targetRoomNumber: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 font-medium"
              >
                {rooms.map((r) => {
                  const occ = (r.occupancyStatus || r.occupancy?.toUpperCase() || 'VACANT');
                  const hk = (r.housekeepingStatus || r.cleanliness?.toUpperCase() || 'CLEAN');
                  const maint = (r.maintenanceStatus || 'AVAILABLE').toUpperCase();
                  const isReady = occ === 'VACANT' && hk === 'CLEAN' && maint === 'AVAILABLE';

                  return (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} ({r.type}) — {occ} • {hk} • {maint} {isReady ? '✓ [READY]' : '⚠️'}
                    </option>
                  );
                })}
              </select>

              {/* Status Verification Pills for Selected Room */}
              {(() => {
                const selRoom = rooms.find(r => r.roomNumber === checkInModalData.targetRoomNumber);
                if (!selRoom) return null;
                const occ = (selRoom.occupancyStatus || selRoom.occupancy?.toUpperCase() || 'VACANT');
                const hk = (selRoom.housekeepingStatus || selRoom.cleanliness?.toUpperCase() || 'CLEAN');
                const maint = (selRoom.maintenanceStatus || 'AVAILABLE').toUpperCase();
                const isClean = hk === 'CLEAN' || hk === 'INSPECTED';
                const isMaintOk = maint === 'AVAILABLE';

                return (
                  <div className="p-3 bg-dark-900/5 rounded-lg border border-gray-200 text-xs space-y-2">
                    <div className="font-semibold text-gray-700 text-[11px] uppercase tracking-wider">
                      Room {selRoom.roomNumber} Status Verification:
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                      <div className={`p-1.5 rounded border ${occ === 'VACANT' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                        OCCUPANCY: {occ}
                      </div>
                      <div className={`p-1.5 rounded border ${isClean ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                        HK: {hk}
                      </div>
                      <div className={`p-1.5 rounded border ${isMaintOk ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                        MAINT: {maint}
                      </div>
                    </div>
                    {(!isClean || !isMaintOk) && (
                      <div className="text-[11px] text-red-600 flex items-center gap-1 pt-1 font-medium">
                        <AlertTriangle size={13} />
                        <span>Room is not ready for guest arrival. Please select a clean, available suite.</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Check-In Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCheckInModalData(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-light hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckIn}
                className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-xs font-medium cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 size={15} />
                <span>Confirm Check-In & Activate Stay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODIFY RESERVATION MODAL */}
      {modifyModalData && (
        <div className="fixed inset-0 z-[125] bg-dark-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full p-5 text-dark-900 relative">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-serif font-bold text-base text-dark-900">Modify Reservation #{modifyModalData.booking.id}</h3>
              <button onClick={() => setModifyModalData(null)} className="text-gray-400 hover:text-dark-900">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Guest Name</label>
                <input
                  type="text"
                  value={modifyModalData.guestName}
                  onChange={(e) => setModifyModalData({ ...modifyModalData, guestName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-[#fafafa]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Room Assignment</label>
                  <select
                    value={modifyModalData.roomNumber}
                    onChange={(e) => setModifyModalData({ ...modifyModalData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    {rooms.map(r => (
                      <option key={r.roomNumber} value={r.roomNumber}>Room {r.roomNumber} ({r.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Nights</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={modifyModalData.nights}
                    onChange={(e) => setModifyModalData({ ...modifyModalData, nights: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-[#fafafa]"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
              <button
                onClick={() => setModifyModalData(null)}
                className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await modifyBooking(modifyModalData.booking.id, {
                    guestName: modifyModalData.guestName,
                    roomNumber: modifyModalData.roomNumber,
                    nights: modifyModalData.nights,
                  });
                  showToast(`✓ Reservation #${modifyModalData.booking.id} modified successfully.`);
                  setModifyModalData(null);
                }}
                className="px-4 py-1.5 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-xs font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MAINTENANCE MODAL */}
      {maintenanceModalData && (
        <div className="fixed inset-0 z-[125] bg-dark-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full p-5 text-dark-900 relative">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2 text-amber-600">
                <Wrench size={18} />
                <h3 className="font-serif font-bold text-base text-dark-900">
                  Report Room Maintenance Issue
                </h3>
              </div>
              <button onClick={() => setMaintenanceModalData(null)} className="text-gray-400 hover:text-dark-900">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Room Number</label>
                <input
                  type="text"
                  disabled
                  value={`Room ${maintenanceModalData.roomNumber}`}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Issue Description *</label>
                <textarea
                  rows={3}
                  placeholder="e.g. AC thermostat malfunction, bathroom faucet leak, door latch calibration needed"
                  value={maintenanceModalData.issueDescription || ''}
                  onChange={(e) => setMaintenanceModalData({ ...maintenanceModalData, issueDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Severity & Impact</label>
                <select
                  value={maintenanceModalData.inventoryImpact || 'OUT_OF_SERVICE'}
                  onChange={(e) => setMaintenanceModalData({ ...maintenanceModalData, inventoryImpact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                >
                  <option value="OUT_OF_SERVICE">OUT OF SERVICE (Strictly blocks check-ins)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Inspection in progress)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
              <button
                onClick={() => setMaintenanceModalData(null)}
                className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!maintenanceModalData.issueDescription) {
                    showToast('Please describe the maintenance issue.');
                    return;
                  }
                  createMaintenanceTicket({
                    roomNumber: maintenanceModalData.roomNumber,
                    issueDescription: maintenanceModalData.issueDescription,
                    inventoryImpact: maintenanceModalData.inventoryImpact || 'OUT_OF_SERVICE',
                    reportedBy: 'Front Desk Reception',
                  });
                  showToast(`✓ Ticket created! Room ${maintenanceModalData.roomNumber} set to OUT OF SERVICE.`);
                  setMaintenanceModalData(null);
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium"
              >
                Flag Out of Service
              </button>
            </div>
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
                    className="h-10 sm:h-11 w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="font-serif text-base font-bold tracking-wider text-white uppercase">
                    Efoy Hotel
                  </h1>
                  <p className="text-[9px] tracking-[0.25em] text-gold-400 uppercase font-medium">
                    Front Desk Portal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-gold-500 text-white font-semibold'
                        : 'text-gray-300 hover:text-white hover:bg-dark-800/60'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={16} />
                      <span>{item.name}</span>
                    </span>
                    {item.count !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-dark-800 rounded text-gray-300">
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

      {/* DESKTOP SIDEBAR (lg+) */}
      <aside className="hidden lg:flex w-64 bg-dark-900 text-white flex-col shrink-0 border-r border-dark-800 select-none">
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
              Front Desk Portal
            </p>
          </div>
        </div>

        <div className="px-3 pt-3">
          <button
            onClick={onBackToSite}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gold-400 bg-gold-500/10 hover:bg-gold-500/15 rounded-md transition-all border border-gold-500/25 cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <Home size={14} />
              <span>Public Website</span>
            </span>
            <span className="text-[10px] text-gold-300/80 group-hover:translate-x-0.5 transition-transform">
              Visit →
            </span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
            Front Desk Operations
          </div>
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-gold-500 hover:bg-gold-600 text-white font-semibold shadow-xs'
                    : 'text-gray-300 hover:text-white hover:bg-dark-800/60 font-light'
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

        {/* Operational Status Box */}
        <div className="p-3 mx-3 mb-3 rounded-xl bg-dark-800/70 border border-dark-700/60 text-xs">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="font-semibold text-gray-300">Room Statuses</span>
            <span className="text-gold-400 font-mono text-[10px]">{rooms.length} Suites</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
            <div className="flex justify-between">
              <span>Clean:</span>
              <span className="text-emerald-400 font-semibold">{cleanRooms.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Dirty:</span>
              <span className={`font-semibold ${dirtyRooms.length > 0 ? 'text-red-400' : 'text-gray-400'}`}>{dirtyRooms.length}</span>
            </div>
            <div className="flex justify-between">
              <span>In-House:</span>
              <span className="text-gold-400 font-semibold">{inHouseGuests.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Out of Svc:</span>
              <span className={`font-semibold ${outOfServiceRooms.length > 0 ? 'text-amber-400' : 'text-gray-400'}`}>{outOfServiceRooms.length}</span>
            </div>
          </div>
        </div>

        {/* User profile & logout */}
        <div className="p-4 border-t border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-dark-800 text-gold-500 border border-gold-500/30 font-semibold text-xs flex items-center justify-center">
              FD
            </div>
            <div>
              <div className="text-xs font-semibold text-white">{user?.name || 'Julian Vance'}</div>
              <div className="text-[10px] text-gray-400 font-light">Front Desk Officer</div>
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
        {/* TOP HEADER */}
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
                placeholder="Search guest name, room, reservation ID..."
                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 bg-[#fafafa] border border-gray-200 rounded-lg text-xs text-dark-900 placeholder-gray-400 focus:outline-none focus:border-gold-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Clock size={14} className="text-gold-500" />
              <span>Live PMS Operations</span>
            </div>

            <button
              onClick={() => setIsWalkInModalOpen(true)}
              className="bg-gold-500 hover:bg-gold-600 text-white text-xs font-medium px-2.5 sm:px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>+ Walk-In</span>
            </button>
          </div>
        </header>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'Overview' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-gold-600 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                  Front Desk Real-Time Dashboard
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Synchronized
                </span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                Front Desk Operations & Guest Manifest
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                Manage arrivals, smart check-ins, departures, room assignments, and live folios.
              </p>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Arrivals */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Today's Arrivals
                </div>
                <div className="font-serif text-2xl font-bold text-dark-900 mb-0.5">
                  {arrivalsToday.length}
                </div>
                <div className="text-[10px] text-blue-600">Pending check-in</div>
              </div>

              {/* In-House */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  In-House Guests
                </div>
                <div className="font-serif text-2xl font-bold text-emerald-700 mb-0.5">
                  {inHouseGuests.length}
                </div>
                <div className="text-[10px] text-gray-500">Active stays & keys</div>
              </div>

              {/* Departures */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Departures
                </div>
                <div className="font-serif text-2xl font-bold text-gold-700 mb-0.5">
                  {departuresToday.length}
                </div>
                <div className="text-[10px] text-gray-500">Checkout scheduled</div>
              </div>

              {/* Clean & Ready */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Clean & Available
                </div>
                <div className="font-serif text-2xl font-bold text-emerald-600 mb-0.5">
                  {cleanRooms.filter(r => (r.occupancyStatus || r.occupancy?.toUpperCase()) === 'VACANT').length}
                </div>
                <div className="text-[10px] text-emerald-600">Ready for check-in</div>
              </div>

              {/* Dirty / Out of Service */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Dirty / Maintenance
                </div>
                <div className="font-serif text-2xl font-bold text-red-600 mb-0.5">
                  {dirtyRooms.length + outOfServiceRooms.length}
                </div>
                <div className="text-[10px] text-red-500">Requires turnover</div>
              </div>
            </div>

            {/* GUEST MANIFEST TABLE */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-lg font-bold text-dark-900">
                    Live Reservation & Stay Manifest
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5 font-light">
                    Follow the complete operational lifecycle: Discover → Reserve → Check-In → Stay → Checkout
                  </p>
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap items-center gap-1 bg-[#fafafa] border border-gray-200 p-1 rounded-lg text-xs">
                  {['All', 'Arrivals', 'In-House', 'Departures', 'Checked Out'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setBookingFilter(filter)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                        bookingFilter === filter
                          ? 'bg-dark-900 text-white shadow-xs'
                          : 'text-gray-600 hover:text-dark-900'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[760px]">
                  <thead className="bg-[#fbfbfb] border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Guest & Confirmation</th>
                      <th className="py-3 px-4">Room & Status</th>
                      <th className="py-3 px-4">Stay Dates</th>
                      <th className="py-3 px-4">Lifecycle Status</th>
                      <th className="py-3 px-4">Folio Total</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBookings.map((booking) => {
                      const folio = getGuestFolio(booking.roomNumber);
                      const room = rooms.find((r) => r.roomNumber === booking.roomNumber);
                      const roomHk = room?.housekeepingStatus || room?.cleanliness?.toUpperCase() || 'CLEAN';
                      const roomMaint = room?.maintenanceStatus || 'AVAILABLE';
                      const isCheckedIn = booking.status === 'In-House' || booking.status === 'CHECKED_IN';
                      const isCheckedOut = booking.status === 'Checked Out' || booking.status === 'CHECKED_OUT';
                      const isPendingArrival = !isCheckedIn && !isCheckedOut && booking.status !== 'CANCELLED' && booking.status !== 'NO_SHOW';

                      return (
                        <tr key={booking.id} className="hover:bg-amber-50/20 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-dark-900">{booking.guestName}</div>
                            <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1.5">
                              <span>#{booking.id}</span>
                              {booking.phone && <span>• {booking.phone}</span>}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-bold text-dark-900">Room {booking.roomNumber || 'Unassigned'}</span>
                              {roomHk === 'DIRTY' && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-red-100 text-red-700 rounded font-bold">
                                  DIRTY
                                </span>
                              )}
                              {roomMaint === 'OUT_OF_SERVICE' && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-red-800 text-white rounded font-bold">
                                  OOS
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500">{booking.roomType}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-gray-800 font-medium">
                              {booking.checkIn} → {booking.checkOut}
                            </div>
                            <div className="text-[10px] text-gray-400">{booking.nights} Night(s)</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                isCheckedIn
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isCheckedOut
                                  ? 'bg-gray-100 text-gray-600 border-gray-200'
                                  : booking.status === 'CANCELLED' || booking.status === 'NO_SHOW'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {booking.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-dark-900">
                              ${folio.grandTotal.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              Room: ${folio.roomTotal} | Food: ${folio.foodTotal}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Check-In Button if Arriving / Confirmed */}
                              {isPendingArrival && (
                                <button
                                  onClick={() => handleInitiateCheckIn(booking)}
                                  className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-medium transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                                >
                                  <UserCheck size={12} />
                                  <span>Check-In</span>
                                </button>
                              )}

                              {/* Checkout Button if In-House */}
                              {isCheckedIn && (
                                <button
                                  onClick={() => handleInitiateCheckout(booking.roomNumber)}
                                  className="px-2.5 py-1.5 bg-dark-900 hover:bg-dark-800 text-white rounded text-[11px] font-medium transition-colors cursor-pointer"
                                >
                                  Checkout
                                </button>
                              )}

                              {/* Folio / Invoice */}
                              <button
                                onClick={() => setSelectedFolioForInvoice(folio)}
                                title="Print Official Tax Invoice"
                                className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Printer size={12} />
                                <span className="hidden sm:inline">Invoice</span>
                              </button>

                              {/* Modify / Cancel Actions for Pending */}
                              {isPendingArrival && (
                                <>
                                  <button
                                    onClick={() => setModifyModalData({
                                      booking,
                                      guestName: booking.guestName,
                                      roomNumber: booking.roomNumber,
                                      nights: booking.nights,
                                    })}
                                    title="Modify Reservation"
                                    className="p-1.5 text-gray-500 hover:text-dark-900 hover:bg-gray-100 rounded"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (window.confirm(`Cancel reservation for ${booking.guestName}?`)) {
                                        await cancelBooking(booking.id);
                                        showToast(`Reservation #${booking.id} marked CANCELLED.`);
                                      }
                                    }}
                                    title="Cancel Reservation"
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                  >
                                    <XCircle size={13} />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (window.confirm(`Mark ${booking.guestName} as NO-SHOW?`)) {
                                        await markNoShow(booking.id);
                                        showToast(`Reservation #${booking.id} marked NO_SHOW.`);
                                      }
                                    }}
                                    title="Mark No-Show"
                                    className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
                                  >
                                    <UserX size={13} />
                                  </button>
                                </>
                              )}

                              {/* Undo Checkout if Checked Out */}
                              {isCheckedOut && (
                                <button
                                  onClick={() => handleUndoCheckout(booking.id, booking.roomNumber)}
                                  className="px-2 py-1 bg-gold-50 hover:bg-gold-100 text-gold-800 border border-gold-200 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                                  title="Revert check-out and restore active stay"
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

        {/* TAB 2: ROOM RACK & ASSIGN */}
        {activeTab === 'Room Rack & Assign' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-dark-900">
                  Room Rack & 3-Status Separation
                </h1>
                <p className="text-xs text-gray-500 mt-1 font-light">
                  Strictly separated: <strong>Occupancy</strong> (Vacant/Occupied) • <strong>Housekeeping</strong> (Clean/Dirty/Cleaning/Inspection) • <strong>Maintenance</strong> (Available/Maintenance/Out of Service)
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1 bg-white border border-gray-200 p-1 rounded-lg text-xs shadow-xs">
                {['All', 'Ready', 'Vacant', 'Occupied', 'Clean', 'Dirty', 'Cleaning', 'Inspection', 'Out of Service'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setRoomFilter(f)}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                      roomFilter === f
                        ? 'bg-dark-900 text-white font-medium shadow-xs'
                        : 'text-gray-500 hover:text-dark-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredRooms.map((room) => {
                const assignedGuest = bookings.find((b) => b.roomNumber === room.roomNumber && (b.status === 'In-House' || b.status === 'CHECKED_IN'));
                const occ = (room.occupancyStatus || room.occupancy?.toUpperCase() || 'VACANT');
                const hk = (room.housekeepingStatus || room.cleanliness?.toUpperCase() || 'CLEAN');
                const maint = (room.maintenanceStatus || 'AVAILABLE').toUpperCase();

                const isClean = hk === 'CLEAN' || hk === 'INSPECTED';
                const isAvailable = maint === 'AVAILABLE';
                const isVacant = occ === 'VACANT' || occ === 'AVAILABLE';
                const canCheckIn = isClean && isAvailable && isVacant;

                return (
                  <div
                    key={room.roomNumber}
                    className={`p-4 rounded-xl border bg-white shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between ${
                      !isAvailable
                        ? 'border-red-400 ring-1 ring-red-300 bg-red-50/10'
                        : !isClean
                        ? 'border-amber-300 ring-1 ring-amber-200'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div>
                      {/* Header with Room Number & Category */}
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-serif text-lg font-bold text-dark-900">
                            Room {room.roomNumber}
                          </span>
                          <div className="text-[11px] text-gray-500 font-medium">{room.type}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-dark-900">${room.rate}</span>
                          <span className="text-[10px] text-gray-400 block">/night</span>
                        </div>
                      </div>

                      {/* 3 DISTINCT SEPARATE STATUS PILLS */}
                      <div className="space-y-1.5 my-3 p-2.5 bg-gray-50/80 rounded-lg border border-gray-100 text-[10px]">
                        {/* 1. Occupancy Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-semibold uppercase tracking-wider">Occupancy:</span>
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              occ === 'OCCUPIED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {occ}
                          </span>
                        </div>

                        {/* 2. Housekeeping Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-semibold uppercase tracking-wider">Housekeeping:</span>
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              hk === 'CLEAN' || hk === 'INSPECTED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : hk === 'DIRTY'
                                ? 'bg-red-100 text-red-800'
                                : hk === 'CLEANING'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {hk}
                          </span>
                        </div>

                        {/* 3. Maintenance Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-semibold uppercase tracking-wider">Maintenance:</span>
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              maint === 'AVAILABLE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : maint === 'OUT_OF_SERVICE'
                                ? 'bg-red-800 text-white'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {maint}
                          </span>
                        </div>
                      </div>

                      {/* Resident Info or Ready Status */}
                      <div className="p-2.5 rounded bg-[#fafafa] border border-gray-100 text-xs mb-3">
                        {assignedGuest ? (
                          <div>
                            <div className="text-[10px] text-gray-400 uppercase font-semibold">Residing Guest:</div>
                            <div className="font-semibold text-dark-900 truncate">
                              👤 {assignedGuest.guestName}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              Departing: {assignedGuest.checkOut}
                            </div>
                          </div>
                        ) : canCheckIn ? (
                          <div className="text-emerald-700 font-medium flex items-center gap-1.5 text-[11px]">
                            <CheckCircle2 size={13} />
                            <span>Vacant • Clean • Ready for Check-In</span>
                          </div>
                        ) : !isAvailable ? (
                          <div className="text-red-700 font-medium flex items-center gap-1 text-[11px]">
                            <Wrench size={13} />
                            <span>{room.dirtyReason || 'Out of service / Maintenance'}</span>
                          </div>
                        ) : (
                          <div className="text-amber-700 font-medium flex items-center gap-1 text-[11px]">
                            <AlertTriangle size={13} />
                            <span>Housekeeping required ({hk})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
                      {assignedGuest ? (
                        <button
                          onClick={() => handleInitiateCheckout(room.roomNumber)}
                          className="w-full py-1.5 bg-dark-900 hover:bg-dark-800 text-white rounded text-xs font-medium transition-colors cursor-pointer"
                        >
                          Checkout & Settle Folio
                        </button>
                      ) : canCheckIn ? (
                        <button
                          onClick={() => {
                            setWalkInData((prev) => ({ ...prev, roomNumber: room.roomNumber }));
                            setIsWalkInModalOpen(true);
                          }}
                          className="w-full py-1.5 bg-gold-500 hover:bg-gold-600 text-white rounded text-xs font-medium transition-colors cursor-pointer shadow-xs"
                        >
                          Assign Walk-In Guest
                        </button>
                      ) : !isClean ? (
                        <button
                          onClick={() => {
                            cleanRoom(room.roomNumber, 'Reception Fast-Track');
                            showToast(`Room ${room.roomNumber} certified CLEAN!`);
                          }}
                          className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                        >
                          <Sparkles size={12} />
                          <span>Certify Clean (Fast-Track)</span>
                        </button>
                      ) : (
                        <div className="text-center py-1 text-[11px] text-gray-400 italic">
                          Unavailable for check-in
                        </div>
                      )}

                      {/* Maintenance Action Button */}
                      {isAvailable ? (
                        <button
                          onClick={() => setMaintenanceModalData({ roomNumber: room.roomNumber })}
                          className="w-full py-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded text-[10px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Wrench size={11} />
                          <span>Report Maintenance Issue</span>
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            // Find active ticket
                            const t = maintenanceTickets.find(m => m.roomNumber === room.roomNumber && m.status !== 'RESOLVED');
                            if (t) {
                              updateMaintenanceTicket(t.id, 'RESOLVED', 'Resolved by Front Desk inspection');
                            }
                            cleanRoom(room.roomNumber, 'Post-Maintenance clearance');
                            showToast(`Room ${room.roomNumber} returned to AVAILABLE status!`);
                          }}
                          className="w-full py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-medium transition-colors cursor-pointer"
                        >
                          Resolve & Mark Available
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
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                Express Walk-In Reservation
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                Verify guest information, select verified clean room, issue digital keycode, and activate folio.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
              <form onSubmit={handleWalkInSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Guest Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lady Genevieve Sterling"
                      value={walkInData.name}
                      onChange={(e) => setWalkInData({ ...walkInData, name: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="guest@luxury.com"
                      value={walkInData.email}
                      onChange={(e) => setWalkInData({ ...walkInData, email: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 492-0199"
                      value={walkInData.phone}
                      onChange={(e) => setWalkInData({ ...walkInData, phone: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Room Allocation *
                    </label>
                    <select
                      value={walkInData.roomNumber}
                      onChange={(e) => setWalkInData({ ...walkInData, roomNumber: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                    >
                      {rooms.map((r) => {
                        const occ = (r.occupancyStatus || r.occupancy?.toUpperCase() || 'VACANT');
                        const hk = (r.housekeepingStatus || r.cleanliness?.toUpperCase() || 'CLEAN');
                        const maint = (r.maintenanceStatus || 'AVAILABLE').toUpperCase();
                        const isReady = occ === 'VACANT' && hk === 'CLEAN' && maint === 'AVAILABLE';

                        return (
                          <option key={r.roomNumber} value={r.roomNumber}>
                            Room {r.roomNumber} - {r.type} (${r.rate}/nt) {isReady ? '✓ [READY]' : `[${hk} / ${maint}]`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Nights of Stay
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={walkInData.nights}
                      onChange={(e) => setWalkInData({ ...walkInData, nights: parseInt(e.target.value) || 1 })}
                      className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Payment Settlement Method
                  </label>
                  <select
                    value={walkInData.paymentMethod}
                    onChange={(e) => setWalkInData({ ...walkInData, paymentMethod: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                  >
                    <option>Credit Card (Terminal Verified)</option>
                    <option>Amex Centurion •••• 8820</option>
                    <option>Corporate Direct Bill</option>
                    <option>Cash Deposit ($500 Pre-Auth)</option>
                    <option>Horizon Privilege Club VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Special Requests / Concierge Notes
                  </label>
                  <textarea
                    rows={2}
                    value={walkInData.notes}
                    onChange={(e) => setWalkInData({ ...walkInData, notes: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2"
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
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                Live Guest Folio & Settlement
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                Continuous tracking of Room Charges, Food Orders (delivered), Concierge Services, Hospitality Taxes (12%), and recorded payments.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {bookings
                .filter((b) => b.status === 'In-House' || b.status === 'CHECKED_IN' || b.status === 'Departing Today')
                .map((b) => {
                  const folio = getGuestFolio(b.roomNumber);
                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif text-base font-bold text-dark-900">
                            Room {b.roomNumber}
                          </span>
                          <span className="text-[10px] font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded border border-gold-200 uppercase">
                            {b.status}
                          </span>
                        </div>

                        <div className="font-semibold text-dark-900 text-sm mb-0.5">{b.guestName}</div>
                        <div className="text-[11px] text-gray-500 mb-3 font-light">
                          {b.roomType} • {b.nights} Night(s)
                        </div>

                        {/* Charges breakdown */}
                        <div className="p-3 bg-[#fafafa] rounded-lg border border-gray-100 space-y-1.5 text-xs mb-4">
                          <div className="flex justify-between text-gray-600">
                            <span>Room Charge:</span>
                            <span className="font-mono font-medium">${folio.roomTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Food & Room Service:</span>
                            <span className="font-mono font-medium text-gold-600">
                              +${folio.foodTotal.toFixed(2)}
                            </span>
                          </div>
                          {folio.serviceTotal > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>Concierge Services:</span>
                              <span className="font-mono font-medium text-blue-600">
                                +${folio.serviceTotal.toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-gray-500 text-[11px]">
                            <span>Taxes & Luxury Surcharge (12%):</span>
                            <span className="font-mono">${folio.taxes.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-bold text-dark-900">
                            <span>Grand Total Folio:</span>
                            <span className="font-mono text-gold-700">${folio.grandTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-gray-500">
                            <span>Balance Due:</span>
                            <span className="font-mono font-bold text-dark-900">${(folio.balanceDue !== undefined ? folio.balanceDue : folio.grandTotal).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Linked dining orders */}
                        {folio.foodOrders.length > 0 && (
                          <div className="mb-4">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                              Linked Dining ({folio.foodOrders.length} Order(s))
                            </span>
                            <div className="space-y-1">
                              {folio.foodOrders.map((ord) => (
                                <div key={ord.id} className="text-[11px] text-gray-600 flex justify-between font-light">
                                  <span>#{ord.id} ({ord.status})</span>
                                  <span className="font-mono font-medium">${ord.total.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => setSelectedFolioForInvoice(folio)}
                          className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-light flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Printer size={13} />
                          <span>View Invoice</span>
                        </button>
                        <button
                          onClick={() => handleInitiateCheckout(b.roomNumber)}
                          className="flex-1 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs"
                        >
                          Check Out & Settle
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 5: CONCIERGE REQUESTS */}
        {activeTab === 'Concierge Requests' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-dark-900">
                  Concierge & Guest Service Operations
                </h1>
                <p className="text-xs text-gray-500 mt-1 font-light">
                  Lifecycle: <strong>REQUESTED → ACCEPTED → IN_PROGRESS → COMPLETED</strong>. Real-time updates directly to Guest Portal.
                </p>
              </div>

              <button
                onClick={() => {
                  const room = prompt('Enter Room Number:');
                  if (!room) return;
                  const service = prompt('Enter Service (e.g. Extra pillows, Valet retrieval, Airport transfer):');
                  if (!service) return;
                  createServiceRequest({
                    roomNumber: room,
                    serviceType: service,
                    details: 'Requested directly via Front Desk',
                    department: 'Front Desk',
                  });
                  showToast(`✓ Concierge request logged for Room ${room}.`);
                }}
                className="px-3.5 py-1.5 bg-dark-900 hover:bg-dark-800 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>+ Log Service Request</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif text-base font-bold text-dark-900">
                        Room {req.roomNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          req.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : req.status === 'IN_PROGRESS'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : req.status === 'ACCEPTED'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="font-semibold text-dark-900 text-sm mb-1">{req.serviceType}</div>
                    <p className="text-xs text-gray-500 mb-3 font-light leading-relaxed">
                      {req.details || 'Standard luxury service provision'}
                    </p>

                    <div className="text-[10px] text-gray-400 space-y-0.5">
                      <div>Assigned: {req.assignedTo || 'Unassigned (Pending)'}</div>
                      <div>Department: {req.department || 'Front Desk / Concierge'}</div>
                      {req.chargeAmount > 0 && <div className="text-gold-600 font-mono font-bold">Charge: ${req.chargeAmount.toFixed(2)}</div>}
                    </div>
                  </div>

                  <div className="pt-3 mt-4 border-t border-gray-100 flex gap-2">
                    {req.status === 'REQUESTED' && (
                      <button
                        onClick={() => {
                          updateServiceRequestStatus(req.id, 'ACCEPTED', 'Julian Vance');
                          showToast(`Request #${req.id} ACCEPTED.`);
                        }}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium cursor-pointer"
                      >
                        Accept Request
                      </button>
                    )}
                    {req.status === 'ACCEPTED' && (
                      <button
                        onClick={() => {
                          updateServiceRequestStatus(req.id, 'IN_PROGRESS');
                          showToast(`Request #${req.id} IN PROGRESS.`);
                        }}
                        className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium cursor-pointer"
                      >
                        Start Service
                      </button>
                    )}
                    {req.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => {
                          updateServiceRequestStatus(req.id, 'COMPLETED');
                          showToast(`Request #${req.id} COMPLETED.`);
                        }}
                        className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-medium cursor-pointer"
                      >
                        Complete Request
                      </button>
                    )}
                    {req.status === 'COMPLETED' && (
                      <div className="w-full text-center text-xs text-emerald-700 font-medium py-1 flex items-center justify-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>Service Fulfilled</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: GUEST INVOICES */}
        {activeTab === 'Guest Invoices' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                Official Hotel Tax Invoices & Folio Archive
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                Generate and print authenticated hospitality tax folios with full itemization.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-[#fbfbfb] border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Invoice / Confirmation</th>
                      <th className="py-3 px-4">Guest</th>
                      <th className="py-3 px-4">Room</th>
                      <th className="py-3 px-4">Accommodation</th>
                      <th className="py-3 px-4">Food & Dining</th>
                      <th className="py-3 px-4">Grand Total</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((b) => {
                      const folio = getGuestFolio(b.roomNumber);
                      return (
                        <tr key={b.id} className="hover:bg-amber-50/20 transition-colors">
                          <td className="py-3 px-4 font-mono font-semibold text-dark-900">
                            INV-{b.id}-2026
                          </td>
                          <td className="py-3 px-4 font-semibold text-dark-900">{b.guestName}</td>
                          <td className="py-3 px-4 font-light">Room {b.roomNumber}</td>
                          <td className="py-3 px-4 font-mono">${folio.roomTotal.toFixed(2)}</td>
                          <td className="py-3 px-4 font-mono text-gold-600">${folio.foodTotal.toFixed(2)}</td>
                          <td className="py-3 px-4 font-mono font-bold text-dark-900">
                            ${folio.grandTotal.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedFolioForInvoice(folio)}
                              className="px-3 py-1 bg-gold-500 hover:bg-gold-600 text-white rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <Printer size={13} />
                              <span>Print Folio</span>
                            </button>
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

      {/* CHECKOUT CONFIRMATION MODAL WITH PAYMENT SELECTOR & HOUSEKEEPING HANDOFF */}
      {checkoutConfirmFolio && (
        <div
          className="fixed inset-0 z-[135] bg-dark-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={handleCancelCheckoutModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 text-dark-900 relative overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-amber-500" />
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gold-50 text-gold-700 border border-gold-200 flex items-center justify-center font-bold">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-dark-900">
                    Finalize Guest Checkout & Settle
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                    Room {checkoutConfirmFolio.roomNumber} ({checkoutConfirmFolio.roomType})
                  </span>
                </div>
              </div>
              <button
                onClick={handleCancelCheckoutModal}
                className="text-gray-400 hover:text-dark-900 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-4 font-light">
              Review final aggregated charges for <strong className="text-dark-900">{checkoutConfirmFolio.guestName}</strong> before settlement.
            </p>

            {/* Folio itemization */}
            <div className="p-4 bg-[#fafafa] rounded-xl border border-gray-100 space-y-2 text-xs mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Accommodation ({checkoutConfirmFolio.nights} Night(s) @ ${checkoutConfirmFolio.roomRate}/nt):</span>
                <span className="font-mono font-medium">${checkoutConfirmFolio.roomTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>In-Room Dining Delivered Orders ({checkoutConfirmFolio.foodOrders?.length || 0}):</span>
                <span className="font-mono font-medium text-gold-600">+${checkoutConfirmFolio.foodTotal.toFixed(2)}</span>
              </div>
              {checkoutConfirmFolio.serviceTotal > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Concierge & Guest Services:</span>
                  <span className="font-mono font-medium text-blue-600">+${checkoutConfirmFolio.serviceTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500 text-[11px]">
                <span>State Tax & Luxury Surcharge (12%):</span>
                <span className="font-mono">${checkoutConfirmFolio.taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-bold text-dark-900">
                <span>Grand Total Folio Balance:</span>
                <span className="font-mono text-base text-gold-700">${checkoutConfirmFolio.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment method selector & status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <select
                  value={checkoutPaymentMethod}
                  onChange={(e) => setCheckoutPaymentMethod(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500"
                >
                  <option value="Visa Signature •••• 4092">Visa Signature •••• 4092</option>
                  <option value="Amex Centurion •••• 8820">Amex Centurion •••• 8820</option>
                  <option value="Mastercard World Elite •••• 1104">Mastercard World Elite •••• 1104</option>
                  <option value="Corporate Direct Folio Billing">Corporate Direct Folio Billing</option>
                  <option value="Cash Settlement Paid at Desk">Cash Settlement Paid at Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Payment Status
                </label>
                <select
                  value={checkoutPaymentStatus}
                  onChange={(e) => setCheckoutPaymentStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 focus:outline-none focus:border-gold-500 font-semibold text-emerald-700"
                >
                  <option value="PAID">PAID (Settled in Full)</option>
                  <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>
            </div>

            {/* Automatic Housekeeping Transition Notification */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800 mb-5 flex items-start gap-2">
              <Sparkles size={15} className="shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>Automatic Operational Handoff:</strong> Confirming checkout will immediately transition <strong>Room {checkoutConfirmFolio.roomNumber}</strong> occupancy to <strong>VACANT</strong> and housekeeping to <strong>DIRTY</strong>, automatically inserting a turnover task into the Housekeeping queue.
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCancelCheckoutModal}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-light transition-colors cursor-pointer"
              >
                Cancel Check-Out
              </button>
              <button
                type="button"
                onClick={() => handleExecuteCheckout(checkoutConfirmFolio.roomNumber, checkoutPaymentMethod)}
                className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 size={15} />
                <span>Confirm Payment & Checkout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WALK-IN MODAL (Direct button in header) */}
      {isWalkInModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-dark-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsWalkInModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-amber-500" />
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 pt-1">
              <h3 className="font-serif font-bold text-lg text-dark-900">
                Create Walk-In Reservation
              </h3>
              <button
                onClick={() => setIsWalkInModalOpen(false)}
                className="text-gray-400 hover:text-dark-900 p-1 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Guest Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lord Alexander Wright"
                  value={walkInData.name}
                  onChange={(e) => setWalkInData({ ...walkInData, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Room Assignment *
                  </label>
                  <select
                    value={walkInData.roomNumber}
                    onChange={(e) => setWalkInData({ ...walkInData, roomNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 bg-white"
                  >
                    {rooms.map((r) => {
                      const occ = (r.occupancyStatus || r.occupancy?.toUpperCase() || 'VACANT');
                      const hk = (r.housekeepingStatus || r.cleanliness?.toUpperCase() || 'CLEAN');
                      const maint = (r.maintenanceStatus || 'AVAILABLE').toUpperCase();
                      const isReady = occ === 'VACANT' && hk === 'CLEAN' && maint === 'AVAILABLE';

                      return (
                        <option key={r.roomNumber} value={r.roomNumber}>
                          Room {r.roomNumber} ({r.type}) {isReady ? '✓ Ready' : `[${hk}]`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Nights of Stay
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={walkInData.nights}
                    onChange={(e) => setWalkInData({ ...walkInData, nights: parseInt(e.target.value) || 1 })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="px-4 py-2 text-xs font-light text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-gold-500 hover:bg-gold-600 rounded-lg cursor-pointer shadow-xs transition-colors"
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
