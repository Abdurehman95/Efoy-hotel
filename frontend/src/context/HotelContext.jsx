import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  roomsApi,
  bookingsApi,
  menuApi,
  ordersApi,
  staffApi,
  hkApi,
  servicesApi,
  maintenanceApi,
  inventoryApi,
  logsApi,
  settingsApi,
  usersApi,
} from '../api/client';

const HotelContext = createContext(null);

const INITIAL_ROOM_CATEGORIES = [
  {
    id: 1,
    name: 'Single Classic',
    baseRate: 1500,
    capacity: '1 Person',
    description: 'Elegantly appointed urban haven featuring bespoke Italian millwork and city skyline vistas.',
    features: 'Single Bed • City View • Espresso Machine',
    imageUrl: '/images/room1.jpg',
  },
  {
    id: 2,
    name: 'Single Deluxe',
    baseRate: 2200,
    capacity: '1 Person',
    description: 'Private retreat overlooking quiet interior botanical courtyard with marble shower.',
    features: 'Queen Bed • Garden Courtyard • Rain Shower',
    imageUrl: '/images/room2.jpg',
  },
  {
    id: 3,
    name: 'Double Deluxe',
    baseRate: 3500,
    capacity: '2 Adults',
    description: 'Expansive suite featuring dual vanities, soaking tub and private promenade balcony.',
    features: 'King Bed • Balcony • Marble Bath',
    imageUrl: '/images/room3.jpg',
  },
  {
    id: 4,
    name: 'Double Executive',
    baseRate: 4800,
    capacity: '2 Adults, 1 Child',
    description: 'Executive-level luxury with dedicated workstation, lounge alcove, and high-fidelity acoustics.',
    features: 'King Bed • Oceanfront • Lounge Area • B&O Audio',
    imageUrl: '/images/room4.jpg',
  },
  {
    id: 5,
    name: 'Luxury Suite',
    baseRate: 6800,
    capacity: '4 Persons',
    description: 'Two-bedroom architectural triumph featuring limestone fireplace and dedicated 24h butler service.',
    features: 'Master King + Twin • Fireplace • Private Butler',
    imageUrl: '/images/room5.jpg',
  },
  {
    id: 6,
    name: 'Penthouse Panoramic',
    baseRate: 8500,
    capacity: '6 Persons',
    description: 'Top-floor expansive luxury boasting 360-degree waterfront wrap terrace and chef kitchen.',
    features: '3 En-Suite Bedrooms • 360° Terrace • Chef Kitchen',
    imageUrl: '/images/room6.jpg',
  },
  {
    id: 7,
    name: 'Presidential Penthouse',
    baseRate: 10000,
    capacity: '6 Persons',
    description: 'The pinnacle of private luxury: full private floor, direct helipad access, and cedar spa.',
    features: 'Full Floor Luxury • Helipad Access • Private Spa',
    imageUrl: '/images/room7.jpg',
  },
];

const INITIAL_ROOMS = [
  {
    roomNumber: '101',
    type: 'Single Classic',
    floor: 'Floor 1 (West Wing)',
    capacity: '1 Person',
    rate: 1500,
    features: 'Single Bed • City View • Espresso Machine',
    // 3 Explicit Separated Statuses
    occupancyStatus: 'OCCUPIED', // 'VACANT' | 'OCCUPIED'
    housekeepingStatus: 'CLEAN', // 'CLEAN' | 'DIRTY' | 'CLEANING' | 'INSPECTION'
    maintenanceStatus: 'AVAILABLE', // 'AVAILABLE' | 'MAINTENANCE' | 'OUT_OF_SERVICE'
    cleanliness: 'Clean',
    occupancy: 'Occupied',
    dirtyReason: null,
    guestId: 'BK-8901',
  },
  {
    roomNumber: '102',
    type: 'Single Deluxe',
    floor: 'Floor 1 (West Wing)',
    capacity: '1 Person',
    rate: 2200,
    features: 'Queen Bed • Garden Courtyard • Rain Shower',
    occupancyStatus: 'VACANT',
    housekeepingStatus: 'DIRTY',
    maintenanceStatus: 'AVAILABLE',
    cleanliness: 'Dirty',
    occupancy: 'Available',
    dirtyReason: 'Guest checked out • Full linen turnover required',
    guestId: null,
  },
  {
    roomNumber: '201',
    type: 'Double Deluxe',
    floor: 'Floor 2 (East Wing)',
    capacity: '2 Adults',
    rate: 3500,
    features: 'King Bed • Balcony • Marble Bath',
    occupancyStatus: 'VACANT',
    housekeepingStatus: 'CLEAN',
    maintenanceStatus: 'AVAILABLE',
    cleanliness: 'Clean',
    occupancy: 'Available',
    dirtyReason: null,
    guestId: null,
  },
  {
    roomNumber: '202',
    type: 'Double Deluxe',
    floor: 'Floor 2 (East Wing)',
    capacity: '2 Adults',
    rate: 3600,
    features: 'Two Queen Beds • Bay View • Work Desk',
    occupancyStatus: 'VACANT',
    housekeepingStatus: 'DIRTY',
    maintenanceStatus: 'AVAILABLE',
    cleanliness: 'Dirty',
    occupancy: 'Available',
    dirtyReason: 'Housekeeping requested • Deep dusting & bathroom replenishment',
    guestId: null,
  },
  {
    roomNumber: '301',
    type: 'Double Executive',
    floor: 'Floor 3 (East Wing)',
    capacity: '2 Adults, 1 Child',
    rate: 4800,
    features: 'King Bed • Oceanfront • Lounge Area',
    occupancyStatus: 'OCCUPIED',
    housekeepingStatus: 'CLEAN',
    maintenanceStatus: 'AVAILABLE',
    cleanliness: 'Clean',
    occupancy: 'Occupied',
    dirtyReason: null,
    guestId: 'BK-8902',
  },
  {
    roomNumber: '302',
    type: 'Double Executive',
    floor: 'Floor 3 (East Wing)',
    capacity: '2 Adults, 1 Child',
    rate: 5000,
    features: 'King Bed • Skyline View • B&O Audio',
    occupancyStatus: 'VACANT',
    housekeepingStatus: 'CLEANING',
    maintenanceStatus: 'AVAILABLE',
    cleanliness: 'Cleaning',
    occupancy: 'Available',
    dirtyReason: null,
    guestId: null,
  },
  {
    roomNumber: '401',
    type: 'Luxury Suite',
    floor: 'Floor 4 (North Panorama)',
    capacity: '4 Persons',
    rate: 6800,
    features: 'Master King + Twin • Fireplace • Private Butler',
    occupancyStatus: 'OCCUPIED',
    housekeepingStatus: 'CLEAN',
    maintenanceStatus: 'AVAILABLE',
    cleanliness: 'Clean',
    occupancy: 'Occupied',
    dirtyReason: null,
    guestId: 'BK-8903',
  },
  {
    roomNumber: '402',
    type: 'Luxury Suite',
    floor: 'Floor 4 (North Panorama)',
    capacity: '4 Persons',
    rate: 7200,
    features: '2 King Beds • Terrace & Jacuzzi • Wine Cellar',
    occupancyStatus: 'VACANT',
    housekeepingStatus: 'DIRTY',
    maintenanceStatus: 'MAINTENANCE',
    cleanliness: 'Dirty',
    occupancy: 'Available',
    dirtyReason: 'Jacuzzi filter pump service in progress',
    guestId: null,
  },
  {
    roomNumber: '501',
    type: 'Penthouse Panoramic',
    floor: 'Floor 5 (Penthouse Level)',
    capacity: '6 Persons',
    rate: 8500,
    features: '3 En-Suite Bedrooms • 360° Terrace • Chef Kitchen',
    occupancyStatus: 'VACANT',
    housekeepingStatus: 'CLEAN',
    maintenanceStatus: 'AVAILABLE',
    cleanliness: 'Clean',
    occupancy: 'Available',
    dirtyReason: null,
    guestId: null,
  },
  {
    roomNumber: '502',
    type: 'Presidential Penthouse',
    floor: 'Floor 5 (Penthouse Level)',
    capacity: '6 Persons',
    rate: 10000,
    features: 'Full Floor Luxury • Helipad Access • Private Spa',
    occupancyStatus: 'VACANT',
    housekeepingStatus: 'INSPECTION',
    maintenanceStatus: 'AVAILABLE',
    cleanliness: 'Inspected',
    occupancy: 'Reserved',
    dirtyReason: null,
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
    checkIn: '2026-09-28',
    checkOut: '2026-10-03',
    nights: 5,
    roomRate: 1500,
    status: 'CHECKED_IN', // 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW'
    notes: 'Member VIP • Prefers feather pillows and early morning newspaper',
    paid: false,
    paymentMethod: null,
    stayId: 'STAY-BK-8901',
    digitalKeyCode: 'AURA-101-924',
  },
  {
    id: 'BK-8902',
    guestName: 'Sophia Montgomery',
    email: 'sophia.m@luxurytravel.org',
    phone: '+1 (555) 987-6543',
    roomNumber: '301',
    roomType: 'Double Executive',
    checkIn: '2026-09-29',
    checkOut: '2026-10-01',
    nights: 2,
    roomRate: 4800,
    status: 'CHECKED_IN',
    notes: 'Forbes reviewer • Late check-out requested (1:00 PM)',
    paid: false,
    paymentMethod: null,
    stayId: 'STAY-BK-8902',
    digitalKeyCode: 'AURA-301-381',
  },
  {
    id: 'BK-8903',
    guestName: 'Elena Rostova',
    email: 'elena.rostova@monaco.mc',
    phone: '+1 (555) 456-7890',
    roomNumber: '401',
    roomType: 'Luxury Suite',
    checkIn: '2026-09-27',
    checkOut: '2026-10-04',
    nights: 7,
    roomRate: 6800,
    status: 'CHECKED_IN',
    notes: 'Celebrity guest • Valet parked Bentley #442',
    paid: false,
    paymentMethod: null,
    stayId: 'STAY-BK-8903',
    digitalKeyCode: 'AURA-401-772',
  },
  {
    id: 'BK-8904',
    guestName: 'Marcus Sterling',
    email: 'm.sterling@investcorp.com',
    phone: '+1 (555) 321-7654',
    roomNumber: '502',
    roomType: 'Presidential Penthouse',
    checkIn: '2026-09-30',
    checkOut: '2026-10-05',
    nights: 5,
    roomRate: 10000,
    status: 'CONFIRMED',
    notes: 'Airport limousine pickup booked for 3:00 PM',
    paid: false,
    paymentMethod: null,
  },
  {
    id: 'BK-8905',
    guestName: 'Dr. Alistair Thorne',
    email: 'thorne@oxford.edu',
    phone: '+44 20 7946 0912',
    roomNumber: '201',
    roomType: 'Double Deluxe',
    checkIn: '2026-10-01',
    checkOut: '2026-10-04',
    nights: 3,
    roomRate: 3500,
    status: 'PENDING',
    notes: 'Arriving late evening • High-speed WiFi credentials needed for keynote prep',
    paid: false,
    paymentMethod: null,
  },
];

