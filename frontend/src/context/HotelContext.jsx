import React, { createContext, useContext, useState, useEffect } from 'react';

const HotelContext = createContext(null);

const INITIAL_ROOMS = [
  {
    roomNumber: '101',
    type: 'Single Classic',
    floor: 'Floor 1 (West Wing)',
    capacity: '1 Person',
    rate: 180,
    features: 'Single Bed • City View • Espresso Machine',
    cleanliness: 'Clean', // 'Clean' | 'Dirty' | 'Cleaning' | 'Inspected'
    occupancy: 'Occupied', // 'Available' | 'Occupied' | 'Reserved'
    guestId: 'BK-8901',
  },
  {
    roomNumber: '102',
    type: 'Single Deluxe',
    floor: 'Floor 1 (West Wing)',
    capacity: '1 Person',
    rate: 220,
    features: 'Queen Bed • Garden Courtyard • Rain Shower',
    cleanliness: 'Dirty',
    dirtyReason: 'Guest checked out 2 hours ago • Full linen turnover required',
    occupancy: 'Available',
    guestId: null,
  },
  {
    roomNumber: '201',
    type: 'Double Deluxe',
    floor: 'Floor 2 (East Wing)',
    capacity: '2 Adults',
    rate: 280,
    features: 'King Bed • Balcony • Marble Bath',
    cleanliness: 'Clean',
    occupancy: 'Available',
    guestId: null,
  },
  {
    roomNumber: '202',
    type: 'Double Deluxe',
    floor: 'Floor 2 (East Wing)',
    capacity: '2 Adults',
    rate: 290,
    features: 'Two Queen Beds • Bay View • Work Desk',
    cleanliness: 'Dirty',
    dirtyReason: 'Housekeeping requested • Deep dusting & bathroom replenishment',
    occupancy: 'Available',
    guestId: null,
  },
  {
    roomNumber: '301',
    type: 'Double Executive',
    floor: 'Floor 3 (East Wing)',
    capacity: '2 Adults, 1 Child',
    rate: 340,
    features: 'King Bed • Oceanfront • Lounge Area',
    cleanliness: 'Clean',
    occupancy: 'Occupied',
    guestId: 'BK-8902',
  },
  {
    roomNumber: '302',
    type: 'Double Executive',
    floor: 'Floor 3 (East Wing)',
    capacity: '2 Adults, 1 Child',
    rate: 350,
    features: 'King Bed • Skyline View • B&O Audio',
    cleanliness: 'Cleaning',
    occupancy: 'Available',
    guestId: null,
  },
  {
    roomNumber: '401',
    type: 'Luxury Suite',
    floor: 'Floor 4 (North Panorama)',
    capacity: '4 Persons',
    rate: 520,
    features: 'Master King + Twin • Fireplace • Private Butler',
    cleanliness: 'Clean',
    occupancy: 'Occupied',
    guestId: 'BK-8903',
  },
  {
    roomNumber: '402',
    type: 'Luxury Suite',
    floor: 'Floor 4 (North Panorama)',
    capacity: '4 Persons',
    rate: 560,
    features: '2 King Beds • Terrace & Jacuzzi • Wine Cellar',
    cleanliness: 'Dirty',
    dirtyReason: 'Checkout turnover in progress • Sanitize jacuzzi and replace linens',
    occupancy: 'Available',
    guestId: null,
  },
  {
    roomNumber: '501',
    type: 'Penthouse Panoramic',
    floor: 'Floor 5 (Penthouse Level)',
    capacity: '6 Persons',
    rate: 850,
    features: '3 En-Suite Bedrooms • 360° Terrace • Chef Kitchen',
    cleanliness: 'Clean',
    occupancy: 'Available',
    guestId: null,
  },
  {
    roomNumber: '502',
    type: 'Presidential Penthouse',
    floor: 'Floor 5 (Penthouse Level)',
    capacity: '6 Persons',
    rate: 1200,
    features: 'Full Floor Luxury • Helipad Access • Private Spa',
    cleanliness: 'Inspected',
    occupancy: 'Reserved',
    guestId: 'BK-8904',
  },
];

