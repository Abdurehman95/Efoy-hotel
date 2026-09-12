-- Efoy Hotel & Suites — Luxury PMS Initial Seed Data

-- 1. USERS
INSERT INTO users (name, email, password_hash, role, phone) VALUES
('Alexander Sterling', 'admin@efoyhotel.com', '$2a$10$x82IkUCstQu4A6vx548li.kprMB8T41f0FdKzMW4REYJeY7IZf7HS', 'admin', '+1 (555) 100-0001'),
('Julian Vance', 'reception@efoyhotel.com', '$2a$10$ckaF8nqZN5Vsa7U9ox2u9ezhWRoJO2fOPPXskbqQm1CCvkDNcl6KG', 'receptionist', '+1 (555) 100-0002'),
('Chef Marco Bellini', 'kitchen@efoyhotel.com', '$2a$10$5.K0pYaU/hlCTiL2xvMDnuSCp7kgsL950B7OrQ1YLaUyKMx7gv.qC', 'kitchen', '+1 (555) 100-0003'),
('Maria Santos', 'housekeeping@efoyhotel.com', '$2a$10$HWRSB0Vi1mUHy1R/nroJae4JXheFjGQDNwqtwK7B1kElUeRYjvw9i', 'housekeeping', '+1 (555) 100-0004'),
('Lord Alexander Wright', 'guest@efoyhotel.com', '$2a$10$YTEOvtBSj3Lt1lcUfrEQzen4s2JRvBt94WUTK9q1EbECJL4Ncsfgm', 'guest', '+1 (555) 234-5678')
ON CONFLICT (email) DO NOTHING;

-- 2. ROOMS
INSERT INTO rooms (room_number, type, floor, capacity, rate, features, cleanliness, dirty_reason, occupancy, guest_id) VALUES
('101', 'Single Classic', 'Floor 1 (West Wing)', '1 Person', 180.00, 'Single Bed • City View • Espresso Machine', 'Clean', NULL, 'Occupied', 'BK-8901'),
('102', 'Single Deluxe', 'Floor 1 (West Wing)', '1 Person', 220.00, 'Queen Bed • Garden Courtyard • Rain Shower', 'Dirty', 'Guest checked out 2 hours ago • Full linen turnover required', 'Available', NULL),
('201', 'Double Deluxe', 'Floor 2 (East Wing)', '2 Adults', 280.00, 'King Bed • Balcony • Marble Bath', 'Clean', NULL, 'Available', NULL),
('202', 'Double Deluxe', 'Floor 2 (East Wing)', '2 Adults', 290.00, 'Two Queen Beds • Bay View • Work Desk', 'Dirty', 'Housekeeping requested • Deep dusting & bathroom replenishment', 'Available', NULL),
('301', 'Double Executive', 'Floor 3 (East Wing)', '2 Adults, 1 Child', 340.00, 'King Bed • Oceanfront • Lounge Area', 'Clean', NULL, 'Occupied', 'BK-8902'),
('302', 'Double Executive', 'Floor 3 (East Wing)', '2 Adults, 1 Child', 350.00, 'King Bed • Skyline View • B&O Audio', 'Cleaning', NULL, 'Available', NULL),
('401', 'Luxury Suite', 'Floor 4 (North Panorama)', '4 Persons', 520.00, 'Master King + Twin • Fireplace • Private Butler', 'Clean', NULL, 'Occupied', 'BK-8903'),
('402', 'Luxury Suite', 'Floor 4 (North Panorama)', '4 Persons', 560.00, '2 King Beds • Terrace & Jacuzzi • Wine Cellar', 'Dirty', 'Checkout turnover in progress • Sanitize jacuzzi and replace linens', 'Available', NULL),
('501', 'Penthouse Panoramic', 'Floor 5 (Penthouse Level)', '6 Persons', 850.00, '3 En-Suite Bedrooms • 360° Terrace • Chef Kitchen', 'Clean', NULL, 'Available', NULL),
('502', 'Presidential Penthouse', 'Floor 5 (Penthouse Level)', '6 Persons', 1200.00, 'Full Floor Luxury • Helipad Access • Private Spa', 'Inspected', NULL, 'Reserved', 'BK-8904')
ON CONFLICT (room_number) DO NOTHING;

