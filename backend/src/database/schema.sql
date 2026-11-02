-- Efoy Hotel & Suites — Relational Database Schema (PostgreSQL 16+)
-- Architecture Updated per DATABASE_ARCHITECTURE.md Specification

-- 1. USERS & RBAC SECURITY
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'guest' CHECK (role IN ('admin', 'receptionist', 'kitchen', 'housekeeping', 'maintenance', 'manager', 'guest')),
    phone VARCHAR(50),
    avatar_url VARCHAR(255),
    department VARCHAR(100) DEFAULT 'General',
    shift VARCHAR(100) DEFAULT 'Day Shift (08:00 - 16:30)',
    status VARCHAR(50) DEFAULT 'Active Duty',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'General';
ALTER TABLE users ADD COLUMN IF NOT EXISTS shift VARCHAR(100) DEFAULT 'Day Shift (08:00 - 16:30)';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active Duty';

-- Roles and Fine-Grained Permissions
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 1.5 ROOM CATEGORIES
CREATE TABLE IF NOT EXISTS room_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    base_rate NUMERIC(12, 2) NOT NULL CHECK (base_rate >= 0),
    capacity VARCHAR(50) NOT NULL,
    default_capacity INT DEFAULT 2,
    description TEXT,
    features TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE room_categories ADD COLUMN IF NOT EXISTS default_capacity INT DEFAULT 2;