const INITIAL_BOOKINGS = [
  {
    id: 'BK-8901',
    guestName: 'Lord Alexander Wright',
    email: 'guest@efoyhotel.com',
    phone: '+1 (555) 234-5678',
    roomNumber: '101',
    roomType: 'Single Classic',
    checkIn: '2026-09-11',
    checkOut: '2026-09-14',
    nights: 3,
    roomRate: 180,
    status: 'In-House', // 'Arriving Today' | 'In-House' | 'Departing Today' | 'Checked Out'
    notes: 'Member VIP • Prefers feather pillows and early morning newspaper',
    paid: false,
    paymentMethod: null,
  },
  {
    id: 'BK-8902',
    guestName: 'Sophia Montgomery',
    email: 'sophia.m@luxurytravel.org',
    phone: '+1 (555) 987-6543',
    roomNumber: '301',
    roomType: 'Double Executive',
    checkIn: '2026-09-10',
    checkOut: '2026-09-12',
    nights: 2,
    roomRate: 340,
    status: 'Departing Today',
    notes: 'Forbes reviewer • Late check-out requested (1:00 PM)',
    paid: false,
    paymentMethod: null,
  },
  {
    id: 'BK-8903',
    guestName: 'Elena Rostova',
    email: 'elena.rostova@monaco.mc',
    phone: '+1 (555) 456-7890',
    roomNumber: '401',
    roomType: 'Luxury Suite',
    checkIn: '2026-09-09',
    checkOut: '2026-09-15',
    nights: 6,
    roomRate: 520,
    status: 'In-House',
    notes: 'Celebrity guest • Valet parked Bentley #442',
    paid: false,
    paymentMethod: null,
  },
  {
    id: 'BK-8904',
    guestName: 'Marcus Sterling',
    email: 'm.sterling@investcorp.com',
    phone: '+1 (555) 321-7654',
    roomNumber: '502',
    roomType: 'Presidential Penthouse',
    checkIn: '2026-09-12',
    checkOut: '2026-09-16',
    nights: 4,
    roomRate: 1200,
    status: 'Arriving Today',
    notes: 'Airport limousine pickup booked for 3:00 PM',
    paid: false,
    paymentMethod: null,
  },
];