const INITIAL_MENU = [
  {
    id: 1,
    name: 'Truffle Wagyu Burger',
    category: 'All-Day Dining',
    price: 1200.0,
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
    price: 550.0,
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
    price: 2800.0,
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
    price: 480.0,
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
    price: 750.0,
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
    price: 3600.0,
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
    price: 1800.0,
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
    price: 450.0,
    prepTime: '5 mins',
    inStock: true,
    description: 'Grey Goose vodka, freshly pulled single-origin espresso, Kahlúa, dark chocolate rim.',
    calories: '210 kcal',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80',
  },
  {
    id: 9,
    name: 'Ethiopian Single-Origin Yirgacheffe Roast',
    category: 'Beverages',
    price: 180.0,
    prepTime: '5 mins',
    inStock: true,
    description: 'Handcrafted pour-over with jasmine floral notes, bergamot, and sweet peach undertones.',
    calories: '5 kcal',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
  },
  {
    id: 10,
    name: 'Imperial Grand Seafood Platter & Tasting',
    category: 'Chef Special',
    price: 4500.0,
    prepTime: '35 mins',
    inStock: true,
    description: 'Whole rock lobster, king crab legs, oysters, tiger prawns, and sea urchin with champagne pairings.',
    calories: '1150 kcal',
    image: 'https://images.unsplash.com/photo-1559737558-2453e9a56cb6?w=600&q=80',
  },
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-501',
    roomNumber: '301',
    guestName: 'Sophia Montgomery',
    items: [
      { id: 1, name: 'Truffle Wagyu Burger', price: 1200.0, qty: 1 },
      { id: 8, name: 'Signature Horizon Espresso Martini', price: 450.0, qty: 1 },
    ],
    total: 1650.0,
    status: 'Cooking', // 'Pending' | 'Cooking' | 'Ready' | 'Delivered'
    createdAt: '10:30 AM',
    elapsedMinutes: 18,
    notes: 'Burger medium-rare, extra truffle aioli on side.',
    server: 'Chef Marco Bellini',
  },
  {
    id: 'ORD-502',
    roomNumber: '401',
    guestName: 'Elena Rostova',
    items: [
      { id: 2, name: 'Belgian Waffle Stack', price: 550.0, qty: 2 },
      { id: 5, name: 'Smoked Salmon Bagel Royale', price: 750.0, qty: 1 },
    ],
    total: 1850.0,
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
      { id: 3, name: 'Chilean Sea Bass', price: 2800.0, qty: 1 },
      { id: 4, name: 'Valrhona Molten Fondant', price: 480.0, qty: 1 },
    ],
    total: 3280.0,
    status: 'Pending',
    createdAt: '10:52 AM',
    elapsedMinutes: 2,
    notes: 'Gluten-sensitive preparation requested.',
    server: 'Unassigned',
  },
];