-- 1.6 RATE PLANS
CREATE TABLE IF NOT EXISTS rate_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cancellation_policy TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ROOM INVENTORY & PHYSICAL ROOMS
CREATE TABLE IF NOT EXISTS rooms (
    room_number VARCHAR(20) PRIMARY KEY,
    category_id INT REFERENCES room_categories(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL,
    floor VARCHAR(100) NOT NULL,
    capacity VARCHAR(50) NOT NULL,
    rate NUMERIC(12, 2) NOT NULL CHECK (rate >= 0),
    features TEXT,
    cleanliness VARCHAR(50) NOT NULL DEFAULT 'Clean',
    dirty_reason TEXT,
    occupancy VARCHAR(50) NOT NULL DEFAULT 'Available',
    -- Three Explicit Decoupled Hospitality Statuses
    occupancy_status VARCHAR(50) NOT NULL DEFAULT 'VACANT' CHECK (occupancy_status IN ('VACANT', 'OCCUPIED')),
    housekeeping_status VARCHAR(50) NOT NULL DEFAULT 'CLEAN' CHECK (housekeeping_status IN ('CLEAN', 'DIRTY', 'CLEANING', 'INSPECTION')),
    maintenance_status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK (maintenance_status IN ('AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE')),
    guest_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS category_id INT REFERENCES room_categories(id) ON DELETE SET NULL;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS occupancy_status VARCHAR(50) DEFAULT 'VACANT';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS housekeeping_status VARCHAR(50) DEFAULT 'CLEAN';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS maintenance_status VARCHAR(50) DEFAULT 'AVAILABLE';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2.5 ROOM BLOCKS (Maintenance, VIP hold, Owner use)
CREATE TABLE IF NOT EXISTS room_blocks (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL CHECK (end_date >= start_date),
    reason TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RELEASED', 'CANCELLED')),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.8 GUEST CRM & PASSPORT / ID PROFILES
CREATE TABLE IF NOT EXISTS guest_profiles (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
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

ALTER TABLE guest_profiles ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE SET NULL;

-- 3. BOOKINGS & RESERVATIONS
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    guest_profile_id VARCHAR(50) REFERENCES guest_profiles(id) ON DELETE SET NULL,
    guest_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE SET NULL,
    room_category_id INT REFERENCES room_categories(id) ON DELETE SET NULL,
    rate_plan_id INT REFERENCES rate_plans(id) ON DELETE SET NULL,
    room_type VARCHAR(100) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL CHECK (check_out > check_in),
    nights INT NOT NULL CHECK (nights > 0),
    guest_count INT DEFAULT 1,
    room_rate NUMERIC(12, 2) NOT NULL CHECK (room_rate >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'ETB',
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    booking_source VARCHAR(50) DEFAULT 'DIRECT_WEB',
    special_requests TEXT,
    notes TEXT,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_profile_id VARCHAR(50) REFERENCES guest_profiles(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_category_id INT REFERENCES room_categories(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rate_plan_id INT REFERENCES rate_plans(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_count INT DEFAULT 1;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS currency CHAR(3) DEFAULT 'ETB';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_source VARCHAR(50) DEFAULT 'DIRECT_WEB';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requests TEXT;

-- 3.2 BOOKING STATUS HISTORY (Audit Trail)
CREATE TABLE IF NOT EXISTS booking_status_history (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.5 GUEST STAYS (Checked-In Occupancy)
CREATE TABLE IF NOT EXISTS stays (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE SET NULL,
    guest_name VARCHAR(150) NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    digital_key_code VARCHAR(100),
    digital_key_reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE stays ADD COLUMN IF NOT EXISTS digital_key_reference VARCHAR(100);

-- 4. FINANCIAL FOLIOS & IMMUTABLE LEDGER
CREATE TABLE IF NOT EXISTS folios (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE SET NULL,
    folio_type VARCHAR(30) NOT NULL DEFAULT 'GUEST' CHECK (folio_type IN ('GUEST', 'MASTER_CORPORATE', 'INCIDENTAL')),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'SETTLED', 'CLOSED')),
    currency CHAR(3) NOT NULL DEFAULT 'ETB',
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE folios ADD COLUMN IF NOT EXISTS currency CHAR(3) DEFAULT 'ETB';

CREATE TABLE IF NOT EXISTS folio_transactions (
    id SERIAL PRIMARY KEY,
    folio_id VARCHAR(50) REFERENCES folios(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('CHARGE', 'PAYMENT', 'REFUND', 'VOID', 'DISCOUNT')),
    -- Explicitly excluded LAUNDRY per specification
    department VARCHAR(50) NOT NULL CHECK (department IN ('ROOM', 'F&B', 'SPA', 'MINIBAR', 'TAX', 'PAYMENT')),
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    reference_type VARCHAR(50),
    reference_id VARCHAR(100),
    posted_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE folio_transactions ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50);
ALTER TABLE folio_transactions ADD COLUMN IF NOT EXISTS reference_id VARCHAR(100);

-- 4.5 CHAPA PAYMENTS & AUDIT LEDGER
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    folio_id VARCHAR(50) REFERENCES folios(id) ON DELETE SET NULL,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'ETB',
    provider VARCHAR(50) NOT NULL DEFAULT 'CHAPA',
    provider_tx_ref VARCHAR(100) UNIQUE NOT NULL,
    checkout_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESSFUL', 'FAILED', 'CANCELLED', 'EXPIRED')),
    payment_type VARCHAR(50) DEFAULT 'ONLINE' CHECK (payment_type IN ('ONLINE', 'POS', 'CASH', 'TRANSFER', 'REFUND')),
    idempotency_key VARCHAR(100) UNIQUE,
    paid_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_webhook_events (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL DEFAULT 'CHAPA',
    provider_event_id VARCHAR(100),
    tx_ref VARCHAR(100),
    payload JSONB NOT NULL,
    signature_valid BOOLEAN DEFAULT TRUE,
    processing_status VARCHAR(50) NOT NULL DEFAULT 'RECEIVED' CHECK (processing_status IN ('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED')),
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 4.8 FORMAL INVOICES
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    folio_id VARCHAR(50) REFERENCES folios(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    issued_to_name VARCHAR(150) NOT NULL,
    issued_to_tax_id VARCHAR(100),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency CHAR(3) NOT NULL DEFAULT 'ETB',
    status VARCHAR(50) NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('DRAFT', 'ISSUED', 'PAID', 'CANCELLED')),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    line_total NUMERIC(12, 2) NOT NULL
);

-- 5. CULINARY MENU (ROOM SERVICE)
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Breakfast', 'All-Day Dining', 'Chef Special', 'Beverages', 'Desserts')),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'ETB',
    prep_time VARCHAR(50) NOT NULL DEFAULT '15-20 mins',
    prep_time_minutes INT DEFAULT 20,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    calories VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS currency CHAR(3) DEFAULT 'ETB';
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS prep_time_minutes INT DEFAULT 20;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;

-- 5.2 INVENTORY & STOCK ITEMS
CREATE TABLE IF NOT EXISTS inventory_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Kitchen',
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
    quantity_on_hand NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL DEFAULT 'units',
    min_stock NUMERIC(12, 2) NOT NULL DEFAULT 5,
    minimum_quantity NUMERIC(12, 2) NOT NULL DEFAULT 5,
    cost_per_unit NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_STOCK' CHECK (status IN ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK')),
    linked_menu_item_id INT REFERENCES menu_items(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS quantity_on_hand NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS minimum_quantity NUMERIC(12, 2) DEFAULT 5;

-- 5.4 RECIPES & RECIPE ITEMS (Many-to-Many Recipe Mapping)
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    menu_item_id INT UNIQUE REFERENCES menu_items(id) ON DELETE CASCADE,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipe_items (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
    inventory_item_id INT REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity_required NUMERIC(12, 2) NOT NULL CHECK (quantity_required > 0),
    unit VARCHAR(50) NOT NULL
);

-- 5.6 AUDITABLE STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    inventory_item_id INT REFERENCES inventory_items(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('PURCHASE', 'USAGE', 'WASTE', 'CORRECTION', 'ORDER_CONSUMPTION')),
    quantity NUMERIC(12, 2) NOT NULL,
    unit_cost NUMERIC(12, 2) DEFAULT 0.00,
    reference_type VARCHAR(50),
    reference_id VARCHAR(100),
    performed_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ROOM SERVICE ORDERS & KITCHEN DISPLAY
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE CASCADE,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    guest_profile_id VARCHAR(50) REFERENCES guest_profiles(id) ON DELETE SET NULL,
    guest_name VARCHAR(150) NOT NULL,
    order_type VARCHAR(50) DEFAULT 'ROOM_SERVICE' CHECK (order_type IN ('ROOM_SERVICE', 'RESTAURANT', 'BAR')),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency CHAR(3) NOT NULL DEFAULT 'ETB',
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Cooking', 'Ready', 'Delivered', 'Cancelled', 'PENDING', 'ACCEPTED', 'COOKING', 'READY', 'DELIVERED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    elapsed_minutes INT DEFAULT 0,
    notes TEXT,
    server_name VARCHAR(100) DEFAULT 'Unassigned',
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_profile_id VARCHAR(50) REFERENCES guest_profiles(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'ROOM_SERVICE';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_total NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency CHAR(3) DEFAULT 'ETB';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by INT REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT REFERENCES menu_items(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    item_name_snapshot VARCHAR(150),
    price NUMERIC(12, 2) NOT NULL,
    unit_price_snapshot NUMERIC(12, 2),
    qty INT NOT NULL CHECK (qty > 0),
    quantity INT DEFAULT 1,
    line_total NUMERIC(12, 2),
    notes TEXT
);

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_name_snapshot VARCHAR(150);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price_snapshot NUMERIC(12, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS line_total NUMERIC(12, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS notes TEXT;

-- 7. STAFF DIRECTORY (Preserved & Unified with users)
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL CHECK (department IN ('Front Desk', 'Kitchen / F&B', 'Housekeeping', 'Management', 'Maintenance')),
    shift VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active Duty' CHECK (status IN ('Active Duty', 'Off Duty', 'On Leave')),
    avatar_bg VARCHAR(50) DEFAULT 'bg-amber-100 text-amber-800',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. HOUSEKEEPING QUEUE & ATTENDANT TASKS
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
    id VARCHAR(50) PRIMARY KEY,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE CASCADE,
    priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'VIP', 'CHECKOUT')),
    assigned_to VARCHAR(150),
    assigned_to_id INT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DIRTY' CHECK (status IN ('DIRTY', 'CLEANING', 'INSPECTION', 'CLEAN')),
    start_time TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completion_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE housekeeping_tasks ADD COLUMN IF NOT EXISTS assigned_to_id INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE housekeeping_tasks ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS housekeeping_history (
    id VARCHAR(50) PRIMARY KEY,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE CASCADE,
    task_id VARCHAR(50) REFERENCES housekeeping_tasks(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL DEFAULT 'Turnover',
    cleaner_name VARCHAR(150) NOT NULL,
    cleaner_id INT REFERENCES users(id) ON DELETE SET NULL,
    inspected_by VARCHAR(150) DEFAULT 'Self-Certified',
    inspected_by_id INT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    notes TEXT,
    duration VARCHAR(50) DEFAULT '15 mins',
    duration_minutes INT DEFAULT 15,
    status VARCHAR(50) DEFAULT 'Passed Inspection',
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE housekeeping_history ADD COLUMN IF NOT EXISTS task_id VARCHAR(50) REFERENCES housekeeping_tasks(id) ON DELETE SET NULL;
ALTER TABLE housekeeping_history ADD COLUMN IF NOT EXISTS cleaner_id INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE housekeeping_history ADD COLUMN IF NOT EXISTS inspected_by_id INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE housekeeping_history ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE housekeeping_history ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 15;

-- 9. CONCIERGE & WHITE-GLOVE SERVICE REQUESTS
CREATE TABLE IF NOT EXISTS service_requests (
    id VARCHAR(50) PRIMARY KEY,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE CASCADE,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    guest_profile_id VARCHAR(50) REFERENCES guest_profiles(id) ON DELETE SET NULL,
    guest_name VARCHAR(150) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    details TEXT,
    priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    department VARCHAR(50) NOT NULL DEFAULT 'Front Desk' CHECK (department IN ('Front Desk', 'Housekeeping', 'Concierge', 'Valet', 'Maintenance')),
    assigned_to VARCHAR(150),
    assigned_to_id INT REFERENCES users(id) ON DELETE SET NULL,
    charge_amount NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS guest_profile_id VARCHAR(50) REFERENCES guest_profiles(id) ON DELETE SET NULL;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS assigned_to_id INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- 10. MAINTENANCE & OUT-OF-ORDER (OOO / OOS) WORK ORDERS
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id VARCHAR(50) PRIMARY KEY,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(20) NOT NULL DEFAULT 'REPORTED' CHECK (status IN ('REPORTED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED')),
    inventory_impact VARCHAR(20) NOT NULL DEFAULT 'OUT_OF_ORDER' CHECK (inventory_impact IN ('OUT_OF_ORDER', 'OUT_OF_SERVICE', 'NONE')),
    issue_description TEXT NOT NULL,
    resolution_notes TEXT,
    reported_by VARCHAR(150) NOT NULL,
    reported_by_id INT REFERENCES users(id) ON DELETE SET NULL,
    assigned_to VARCHAR(150),
    assigned_to_id INT REFERENCES users(id) ON DELETE SET NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    estimated_cost NUMERIC(12, 2) DEFAULT 0.00,
    actual_cost NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE maintenance_tickets ADD COLUMN IF NOT EXISTS reported_by_id INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE maintenance_tickets ADD COLUMN IF NOT EXISTS assigned_to_id INT REFERENCES users(id) ON DELETE SET NULL;

-- 11. NIGHT AUDIT & DAILY FINANCIAL CLOSING LOGS
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
    adr NUMERIC(12, 2) NOT NULL,
    revpar NUMERIC(12, 2) NOT NULL,
    notes TEXT
);

-- 12. AUDIT TRAIL & ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    tag VARCHAR(100) NOT NULL,
    action VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS action VARCHAR(100);
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100);
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS entity_id VARCHAR(100);
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS details JSONB;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(100);

-- 13. SYSTEM CONFIGURATION & SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by INT REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS updated_by INT REFERENCES users(id) ON DELETE SET NULL;

-- PERFORMANCE INDICES
CREATE INDEX IF NOT EXISTS idx_rooms_occupancy ON rooms(occupancy);
CREATE INDEX IF NOT EXISTS idx_rooms_cleanliness ON rooms(cleanliness);
CREATE INDEX IF NOT EXISTS idx_rooms_occupancy_status ON rooms(occupancy_status);
CREATE INDEX IF NOT EXISTS idx_rooms_housekeeping_status ON rooms(housekeeping_status);
CREATE INDEX IF NOT EXISTS idx_rooms_maintenance_status ON rooms(maintenance_status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_profile ON bookings(guest_profile_id);
CREATE INDEX IF NOT EXISTS idx_room_blocks_dates ON room_blocks(room_number, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_room ON orders(room_number);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_folio_booking ON folios(booking_id);
CREATE INDEX IF NOT EXISTS idx_folio_trans_folio ON folio_transactions(folio_id);
CREATE INDEX IF NOT EXISTS idx_payments_tx_ref ON payments(provider_tx_ref);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_invoices_folio ON invoices(folio_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_room ON maintenance_tickets(room_number);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_tickets(status);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_email ON guest_profiles(email);
CREATE INDEX IF NOT EXISTS idx_night_audit_date ON night_audit_logs(business_date);
CREATE INDEX IF NOT EXISTS idx_hk_tasks_room ON housekeeping_tasks(room_number);
CREATE INDEX IF NOT EXISTS idx_hk_tasks_status ON housekeeping_tasks(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_room ON service_requests(room_number);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON stock_movements(inventory_item_id);

-- 14. BOOKING GROUPS (Corporate & Group Reservations)
CREATE TABLE IF NOT EXISTS booking_groups (
    id VARCHAR(50) PRIMARY KEY,
    group_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(150) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    total_rooms INT NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_policy_id INT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS group_id VARCHAR(50) REFERENCES booking_groups(id) ON DELETE SET NULL;

ALTER TABLE guest_profiles ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0;
ALTER TABLE guest_profiles ADD COLUMN IF NOT EXISTS complaint_history TEXT;
ALTER TABLE guest_profiles ADD COLUMN IF NOT EXISTS vip_benefits TEXT;

-- 15. IN-APP NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50),
    type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. GUEST COMPLAINTS & FEEDBACK
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE SET NULL,
    guest_name VARCHAR(150) NOT NULL,
    department VARCHAR(50) DEFAULT 'Front Desk',
    issue_category VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_INVESTIGATION', 'RESOLVED', 'CLOSED')),
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS guest_feedback (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    guest_name VARCHAR(150) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. MINIBAR MANAGEMENT
CREATE TABLE IF NOT EXISTS minibar_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) DEFAULT 'Beverage',
    price NUMERIC(10, 2) NOT NULL,
    in_stock INT DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS minibar_consumptions (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE CASCADE,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
    minibar_item_id INT REFERENCES minibar_items(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_charge NUMERIC(10, 2) NOT NULL,
    recorded_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS minibar_restock_logs (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE CASCADE,
    minibar_item_id INT REFERENCES minibar_items(id) ON DELETE CASCADE,
    quantity_restocked INT NOT NULL CHECK (quantity_restocked > 0),
    restocked_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PERFORMANCE INDICES
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_minibar_room ON minibar_consumptions(room_number);

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