const INITIAL_MENU = [
  {
    id: 1,
    name: 'Truffle Wagyu Burger',
    category: 'All-Day Dining',
    price: 36.0,
    prepTime: '20-25 mins',
    inStock: true,
    description: 'Brioche bun, caramelized onion, Gruyere, black truffle aioli, rosemary parmesan fries.',
    calories: '850 kcal',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
  },
  {
    id: 2,
    name: 'Belgian Waffle Stack',
    category: 'Breakfast',
    price: 24.0,
    prepTime: '15 mins',
    inStock: true,
    description: 'Organic berry compote, Madagascar vanilla bean cream, grade-A Canadian maple syrup.',
    calories: '620 kcal',
    image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&q=80',
  },
  {
    id: 3,
    name: 'Chilean Sea Bass',
    category: 'Chef Special',
    price: 48.0,
    prepTime: '25-30 mins',
    inStock: true,
    description: 'Pan-seared with saffron emulsion, baby fennel, and fingerling potato crisps.',
    calories: '540 kcal',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
  },
  {
    id: 4,
    name: 'Valrhona Molten Fondant',
    category: 'Desserts',
    price: 18.0,
    prepTime: '12 mins',
    inStock: true,
    description: 'Warm molten 70% chocolate center, hazelnut praline gelato, edible 24k gold leaf.',
    calories: '490 kcal',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
  },
  {
    id: 5,
    name: 'Smoked Salmon Bagel Royale',
    category: 'Breakfast',
    price: 26.0,
    prepTime: '12 mins',
    inStock: true,
    description: 'Norwegian cold-smoked salmon, dill cream cheese, caper berries, pickled red onion.',
    calories: '480 kcal',
    image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&q=80',
  },
  {
    id: 6,
    name: 'Prime Dry-Aged Ribeye 12oz',
    category: 'Chef Special',
    price: 64.0,
    prepTime: '30 mins',
    inStock: true,
    description: '45-day dry aged, garlic confit butter, grilled asparagus, marrow bordelaise sauce.',
    calories: '980 kcal',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
  },
  {
    id: 7,
    name: 'Artisanal Charcuterie & Fromage',
    category: 'All-Day Dining',
    price: 32.0,
    prepTime: '10 mins',
    inStock: true,
    description: 'Prosciutto di Parma, Comte 24-mo, honeycomb, Marcona almonds, house sourdough.',
    calories: '610 kcal',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&q=80',
  },
  {
    id: 8,
    name: 'Signature Horizon Espresso Martini',
    category: 'Beverages',
    price: 22.0,
    prepTime: '5 mins',
    inStock: true,
    description: 'Grey Goose vodka, freshly pulled single-origin espresso, Kahlúa, dark chocolate rim.',
    calories: '210 kcal',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80',
  },
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-501',
    roomNumber: '301',
    guestName: 'Sophia Montgomery',
    items: [
      { id: 1, name: 'Truffle Wagyu Burger', price: 36.0, qty: 1 },
      { id: 8, name: 'Signature Horizon Espresso Martini', price: 22.0, qty: 1 },
    ],
    total: 58.0,
    status: 'Cooking', // 'Pending' | 'Cooking' | 'Ready' | 'Delivered'
    createdAt: '10:30 AM',
    elapsedMinutes: 18,
    notes: 'Burger medium-rare, extra truffle aioli on side. Quick delivery appreciated.',
    server: 'Chef Marco Bellini',
  },
  {
    id: 'ORD-502',
    roomNumber: '401',
    guestName: 'Elena Rostova',
    items: [
      { id: 2, name: 'Belgian Waffle Stack', price: 24.0, qty: 2 },
      { id: 5, name: 'Smoked Salmon Bagel Royale', price: 26.0, qty: 1 },
    ],
    total: 74.0,
    status: 'Ready',
    createdAt: '10:42 AM',
    elapsedMinutes: 8,
    notes: 'Deliver to terrace table with heated dome covers.',
    server: 'Sous Chef David Chen',
  },
  {
    id: 'ORD-503',
    roomNumber: '101',
    guestName: 'Lord Alexander Wright',
    items: [
      { id: 3, name: 'Chilean Sea Bass', price: 48.0, qty: 1 },
      { id: 4, name: 'Valrhona Molten Fondant', price: 18.0, qty: 1 },
    ],
    total: 66.0,
    status: 'Pending',
    createdAt: '10:52 AM',
    elapsedMinutes: 2,
    notes: 'Gluten-sensitive preparation requested. Champagne glasses on tray.',
    server: 'Unassigned',
  },
];

const INITIAL_HOUSEKEEPING_HISTORY = [
  {
    id: 'HK-109',
    roomNumber: '201',
    type: 'Double Deluxe',
    cleanerName: 'Maria Santos',
    action: 'Full Turnover & Sanitization',
    completedAt: 'Today, 09:45 AM',
    duration: '28 mins',
    inspectedBy: 'Elena Vance (Lead HK)',
    status: 'Passed Inspection',
  },
  {
    id: 'HK-108',
    roomNumber: '301',
    type: 'Double Executive',
    cleanerName: 'Maria Santos',
    action: 'Daily Morning Refresh & Linens',
    completedAt: 'Today, 08:30 AM',
    duration: '18 mins',
    inspectedBy: 'Elena Vance (Lead HK)',
    status: 'Passed Inspection',
  },
  {
    id: 'HK-107',
    roomNumber: '501',
    type: 'Penthouse Panoramic',
    cleanerName: 'Carlos Morales',
    action: 'Deep Clean & Balcony Jet Wash',
    completedAt: 'Yesterday, 04:15 PM',
    duration: '45 mins',
    inspectedBy: 'Elena Vance (Lead HK)',
    status: 'Passed Inspection',
  },
  {
    id: 'HK-106',
    roomNumber: '101',
    type: 'Single Classic',
    cleanerName: 'Carlos Morales',
    action: 'Pre-Arrival VIP Preparation',
    completedAt: 'Yesterday, 02:00 PM',
    duration: '22 mins',
    inspectedBy: 'Elena Vance (Lead HK)',
    status: 'Passed Inspection',
  },
];