const INITIAL_HOUSEKEEPING_TASKS = [
  {
    id: 'HKT-101',
    roomNumber: '102',
    priority: 'CHECKOUT',
    assignedTo: 'Maria Santos',
    status: 'DIRTY', // 'DIRTY' | 'CLEANING' | 'INSPECTION' | 'CLEAN'
    startTime: null,
    completionTime: null,
    notes: 'Turnover requested upon guest checkout. Replace linens and restock amenities.',
    createdAt: 'Today, 08:30 AM',
  },
  {
    id: 'HKT-102',
    roomNumber: '202',
    priority: 'NORMAL',
    assignedTo: 'Carlos Morales',
    status: 'DIRTY',
    startTime: null,
    completionTime: null,
    notes: 'Deep dusting & replenishment required.',
    createdAt: 'Today, 09:10 AM',
  },
  {
    id: 'HKT-103',
    roomNumber: '302',
    priority: 'HIGH',
    assignedTo: 'Maria Santos',
    status: 'CLEANING',
    startTime: 'Today, 09:40 AM',
    completionTime: null,
    notes: 'Expedited refresh for early VIP arrival.',
    createdAt: 'Today, 09:35 AM',
  },
  {
    id: 'HKT-104',
    roomNumber: '502',
    priority: 'VIP',
    assignedTo: 'Elena Vance (Lead HK)',
    status: 'INSPECTION',
    startTime: 'Today, 08:00 AM',
    completionTime: null,
    notes: 'Presidential Penthouse pre-arrival inspection.',
    createdAt: 'Today, 07:45 AM',
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
];

const INITIAL_SERVICE_REQUESTS = [
  {
    id: 'REQ-101',
    roomNumber: '101',
    guestName: 'Lord Alexander Wright',
    serviceType: 'Extra Egyptian Linens & Pillows',
    details: '2 extra hypoallergenic feather pillows and extra plush bathrobe',
    priority: 'HIGH',
    status: 'IN_PROGRESS', // 'REQUESTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    department: 'Housekeeping',
    assignedTo: 'Maria Santos',
    chargeAmount: 0,
    createdAt: 'Today, 09:15 AM',
  },
  {
    id: 'REQ-102',
    roomNumber: '301',
    guestName: 'Sophia Montgomery',
    serviceType: 'Valet Car Retrieval',
    details: 'Bring Porsche Taycan (Tag #SF-884) to portico at 11:30 AM',
    priority: 'NORMAL',
    status: 'ACCEPTED',
    department: 'Front Desk',
    assignedTo: 'Julian Vance',
    chargeAmount: 0,
    createdAt: 'Today, 10:05 AM',
  },
  {
    id: 'REQ-103',
    roomNumber: '401',
    guestName: 'Elena Rostova',
    serviceType: 'Airport Limousine Transfer',
    details: 'Mercedes Maybach transfer to SFO International Terminal G',
    priority: 'HIGH',
    status: 'REQUESTED',
    department: 'Concierge',
    assignedTo: null,
    chargeAmount: 180.0,
    createdAt: 'Today, 10:30 AM',
  },
];

const INITIAL_MAINTENANCE_TICKETS = [
  {
    id: 'MNT-401',
    roomNumber: '402',
    severity: 'MEDIUM',
    status: 'IN_PROGRESS', // 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED'
    inventoryImpact: 'MAINTENANCE',
    issueDescription: 'Jacuzzi filter pump pressure low and heating sensor calibration needed.',
    resolutionNotes: 'Replacement heating coil installed; final water heat test running.',
    reportedBy: 'Carlos Morales (Housekeeping)',
    assignedTo: 'Engineering - Dave',
    startDate: '2026-09-29',
    estimatedCost: 150,
  },
];

const INITIAL_INVENTORY = [
  { id: 1, name: 'A5 Miyazaki Wagyu Beef', category: 'Butchery', quantity: 18, unit: 'kg', minStock: 5, costPerUnit: 85, status: 'IN_STOCK', linkedMenuItemId: 1, linkedMenuItemName: 'Truffle Wagyu Burger' },
  { id: 2, name: 'French Artisanal Brioche Buns', category: 'Bakery', quantity: 35, unit: 'pcs', minStock: 10, costPerUnit: 2.5, status: 'IN_STOCK', linkedMenuItemId: 1, linkedMenuItemName: 'Truffle Wagyu Burger' },
  { id: 3, name: 'Winter Black Truffle Aioli', category: 'Pantry', quantity: 2, unit: 'jars', minStock: 3, costPerUnit: 14, status: 'LOW_STOCK', linkedMenuItemId: 1, linkedMenuItemName: 'Truffle Wagyu Burger' },
  { id: 4, name: 'Belgian Artisan Waffle Batter', category: 'Bakery', quantity: 18, unit: 'kg', minStock: 5, costPerUnit: 8, status: 'IN_STOCK', linkedMenuItemId: 2, linkedMenuItemName: 'Belgian Waffle Stack' },
  { id: 5, name: 'Patagonian Toothfish (Sea Bass)', category: 'Seafood', quantity: 0, unit: 'kg', minStock: 4, costPerUnit: 42, status: 'OUT_OF_STOCK', linkedMenuItemId: 3, linkedMenuItemName: 'Chilean Sea Bass' },
  { id: 6, name: 'Valrhona Guanaja 70% Chocolate', category: 'Pastry', quantity: 14, unit: 'kg', minStock: 4, costPerUnit: 28, status: 'IN_STOCK', linkedMenuItemId: 4, linkedMenuItemName: 'Valrhona Molten Fondant' },
  { id: 7, name: 'Norwegian Cold-Smoked Salmon', category: 'Seafood', quantity: 12, unit: 'kg', minStock: 4, costPerUnit: 34, status: 'IN_STOCK', linkedMenuItemId: 5, linkedMenuItemName: 'Smoked Salmon Bagel Royale' },
  { id: 8, name: 'USDA Prime 45-Day Ribeye', category: 'Butchery', quantity: 8, unit: 'portions', minStock: 3, costPerUnit: 38, status: 'IN_STOCK', linkedMenuItemId: 6, linkedMenuItemName: 'Prime Dry-Aged Ribeye 12oz' },
  { id: 9, name: 'Single-Origin Espresso Beans', category: 'Beverages', quantity: 15, unit: 'kg', minStock: 5, costPerUnit: 18, status: 'IN_STOCK', linkedMenuItemId: 8, linkedMenuItemName: 'Signature Horizon Espresso Martini' },
];

const INITIAL_STAFF = [
  { id: 1, name: 'Alexander Sterling', email: 'admin@efoyhotel.com', role: 'General Manager', department: 'Management', shift: 'Morning (07:00 - 16:00)', status: 'Active Duty', avatarBg: 'bg-amber-100 text-amber-800' },
  { id: 2, name: 'Julian Vance', email: 'reception@efoyhotel.com', role: 'Head Receptionist', department: 'Front Desk', shift: 'Morning (07:00 - 15:30)', status: 'Active Duty', avatarBg: 'bg-blue-100 text-blue-800' },
  { id: 3, name: 'Claire Beauchamp', email: 'claire.b@efoyhotel.com', role: 'Night Auditor / Receptionist', department: 'Front Desk', shift: 'Night (23:00 - 07:30)', status: 'Off Duty', avatarBg: 'bg-indigo-100 text-indigo-800' },
  { id: 4, name: 'Chef Marco Bellini', email: 'kitchen@efoyhotel.com', role: 'Executive Head Chef', department: 'Kitchen / F&B', shift: 'Day Shift (10:00 - 22:00)', status: 'Active Duty', avatarBg: 'bg-orange-100 text-orange-800' },
  { id: 5, name: 'David Chen', email: 'david.chen@efoyhotel.com', role: 'Sous Chef', department: 'Kitchen / F&B', shift: 'Evening (14:00 - 23:00)', status: 'Active Duty', avatarBg: 'bg-amber-100 text-amber-800' },
  { id: 6, name: 'Maria Santos', email: 'housekeeping@efoyhotel.com', role: 'Senior Housekeeping Attendant', department: 'Housekeeping', shift: 'Day Shift (08:00 - 16:30)', status: 'Active Duty', avatarBg: 'bg-emerald-100 text-emerald-800' },
  { id: 7, name: 'Carlos Morales', email: 'carlos.m@efoyhotel.com', role: 'Housekeeping & Linen Lead', department: 'Housekeeping', shift: 'Day Shift (08:00 - 16:30)', status: 'Active Duty', avatarBg: 'bg-teal-100 text-teal-800' },
];

const INITIAL_LOGS = [
  { id: 1, title: 'Room 201 Cleaned & Inspected', category: 'Housekeeping', description: 'Maria Santos marked Room 201 Clean; status updated on Receptionist dashboard.', time: '12 mins ago', tag: 'Housekeeping' },
  { id: 2, title: 'Room Service Order #ORD-501 in Preparation', category: 'Kitchen', description: 'Kitchen accepted order for Room 301. Stage: Cooking.', time: '24 mins ago', tag: 'Kitchen KDS' },
  { id: 3, title: 'Check-In Confirmed: Room 101', category: 'Front Desk', description: 'Lord Alexander Wright checked in. NFC Digital Keycard issued.', time: '45 mins ago', tag: 'Front Desk' },
  { id: 4, title: 'Housekeeping Queue Task Generated', category: 'Housekeeping', description: 'Automated turnover task created for Room 102 following guest checkout.', time: '1 hour ago', tag: 'Turnover' },
];

const INITIAL_USERS = [
  { id: 1, name: 'Alexander Sterling', email: 'admin@efoyhotel.com', role: 'admin', phone: '+1 (555) 100-0001', createdAt: '2026-09-12T22:24:05.956Z' },
  { id: 2, name: 'Julian Vance', email: 'reception@efoyhotel.com', role: 'receptionist', phone: '+1 (555) 100-0002', createdAt: '2026-09-12T22:24:05.956Z' },
  { id: 3, name: 'Chef Marco Bellini', email: 'kitchen@efoyhotel.com', role: 'kitchen', phone: '+1 (555) 100-0003', createdAt: '2026-09-12T22:24:05.956Z' },
  { id: 4, name: 'Maria Santos', email: 'housekeeping@efoyhotel.com', role: 'housekeeping', phone: '+1 (555) 100-0004', createdAt: '2026-09-12T22:24:05.956Z' },
  { id: 5, name: 'Lord Alexander Wright', email: 'guest@efoyhotel.com', role: 'guest', phone: '+1 (555) 234-5678', createdAt: '2026-09-12T22:24:05.956Z' },
];

export const HotelProvider = ({ children }) => {
  const [rooms, setRooms] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_rooms');
      return saved ? JSON.parse(saved) : INITIAL_ROOMS;
    } catch {
      return INITIAL_ROOMS;
    }
  });

  const [roomCategories, setRoomCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_room_categories');
      return saved ? JSON.parse(saved) : INITIAL_ROOM_CATEGORIES;
    } catch {
      return INITIAL_ROOM_CATEGORIES;
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

  const [housekeepingTasks, setHousekeepingTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_hk_tasks');
      return saved ? JSON.parse(saved) : INITIAL_HOUSEKEEPING_TASKS;
    } catch {
      return INITIAL_HOUSEKEEPING_TASKS;
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

  const [serviceRequests, setServiceRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_service_requests');
      return saved ? JSON.parse(saved) : INITIAL_SERVICE_REQUESTS;
    } catch {
      return INITIAL_SERVICE_REQUESTS;
    }
  });

  const [maintenanceTickets, setMaintenanceTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_maintenance_tickets');
      return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_TICKETS;
    } catch {
      return INITIAL_MAINTENANCE_TICKETS;
    }
  });

  const [inventoryItems, setInventoryItems] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_inventory');
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
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

  const [usersList, setUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('efoy_hotel_rooms', JSON.stringify(rooms));
      localStorage.setItem('efoy_hotel_room_categories', JSON.stringify(roomCategories));
      localStorage.setItem('efoy_hotel_bookings', JSON.stringify(bookings));
      localStorage.setItem('efoy_hotel_menu', JSON.stringify(menuItems));
      localStorage.setItem('efoy_hotel_orders', JSON.stringify(orders));
      localStorage.setItem('efoy_hotel_hk_tasks', JSON.stringify(housekeepingTasks));
      localStorage.setItem('efoy_hotel_hk_history', JSON.stringify(housekeepingHistory));
      localStorage.setItem('efoy_hotel_service_requests', JSON.stringify(serviceRequests));
      localStorage.setItem('efoy_hotel_maintenance_tickets', JSON.stringify(maintenanceTickets));
      localStorage.setItem('efoy_hotel_inventory', JSON.stringify(inventoryItems));
      localStorage.setItem('efoy_hotel_staff', JSON.stringify(staffList));
      localStorage.setItem('efoy_hotel_logs', JSON.stringify(activityLogs));
      localStorage.setItem('efoy_hotel_users', JSON.stringify(usersList));
    } catch (e) {
      console.error('Failed to sync hotel state to storage', e);
    }
  }, [
    rooms,
    roomCategories,
    bookings,
    menuItems,
    orders,
    housekeepingTasks,
    housekeepingHistory,
    serviceRequests,
    maintenanceTickets,
    inventoryItems,
    staffList,
    activityLogs,
    usersList,
  ]);

  // Fetch live PostgreSQL backend data on mount
  useEffect(() => {
    let isMounted = true;
    const fetchBackendData = async () => {
      try {
        const [
          roomsRes,
          catsRes,
          bookingsRes,
          menuRes,
          ordersRes,
          hkTasksRes,
          hkHistRes,
          servicesRes,
          maintRes,
          invRes,
          staffRes,
          logsRes,
          usersRes,
        ] = await Promise.allSettled([
          roomsApi.getAll(),
          roomsApi.getCategories(),
          bookingsApi.getAll(),
          menuApi.getAll(),
          ordersApi.getAll(),
          hkApi.getTasks(),
          hkApi.getHistory(),
          servicesApi.getAll(),
          maintenanceApi.getAll(),
          inventoryApi.getAll(),
          staffApi.getAll(),
          logsApi.getAll(),
          usersApi.getAll(),
        ]);

        if (isMounted) {
          if (roomsRes.status === 'fulfilled' && roomsRes.value?.rooms?.length) {
            setRooms(roomsRes.value.rooms);
          }
          if (catsRes.status === 'fulfilled' && catsRes.value?.categories?.length) {
            setRoomCategories(catsRes.value.categories);
          }
          if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.bookings?.length) {
            setBookings(bookingsRes.value.bookings);
          }
          if (menuRes.status === 'fulfilled' && menuRes.value?.menu?.length) {
            setMenuItems(menuRes.value.menu);
          }
          if (ordersRes.status === 'fulfilled' && ordersRes.value?.orders?.length) {
            setOrders(ordersRes.value.orders);
          }
          if (hkTasksRes.status === 'fulfilled' && hkTasksRes.value?.tasks?.length) {
            setHousekeepingTasks(hkTasksRes.value.tasks);
          }
          if (hkHistRes.status === 'fulfilled' && hkHistRes.value?.history?.length) {
            setHousekeepingHistory(hkHistRes.value.history);
          }
          if (servicesRes.status === 'fulfilled' && servicesRes.value?.requests?.length) {
            setServiceRequests(servicesRes.value.requests);
          }
          if (maintRes.status === 'fulfilled' && maintRes.value?.tickets?.length) {
            setMaintenanceTickets(maintRes.value.tickets);
          }
          if (invRes.status === 'fulfilled' && invRes.value?.items?.length) {
            setInventoryItems(invRes.value.items);
          }
          if (staffRes.status === 'fulfilled' && staffRes.value?.staff?.length) {
            setStaffList(staffRes.value.staff);
          }
          if (logsRes.status === 'fulfilled' && logsRes.value?.logs?.length) {
            setActivityLogs(logsRes.value.logs);
          }
          if (usersRes.status === 'fulfilled' && usersRes.value?.users?.length) {
            setUsersList(usersRes.value.users);
          }
        }
      } catch (err) {
        console.warn('Backend sync error:', err.message);
      }
    };

    fetchBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-Time PMS Synchronization Gateway via Socket.io
  useEffect(() => {
    const socketUrl =
      window.location.port === '5173' || window.location.port === '3000'
        ? window.location.origin
        : 'http://localhost:5000';

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[PMS Real-Time] Connected to WebSocket Hub, ID:', socket.id);
    });

    // 1. Room Cleanliness Updated
    socket.on('PMS_ROOM_CLEANLINESS_UPDATED', (updatedRoom) => {
      if (!updatedRoom?.roomNumber) return;
      setRooms((prev) =>
        prev.map((r) =>
          r.roomNumber === updatedRoom.roomNumber
            ? {
                ...r,
                ...updatedRoom,
                cleanliness: updatedRoom.cleanliness || updatedRoom.housekeepingStatus,
                housekeepingStatus: updatedRoom.housekeepingStatus || (updatedRoom.cleanliness === 'Dirty' ? 'DIRTY' : 'CLEAN'),
                dirtyReason: updatedRoom.dirtyReason !== undefined ? updatedRoom.dirtyReason : r.dirtyReason,
              }
            : r
        )
      );
    });

    // 2. Room Status (Occupancy, Maintenance) Updated
    socket.on('PMS_ROOM_STATUS_UPDATED', (updatedRoom) => {
      if (!updatedRoom?.roomNumber) return;
      setRooms((prev) =>
        prev.map((r) => (r.roomNumber === updatedRoom.roomNumber ? { ...r, ...updatedRoom } : r))
      );
    });

    // 3. New Booking Created
    socket.on('PMS_BOOKING_CREATED', (newBooking) => {
      if (!newBooking?.id) return;
      setBookings((prev) => {
        if (prev.some((b) => b.id === newBooking.id)) {
          return prev.map((b) => (b.id === newBooking.id ? { ...b, ...newBooking } : b));
        }
        return [newBooking, ...prev];
      });

      if (newBooking.roomNumber) {
        setRooms((prev) =>
          prev.map((r) =>
            r.roomNumber === newBooking.roomNumber
              ? {
                  ...r,
                  occupancy: newBooking.status === 'CHECKED_IN' || newBooking.status === 'In-House' ? 'Occupied' : 'Reserved',
                  occupancyStatus: newBooking.status === 'CHECKED_IN' || newBooking.status === 'In-House' ? 'OCCUPIED' : 'VACANT',
                  guestId: newBooking.id,
                }
              : r
          )
        );
      }
    });

    // 4. Booking Updated
    socket.on('PMS_BOOKING_UPDATED', (updatedBooking) => {
      if (!updatedBooking?.id) return;
      setBookings((prev) =>
        prev.map((b) => (b.id === updatedBooking.id ? { ...b, ...updatedBooking } : b))
      );
    });

    // 5. Room Assigned
    socket.on('PMS_ROOM_ASSIGNED', ({ booking, roomNumber }) => {
      if (!roomNumber) return;
      if (booking?.id) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === booking.id
              ? { ...b, ...booking, roomNumber, status: booking.status || 'CHECKED_IN' }
              : b
          )
        );
      }
      setRooms((prev) =>
        prev.map((r) =>
          r.roomNumber === roomNumber
            ? { ...r, occupancy: 'Occupied', occupancyStatus: 'OCCUPIED', guestId: booking?.id || r.guestId }
            : r
        )
      );
    });

    // 6. Guest Checked In
    socket.on('PMS_GUEST_CHECKED_IN', ({ booking, roomNumber }) => {
      if (booking?.id) {
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, ...booking, status: 'CHECKED_IN' } : b))
        );
      }
      if (roomNumber) {
        setRooms((prev) =>
          prev.map((r) =>
            r.roomNumber === roomNumber
              ? { ...r, occupancy: 'Occupied', occupancyStatus: 'OCCUPIED', guestId: booking?.id || r.guestId }
              : r
          )
        );
      }
    });

    // 7. Guest Checked Out
    socket.on('PMS_GUEST_CHECKED_OUT', ({ roomNumber, booking, housekeepingTask }) => {
      if (booking?.id) {
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, ...booking, status: 'CHECKED_OUT', paid: true } : b))
        );
      }
      if (roomNumber) {
        setRooms((prev) =>
          prev.map((r) =>
            r.roomNumber === roomNumber
              ? {
                  ...r,
                  occupancy: 'Available',
                  occupancyStatus: 'VACANT',
                  cleanliness: 'Dirty',
                  housekeepingStatus: 'DIRTY',
                  dirtyReason: `Checked out today (${booking?.guestName || 'Guest'}) • Turnover required`,
                  guestId: null,
                }
              : r
          )
        );
      }
      if (housekeepingTask) {
        setHousekeepingTasks((prev) => [housekeepingTask, ...prev]);
      }
    });

    // 8. Kitchen Food Order Created
    socket.on('PMS_NEW_ORDER', (newOrder) => {
      if (!newOrder?.id) return;
      setOrders((prev) => {
        if (prev.some((o) => o.id === newOrder.id)) {
          return prev.map((o) => (o.id === newOrder.id ? newOrder : o));
        }
        return [newOrder, ...prev];
      });
    });

    // 9. Order Status Changed (Cooking -> Ready -> Delivered)
    socket.on('PMS_ORDER_STATUS_CHANGED', (updatedOrder) => {
      if (!updatedOrder?.id) return;
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
      );
    });

    // 10. Menu Stock Toggled (86 System)
    socket.on('PMS_MENU_STOCK_CHANGED', (updatedDish) => {
      if (!updatedDish?.id) return;
      setMenuItems((prev) =>
        prev.map((d) => (d.id === updatedDish.id ? { ...d, inStock: updatedDish.inStock } : d))
      );
    });

    // 11. Housekeeping Task Created / Updated
    socket.on('PMS_HK_TASK_CREATED', (task) => {
      if (!task?.id) return;
      setHousekeepingTasks((prev) => [task, ...prev]);
    });

    socket.on('PMS_HK_TASK_UPDATED', (task) => {
      if (!task?.id) return;
      setHousekeepingTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...task } : t)));
    });

    // 12. Service Request Created / Updated
    socket.on('PMS_SERVICE_REQUEST_CREATED', (req) => {
      if (!req?.id) return;
      setServiceRequests((prev) => [req, ...prev]);
    });

    socket.on('PMS_SERVICE_REQUEST_UPDATED', (req) => {
      if (!req?.id) return;
      setServiceRequests((prev) => prev.map((s) => (s.id === req.id ? { ...s, ...req } : s)));
    });

    // 13. Maintenance Created / Updated
    socket.on('PMS_MAINTENANCE_CREATED', (ticket) => {
      if (!ticket?.id) return;
      setMaintenanceTickets((prev) => [ticket, ...prev]);
    });

    socket.on('PMS_MAINTENANCE_UPDATED', (ticket) => {
      if (!ticket?.id) return;
      setMaintenanceTickets((prev) => prev.map((m) => (m.id === ticket.id ? { ...m, ...ticket } : m)));
    });

    // 14. Inventory Updated
    socket.on('PMS_INVENTORY_UPDATED', (item) => {
      if (!item?.id) return;
      setInventoryItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, ...item } : i)));
    });

    socket.on('disconnect', () => {
      console.log('[PMS Real-Time] Disconnected from WebSocket Hub');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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

  // 1. Housekeeping: Certify clean room (One-click or inspection completion)
  const cleanRoom = (roomNumber, cleanerName = 'Maria Santos') => {
    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === roomNumber
          ? {
              ...r,
              housekeepingStatus: 'CLEAN',
              cleanliness: 'Clean',
              dirtyReason: null,
            }
          : r
      )
    );

    // Complete any active task in queue
    setHousekeepingTasks((prev) =>
      prev.map((t) =>
        t.roomNumber === roomNumber && t.status !== 'CLEAN'
          ? { ...t, status: 'CLEAN', completionTime: 'Just now' }
          : t
      )
    );

    const room = rooms.find((r) => r.roomNumber === roomNumber);
    const newEntry = {
      id: `HK-${Date.now().toString().slice(-4)}`,
      roomNumber,
      type: room?.type || 'Guest Suite',
      cleanerName,
      action: 'Turnover & Cleanliness Certified Clean',
      completedAt: 'Just now',
      duration: '15 mins',
      inspectedBy: 'Self-Certified (One-Click)',
      status: 'Passed Inspection',
    };
    setHousekeepingHistory((prev) => [newEntry, ...prev]);

    addLog(
      `Room ${roomNumber} Marked CLEAN`,
      'Housekeeping',
      `${cleanerName} certified Room ${roomNumber}. Immediately available across dashboards.`,
      'Housekeeping'
    );

    hkApi.certifyClean({ roomNumber, cleanerName }).catch((err) => {
      console.warn('hkApi.certifyClean sync error:', err.message);
    });
  };

  // Mark room dirty
  const markRoomDirty = (roomNumber, reason = 'Turnover & sanitization needed') => {
    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === roomNumber
          ? {
              ...r,
              housekeepingStatus: 'DIRTY',
              cleanliness: 'Dirty',
              dirtyReason: reason,
            }
          : r
      )
    );

    const newTask = {
      id: `HKT-${Math.floor(1000 + Math.random() * 9000)}`,
      roomNumber,
      priority: 'NORMAL',
      assignedTo: null,
      status: 'DIRTY',
      notes: reason,
      createdAt: 'Just now',
    };
    setHousekeepingTasks((prev) => [newTask, ...prev]);

    addLog(`Room ${roomNumber} Flagged DIRTY`, 'Housekeeping', `Room ${roomNumber} dirty: ${reason}`, 'Housekeeping');

    roomsApi.updateCleanliness(roomNumber, 'DIRTY', reason).catch((err) => {
      console.warn('roomsApi.updateCleanliness error:', err.message);
    });
  };

  // 1.5 Create Housekeeping Task
  const createHousekeepingTask = ({ roomNumber, priority = 'NORMAL', assignedTo = null, notes = '' }) => {
    const newTask = {
      id: `HKT-${Math.floor(1000 + Math.random() * 9000)}`,
      roomNumber,
      priority,
      assignedTo,
      status: 'DIRTY',
      notes,
      createdAt: 'Just now',
    };
    setHousekeepingTasks((prev) => [newTask, ...prev]);

    hkApi.createTask(newTask).catch((err) => {
      console.warn('hkApi.createTask sync error:', err.message);
    });

    return newTask;
  };

  // 2. Housekeeping Task Progress (DIRTY -> CLEANING -> INSPECTION -> CLEAN)
  const updateHousekeepingTaskStatus = (taskId, newStatus, assignedTo, notes) => {
    setHousekeepingTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            status: newStatus,
            assignedTo: assignedTo || t.assignedTo,
            notes: notes || t.notes,
          };
          if (newStatus === 'CLEANING' && !t.startTime) updated.startTime = 'Just now';
          if (newStatus === 'CLEAN') updated.completionTime = 'Just now';
          return updated;
        }
        return t;
      })
    );

    const task = housekeepingTasks.find((t) => t.id === taskId);
    if (task) {
      setRooms((prev) =>
        prev.map((r) =>
          r.roomNumber === task.roomNumber
            ? {
                ...r,
                housekeepingStatus: newStatus,
                cleanliness: newStatus === 'DIRTY' ? 'Dirty' : newStatus === 'CLEANING' ? 'Cleaning' : newStatus === 'INSPECTION' ? 'Inspected' : 'Clean',
                dirtyReason: newStatus === 'CLEAN' ? null : r.dirtyReason,
              }
            : r
        )
      );
    }

    addLog(
      `Housekeeping Task ${taskId} -> ${newStatus}`,
      'Housekeeping',
      `Room ${task?.roomNumber} task moved to ${newStatus}.`,
      'Housekeeping'
    );

    hkApi.updateTaskStatus(taskId, newStatus, assignedTo, notes).catch((err) => {
      console.warn('hkApi.updateTaskStatus sync error:', err.message);
    });
  };

  // 3. Receptionist: Check-In Workflow (Verify Clean & Available)
  const checkInGuest = async (bookingId, targetRoomNumber = null, forceOverride = false) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Reservation not found' };

    const roomNum = targetRoomNumber || booking.roomNumber;
    if (!roomNum) return { success: false, message: 'Please select a room to assign for check-in' };

    const targetRoom = rooms.find((r) => r.roomNumber === roomNum);
    if (!targetRoom) return { success: false, message: `Room ${roomNum} not found in inventory` };

    // Verification 1: Maintenance Status must be AVAILABLE
    if (targetRoom.maintenanceStatus && targetRoom.maintenanceStatus !== 'AVAILABLE') {
      return {
        success: false,
        isMaintenance: true,
        message: `Cannot check in to Room ${roomNum}: Room is currently under ${targetRoom.maintenanceStatus} (${targetRoom.dirtyReason || 'Maintenance in progress'}).`,
        room: targetRoom,
      };
    }

    // Verification 2: Housekeeping Status must be CLEAN
    const isClean = targetRoom.housekeepingStatus === 'CLEAN' || targetRoom.cleanliness === 'Clean';
    if (!isClean && !forceOverride) {
      return {
        success: false,
        isDirtyAlert: true,
        message: `Room ${roomNum} is marked ${targetRoom.housekeepingStatus || 'DIRTY'} (${targetRoom.dirtyReason || 'Full turnover needed'}). 5-star standard requires assigning verified CLEAN rooms only.`,
        room: targetRoom,
      };
    }

    const digitalKey = `AURA-${roomNum}-${Math.floor(100 + Math.random() * 900)}`;

    // Update booking
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              roomNumber: roomNum,
              status: 'CHECKED_IN',
              stayId: `STAY-${bookingId}`,
              digitalKeyCode: digitalKey,
            }
          : b
      )
    );

    // Update room to OCCUPIED
    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === roomNum
          ? {
              ...r,
              occupancyStatus: 'OCCUPIED',
              occupancy: 'Occupied',
              guestId: bookingId,
            }
          : r
      )
    );

    addLog(
      `Guest Checked In: Room ${roomNum}`,
      'Front Desk',
      `${booking.guestName} confirmed check-in. Room ${roomNum} occupied; Guest Stay & Digital Key active.`,
      'Check-In'
    );

    try {
      await bookingsApi.checkIn(bookingId, { roomNumber: roomNum, forceOverride });
    } catch (err) {
      console.warn('bookingsApi.checkIn sync error:', err.message);
    }

    return {
      success: true,
      message: `Successfully checked in ${booking.guestName} to Room ${roomNum}!`,
      digitalKey,
    };
  };

  // Assign Room
  const assignRoom = (bookingId, targetRoomNumber, forceOverride = false) => {
    return checkInGuest(bookingId, targetRoomNumber, forceOverride);
  };

  // Modify Booking
  const modifyBooking = async (bookingId, updatedData) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...updatedData } : b))
    );

    addLog(`Reservation ${bookingId} Modified`, 'Front Desk', `Updated details for ${bookingId}.`, 'Reservation');

    try {
      await bookingsApi.update(bookingId, updatedData);
      return { success: true };
    } catch (err) {
      console.warn('bookingsApi.update error:', err.message);
      return { success: false, message: err.message };
    }
  };

  // Cancel Booking
  const cancelBooking = async (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
    );

    if (booking?.roomNumber) {
      setRooms((prev) =>
        prev.map((r) =>
          r.roomNumber === booking.roomNumber
            ? { ...r, occupancy: 'Available', occupancyStatus: 'VACANT', guestId: null }
            : r
        )
      );
    }

    addLog(`Reservation ${bookingId} Cancelled`, 'Front Desk', `Booking for ${booking?.guestName} cancelled.`, 'Reservation');

    try {
      await bookingsApi.cancel(bookingId);
      return { success: true };
    } catch (err) {
      console.warn('bookingsApi.cancel error:', err.message);
      return { success: false, message: err.message };
    }
  };

  // Mark No-Show
  const markNoShow = async (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'NO_SHOW' } : b))
    );

    if (booking?.roomNumber) {
      setRooms((prev) =>
        prev.map((r) =>
          r.roomNumber === booking.roomNumber
            ? { ...r, occupancy: 'Available', occupancyStatus: 'VACANT', guestId: null }
            : r
        )
      );
    }

    addLog(`Reservation ${bookingId} Marked No-Show`, 'Front Desk', `${booking?.guestName} marked as No-Show. Room released.`, 'Front Desk');

    try {
      await bookingsApi.markNoShow(bookingId);
      return { success: true };
    } catch (err) {
      console.warn('bookingsApi.markNoShow error:', err.message);
      return { success: false, message: err.message };
    }
  };

  // 4. Receptionist: Walk-In Booking
  const createWalkInBooking = (guestData) => {
    const newId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const nights = guestData.nights || 1;
    const selectedRoom = rooms.find((r) => r.roomNumber === guestData.roomNumber);
    const roomRate = selectedRoom ? selectedRoom.rate : 2200;
    const digitalKey = `AURA-${guestData.roomNumber}-${Math.floor(100 + Math.random() * 900)}`;

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
      status: 'CHECKED_IN',
      notes: guestData.notes || 'Walk-In Guest • Immediate Check-In',
      paid: false,
      paymentMethod: guestData.paymentMethod || 'Credit Card On File',
      stayId: `STAY-${newId}`,
      digitalKeyCode: digitalKey,
    };

    setBookings((prev) => [newBooking, ...prev]);

    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === guestData.roomNumber
          ? { ...r, occupancy: 'Occupied', occupancyStatus: 'OCCUPIED', guestId: newId }
          : r
      )
    );

    addLog(
      `Walk-In Guest Checked In (#${newId})`,
      'Front Desk',
      `${guestData.name} checked into Room ${guestData.roomNumber} (${nights} nights, ${roomRate} ETB/nt). Stay active.`,
      'Walk-In'
    );

    bookingsApi.create(newBooking).catch((err) => {
      console.warn('bookingsApi.create sync error:', err.message);
    });

    return newBooking;
  };

  // 5. Live Folio Calculation (Room + Food Orders + Concierge Charges + Taxes)
  const getGuestFolio = (roomNumber) => {
    const booking = bookings.find(
      (b) => b.roomNumber === roomNumber && b.status !== 'CHECKED_OUT' && b.status !== 'CANCELLED'
    );

    const roomFoodOrders = orders.filter((o) => o.roomNumber === roomNumber && o.status !== 'Cancelled');
    const roomServiceReqs = serviceRequests.filter(
      (s) => s.roomNumber === roomNumber && s.chargeAmount > 0 && s.status !== 'CANCELLED'
    );

    const roomTotal = booking ? booking.roomRate * booking.nights : 0;
    // Food orders are charged when DELIVERED (or all delivered/cooking items)
    const foodTotal = roomFoodOrders.reduce((acc, curr) => acc + curr.total, 0);
    const serviceTotal = roomServiceReqs.reduce((acc, curr) => acc + (parseFloat(curr.chargeAmount) || 0), 0);

    const subtotal = roomTotal + foodTotal + serviceTotal;
    const taxes = subtotal * 0.12; // 12% luxury tax & service charge
    const grandTotal = subtotal + taxes;

    const remainingBalance = booking?.paid ? 0 : grandTotal;
    const paymentStatus = booking?.paid ? 'PAID' : 'PENDING';

    return {
      booking,
      roomNumber,
      guestName: booking?.guestName || 'Valued Guest',
      email: booking?.email || '',
      phone: booking?.phone || '',
      roomType: booking?.roomType || 'Deluxe Suite',
      nights: booking?.nights || 1,
      roomRate: booking?.roomRate || 0,
      roomTotal,
      foodOrders: roomFoodOrders,
      foodTotal,
      serviceRequests: roomServiceReqs,
      serviceTotal,
      subtotal,
      taxes,
      grandTotal,
      remainingBalance,
      paymentStatus,
      isPaid: booking?.paid || false,
    };
  };

  // 6. Receptionist: Settle Bill & Check Out (Automatic Housekeeping Handoff)
  const checkoutGuest = (roomNumber, paymentMethod = 'Amex Centurion •••• 8820') => {
    const folio = getGuestFolio(roomNumber);
    if (!folio.booking) return { success: false, message: 'No active booking found for this room' };

    // Update booking status to CHECKED_OUT
    setBookings((prev) =>
      prev.map((b) =>
        b.id === folio.booking.id
          ? { ...b, status: 'CHECKED_OUT', paid: true, paymentMethod }
          : b
      )
    );

    // AUTOMATIC CHECKOUT -> HOUSEKEEPING (Requirement 10)
    // 1. Room occupancy -> VACANT
    // 2. Housekeeping status -> DIRTY
    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === roomNumber
          ? {
              ...r,
              occupancy: 'Available',
              occupancyStatus: 'VACANT',
              cleanliness: 'Dirty',
              housekeepingStatus: 'DIRTY',
              dirtyReason: `Checked out today (${folio.booking.guestName}) • Full turnover required`,
              guestId: null,
            }
          : r
      )
    );

    // 3. Automatically create task in Housekeeping Queue
    const newHkTask = {
      id: `HKT-${Math.floor(1000 + Math.random() * 9000)}`,
      roomNumber,
      priority: 'CHECKOUT',
      assignedTo: null,
      status: 'DIRTY',
      notes: `Checkout turnover for ${folio.guestName}. Sanitize room and replace linens.`,
      createdAt: 'Just now',
    };
    setHousekeepingTasks((prev) => [newHkTask, ...prev]);

    addLog(
      `Guest Checked Out (Room ${roomNumber})`,
      'Front Desk',
      `${folio.guestName} settled folio (${folio.grandTotal.toFixed(2)} ETB) via ${paymentMethod}. Room transitioned to Housekeeping queue as DIRTY.`,
      'Checkout'
    );

    bookingsApi.checkout(roomNumber, paymentMethod).catch((err) => {
      console.warn('bookingsApi.checkout sync error:', err.message);
    });

    return { success: true, folio, housekeepingTask: newHkTask };
  };

  // Undo checkout
  const undoCheckout = (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: 'CHECKED_IN', paid: false } : b
      )
    );

    if (booking.roomNumber) {
      setRooms((prev) =>
        prev.map((r) =>
          r.roomNumber === booking.roomNumber
            ? {
                ...r,
                occupancy: 'Occupied',
                occupancyStatus: 'OCCUPIED',
                cleanliness: 'Clean',
                housekeepingStatus: 'CLEAN',
                dirtyReason: null,
                guestId: bookingId,
              }
            : r
        )
      );
    }

    addLog(
      `Checkout Reverted: ${booking.guestName}`,
      'Front Desk',
      `Stay in Room ${booking.roomNumber} restored to Active Check-In status.`,
      'Front Desk'
    );

    bookingsApi.undoCheckout(bookingId).catch((err) => {
      console.warn('bookingsApi.undoCheckout sync error:', err.message);
    });

    return { success: true, message: `Stay in Room ${booking.roomNumber} restored to Active Check-In!` };
  };

  // 7. Kitchen & Guest: Order food (Workflow: PENDING -> COOKING -> READY -> DELIVERED)
  const placeFoodOrder = ({ roomNumber, guestName, items, notes = '' }) => {
    const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const orderId = `ORD-${Math.floor(500 + Math.random() * 499)}`;

    const newOrder = {
      id: orderId,
      roomNumber,
      guestName: guestName || `Guest in Room ${roomNumber}`,
      items,
      total,
      status: 'Pending', // PENDING -> COOKING -> READY -> DELIVERED
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elapsedMinutes: 0,
      notes: notes || 'Room service order',
      server: 'Kitchen Brigade',
    };

    setOrders((prev) => [newOrder, ...prev]);

    addLog(
      `Room Service Order Placed (${orderId})`,
      'Kitchen',
      `Room ${roomNumber} ordered ${items.length} item(s) totaling ${total.toFixed(2)} ETB. Sent to KDS.`,
      'Kitchen KDS'
    );

    ordersApi.create(newOrder).catch((err) => {
      console.warn('ordersApi.create sync error:', err.message);
    });

    return newOrder;
  };

  // Update Food Order Status
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    const targetOrder = orders.find((o) => o.id === orderId);

    addLog(
      `Order ${orderId} Status: ${newStatus}`,
      'Kitchen',
      `Order for Room ${targetOrder?.roomNumber || 'Unknown'} is now ${newStatus.toUpperCase()}.${newStatus === 'Delivered' ? ' Folio automatically charged.' : ''}`,
      'Kitchen KDS'
    );

    ordersApi.updateStatus(orderId, newStatus).catch((err) => {
      console.warn('ordersApi.updateStatus sync error:', err.message);
    });
  };

  // 8. 86 / Out of Stock System
  const toggleDishStock = (dishId) => {
    setMenuItems((prev) =>
      prev.map((d) => (d.id === dishId ? { ...d, inStock: !d.inStock } : d))
    );
    menuApi.toggleStock(dishId).catch((err) => {
      console.warn('menuApi.toggleStock sync error:', err.message);
    });
  };

  // Menu Items Management
  const addMenuItem = (item) => {
    const newItem = { ...item, id: Date.now(), inStock: true };
    setMenuItems((prev) => [...prev, newItem]);
    addLog(`Menu Item Added: ${item.name}`, 'Menu', `Added dish priced at ${item.price} ETB.`, 'Admin');
    menuApi.create(item).catch((err) => {
      console.warn('menuApi.create sync error:', err.message);
    });
  };

  const editMenuItem = (item) => {
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? item : m)));
    addLog(`Menu Item Updated: ${item.name}`, 'Menu', `Updated details for ${item.name}.`, 'Admin');
    menuApi.update(item.id, item).catch((err) => {
      console.warn('menuApi.update sync error:', err.message);
    });
  };

  const deleteMenuItem = (id) => {
    const item = menuItems.find((m) => m.id === id);
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
    addLog(`Menu Item Removed: ${item?.name || id}`, 'Menu', `Removed from catalog.`, 'Admin');
    menuApi.delete(id).catch((err) => {
      console.warn('menuApi.delete sync error:', err.message);
    });
  };

  // 9. Concierge / Service Requests (REQUESTED -> ACCEPTED -> IN_PROGRESS -> COMPLETED)
  const createServiceRequest = ({ roomNumber, guestName, serviceType, details, priority = 'NORMAL', department = 'Front Desk', chargeAmount = 0 }) => {
    const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq = {
      id: reqId,
      roomNumber,
      guestName: guestName || `Guest in Room ${roomNumber}`,
      serviceType,
      details,
      priority,
      status: 'REQUESTED',
      department,
      assignedTo: null,
      chargeAmount: parseFloat(chargeAmount) || 0,
      createdAt: 'Just now',
    };

    setServiceRequests((prev) => [newReq, ...prev]);

    addLog(
      `Concierge Request: ${serviceType}`,
      'Concierge',
      `Room ${roomNumber} requested "${serviceType}". Routed to ${department}.`,
      'Concierge'
    );

    servicesApi.create(newReq).catch((err) => {
      console.warn('servicesApi.create error:', err.message);
    });

    return newReq;
  };

  const updateServiceRequestStatus = (id, newStatus, assignedTo) => {
    setServiceRequests((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus, assignedTo: assignedTo || s.assignedTo } : s))
    );

    const targetReq = serviceRequests.find((s) => s.id === id);

    addLog(
      `Service #${id} Status: ${newStatus}`,
      'Concierge',
      `Request "${targetReq?.serviceType}" moved to ${newStatus}.`,
      'Concierge'
    );

    servicesApi.updateStatus(id, newStatus, assignedTo).catch((err) => {
      console.warn('servicesApi.updateStatus error:', err.message);
    });
  };

  // 10. Maintenance Workflow (Problem reported -> OUT_OF_SERVICE -> Resolved -> AVAILABLE)
  const createMaintenanceTicket = ({ roomNumber, issueDescription, severity = 'MEDIUM', reportedBy, inventoryImpact = 'OUT_OF_SERVICE' }) => {
    const ticketId = `MNT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = {
      id: ticketId,
      roomNumber,
      severity,
      status: 'REPORTED',
      inventoryImpact,
      issueDescription,
      resolutionNotes: '',
      reportedBy: reportedBy || 'Staff Attendant',
      assignedTo: 'Engineering Department',
      startDate: new Date().toISOString().split('T')[0],
      createdAt: 'Just now',
    };

    setMaintenanceTickets((prev) => [newTicket, ...prev]);

    // Mark room OUT_OF_SERVICE (blocking check-in)
    const newMaintStatus = inventoryImpact === 'OUT_OF_SERVICE' ? 'OUT_OF_SERVICE' : 'MAINTENANCE';
    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === roomNumber
          ? {
              ...r,
              maintenanceStatus: newMaintStatus,
              dirtyReason: `Maintenance: ${issueDescription}`,
            }
          : r
      )
    );

    addLog(
      `Room ${roomNumber} Out of Service`,
      'Maintenance',
      `Ticket #${ticketId} opened: ${issueDescription}. Room blocked from check-ins.`,
      'Maintenance'
    );

    maintenanceApi.create(newTicket).catch((err) => {
      console.warn('maintenanceApi.create error:', err.message);
    });

    return newTicket;
  };

  const updateMaintenanceTicket = (id, newStatus, resolutionNotes, assignedTo) => {
    setMaintenanceTickets((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: newStatus,
              resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : m.resolutionNotes,
              assignedTo: assignedTo || m.assignedTo,
            }
          : m
      )
    );

    const ticket = maintenanceTickets.find((m) => m.id === id);

    // If resolved, return room to AVAILABLE if no other open tickets exist
    if (newStatus === 'RESOLVED' && ticket?.roomNumber) {
      const remainingOpen = maintenanceTickets.filter(
        (m) => m.roomNumber === ticket.roomNumber && m.id !== id && (m.status === 'REPORTED' || m.status === 'IN_PROGRESS')
      );
      if (remainingOpen.length === 0) {
        setRooms((prev) =>
          prev.map((r) =>
            r.roomNumber === ticket.roomNumber
              ? {
                  ...r,
                  maintenanceStatus: 'AVAILABLE',
                }
              : r
          )
        );
      }
    }

    addLog(
      `Maintenance #${id}: ${newStatus}`,
      'Maintenance',
      `Room ${ticket?.roomNumber} maintenance marked as ${newStatus}.`,
      'Maintenance'
    );

    maintenanceApi.update(id, { status: newStatus, resolutionNotes, assignedTo }).catch((err) => {
      console.warn('maintenanceApi.update error:', err.message);
    });
  };

  // 11. Inventory Management
  const createInventoryItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now(),
      status: item.quantity <= 0 ? 'OUT_OF_STOCK' : item.quantity <= (item.minStock || 5) ? 'LOW_STOCK' : 'IN_STOCK',
    };
    setInventoryItems((prev) => [newItem, ...prev]);

    inventoryApi.create(item).catch((err) => {
      console.warn('inventoryApi.create error:', err.message);
    });
  };

  const updateInventoryItem = (id, updatedFields) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updatedFields };
          merged.status =
            merged.quantity <= 0
              ? 'OUT_OF_STOCK'
              : merged.quantity <= (merged.minStock || 5)
              ? 'LOW_STOCK'
              : 'IN_STOCK';
          return merged;
        }
        return item;
      })
    );

    inventoryApi.update(id, updatedFields).catch((err) => {
      console.warn('inventoryApi.update error:', err.message);
    });
  };

  const deleteInventoryItem = (id) => {
    setInventoryItems((prev) => prev.filter((i) => i.id !== id));
    inventoryApi.delete(id).catch((err) => {
      console.warn('inventoryApi.delete error:', err.message);
    });
  };

  // 12. Room Categories Management
  const addRoomCategory = (category) => {
    const newCat = { ...category, id: Date.now() };
    setRoomCategories((prev) => [...prev, newCat]);
    addLog(`Room Category Added: ${category.name}`, 'Rooms', `Added category ${category.name}.`, 'Admin');
    roomsApi.createCategory(category).catch((err) => {
      console.warn('roomsApi.createCategory error:', err.message);
    });
  };

  const editRoomCategory = (id, category) => {
    setRoomCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...category } : c)));
    addLog(`Room Category Updated: ${category.name}`, 'Rooms', `Updated category ${category.name}.`, 'Admin');
    roomsApi.updateCategory(id, category).catch((err) => {
      console.warn('roomsApi.updateCategory error:', err.message);
    });
  };

  const deleteRoomCategory = (id) => {
    setRoomCategories((prev) => prev.filter((c) => c.id !== id));
    roomsApi.deleteCategory(id).catch((err) => {
      console.warn('roomsApi.deleteCategory error:', err.message);
    });
  };

  // 13. Rooms Management
  const updateRoom = (updatedRoom) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === updatedRoom.roomNumber
          ? {
              ...r,
              ...updatedRoom,
              occupancyStatus: updatedRoom.occupancyStatus || (updatedRoom.occupancy === 'Occupied' ? 'OCCUPIED' : 'VACANT'),
              housekeepingStatus: updatedRoom.housekeepingStatus || (updatedRoom.cleanliness === 'Dirty' ? 'DIRTY' : 'CLEAN'),
              maintenanceStatus: updatedRoom.maintenanceStatus || 'AVAILABLE',
            }
          : r
      )
    );
    addLog(`Room ${updatedRoom.roomNumber} Modified`, 'Rooms', `Tariff and status specifications updated.`, 'Admin');
    roomsApi.update(updatedRoom.roomNumber, updatedRoom).catch((err) => {
      console.warn('roomsApi.update sync error:', err.message);
    });
  };

  const addRoom = (newRoom) => {
    const fullRoom = {
      ...newRoom,
      occupancyStatus: newRoom.occupancyStatus || 'VACANT',
      housekeepingStatus: newRoom.housekeepingStatus || 'CLEAN',
      maintenanceStatus: newRoom.maintenanceStatus || 'AVAILABLE',
      cleanliness: 'Clean',
      occupancy: 'Available',
      guestId: null,
    };
    setRooms((prev) => [...prev, fullRoom]);
    addLog(`New Room Added: ${newRoom.roomNumber}`, 'Rooms', `Added Room ${newRoom.roomNumber} (${newRoom.type}).`, 'Admin');
    roomsApi.create(fullRoom).catch((err) => {
      console.warn('roomsApi.create sync error:', err.message);
    });
  };

  const deleteRoom = (roomNumber) => {
    setRooms((prev) => prev.filter((r) => r.roomNumber !== roomNumber));
    addLog(`Room ${roomNumber} Deleted`, 'Rooms', `Removed from property inventory.`, 'Admin');
    roomsApi.delete(roomNumber).catch((err) => {
      console.warn('roomsApi.delete sync error:', err.message);
    });
  };

  // 14. Guest Online Booking
  const createGuestOnlineBooking = async ({ guestName, email, phone, roomNumber, roomType, checkIn, checkOut, nights, notes, autoCheckIn = false }) => {
    const selectedRoom = rooms.find((r) => r.roomNumber === roomNumber);
    const roomRate = selectedRoom ? selectedRoom.rate : 220;
    const resolvedRoomType = roomType || selectedRoom?.type || 'Deluxe Suite';
    const newId = `BK-${Math.floor(2000 + Math.random() * 8000)}`;

    const isToday = new Date(checkIn).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
    const bookingStatus = (autoCheckIn && isToday) ? 'CHECKED_IN' : 'CONFIRMED';
    const digitalKey = bookingStatus === 'CHECKED_IN' ? `AURA-${roomNumber}-${Math.floor(100 + Math.random() * 900)}` : null;

    const newBooking = {
      id: newId,
      guestName: (guestName || 'Valued Guest').trim(),
      email: (email || 'guest@efoyhotel.com').trim().toLowerCase(),
      phone: (phone || '+1 (555) 234-5678').trim(),
      roomNumber,
      roomType: resolvedRoomType,
      checkIn,
      checkOut,
      nights: Number(nights) || 1,
      roomRate,
      status: bookingStatus,
      notes: notes || 'Online booking via Guest Portal',
      paid: false,
      paymentMethod: 'Credit Card (Online Pre-Authorized)',
      stayId: bookingStatus === 'CHECKED_IN' ? `STAY-${newId}` : null,
      digitalKeyCode: digitalKey,
    };

    // Optimistically update local PMS state immediately
    setBookings((prev) => [newBooking, ...prev]);

    if (roomNumber) {
      setRooms((prev) =>
        prev.map((r) =>
          r.roomNumber === roomNumber
            ? {
                ...r,
                occupancy: bookingStatus === 'CHECKED_IN' ? 'Occupied' : 'Reserved',
                occupancyStatus: bookingStatus === 'CHECKED_IN' ? 'OCCUPIED' : r.occupancyStatus,
                guestId: newId,
              }
            : r
        )
      );
    }

    addLog(
      `Online Booking Confirmed (#${newId})`,
      'Guest Portal',
      `${guestName} booked Room ${roomNumber} (${nights} nights). Check-in: ${checkIn}.`,
      'Online Booking'
    );

    try {
      const res = await bookingsApi.create(newBooking);
      if (res?.booking) {
        setBookings((prev) => prev.map((b) => (b.id === newId ? { ...newBooking, ...res.booking } : b)));
        return { success: true, booking: res.booking, folioId: res.folioId };
      }
      return { success: true, booking: newBooking };
    } catch (err) {
      console.warn('bookingsApi.create online sync notice:', err.message);
      // Local optimistic record ensures guest flow continues uninterrupted
      return { success: true, booking: newBooking, warning: err.message };
    }
  };

  // Staff Management
  const addStaff = (staff) => {
    const newStaff = {
      ...staff,
      id: Date.now(),
      status: staff.status || 'Active Duty',
      avatarBg: 'bg-amber-100 text-amber-800',
    };
    setStaffList((prev) => [...prev, newStaff]);
    addLog(`Staff Member Added: ${staff.name}`, 'Staff', `Assigned as ${staff.role} in ${staff.department}.`, 'Admin');
    staffApi.create(staff).catch((err) => {
      console.warn('staffApi.create sync error:', err.message);
    });
  };

  const editStaff = (staff) => {
    setStaffList((prev) => prev.map((s) => (s.id === staff.id ? staff : s)));
    addLog(`Staff Updated: ${staff.name}`, 'Staff', `Role and shift schedules updated.`, 'Admin');
    staffApi.update(staff.id, staff).catch((err) => {
      console.warn('staffApi.update sync error:', err.message);
    });
  };

  const deleteStaff = (id) => {
    const staff = staffList.find((s) => s.id === id);
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    addLog(`Staff Removed: ${staff?.name || id}`, 'Staff', `Removed from directory.`, 'Admin');
    staffApi.delete(id).catch((err) => {
      console.warn('staffApi.delete sync error:', err.message);
    });
  };

  // Reset demo
  const resetDemoData = () => {
    setRooms(INITIAL_ROOMS);
    setRoomCategories(INITIAL_ROOM_CATEGORIES);
    setBookings(INITIAL_BOOKINGS);
    setMenuItems(INITIAL_MENU);
    setOrders(INITIAL_ORDERS);
    setHousekeepingTasks(INITIAL_HOUSEKEEPING_TASKS);
    setHousekeepingHistory(INITIAL_HOUSEKEEPING_HISTORY);
    setServiceRequests(INITIAL_SERVICE_REQUESTS);
    setMaintenanceTickets(INITIAL_MAINTENANCE_TICKETS);
    setInventoryItems(INITIAL_INVENTORY);
    setStaffList(INITIAL_STAFF);
    setActivityLogs(INITIAL_LOGS);

    localStorage.removeItem('efoy_hotel_rooms');
    localStorage.removeItem('efoy_hotel_room_categories');
    localStorage.removeItem('efoy_hotel_bookings');
    localStorage.removeItem('efoy_hotel_menu');
    localStorage.removeItem('efoy_hotel_orders');
    localStorage.removeItem('efoy_hotel_hk_tasks');
    localStorage.removeItem('efoy_hotel_hk_history');
    localStorage.removeItem('efoy_hotel_service_requests');
    localStorage.removeItem('efoy_hotel_maintenance_tickets');
    localStorage.removeItem('efoy_hotel_inventory');
    localStorage.removeItem('efoy_hotel_staff');
    localStorage.removeItem('efoy_hotel_logs');

    settingsApi.resetDemo().catch((err) => {
      console.warn('settingsApi.resetDemo sync error:', err.message);
    });
  };

  const value = {
    rooms,
    roomCategories,
    bookings,
    menuItems,
    orders,
    housekeepingTasks,
    housekeepingHistory,
    serviceRequests,
    maintenanceTickets,
    inventoryItems,
    staffList,
    activityLogs,
    usersList,
    // Operations
    cleanRoom,
    markRoomDirty,
    checkInGuest,
    assignRoom,
    modifyBooking,
    cancelBooking,
    markNoShow,
    createWalkInBooking,
    createGuestOnlineBooking,
    getGuestFolio,
    checkoutGuest,
    undoCheckout,
    placeFoodOrder,
    updateOrderStatus,
    toggleDishStock,
    addMenuItem,
    editMenuItem,
    deleteMenuItem,
    createHousekeepingTask,
    updateHousekeepingTaskStatus,
    createServiceRequest,
    updateServiceRequestStatus,
    createMaintenanceTicket,
    updateMaintenanceTicket,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addRoomCategory,
    editRoomCategory,
    deleteRoomCategory,
    addRoom,
    updateRoom,
    deleteRoom,
    addStaff,
    editStaff,
    deleteStaff,
    resetDemoData,
    // Users Management
    addUser: async (userData) => {
      try {
        const res = await usersApi.create(userData);
        if (res?.user) {
          setUsersList((prev) => [res.user, ...prev]);
          addLog(`User Created: ${res.user.name}`, 'Users', `Account created with role ${res.user.role}.`, 'Admin');
          return { success: true, user: res.user };
        }
        return { success: true };
      } catch (err) {
        const newUser = { ...userData, id: Date.now(), createdAt: new Date().toISOString() };
        setUsersList((prev) => [newUser, ...prev]);
        return { success: true, user: newUser, warning: err.message };
      }
    },
    editUser: async (id, userData) => {
      try {
        const res = await usersApi.update(id, userData);
        if (res?.user) {
          setUsersList((prev) => prev.map((u) => (u.id === id ? res.user : u)));
          return { success: true, user: res.user };
        }
        return { success: true };
      } catch (err) {
        setUsersList((prev) => prev.map((u) => (u.id === id ? { ...u, ...userData } : u)));
        return { success: true, warning: err.message };
      }
    },
    deleteUser: async (id) => {
      try {
        await usersApi.delete(id);
        setUsersList((prev) => prev.filter((u) => u.id !== id));
        return { success: true };
      } catch (err) {
        setUsersList((prev) => prev.filter((u) => u.id !== id));
        return { success: true, warning: err.message };
      }
    },
  };

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