-- 3. BOOKINGS
INSERT INTO bookings (id, guest_name, email, phone, room_number, room_type, check_in, check_out, nights, room_rate, status, notes, paid, payment_method) VALUES
('BK-8901', 'Lord Alexander Wright', 'guest@efoyhotel.com', '+1 (555) 234-5678', '101', 'Single Classic', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '1 day', 3, 180.00, 'In-House', 'Member VIP • Prefers feather pillows and early morning newspaper', FALSE, NULL),
('BK-8902', 'Sophia Montgomery', 'sophia.m@luxurytravel.org', '+1 (555) 987-6543', '301', 'Double Executive', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE, 2, 340.00, 'Departing Today', 'Forbes reviewer • Late check-out requested (1:00 PM)', FALSE, NULL),
('BK-8903', 'Elena Rostova', 'elena.rostova@monaco.mc', '+1 (555) 456-7890', '401', 'Luxury Suite', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '3 days', 6, 520.00, 'In-House', 'Celebrity guest • Valet parked Bentley #442', FALSE, NULL),
('BK-8904', 'Marcus Sterling', 'm.sterling@investcorp.com', '+1 (555) 321-7654', '502', 'Presidential Penthouse', CURRENT_DATE, CURRENT_DATE + INTERVAL '4 days', 4, 1200.00, 'Arriving Today', 'Airport limousine pickup booked for 3:00 PM', FALSE, NULL)
ON CONFLICT (id) DO NOTHING;