const INITIAL_STAFF = [
  {
    id: 1,
    name: 'Alexander Sterling',
    email: 'admin@efoyhotel.com',
    role: 'General Manager',
    department: 'Management',
    shift: 'Morning (07:00 - 16:00)',
    status: 'Active Duty',
    avatarBg: 'bg-amber-100 text-amber-800',
  },
  {
    id: 2,
    name: 'Julian Vance',
    email: 'reception@efoyhotel.com',
    role: 'Head Receptionist',
    department: 'Front Desk',
    shift: 'Morning (07:00 - 15:30)',
    status: 'Active Duty',
    avatarBg: 'bg-blue-100 text-blue-800',
  },
  {
    id: 3,
    name: 'Claire Beauchamp',
    email: 'claire.b@efoyhotel.com',
    role: 'Night Auditor / Receptionist',
    department: 'Front Desk',
    shift: 'Night (23:00 - 07:30)',
    status: 'Off Duty',
    avatarBg: 'bg-indigo-100 text-indigo-800',
  },
  {
    id: 4,
    name: 'Chef Marco Bellini',
    email: 'kitchen@efoyhotel.com',
    role: 'Executive Head Chef',
    department: 'Kitchen / F&B',
    shift: 'Day Shift (10:00 - 22:00)',
    status: 'Active Duty',
    avatarBg: 'bg-orange-100 text-orange-800',
  },
  {
    id: 5,
    name: 'David Chen',
    email: 'david.chen@efoyhotel.com',
    role: 'Sous Chef',
    department: 'Kitchen / F&B',
    shift: 'Evening (14:00 - 23:00)',
    status: 'Active Duty',
    avatarBg: 'bg-amber-100 text-amber-800',
  },
  {
    id: 6,
    name: 'Maria Santos',
    email: 'housekeeping@efoyhotel.com',
    role: 'Senior Housekeeping Attendant',
    department: 'Housekeeping',
    shift: 'Day Shift (08:00 - 16:30)',
    status: 'Active Duty',
    avatarBg: 'bg-emerald-100 text-emerald-800',
  },
  {
    id: 7,
    name: 'Carlos Morales',
    email: 'carlos.m@efoyhotel.com',
    role: 'Housekeeping & Linen Lead',
    department: 'Housekeeping',
    shift: 'Day Shift (08:00 - 16:30)',
    status: 'Active Duty',
    avatarBg: 'bg-teal-100 text-teal-800',
  },
];

const INITIAL_LOGS = [
  {
    id: 1,
    title: 'Room 201 Cleaned & Inspected',
    category: 'Housekeeping',
    description: 'Maria Santos marked Room 201 Clean; status updated on Receptionist dashboard.',
    time: '12 mins ago',
    tag: 'Housekeeping',
  },
  {
    id: 2,
    title: 'Room Service Order #ORD-501 in Preparation',
    category: 'Kitchen',
    description: 'Kitchen accepted order for Room 301 (Truffle Wagyu Burger + Martini). Charged $58 to folio.',
    time: '24 mins ago',
    tag: 'Kitchen KDS',
  },
  {
    id: 3,
    title: 'VIP Arrival: Sophia Montgomery in Room 301',
    category: 'Front Desk',
    description: 'Front desk processed check-in keycard #AURA-301-8. Direct billing profile verified.',
    time: '45 mins ago',
    tag: 'Front Desk',
  },
  {
    id: 4,
    title: 'Dirty Room Alert Prevented Assigned Check-in',
    category: 'Front Desk',
    description: 'System blocked assignment to Room 402 pending deep sanitization turnover.',
    time: '1 hour ago',
    tag: 'Smart Alert',
  },
];

