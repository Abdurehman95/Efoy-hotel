# 🏨 Efoy Hotel & Suites — PERN Backend Architecture & Implementation Plan

> **Stack**: **P**ostgreSQL • **E**xpress.js • **R**eact 19 (Frontend) • **N**ode.js  
> **Target System**: Enterprise Luxury Hotel Property Management System (PMS) & Operational Dashboards  
> **Document Version**: 1.0.0  
> **Status**: Ready for Implementation  

---

## 📑 Table of Contents
1. [Executive Overview](#1-executive-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [PostgreSQL Database Design & ERD](#3-postgresql-database-design--erd)
4. [Backend Directory & Modular Structure](#4-backend-directory--modular-structure)
5. [Authentication & Role-Based Access Control (RBAC)](#5-authentication--role-based-access-control-rbac)
6. [API Specifications & Endpoints](#6-api-specifications--endpoints)
7. [Business Logic & Cross-Operational Workflows](#7-business-logic--cross-operational-workflows)
8. [Real-Time Synchronization Strategy](#8-real-time-synchronization-strategy)
9. [Frontend Integration Roadmap](#9-frontend-integration-roadmap)
10. [Step-by-Step Implementation Phases](#10-step-by-step-implementation-phases)
11. [Security, Performance & Deployment Best Practices](#11-security-performance--deployment-best-practices)

---

## 1. Executive Overview

The **Efoy Hotel & Suites** platform currently runs with a feature-rich, multi-role React 19 frontend supporting 5 dedicated operational portals:
1. **👑 Administrator (GM)**: Executive KPIs, Chart.js analytics, inventory tariffs, catalog control, staff directory, and audit trails.
2. **🔔 Front Desk (Receptionist)**: Real-time room assignments, walk-in reservations, smart dirty room alerts, folio settlement, and invoice generation.
3. **👨‍🍳 Kitchen Display System (KDS)**: Real-time room service queue, culinary timers, prep status updates.
4. **🧹 Housekeeping Hub**: Room turnover board, one-click cleaning certification, inspection logs.
5. **👤 Guest & Member Portal**: Online suite booking, in-room dining orders, digital stay folio.

### Objective
Transition the existing frontend from client-side `localStorage` mock persistence to a robust, scalable, concurrent **Node.js/Express** RESTful backend backed by a relational **PostgreSQL** database, ensuring data integrity, transactional safety (e.g. double-booking prevention), and real-time status synchronization across all 5 hotel stations.

---

## 2. High-Level Architecture

```
                                  ┌──────────────────────────────────────────────┐
                                  │               React 19 Client                │
                                  │   (Public Landing + 5 Authenticated Portals) │
                                  └──────────────────────┬───────────────────────┘
                                                         │ HTTPS / JSON & WSS
                                                         ▼
                                  ┌──────────────────────────────────────────────┐
                                  │               Nginx / Reverse Proxy          │
                                  └──────────────────────┬───────────────────────┘
                                                         │
                                                         ▼
                                  ┌──────────────────────────────────────────────┐
                                  │            Express.js REST API Server        │
                                  │  ──────────────────────────────────────────  │
                                  │  • CORS, Helmet, Rate Limiting               │
                                  │  • JWT Auth & RBAC Middleware               │
                                  │  • Controllers & Business Validation        │
                                  │  • Socket.io Gateway (Real-Time Events)     │
                                  └──────────────────────┬───────────────────────┘
                                                         │ Pool Queries / Transactions
                                                         ▼
                                  ┌──────────────────────────────────────────────┐
                                  │            PostgreSQL 16+ Database           │
                                  │  ──────────────────────────────────────────  │
                                  │  • users & roles      • rooms & inventory    │
                                  │  • bookings & folios  • menu_items & orders  │
                                  │  • staff_members      • audit_logs & hk_logs │
                                  └──────────────────────────────────────────────┘
```

---

## 3. PostgreSQL Database Design & ERD

### 3.1 Relational Schema Blueprint

```sql
-- 1. USERS & AUTHENTICATION
CREATE TABLE users (
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

-- 2. ROOM INVENTORY
CREATE TABLE rooms (
    room_number VARCHAR(20) PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    floor VARCHAR(100) NOT NULL,
    capacity VARCHAR(50) NOT NULL,
    rate NUMERIC(10, 2) NOT NULL CHECK (rate >= 0),
    features TEXT,
    cleanliness VARCHAR(50) NOT NULL DEFAULT 'Clean' CHECK (cleanliness IN ('Clean', 'Dirty', 'Cleaning', 'Inspected')),
    dirty_reason TEXT,
    occupancy VARCHAR(50) NOT NULL DEFAULT 'Available' CHECK (occupancy IN ('Available', 'Occupied', 'Reserved')),
    guest_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. BOOKINGS & RESERVATIONS
CREATE TABLE bookings (
    id VARCHAR(50) PRIMARY KEY, -- e.g. BK-8901
    guest_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    room_number VARCHAR(20) REFERENCES rooms(room_number) ON DELETE SET NULL,
    room_type VARCHAR(100) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INT NOT NULL CHECK (nights > 0),
    room_rate NUMERIC(10, 2) NOT NULL CHECK (room_rate >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'In-House' CHECK (status IN ('Arriving Today', 'In-House', 'Departing Today', 'Checked Out', 'Cancelled')),
    notes TEXT,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CULINARY MENU (ROOM SERVICE)
CREATE TABLE menu_items (
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
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY, -- e.g. ORD-501
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
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT REFERENCES menu_items(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    qty INT NOT NULL CHECK (qty > 0)
);

-- 7. STAFF DIRECTORY
CREATE TABLE staff (
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
CREATE TABLE housekeeping_history (
    id VARCHAR(50) PRIMARY KEY, -- e.g. HK-109
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
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. SYSTEM CONFIGURATION & SETTINGS
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Performance Indices
```sql
CREATE INDEX idx_rooms_occupancy ON rooms(occupancy);
CREATE INDEX idx_rooms_cleanliness ON rooms(cleanliness);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_room ON orders(room_number);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
```

---

## 4. Backend Directory & Modular Structure

The backend will live in `/backend` side-by-side with the existing `/frontend`:

```
Efoy-hotel/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # PostgreSQL pg.Pool connection & event listeners
│   │   │   ├── env.js                # Validated environment variables (dotenv/zod)
│   │   │   └── socket.js             # Socket.io server instance & room dispatchers
│   │   ├── controllers/
│   │   │   ├── authController.js     # Login, register, profile, token refresh
│   │   │   ├── roomController.js     # CRUD rooms, occupancy, cleanliness toggle
│   │   │   ├── bookingController.js  # Walk-in, online booking, check-in, checkout, folios
│   │   │   ├── menuController.js     # Menu CRUD, stock availability toggle
│   │   │   ├── orderController.js    # KDS orders, status advancement, items
│   │   │   ├── staffController.js    # Personnel directory & shift management
│   │   │   ├── hkController.js       # Housekeeping turnover logs, clean room action
│   │   │   ├── logController.js      # Activity audit stream
│   │   │   └── settingsController.js # Hotel tax, currency, and reset demo data
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT token verification & user injection
│   │   │   ├── roleMiddleware.js     # Granular role guards (e.g. checkRole(['admin', 'receptionist']))
│   │   │   ├── validator.js          # Request body schemas (Joi / Zod validation)
│   │   │   └── errorHandler.js       # Centralized JSON error formatting & status codes
│   │   ├── database/
│   │   │   ├── schema.sql            # Table definitions, constraints, indices
│   │   │   ├── seed.sql              # Initial luxury hotel seed data (matching frontend)
│   │   │   └── migrate.js            # Automated migration execution runner
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth/*
│   │   │   ├── roomRoutes.js         # /api/rooms/*
│   │   │   ├── bookingRoutes.js      # /api/bookings/*
│   │   │   ├── menuRoutes.js         # /api/menu/*
│   │   │   ├── orderRoutes.js        # /api/orders/*
│   │   │   ├── staffRoutes.js        # /api/staff/*
│   │   │   ├── hkRoutes.js           # /api/housekeeping/*
│   │   │   ├── logRoutes.js          # /api/logs/*
│   │   │   └── settingsRoutes.js     # /api/settings/*
│   │   ├── utils/
│   │   │   ├── folioCalculator.js    # Room charge + dining + 12% tax computations
│   │   │   └── logger.js             # Winston / Morgan HTTP logging
│   │   ├── app.js                    # Express application configuration
│   │   └── server.js                 # HTTP listener + Socket.io server bootstrap
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/                         # Existing React 19 Client
└── plan.md                           # This Architecture Plan
```

---

## 5. Authentication & Role-Based Access Control (RBAC)

### 5.1 Token Strategy
- **Authentication**: Stateless JSON Web Tokens (`jsonwebtoken`).
- **Signature Payload**: `{ id: user.id, email: user.email, role: user.role, name: user.name }`.
- **Expiry**: `7d` for demo convenience (or access token `15m` + refresh token in production).
- **Passwords**: Hashed with `bcryptjs` (salt rounds: 10).

### 5.2 Role Permission Matrix

| Resource / Endpoint | Guest | Housekeeping | Kitchen KDS | Front Desk | Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| **Public Website & Suites** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Online Room Booking** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Order In-Room Dining** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Front Desk Check-in / Assign** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Folio Settlement & Invoice** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Dirty Room Alert Override** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Kitchen KDS Order Status** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Dish Stock Toggle** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **One-Click Clean Certification**| ❌ | ✅ | ❌ | ❌ | ✅ |
| **Room Inventory & Tariffs** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Menu Catalog Management** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Staff Personnel Directory** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Chart.js Financial Analytics** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **System Settings & Reset** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 6. API Specifications & Endpoints

### 6.1 Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate with email and password; returns JWT token + user object.
- `POST /api/auth/register`: Create a member/guest account.
- `GET /api/auth/me`: Validate token and return current session user.

### 6.2 Rooms & Inventory (`/api/rooms`)
- `GET /api/rooms`: List all rooms with status, occupancy, cleanliness, and active booking ID.
- `GET /api/rooms/:roomNumber`: Get detailed room attributes and active occupant.
- `POST /api/rooms`: Create a new room unit (Admin only).
- `PUT /api/rooms/:roomNumber`: Update room tariff, capacity, floor, features (Admin only).
- `PATCH /api/rooms/:roomNumber/cleanliness`: Mark room clean, dirty, or cleaning (HK / Front Desk).
- `DELETE /api/rooms/:roomNumber`: Delete room from inventory (Admin only).

### 6.3 Bookings & Reservations (`/api/bookings`)
- `GET /api/bookings`: Retrieve all bookings with query filters (`status`, `search`, `checkIn`).
- `GET /api/bookings/:id`: Retrieve single booking with stay breakdown.
- `POST /api/bookings`: Create reservation (Online Guest or Walk-In Front Desk).
- `PATCH /api/bookings/:id/assign`: Assign or change room number; verifies cleanliness and returns smart dirty warning if uncleaned.
- `GET /api/bookings/folio/:roomNumber`: Calculate live room folio (tariff * nights + culinary orders + 12% luxury tax).
- `POST /api/bookings/checkout/:roomNumber`: Process payment, settle folio, mark room dirty for housekeeping, mark booking checked out.
- `POST /api/bookings/:id/undo-checkout`: Reopen stay to In-House status.

### 6.4 Culinary & In-Room Dining (`/api/menu` & `/api/orders`)
- `GET /api/menu`: List in-room dining catalog.
- `POST /api/menu`: Add dish item (Admin only).
- `PUT /api/menu/:id`: Update dish pricing, prep time, description (Admin only).
- `PATCH /api/menu/:id/toggle-stock`: Toggle item availability (Admin / Kitchen).
- `DELETE /api/menu/:id`: Remove item from catalog (Admin only).
- `GET /api/orders`: List room service orders for KDS.
- `POST /api/orders`: Place food order from Guest portal or Front Desk.
- `PATCH /api/orders/:id/status`: Update order status (`Pending` → `Cooking` → `Ready` → `Delivered`).

### 6.5 Staff Personnel Directory (`/api/staff`)
- `GET /api/staff`: List hotel staff directory with department and duty status.
- `POST /api/staff`: Add staff member (Admin only).
- `PUT /api/staff/:id`: Update role, shift schedule, department, or status (Admin only).
- `DELETE /api/staff/:id`: Remove staff member (Admin only).

### 6.6 Housekeeping & Audit Trail (`/api/housekeeping` & `/api/logs`)
- `GET /api/housekeeping/history`: Audit log of cleaning turnovers.
- `POST /api/housekeeping/clean`: One-click room cleaning certification.
- `GET /api/logs`: Live chronological activity logs stream.

### 6.7 Analytics & Settings (`/api/analytics` & `/api/settings`)
- `GET /api/analytics/overview`: Aggregated KPI stats (Total revenue today, live occupancy %, active staff, 7-day revenue dataset, room type yield).
- `GET /api/settings`: Get hotel tax rates and currency.
- `PUT /api/settings`: Update configuration (Admin only).
- `POST /api/settings/reset-demo`: Reset database to original luxury demo seed state.

---

## 7. Business Logic & Cross-Operational Workflows

### 7.1 Smart Dirty Room Alert on Check-in
```
[Front Desk attempts room assignment]
               │
               ▼
   Is room marked 'Dirty'?
      ├── YES ──► Check 'forceOverride' flag
      │             ├── FALSE ──► Return 400 with warning:
      │             │             "Room 402 is Dirty. Violates 5-star protocol."
      │             └── TRUE  ──► Assign room, log override audit event
      └── NO  ──► Assign room, update occupancy='Occupied', status='In-House'
```

### 7.2 Guest Folio Settlement & Automated Turnover Flagging
When `checkoutGuest(roomNumber)` is invoked:
1. Fetch active booking and all linked room service orders.
2. Calculate: `roomTotal = roomRate * nights`, `foodTotal = sum(orders.total)`, `tax = (roomTotal + foodTotal) * 0.12`, `grandTotal = roomTotal + foodTotal + tax`.
3. Set `bookings.paid = true`, `bookings.status = 'Checked Out'`, `bookings.payment_method = method`.
4. Set `rooms.occupancy = 'Available'`, `rooms.cleanliness = 'Dirty'`, `rooms.dirty_reason = 'Guest checked out today • Full turnover required'`, `rooms.guest_id = null`.
5. Broadcast real-time event to Housekeeping Hub and Front Desk.
6. Insert audit trail record in `activity_logs`.

### 7.3 Room Service Order Direct Billing
When a guest in Room 301 orders a Truffle Wagyu Burger + Espresso Martini ($58.00):
1. Order is inserted into `orders` with `status = 'Pending'` and linked to Room 301.
2. Broadcast to Kitchen KDS with audio chime trigger.
3. Automatically included in Room 301 master folio without manual Front Desk intervention.

---

## 8. Real-Time Synchronization Strategy

To eliminate manual page refreshes when a cleaner marks a room clean or a chef finishes cooking an order:

- **Socket.io Integration**:
  - `ROOM_STATUS_CHANGED`: Emitted when room cleanliness or occupancy updates (receptionist & housekeeping update instantly).
  - `ORDER_PLACED` & `ORDER_STATUS_CHANGED`: Emitted when orders are created or move along KDS stages.
  - `BOOKING_CREATED` & `CHECKOUT_COMPLETED`: Emitted when guests check in/out.
  - `ACTIVITY_LOGGED`: Emitted to push instant logs to Admin activity feed.

---

## 9. Frontend Integration Roadmap

Connecting the existing frontend to the backend will be completely non-destructive:

1. **API Client (`frontend/src/api/client.js`)**:
   - Axios or fetch wrapper with base URL `http://localhost:5000/api` (or environment variable `VITE_API_URL`).
   - Request interceptor injecting `Authorization: Bearer <token>`.
   - Response interceptor catching 401 Unauthorized and redirecting to login.

2. **Refactoring `HotelContext.jsx`**:
   - Replace synchronous `localStorage.getItem` with `useEffect` async query calls (`fetchRooms()`, `fetchBookings()`, etc.).
   - Keep the exact same signature of context functions (`cleanRoom`, `assignRoom`, `checkoutGuest`, `placeFoodOrder`, `updateRoom`, etc.) so **zero component code in the 5 dashboards needs to change**.

3. **Proxy Configuration (`frontend/vite.config.js`)**:
   ```javascript
   server: {
     proxy: {
       '/api': 'http://localhost:5000',
       '/socket.io': { target: 'http://localhost:5000', ws: true }
     }
   }
   ```

---

## 10. Step-by-Step Implementation Phases

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Backend Foundation & Database Setup                           │
│ • Initialize backend/package.json (express, pg, cors, dotenv, etc.)    │
│ • Configure PostgreSQL database connection pool in config/db.js        │
│ • Write schema.sql (tables, constraints, indices) & execute migration │
│ • Write seed.sql with 10 luxury rooms, 7 staff, 8 dishes, demo users   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ PHASE 2: Authentication & RBAC Middleware                              │
│ • Implement bcryptjs password hashing and JWT token generation         │
│ • Build authMiddleware and roleMiddleware                              │
│ • Expose /api/auth/login, /api/auth/register, /api/auth/me             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ PHASE 3: Core Business Controllers & Routes                            │
│ • Room Controller: inventory, pricing, cleanliness toggle              │
│ • Booking Controller: walk-in check-in, dirty room alert, checkout    │
│ • Menu & Order Controller: in-room dining catalog & KDS status         │
│ • Staff & Housekeeping Controllers: shifts, turnover history           │
│ • Analytics & Settings: financial trajectory & demo reset              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ PHASE 4: Frontend API Layer & Context Transition                       │
│ • Configure frontend API client & Vite proxy                           │
│ • Wire HotelContext.jsx to backend endpoints seamlessly                │
│ • Connect AuthModal.jsx to /api/auth/login                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ PHASE 5: Testing, Real-Time Socket.io & Verification                   │
│ • Verify all 5 portals in browser: Admin, Reception, Kitchen, HK, Guest│
│ • Validate concurrency, double-booking prevention, and audit logs      │
│ • Document deployment instructions and run scripts                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Security, Performance & Deployment Best Practices

1. **SQL Injection Prevention**: Always use parameterized queries (`$1, $2, ...`) via `pg` library.
2. **Environment Isolation**: Sensitive keys (`JWT_SECRET`, `DATABASE_URL`, `PORT`) stored strictly in `.env`.
3. **Database Transactions**: Multi-table updates (e.g. check-out altering booking + room + order + logging) wrapped in `BEGIN ... COMMIT / ROLLBACK` blocks.
4. **CORS & Headers**: Strict CORS origin configuration and `helmet` security headers.
5. **Data Consistency**: PostgreSQL foreign keys with `ON DELETE SET NULL` or `CASCADE` ensuring referential integrity.
