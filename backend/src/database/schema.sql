-- Efoy Hotel & Suites — Relational Database Schema (PostgreSQL 16+)

-- 1. USERS & AUTHENTICATION
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'receptionist', 'kitchen', 'housekeeping', 'guest')),
    phone VARCHAR(50),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.5 ROOM CATEGORIES
CREATE TABLE IF NOT EXISTS room_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    base_rate NUMERIC(10, 2) NOT NULL CHECK (base_rate >= 0),
    capacity VARCHAR(50) NOT NULL,
    description TEXT,
    features TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ROOM INVENTORY
CREATE TABLE IF NOT EXISTS rooms (
    room_number VARCHAR(20) PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    floor VARCHAR(100) NOT NULL,
    capacity VARCHAR(50) NOT NULL,
    rate NUMERIC(10, 2) NOT NULL CHECK (rate >= 0),
    features TEXT,
    -- Legacy fields preserved for backward compatibility
    cleanliness VARCHAR(50) NOT NULL DEFAULT 'Clean',
    dirty_reason TEXT,
    occupancy VARCHAR(50) NOT NULL DEFAULT 'Available',
    -- Three Explicit Separated Statuses (Per Hospitality Specifications)
    occupancy_status VARCHAR(50) NOT NULL DEFAULT 'VACANT' CHECK (occupancy_status IN ('VACANT', 'OCCUPIED')),
    housekeeping_status VARCHAR(50) NOT NULL DEFAULT 'CLEAN' CHECK (housekeeping_status IN ('CLEAN', 'DIRTY', 'CLEANING', 'INSPECTION')),
    maintenance_status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK (maintenance_status IN ('AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE')),
    guest_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure columns exist if table was already created
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS occupancy_status VARCHAR(50) DEFAULT 'VACANT';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS housekeeping_status VARCHAR(50) DEFAULT 'CLEAN';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS maintenance_status VARCHAR(50) DEFAULT 'AVAILABLE';

-- 3. BOOKINGS & RESERVATIONS
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    guest_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE SET NULL,
    room_type VARCHAR(100) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INT NOT NULL CHECK (nights > 0),
    room_rate NUMERIC(10, 2) NOT NULL CHECK (room_rate >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW', 'Arriving Today', 'In-House', 'Departing Today')),
    notes TEXT,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.5 GUEST STAYS (Guest -> Reservation -> Stay -> Folio)
CREATE TABLE IF NOT EXISTS stays (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE SET NULL,
    guest_name VARCHAR(150) NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    digital_key_code VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CULINARY MENU (ROOM SERVICE)
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Breakfast', 'All-Day Dining', 'Chef Special', 'Beverages', 'Desserts')),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    prep_time VARCHAR(50) NOT NULL DEFAULT '15-20 mins',
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    calories VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ROOM SERVICE ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE CASCADE,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    guest_name VARCHAR(150) NOT NULL,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Cooking', 'Ready', 'Delivered', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    elapsed_minutes INT DEFAULT 0,
    notes TEXT,
    server_name VARCHAR(100) DEFAULT 'Unassigned',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ORDER LINE ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT REFERENCES menu_items(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    qty INT NOT NULL CHECK (qty > 0)
);

-- 7. STAFF DIRECTORY
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL CHECK (department IN ('Front Desk', 'Kitchen / F&B', 'Housekeeping', 'Management')),
    shift VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active Duty' CHECK (status IN ('Active Duty', 'Off Duty', 'On Leave')),
    avatar_bg VARCHAR(50) DEFAULT 'bg-amber-100 text-amber-800',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. HOUSEKEEPING AUDIT HISTORY
CREATE TABLE IF NOT EXISTS housekeeping_history (
    id VARCHAR(50) PRIMARY KEY,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    cleaner_name VARCHAR(150) NOT NULL,
    action TEXT NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration VARCHAR(50) DEFAULT '15 mins',
    inspected_by VARCHAR(150) DEFAULT 'Self-Certified',
    status VARCHAR(50) DEFAULT 'Passed Inspection'
);

-- 9. LIVE ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. SYSTEM CONFIGURATION & SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. FINANCIAL FOLIOS & IMMUTABLE LEDGER
CREATE TABLE IF NOT EXISTS folios (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE SET NULL,
    folio_type VARCHAR(30) NOT NULL DEFAULT 'GUEST' CHECK (folio_type IN ('GUEST', 'MASTER_CORPORATE', 'INCIDENTAL')),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'SETTLED', 'CLOSED')),
    balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS folio_transactions (
    id SERIAL PRIMARY KEY,
    folio_id VARCHAR(50) REFERENCES folios(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('CHARGE', 'PAYMENT', 'REFUND', 'VOID', 'DISCOUNT')),
    department VARCHAR(50) NOT NULL CHECK (department IN ('ROOM', 'F&B', 'SPA', 'MINIBAR', 'LAUNDRY', 'TAX', 'PAYMENT')),
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    reference_id VARCHAR(100),
    posted_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. MAINTENANCE & OUT-OF-ORDER (OOO / OOS) WORK ORDERS
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id VARCHAR(50) PRIMARY KEY,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(20) NOT NULL DEFAULT 'REPORTED' CHECK (status IN ('REPORTED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED')),
    inventory_impact VARCHAR(20) NOT NULL DEFAULT 'OUT_OF_ORDER' CHECK (inventory_impact IN ('OUT_OF_ORDER', 'OUT_OF_SERVICE', 'NONE')),
    issue_description TEXT NOT NULL,
    resolution_notes TEXT,
    reported_by VARCHAR(150) NOT NULL,
    assigned_to VARCHAR(150),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    estimated_cost NUMERIC(10, 2) DEFAULT 0.00,
    actual_cost NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. GUEST CRM & PASSPORT / ID PROFILES
CREATE TABLE IF NOT EXISTS guest_profiles (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    nationality VARCHAR(100),
    id_type VARCHAR(50) CHECK (id_type IN ('PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE')),
    id_number VARCHAR(100),
    id_scan_url TEXT,
    vip_tier VARCHAR(50) DEFAULT 'STANDARD' CHECK (vip_tier IN ('STANDARD', 'SILVER', 'GOLD', 'VIP_PRESIDENTIAL')),
    preferences TEXT,
    dietary_allergies TEXT,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    blacklist_reason TEXT,
    total_stays INT DEFAULT 0,
    lifetime_spend NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. HOUSEKEEPING QUEUE & ATTENDANT TASKS
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
    id VARCHAR(50) PRIMARY KEY,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE CASCADE,
    priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'VIP', 'CHECKOUT')),
    assigned_to VARCHAR(150),
    status VARCHAR(50) NOT NULL DEFAULT 'DIRTY' CHECK (status IN ('DIRTY', 'CLEANING', 'INSPECTION', 'CLEAN')),
    start_time TIMESTAMP WITH TIME ZONE,
    completion_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. CONCIERGE & WHITE-GLOVE SERVICE REQUESTS
CREATE TABLE IF NOT EXISTS service_requests (
    id VARCHAR(50) PRIMARY KEY,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE CASCADE,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    guest_name VARCHAR(150) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    details TEXT,
    priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    department VARCHAR(50) NOT NULL DEFAULT 'Front Desk' CHECK (department IN ('Front Desk', 'Housekeeping', 'Concierge', 'Valet', 'Maintenance')),
    assigned_to VARCHAR(150),
    charge_amount NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. KITCHEN INVENTORY & INGREDIENT 86 TRACKING
CREATE TABLE IF NOT EXISTS inventory_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Kitchen',
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL DEFAULT 'units',
    min_stock NUMERIC(10, 2) NOT NULL DEFAULT 5,
    cost_per_unit NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_STOCK' CHECK (status IN ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK')),
    linked_menu_item_id INT REFERENCES menu_items(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. NIGHT AUDIT & DAILY FINANCIAL CLOSING LOGS
CREATE TABLE IF NOT EXISTS night_audit_logs (
    id SERIAL PRIMARY KEY,
    business_date DATE NOT NULL UNIQUE,
    closed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    auditor_id INT REFERENCES users(id) ON DELETE SET NULL,
    rooms_occupied INT NOT NULL,
    total_available_rooms INT NOT NULL,
    rooms_out_of_order INT NOT NULL DEFAULT 0,
    occupancy_rate NUMERIC(5, 2) NOT NULL,
    total_room_revenue NUMERIC(12, 2) NOT NULL,
    total_fnb_revenue NUMERIC(12, 2) NOT NULL,
    total_tax_collected NUMERIC(12, 2) NOT NULL,
    adr NUMERIC(10, 2) NOT NULL,
    revpar NUMERIC(10, 2) NOT NULL,
    notes TEXT
);

-- INDICES FOR HIGH QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_rooms_occupancy ON rooms(occupancy);
CREATE INDEX IF NOT EXISTS idx_rooms_cleanliness ON rooms(cleanliness);
CREATE INDEX IF NOT EXISTS idx_rooms_occupancy_status ON rooms(occupancy_status);
CREATE INDEX IF NOT EXISTS idx_rooms_housekeeping_status ON rooms(housekeeping_status);
CREATE INDEX IF NOT EXISTS idx_rooms_maintenance_status ON rooms(maintenance_status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_room ON orders(room_number);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_folio_booking ON folios(booking_id);
CREATE INDEX IF NOT EXISTS idx_folio_trans_folio ON folio_transactions(folio_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_room ON maintenance_tickets(room_number);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_tickets(status);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_email ON guest_profiles(email);
CREATE INDEX IF NOT EXISTS idx_night_audit_date ON night_audit_logs(business_date);
CREATE INDEX IF NOT EXISTS idx_hk_tasks_room ON housekeeping_tasks(room_number);
CREATE INDEX IF NOT EXISTS idx_hk_tasks_status ON housekeeping_tasks(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_room ON service_requests(room_number);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_items(status);

-- SYNCHRONIZE ROOM STATUS VALUES
UPDATE rooms 
SET occupancy_status = CASE 
  WHEN occupancy = 'Occupied' THEN 'OCCUPIED' 
  ELSE 'VACANT' 
END 
WHERE occupancy_status IS NULL OR occupancy_status = 'VACANT';

UPDATE rooms 
SET housekeeping_status = CASE 
  WHEN cleanliness ILIKE 'Dirty' THEN 'DIRTY'
  WHEN cleanliness ILIKE 'Cleaning' THEN 'CLEANING'
  WHEN cleanliness ILIKE 'Inspected' OR cleanliness ILIKE 'Inspection' THEN 'INSPECTION'
  ELSE 'CLEAN'
END;

UPDATE rooms 
SET maintenance_status = 'AVAILABLE' 
WHERE maintenance_status IS NULL;