export const HotelProvider = ({ children }) => {
  // Load or fallback to initial states
  const [rooms, setRooms] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_rooms');
      return saved ? JSON.parse(saved) : INITIAL_ROOMS;
    } catch {
      return INITIAL_ROOMS;
    }
  });

  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_bookings');
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [menuItems, setMenuItems] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_menu');
      return saved ? JSON.parse(saved) : INITIAL_MENU;
    } catch {
      return INITIAL_MENU;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [housekeepingHistory, setHousekeepingHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_hk_history');
      return saved ? JSON.parse(saved) : INITIAL_HOUSEKEEPING_HISTORY;
    } catch {
      return INITIAL_HOUSEKEEPING_HISTORY;
    }
  });

  const [staffList, setStaffList] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_staff');
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_logs');
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  // Sync states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('efoy_hotel_rooms', JSON.stringify(rooms));
      localStorage.setItem('efoy_hotel_bookings', JSON.stringify(bookings));
      localStorage.setItem('efoy_hotel_menu', JSON.stringify(menuItems));
      localStorage.setItem('efoy_hotel_orders', JSON.stringify(orders));
      localStorage.setItem('efoy_hotel_hk_history', JSON.stringify(housekeepingHistory));
      localStorage.setItem('efoy_hotel_staff', JSON.stringify(staffList));
      localStorage.setItem('efoy_hotel_logs', JSON.stringify(activityLogs));
    } catch (e) {
      console.error('Failed to sync hotel state to storage', e);
    }
  }, [rooms, bookings, menuItems, orders, housekeepingHistory, staffList, activityLogs]);

  // Activity logger helper
  const addLog = (title, category, description, tag = category) => {
    const newLog = {
      id: Date.now(),
      title,
      category,
      description,
      time: 'Just now',
      tag,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 40)]);
  };

  // 1. Housekeeping: One-click clean room
  const cleanRoom = (roomNumber, cleanerName = 'Maria Santos') => {
    setRooms((prevRooms) =>
      prevRooms.map((r) => {
        if (r.roomNumber === roomNumber) {
          return {
            ...r,
            cleanliness: 'Clean',
            dirtyReason: null,
          };
        }
        return r;
      })
    );

    // Add to housekeeping history
    const room = rooms.find((r) => r.roomNumber === roomNumber);
    const newEntry = {
      id: `HK-${Date.now().toString().slice(-4)}`,
      roomNumber,
      type: room?.type || 'Guest Suite',
      cleanerName,
      action: 'One-Click Room Cleaning & Inspection Complete',
      completedAt: 'Just now',
      duration: '15 mins',
      inspectedBy: 'Self-Certified (One-Click)',
      status: 'Passed Inspection',
    };
    setHousekeepingHistory((prev) => [newEntry, ...prev]);

    addLog(
      `Room ${roomNumber} Marked Clean`,
      'Housekeeping',
      `${cleanerName} completed cleaning for Room ${roomNumber}. Receptionist room status updated in real-time.`,
      'Housekeeping'
    );
  };

  // Mark room dirty (e.g. from receptionist or guest checkout)
  const markRoomDirty = (roomNumber, reason = 'Turnover & sanitization needed') => {
    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === roomNumber
          ? { ...r, cleanliness: 'Dirty', dirtyReason: reason }
          : r
      )
    );
    addLog(
      `Room ${roomNumber} Flagged Dirty`,
      'Housekeeping',
      `Room ${roomNumber} flagged as dirty: ${reason}`,
      'Housekeeping'
    );
  };

  // 2. Receptionist: Assign Room (with dirty check alert)
  const assignRoom = (bookingId, targetRoomNumber, forceOverride = false) => {
    const targetRoom = rooms.find((r) => r.roomNumber === targetRoomNumber);
    if (!targetRoom) return { success: false, message: 'Room not found' };

    if (targetRoom.cleanliness === 'Dirty' && !forceOverride) {
      return {
        success: false,
        isDirtyAlert: true,
        message: `Room ${targetRoomNumber} is marked DIRTY (${targetRoom.dirtyReason || 'Needs cleaning'}). Assigning an arriving guest to an uncleaned room violates 5-star protocol.`,
        room: targetRoom,
      };
    }

    // Assign room
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, roomNumber: targetRoomNumber, status: 'In-House' } : b))
    );

    setRooms((prev) =>
      prev.map((r) => {
        if (r.roomNumber === targetRoomNumber) {
          return { ...r, occupancy: 'Occupied', guestId: bookingId };
        }
        // If unassigning from previous room
        return r;
      })
    );

    addLog(
      `Guest Checked In to Room ${targetRoomNumber}`,
      'Front Desk',
      `Booking ${bookingId} assigned to Room ${targetRoomNumber} (${targetRoom.type}).`,
      'Front Desk'
    );

    return { success: true, message: `Guest successfully assigned to Room ${targetRoomNumber}` };
  };

  // 3. Receptionist: Walk-In Booking in 1 step
  const createWalkInBooking = (guestData) => {
    const newId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const nights = guestData.nights || 1;
    const selectedRoom = rooms.find((r) => r.roomNumber === guestData.roomNumber);
    const roomRate = selectedRoom ? selectedRoom.rate : 200;

    const newBooking = {
      id: newId,
      guestName: guestData.name,
      email: guestData.email || `${guestData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: guestData.phone || '+1 (555) 000-1122',
      roomNumber: guestData.roomNumber,
      roomType: selectedRoom?.type || 'Deluxe Room',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + nights * 86400000).toISOString().split('T')[0],
      nights,
      roomRate,
      status: 'In-House',
      notes: guestData.notes || 'Walk-In Guest • Immediate Check-In',
      paid: false,
      paymentMethod: guestData.paymentMethod || 'Credit Card On File',
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Mark room as occupied
    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === guestData.roomNumber
          ? { ...r, occupancy: 'Occupied', guestId: newId }
          : r
      )
    );

    addLog(
      `Walk-In Reservation Created (#${newId})`,
      'Front Desk',
      `${guestData.name} checked in to Room ${guestData.roomNumber} (${nights} nights, $${roomRate}/nt).`,
      'Walk-In'
    );

    return newBooking;
  };

  // 4. Kitchen & Billing: Calculate Live Guest Bill (Room + Food Orders)
  const getGuestFolio = (roomNumber) => {
    const booking = bookings.find((b) => b.roomNumber === roomNumber && b.status !== 'Checked Out');
    const roomFoodOrders = orders.filter((o) => o.roomNumber === roomNumber);

    const roomTotal = booking ? booking.roomRate * booking.nights : 0;
    const foodTotal = roomFoodOrders.reduce((acc, curr) => acc + curr.total, 0);
    const taxes = (roomTotal + foodTotal) * 0.12; // 12% luxury tax & service charge
    const grandTotal = roomTotal + foodTotal + taxes;

    return {
      booking,
      roomNumber,
      guestName: booking?.guestName || 'Valued Guest',
      roomType: booking?.roomType || 'Deluxe Suite',
      nights: booking?.nights || 1,
      roomRate: booking?.roomRate || 0,
      roomTotal,
      foodOrders: roomFoodOrders,
      foodTotal,
      taxes,
      grandTotal,
      isPaid: booking?.paid || false,
    };
  };

  // 5. Receptionist: Settle Bill & Check Out
  const checkoutGuest = (roomNumber, paymentMethod = 'Amex Centurion •••• 8820') => {
    const folio = getGuestFolio(roomNumber);
    if (!folio.booking) return { success: false, message: 'No active booking found for this room' };

    // Update booking status
    setBookings((prev) =>
      prev.map((b) =>
        b.id === folio.booking.id
          ? { ...b, status: 'Checked Out', paid: true, paymentMethod }
          : b
      )
    );

    // Mark room as Dirty and Available
    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === roomNumber
          ? {
              ...r,
              occupancy: 'Available',
              cleanliness: 'Dirty',
              dirtyReason: `Checked out today (${folio.booking.guestName}) • Full turnover required`,
              guestId: null,
            }
          : r
      )
    );

    addLog(
      `Guest Checked Out (Room ${roomNumber})`,
      'Front Desk',
      `${folio.guestName} settled folio of $${folio.grandTotal.toFixed(2)} via ${paymentMethod}. Room flagged DIRTY for Housekeeping.`,
      'Checkout'
    );

    return { success: true, folio };
  };

  // Cancel / Revert Checkout (reopen stay)
  const undoCheckout = (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: 'In-House', paid: false } : b
      )
    );

    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === booking.roomNumber
          ? {
              ...r,
              occupancy: 'Occupied',
              cleanliness: 'Clean',
              dirtyReason: null,
              guestId: bookingId,
            }
          : r
      )
    );

    addLog(
      `Checkout Cancelled & Reopened for ${booking.guestName}`,
      'Front Desk',
      `Stay in Room ${booking.roomNumber} restored to In-House status.`,
      'Front Desk'
    );

    return { success: true, message: `Stay for Room ${booking.roomNumber} reopened and restored to In-House!` };
  };

  // 6. Kitchen & Guest: Order food (automatically connects to room and bill)
  const placeFoodOrder = ({ roomNumber, guestName, items, notes = '' }) => {
    const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const orderId = `ORD-${Math.floor(500 + Math.random() * 499)}`;

    const newOrder = {
      id: orderId,
      roomNumber,
      guestName: guestName || `Guest in Room ${roomNumber}`,
      items,
      total,
      status: 'Pending', // Pending -> Cooking -> Ready -> Delivered
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elapsedMinutes: 0,
      notes: notes || 'Standard luxury room service delivery',
      server: 'Kitchen Brigade',
    };

    setOrders((prev) => [newOrder, ...prev]);

    addLog(
      `Room Service Order Placed (${orderId})`,
      'Kitchen',
      `Room ${roomNumber} ordered ${items.length} dish(es) totaling $${total.toFixed(2)}. Added to guest folio automatically.`,
      'Kitchen KDS'
    );

    return newOrder;
  };

  // 7. Kitchen: Update Order Status (Pending -> Cooking -> Ready -> Delivered)
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    const targetOrder = orders.find((o) => o.id === orderId);

    addLog(
      `Order ${orderId} Status: ${newStatus}`,
      'Kitchen',
      `Order for Room ${targetOrder?.roomNumber || 'Unknown'} is now ${newStatus.toUpperCase()}.`,
      'Kitchen KDS'
    );
  };

  // 8. Kitchen / Admin: Dish Stock Toggle
  const toggleDishStock = (dishId) => {
    setMenuItems((prev) =>
      prev.map((d) => (d.id === dishId ? { ...d, inStock: !d.inStock } : d))
    );
  };

  // 9. Admin: Manage Menu
  const addMenuItem = (item) => {
    const newItem = { ...item, id: Date.now(), inStock: true };
    setMenuItems((prev) => [...prev, newItem]);
    addLog(`Menu Item Added: ${item.name}`, 'Menu', `Added new dish priced at $${item.price}.`, 'Admin');
  };

  const editMenuItem = (item) => {
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? item : m)));
    addLog(`Menu Item Updated: ${item.name}`, 'Menu', `Updated pricing and recipe details.`, 'Admin');
  };

  const deleteMenuItem = (id) => {
    const item = menuItems.find((m) => m.id === id);
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
    addLog(`Menu Item Removed: ${item?.name || id}`, 'Menu', `Removed from in-room dining catalog.`, 'Admin');
  };

  // 10. Admin: Manage Staff (Add, Edit, Delete)
  const addStaff = (staff) => {
    const newStaff = {
      ...staff,
      id: Date.now(),
      status: staff.status || 'Active Duty',
      avatarBg: 'bg-amber-100 text-amber-800',
    };
    setStaffList((prev) => [...prev, newStaff]);
    addLog(`Staff Member Added: ${staff.name}`, 'Staff', `Assigned as ${staff.role} in ${staff.department}.`, 'Admin');
  };

  const editStaff = (staff) => {
    setStaffList((prev) => prev.map((s) => (s.id === staff.id ? staff : s)));
    addLog(`Staff Updated: ${staff.name}`, 'Staff', `Role and shift schedules updated.`, 'Admin');
  };

  const deleteStaff = (id) => {
    const staff = staffList.find((s) => s.id === id);
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    addLog(`Staff Removed: ${staff?.name || id}`, 'Staff', `Removed from hotel system directory.`, 'Admin');
  };

  // 11. Admin: Manage Rooms (Pricing, Capacity, Type)
  const updateRoom = (updatedRoom) => {
    setRooms((prev) => prev.map((r) => (r.roomNumber === updatedRoom.roomNumber ? updatedRoom : r)));
    addLog(`Room ${updatedRoom.roomNumber} Modified`, 'Rooms', `Rate updated to $${updatedRoom.rate}/nt, capacity: ${updatedRoom.capacity}.`, 'Admin');
  };

  const addRoom = (newRoom) => {
    setRooms((prev) => [...prev, { ...newRoom, cleanliness: 'Clean', occupancy: 'Available', guestId: null }]);
    addLog(`New Room Added: ${newRoom.roomNumber}`, 'Rooms', `Added ${newRoom.type} with capacity ${newRoom.capacity}.`, 'Admin');
  };

  const deleteRoom = (roomNumber) => {
    setRooms((prev) => prev.filter((r) => r.roomNumber !== roomNumber));
    addLog(`Room ${roomNumber} Deleted`, 'Rooms', `Removed from property inventory.`, 'Admin');
  };

  // 12. Guest: Online Room Booking
  const createGuestOnlineBooking = ({ guestName, email, phone, roomNumber, checkIn, checkOut, nights, notes }) => {
    const selectedRoom = rooms.find((r) => r.roomNumber === roomNumber);
    const roomRate = selectedRoom ? selectedRoom.rate : 220;
    const newId = `BK-${Math.floor(2000 + Math.random() * 8000)}`;

    const newBooking = {
      id: newId,
      guestName,
      email,
      phone,
      roomNumber,
      roomType: selectedRoom?.type || 'Deluxe Suite',
      checkIn,
      checkOut,
      nights,
      roomRate,
      status: 'In-House', // Instant digital check-in
      notes: notes || 'Online booking via Guest Portal',
      paid: false,
      paymentMethod: 'Credit Card (Online Pre-Authorized)',
    };

    setBookings((prev) => [newBooking, ...prev]);

    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === roomNumber
          ? { ...r, occupancy: 'Occupied', guestId: newId }
          : r
      )
    );

    addLog(
      `Online Booking Confirmed (#${newId})`,
      'Guest Portal',
      `${guestName} booked Room ${roomNumber} (${nights} nights). Check-in completed online.`,
      'Online Booking'
    );

    return newBooking;
  };

  // Reset to initial demo data
  const resetDemoData = () => {
    setRooms(INITIAL_ROOMS);
    setBookings(INITIAL_BOOKINGS);
    setMenuItems(INITIAL_MENU);
    setOrders(INITIAL_ORDERS);
    setHousekeepingHistory(INITIAL_HOUSEKEEPING_HISTORY);
    setStaffList(INITIAL_STAFF);
    setActivityLogs(INITIAL_LOGS);
    localStorage.removeItem('efoy_hotel_rooms');
    localStorage.removeItem('efoy_hotel_bookings');
    localStorage.removeItem('efoy_hotel_menu');
    localStorage.removeItem('efoy_hotel_orders');
    localStorage.removeItem('efoy_hotel_hk_history');
    localStorage.removeItem('efoy_hotel_staff');
    localStorage.removeItem('efoy_hotel_logs');
  };

  const value = {
    rooms,
    bookings,
    menuItems,
    orders,
    housekeepingHistory,
    staffList,
    activityLogs,
    // Operations
    cleanRoom,
    markRoomDirty,
    assignRoom,
    createWalkInBooking,
    getGuestFolio,
    checkoutGuest,
    undoCheckout,
    placeFoodOrder,
    updateOrderStatus,
    toggleDishStock,
    addMenuItem,
    editMenuItem,
    deleteMenuItem,
    addStaff,
    editStaff,
    deleteStaff,
    updateRoom,
    addRoom,
    deleteRoom,
    createGuestOnlineBooking,
    resetDemoData,
  };

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