-- 4. MENU ITEMS
INSERT INTO menu_items (id, name, category, price, prep_time, in_stock, description, calories, image_url) VALUES
(1, 'Truffle Wagyu Burger', 'All-Day Dining', 36.00, '20-25 mins', TRUE, 'Brioche bun, caramelized onion, Gruyere, black truffle aioli, rosemary parmesan fries.', '850 kcal', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80'),
(2, 'Belgian Waffle Stack', 'Breakfast', 24.00, '15 mins', TRUE, 'Organic berry compote, Madagascar vanilla bean cream, grade-A Canadian maple syrup.', '620 kcal', 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&q=80'),
(3, 'Chilean Sea Bass', 'Chef Special', 48.00, '25-30 mins', TRUE, 'Pan-seared with saffron emulsion, baby fennel, and fingerling potato crisps.', '540 kcal', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80'),
(4, 'Valrhona Molten Fondant', 'Desserts', 18.00, '12 mins', TRUE, 'Warm molten 70% chocolate center, hazelnut praline gelato, edible 24k gold leaf.', '490 kcal', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80'),
(5, 'Smoked Salmon Bagel Royale', 'Breakfast', 26.00, '12 mins', TRUE, 'Norwegian cold-smoked salmon, dill cream cheese, caper berries, pickled red onion.', '480 kcal', 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&q=80'),
(6, 'Prime Dry-Aged Ribeye 12oz', 'Chef Special', 64.00, '30 mins', TRUE, '45-day dry aged, garlic confit butter, grilled asparagus, marrow bordelaise sauce.', '980 kcal', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80'),
(7, 'Artisanal Charcuterie & Fromage', 'All-Day Dining', 32.00, '10 mins', TRUE, 'Prosciutto di Parma, Comte 24-mo, honeycomb, Marcona almonds, house sourdough.', '610 kcal', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&q=80'),
(8, 'Signature Horizon Espresso Martini', 'Beverages', 22.00, '5 mins', TRUE, 'Grey Goose vodka, freshly pulled single-origin espresso, Kahlúa, dark chocolate rim.', '210 kcal', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80')
ON CONFLICT (id) DO NOTHING;

-- Align sequence
SELECT setval(pg_get_serial_sequence('menu_items', 'id'), coalesce(max(id), 1)) FROM menu_items;

-- 5. ORDERS
INSERT INTO orders (id, room_number, booking_id, guest_name, total, status, elapsed_minutes, notes, server_name) VALUES
('ORD-501', '301', 'BK-8902', 'Sophia Montgomery', 58.00, 'Cooking', 18, 'Burger medium-rare, extra truffle aioli on side. Quick delivery appreciated.', 'Chef Marco Bellini'),
('ORD-502', '401', 'BK-8903', 'Elena Rostova', 74.00, 'Ready', 8, 'Deliver to terrace table with heated dome covers.', 'Sous Chef David Chen'),
('ORD-503', '101', 'BK-8901', 'Lord Alexander Wright', 66.00, 'Pending', 2, 'Gluten-sensitive preparation requested. Champagne glasses on tray.', 'Unassigned')
ON CONFLICT (id) DO NOTHING;

-- 6. ORDER ITEMS
INSERT INTO order_items (order_id, menu_item_id, name, price, qty) VALUES
('ORD-501', 1, 'Truffle Wagyu Burger', 36.00, 1),
('ORD-501', 8, 'Signature Horizon Espresso Martini', 22.00, 1),
('ORD-502', 2, 'Belgian Waffle Stack', 24.00, 2),
('ORD-502', 5, 'Smoked Salmon Bagel Royale', 26.00, 1),
('ORD-503', 3, 'Chilean Sea Bass', 48.00, 1),
('ORD-503', 4, 'Valrhona Molten Fondant', 18.00, 1)
ON CONFLICT DO NOTHING;

-- 7. STAFF
INSERT INTO staff (id, name, email, role, department, shift, status, avatar_bg) VALUES
(1, 'Alexander Sterling', 'admin@efoyhotel.com', 'General Manager', 'Management', 'Morning (07:00 - 16:00)', 'Active Duty', 'bg-amber-100 text-amber-800'),
(2, 'Julian Vance', 'reception@efoyhotel.com', 'Head Receptionist', 'Front Desk', 'Morning (07:00 - 15:30)', 'Active Duty', 'bg-blue-100 text-blue-800'),
(3, 'Claire Beauchamp', 'claire.b@efoyhotel.com', 'Night Auditor / Receptionist', 'Front Desk', 'Night (23:00 - 07:30)', 'Off Duty', 'bg-indigo-100 text-indigo-800'),
(4, 'Chef Marco Bellini', 'kitchen@efoyhotel.com', 'Executive Head Chef', 'Kitchen / F&B', 'Day Shift (10:00 - 22:00)', 'Active Duty', 'bg-orange-100 text-orange-800'),
(5, 'David Chen', 'david.chen@efoyhotel.com', 'Sous Chef', 'Kitchen / F&B', 'Evening (14:00 - 23:00)', 'Active Duty', 'bg-amber-100 text-amber-800'),
(6, 'Maria Santos', 'housekeeping@efoyhotel.com', 'Senior Housekeeping Attendant', 'Housekeeping', 'Day Shift (08:00 - 16:30)', 'Active Duty', 'bg-emerald-100 text-emerald-800'),
(7, 'Carlos Morales', 'carlos.m@efoyhotel.com', 'Housekeeping & Linen Lead', 'Housekeeping', 'Day Shift (08:00 - 16:30)', 'Active Duty', 'bg-teal-100 text-teal-800')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('staff', 'id'), coalesce(max(id), 1)) FROM staff;

-- 8. HOUSEKEEPING HISTORY
INSERT INTO housekeeping_history (id, room_number, type, cleaner_name, action, completed_at, duration, inspected_by, status) VALUES
('HK-109', '201', 'Double Deluxe', 'Maria Santos', 'Full Turnover & Sanitization', CURRENT_TIMESTAMP - INTERVAL '3 hours', '28 mins', 'Elena Vance (Lead HK)', 'Passed Inspection'),
('HK-108', '301', 'Double Executive', 'Maria Santos', 'Daily Morning Refresh & Linens', CURRENT_TIMESTAMP - INTERVAL '4 hours', '18 mins', 'Elena Vance (Lead HK)', 'Passed Inspection'),
('HK-107', '501', 'Penthouse Panoramic', 'Carlos Morales', 'Deep Clean & Balcony Jet Wash', CURRENT_TIMESTAMP - INTERVAL '1 day', '45 mins', 'Elena Vance (Lead HK)', 'Passed Inspection'),
('HK-106', '101', 'Single Classic', 'Carlos Morales', 'Pre-Arrival VIP Preparation', CURRENT_TIMESTAMP - INTERVAL '1 day', '22 mins', 'Elena Vance (Lead HK)', 'Passed Inspection')
ON CONFLICT (id) DO NOTHING;

-- 9. ACTIVITY LOGS
INSERT INTO activity_logs (title, category, description, tag, created_at) VALUES
('Room 201 Cleaned & Inspected', 'Housekeeping', 'Maria Santos marked Room 201 Clean; status updated on Receptionist dashboard.', 'Housekeeping', CURRENT_TIMESTAMP - INTERVAL '12 minutes'),
('Room Service Order #ORD-501 in Preparation', 'Kitchen', 'Kitchen accepted order for Room 301 (Truffle Wagyu Burger + Martini). Charged $58 to folio.', 'Kitchen KDS', CURRENT_TIMESTAMP - INTERVAL '24 minutes'),
('VIP Arrival: Sophia Montgomery in Room 301', 'Front Desk', 'Front desk processed check-in keycard #AURA-301-8. Direct billing profile verified.', 'Front Desk', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
('Dirty Room Alert Prevented Assigned Check-in', 'Front Desk', 'System blocked assignment to Room 402 pending deep sanitization turnover.', 'Smart Alert', CURRENT_TIMESTAMP - INTERVAL '1 hour');

-- 10. SYSTEM SETTINGS
INSERT INTO system_settings (key, value) VALUES
('general', '{"hotelName": "Efoy Hotel & Suites", "taxRate": 12, "currency": "$", "checkoutTime": "11:00 AM", "checkinTime": "15:00 PM"}')
ON CONFLICT (key) DO NOTHING;
