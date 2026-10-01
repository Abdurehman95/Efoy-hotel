import React, { useState } from 'react';
import {
  Users,
  Wine,
  Maximize2,
  ArrowRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';

const RoomsSection = () => {
  const { rooms: dbRooms, roomCategories, createGuestOnlineBooking } = useHotel();
  const [activeFilter, setActiveFilter] = useState('All Suites');

  // Booking Modal States
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingFormData, setBookingFormData] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    notes: 'High floor preferred • Non-smoking',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Luxury visual assets for real hotel rooms
  const SUITE_METADATA = {
    '101': { image: '/images/room1.jpg', badge: 'MOST REQUESTED', size: '54 m² / 581 sq ft', name: 'Deluxe King Sanctuary' },
    '102': { image: '/images/room5.jpg', badge: 'SUNSET VIEW', size: '75 m² / 807 sq ft', name: 'Golden Hour Skyline Loft' },
    '201': { image: '/images/room2.jpg', badge: 'RESORT EXCLUSIVE', size: '120 m² / 1,290 sq ft', name: 'Resort Oceanfront Pool Villa' },
    '202': { image: '/images/room6.jpg', badge: 'DOUBLE DELUXE', size: '70 m² / 753 sq ft', name: 'Deluxe Garden Suite' },
    '301': { image: '/images/room3.jpg', badge: 'ARCHITECTURAL ICON', size: '92 m² / 990 sq ft', name: 'Horizon Glasshouse Suite' },
    '302': { image: '/images/room6.jpg', badge: 'EXECUTIVE PRIVILEGES', size: '68 m² / 732 sq ft', name: 'Executive Metropolitan Suite' },
    '401': { image: '/images/room7.jpg', badge: 'PURE CALM', size: '50 m² / 538 sq ft', name: 'Minimalist Zen King Sanctuary' },
    '402': { image: '/images/room8.jpg', badge: 'PRIVATE GARDEN', size: '95 m² / 1,022 sq ft', name: 'Tropical Garden Pavilion Suite' },
    '501': { image: '/images/room4.jpg', badge: 'SIGNATURE SUITE', size: '160 m² / 1,720 sq ft', name: 'Presidential Royal Penthouse' },
    '502': { image: '/images/room4.jpg', badge: 'PRESIDENTIAL', size: '180 m² / 1,937 sq ft', name: 'Presidential Panorama Penthouse' },
  };
  

  // Map live PostgreSQL database rooms
  const rooms = (dbRooms && dbRooms.length > 0)
    ? dbRooms.map((r, idx) => {
        const meta = SUITE_METADATA[r.roomNumber] || {};
        const cat = roomCategories?.find((c) => c.name?.toLowerCase() === r.type?.toLowerCase());
        const isOutOfService = r.maintenanceStatus === 'OUT_OF_SERVICE';
        const isOccupied = (r.occupancyStatus || r.occupancy) === 'OCCUPIED' || r.occupancy === 'Occupied';
        const isClean = (r.housekeepingStatus || r.cleanliness) === 'CLEAN' || r.cleanliness === 'Clean';

        let badge = meta.badge || 'LUXURY SUITE';
        if (isOutOfService) badge = 'MAINTENANCE';
        else if (isOccupied) badge = 'IN-HOUSE GUEST';
        else if (isClean) badge = 'CLEAN & READY';

        return {
          id: r.roomNumber || idx + 1,
          roomNumber: r.roomNumber,
          name: meta.name || `${r.type} Suite #${r.roomNumber}`,
          category: r.type || 'Deluxe Suite',
          size: meta.size || '65 m² / 700 sq ft',
          description: r.features
            ? `${r.features}. Forbes five-star certified luxury suite with 24/7 dedicated concierge assistance.`
            : (cat?.description || 'Forbes 5-star certified luxury suite with panoramic terrace.'),
          guests: r.capacity?.includes('4') ? 4 : r.capacity?.includes('3') ? 3 : r.capacity?.includes('1') ? 1 : 2,
          price: Number(r.rate) || 200,
          image: meta.image || cat?.imageUrl || `/images/room${(idx % 8) + 1}.jpg`,
          badge,
          occupancyStatus: r.occupancyStatus || (isOccupied ? 'OCCUPIED' : 'VACANT'),
          housekeepingStatus: r.housekeepingStatus || (isClean ? 'CLEAN' : 'DIRTY'),
          maintenanceStatus: r.maintenanceStatus || 'AVAILABLE',
          isOutOfService,
          isOccupied,
        };
      })
    : [];

  const categories = ['All Suites', ...new Set(rooms.map((r) => r.category).filter(Boolean))];
  const filteredRooms =
    activeFilter === 'All Suites'
      ? rooms
      : rooms.filter((r) => r.category === activeFilter);

  // Compute nights and pricing
  const checkInDate = new Date(bookingFormData.checkIn);
  const checkOutDate = new Date(bookingFormData.checkOut);
  const computedNights = Math.max(
    1,
    Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) || 1
  );
  const baseRate = selectedRoom ? selectedRoom.price : 200;
  const subtotal = baseRate * computedNights;
  const taxes = Number((subtotal * 0.12).toFixed(2));
  const grandTotal = Number((subtotal + taxes).toFixed(2));

  const handleOpenReserve = (room) => {
    setSelectedRoom(room);
    setBookingError('');
    setConfirmedBooking(null);
    try {
      const savedAuth = localStorage.getItem('efoy_hotel_auth');
      if (savedAuth) {
        const u = JSON.parse(savedAuth);
        if (u && (u.name || u.email)) {
          setBookingFormData((prev) => ({
            ...prev,
            name: prev.name || u.name || '',
            email: prev.email || u.email || '',
            phone: prev.phone || u.phone || '',
          }));
        }
      }
    } catch {
      // ignore
    }
  };

  const handleCloseModal = () => {
    setSelectedRoom(null);
    setConfirmedBooking(null);
    setBookingError('');
  };

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingLoading(true);

    if (!bookingFormData.name || !bookingFormData.email || !bookingFormData.phone) {
      setBookingError('Please provide your name, email, and phone number.');
      setBookingLoading(false);
      return;
    }

    try {
      const result = await createGuestOnlineBooking({
        guestName: bookingFormData.name.trim(),
        email: bookingFormData.email.trim(),
        phone: bookingFormData.phone.trim(),
        roomNumber: selectedRoom.roomNumber,
        checkIn: bookingFormData.checkIn,
        checkOut: bookingFormData.checkOut,
        nights: computedNights,
        notes: bookingFormData.notes,
      });

      if (result.success) {
        setConfirmedBooking(result);
      } else {
        setBookingError(result.message || 'Failed to complete reservation. Please try again.');
      }
    } catch (err) {
      setBookingError(err.message || 'Network error while booking suite.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <section id="rooms" className="py-20 sm:py-28 md:py-32 bg-[#fafafa] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20">
          <span className="text-xs uppercase tracking-[0.3em] text-gold-600 font-semibold block mb-3">
            Accommodations
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-dark-900 mb-4 sm:mb-6 font-normal tracking-tight">
            Curated Sanctuaries & Suites
          </h2>
          <div className="w-16 h-px bg-gold-400 mx-auto mb-6"></div>
          <p className="text-gray-600 font-light text-sm sm:text-base leading-relaxed">
            Every suite is tailored with bespoke furnishings, acoustic insulation, customized ambient lighting, and panoramic vistas of the waterfront or downtown skyline.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-8 sm:mt-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 sm:px-5 py-2 text-xs uppercase tracking-wider transition-all duration-300 rounded-xs cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-dark-900 text-white font-medium shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80 font-light'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 flex flex-col group border border-gray-100"
            >
              {/* Room Image Container */}
              <div className="relative aspect-16/10 overflow-hidden bg-gray-100">
                <img
                  src={room.image}
                  alt={room.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-4 left-4 bg-dark-900/85 backdrop-blur-md text-white text-[10px] uppercase tracking-widest px-3 py-1 font-medium rounded-xs">
                  {room.badge}
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-dark-900 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Maximize2 size={16} />
                </div>
              </div>

              {/* Room Content */}
              <div className="p-5 sm:p-7 md:p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-2 text-[11px] sm:text-xs tracking-wider text-gray-400 uppercase font-medium">
                  <span>Suite #{room.roomNumber} • {room.category}</span>
                  <span>{room.size.split('/')[1] || room.size}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-serif text-dark-900 mb-2.5 sm:mb-3 group-hover:text-gold-600 transition-colors">
                  {room.name}
                </h3>

                <p className="text-gray-600 font-light text-xs sm:text-sm mb-5 sm:mb-6 flex-grow leading-relaxed">
                  {room.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 sm:mb-7 text-xs text-gray-500 border-t border-gray-100 pt-4">
                  <span className="flex items-center gap-1.5 font-medium text-gray-700">
                    <Users size={15} className="text-gold-500" /> {room.guests} Guests
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-gray-700">
                    <Wine size={15} className="text-gold-500" /> Welcome Bar & Sommelier
                  </span>
                </div>

                {/* Pricing & CTA */}
                <div className="flex flex-wrap sm:flex-nowrap justify-between items-end gap-3 pt-4 border-t border-gray-100 mt-auto">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5 font-medium">
                      Direct Guarantee
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-serif text-dark-900">
                        ${room.price}
                      </span>
                      <span className="text-xs text-gray-500">/ night</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleOpenReserve(room)}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-dark-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Reserve Suite</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info notice */}
        <div className="mt-12 sm:mt-16 text-center bg-white p-5 sm:p-6 border border-gray-100 rounded-xl shadow-xs max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
            All rooms and suites include complimentary high-speed fiber Wi-Fi, daily hydrotherapy access, airport arrival transfers, and 24/7 dedicated concierge assistance.
          </p>
        </div>
      </div>

      {/* LUXURY RESERVATION MODAL */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-amber-500/30">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles size={18} className="text-amber-400" />
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold">
                    Reserve {selectedRoom.name}
                  </h3>
                  <p className="text-[10px] text-amber-300/90 font-mono tracking-wider">
                    SUITE #{selectedRoom.roomNumber} • ${selectedRoom.price}/NIGHT
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6">
              {confirmedBooking ? (
                /* Success View */
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Confirmed & Guaranteed
                    </span>
                    <h4 className="font-serif text-2xl font-bold text-slate-900 mt-2">
                      Sanctuary Awaits You
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                      Thank you, {bookingFormData.name}. Your luxury stay has been recorded in the hotel PMS ledger.
                    </p>
                  </div>

                  {/* Booking Certificate Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">Confirmation Code:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {confirmedBooking.booking?.id || 'BK-CONFIRMED'}
                      </span>
                    </div>
                    {confirmedBooking.folioId && (
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="text-slate-500 font-medium">Financial Folio ID:</span>
                        <span className="font-mono font-semibold text-amber-800">
                          {confirmedBooking.folioId}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">Assigned Suite:</span>
                      <span className="font-semibold text-slate-900">
                        Room {selectedRoom.roomNumber} ({selectedRoom.name})
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">Stay Dates:</span>
                      <span className="font-semibold text-slate-900">
                        {bookingFormData.checkIn} → {bookingFormData.checkOut} ({computedNights} nights)
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 font-bold">
                      <span className="text-slate-800">Total Charged to Folio:</span>
                      <span className="font-serif text-sm text-slate-900">
                        ${grandTotal.toFixed(2)} (incl. 12% tax)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      onClick={() => {
                        handleCloseModal();
                        window.location.hash = 'guest';
                      }}
                      className="flex-1 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer text-center"
                    >
                      View in Guest Dashboard →
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Reservation Form */
                <form onSubmit={handleSubmitReservation} className="space-y-4">
                  {bookingError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingFormData.checkIn}
                        onChange={(e) =>
                          setBookingFormData({ ...bookingFormData, checkIn: e.target.value })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingFormData.checkOut}
                        onChange={(e) =>
                          setBookingFormData({ ...bookingFormData, checkOut: e.target.value })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Guest Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lord Alexander Wright"
                      value={bookingFormData.name}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, name: e.target.value })
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="guest@luxury.com"
                        value={bookingFormData.email}
                        onChange={(e) =>
                          setBookingFormData({ ...bookingFormData, email: e.target.value })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-1122"
                        value={bookingFormData.phone}
                        onChange={(e) =>
                          setBookingFormData({ ...bookingFormData, phone: e.target.value })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Special In-Room Requests
                    </label>
                    <textarea
                      rows={2}
                      value={bookingFormData.notes}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, notes: e.target.value })
                      }
                      placeholder="e.g. Champagne on ice upon arrival, quiet room, late check-in"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  {/* Stay Price Summary Card */}
                  <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Rate per Night:</span>
                      <span className="font-mono font-medium">${baseRate}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Nights Selected:</span>
                      <span className="font-mono font-medium">{computedNights} night(s)</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Luxury Tax & Service (12%):</span>
                      <span className="font-mono font-medium">${taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold border-t border-amber-200 pt-1.5 text-sm">
                      <span>Estimated Folio Total:</span>
                      <span className="font-serif">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-3 bg-slate-900 hover:bg-gold-600 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {bookingLoading ? (
                      <span>Verifying Availability & Booking...</span>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Confirm & Guarantee Reservation</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RoomsSection;
