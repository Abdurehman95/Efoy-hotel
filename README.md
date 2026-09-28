# 🏨 Efoy Hotel & Suites — Enterprise Property Management System (PMS)

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![Stack: PERN](https://img.shields.io/badge/Stack-PERN%20(Postgres%20%7C%20Express%20%7C%20React%20%7C%20Node)-blue.svg)](#tech-stack)
[![Frontend: React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%208%20%7C%20Tailwind%20v4-61DAFB.svg)](https://react.dev/)
[![Real-Time: Socket.io](https://img.shields.io/badge/Real--Time-WebSocket%20%2F%20Socket.io-orange.svg)](https://socket.io/)
[![Database: PostgreSQL 16+](https://img.shields.io/badge/Database-PostgreSQL%2016+-336791.svg)](https://www.postgresql.org/)

An enterprise-grade, five-star luxury Property Management System (PMS) and public guest booking engine built with the **PERN stack** (PostgreSQL, Express.js, React 19, Node.js) and real-time bidirectional WebSocket synchronization.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Modules & Operational Portals](#-key-modules--operational-portals)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Configuration](#1-backend-setup)
  - [Frontend Configuration](#2-frontend-setup)
  - [Running the Application](#3-running-locally)
- [Security & Authentication](#-security--authentication)
- [License](#-license)

---

## 🌟 Overview

**Efoy Hotel & Suites** is designed to meet the rigorous operational requirements of modern five-star hotels and luxury resorts. It provides a guest-facing digital presence and reservation system combined with a unified back-office operational dashboard for general managers, front desk receptionists, culinary brigades, housekeeping supervisors, and verified guests.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        EFOY HOTEL & SUITES PMS                         │
└────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          ▼                                                   ▼
┌───────────────────────────┐                       ┌────────────────────┐
│   Public Website & Web    │                       │  Role-Specific     │
│   Booking Reservation     │                       │  Dashboards (5)    │
└───────────────────────────┘                       └────────────────────┘
          │                                                   │
          └─────────────────────────┬─────────────────────────┘
                                    ▼
                ┌───────────────────────────────────────┐
                │     React 19 Single Page App (SPA)    │
                │  Tailwind CSS v4 • Vite • Context API │
                └───────────────────────────────────────┘
                                    │
                     REST API / WebSocket Gateway
                                    │
                                    ▼
                ┌───────────────────────────────────────┐
                │      Node.js / Express.js Backend     │
                │   JWT Auth • RBAC • Helmet • Morgan   │
                └───────────────────────────────────────┘
                                    │
                    Connection Pooling (node-pg)
                                    │
                                    ▼
                ┌───────────────────────────────────────┐
                │        PostgreSQL 16+ Database        │
                │ Relational Schema • Foreign Keys • FK │
                └───────────────────────────────────────┘
```

---

## 🖥️ Key Modules & Operational Portals

### 1. Public Guest Experience & Online Reservation
- **Dynamic Booking Bar**: Instant search across check-in/check-out dates, guest counts, and suite categories.
- **Luxury Suite Showcase**: Interactive room selection with real-time rate calculation, capacity indicators, and direct reservation modal.
- **Culinary & Dining**: Presentation of executive menus, private dining, and Michelin-inspired showcases.
- **Wellness & Concierge Highlights**: White-glove amenities, spa offerings, and private chauffeur services.

### 2. General Manager & Executive Administration
- **Operational KPI Cards**: Live tracking of RevPAR, ADR, occupancy percentages, clean/dirty room distribution, and gross revenue.
- **Financial Analytics & Charts**: Interactive Chart.js visualizations for revenue trends, category yield analysis, and channel attribution.
- **Room Inventory Control**: Real-time management of room tariffs, floor locations, bed configurations, and capacity limits.
- **In-Room Dining Catalog**: Menu curation, item pricing, preparation time estimates, and instant live inventory 86/stock toggling.
- **Staff Directory & Roster**: Department assignments, shift schedules, and personnel duty status tracking.
- **User Accounts Management**: Full CRUD interface for managing registered database accounts, changing roles, resetting passwords, and auditing authentication records.
- **Activity Logs & Audit Trail**: Real-time logging of reservations, turnovers, checkouts, and culinary orders.

### 3. Front Desk & Receptionist Console
- **Interactive Room Rack**: Live status indicators for all rooms (`Clean`, `Dirty`, `Cleaning`, `Inspected`) and occupancy (`Available`, `Occupied`, `Reserved`).
- **One-Step Walk-In Check-In**: Instant booking creation and key assignment with occupancy conflict prevention.
- **Smart Turnover Protection**: Automatic validation preventing front desk staff from assigning uninspected or dirty rooms.
- **Live Folio Calculation**: Automated billing combining room tariffs, luxury hospitality taxes, and in-room dining charges.
- **Checkout & Invoice Generator**: Settlement processing with printable, high-resolution guest invoices and immediate room dirty flagging.

### 4. Kitchen Display System (KDS)
- **Live Culinary Ticket Stream**: Real-time order dispatch directly from guest suites with kitchen countdown timers.
- **Four-Stage Status Progression**: Order status workflow (`Pending` → `Cooking` → `Ready` → `Delivered`).
- **Brigade Assignment**: Dish quantities, preparation times, server assignments, and custom dietary requests.

### 5. Housekeeping & Turnover Hub
- **One-Tap Sanitization Certification**: Turn dirty rooms into inspected, clean keys in real time.
- **Turnover Reason Tracking**: Checkout turnover notes and deep-cleaning logs.
- **Real-Time Cross-Department Sync**: Instant status updates visible immediately to Front Desk upon cleaning certification.

### 6. Guest Self-Service Portal
- **Digital Suite Keycard**: Interactive NFC keycard simulation for assigned suites.
- **Direct In-Room Dining**: Browse chef specials and order dishes charged directly to the active room folio.
- **Live Order Tracking**: Four-step culinary order progress tracker.
- **24/7 White-Glove Concierge**: One-tap requests for extra linens, valet retrieval, late checkout, and airport limousine transfers.
- **Graceful Account Onboarding**: First-class onboarding for newly registered guests with instant booking capabilities.

---

## 🔐 Role-Based Access Control (RBAC)

The system enforces strict multi-tier role authorization across both backend REST endpoints and frontend routing:

| Role Identifier | Portal Interface | Primary Permissions & Responsibilities |
|---|---|---|
| `admin` | **Administrator Portal** | Full platform management, user account management, analytics, inventory, pricing, staff directory |
| `receptionist` | **Front Desk Console** | Check-ins, walk-in bookings, room assignments, folio settlement, printable invoices |
| `kitchen` | **Kitchen Display (KDS)** | Order status updates, culinary timers, menu stock toggling, brigade management |
| `housekeeping` | **Housekeeping Hub** | Room inspection certification, sanitization turnover audit, status updates |
| `guest` | **Member Portal** | Suite reservation, digital NFC room key, in-room dining orders, concierge dispatch |

---

## 🛠️ Tech Stack

### Frontend Architecture
- **Framework**: React 19 (Hooks, Context API, Suspense)
- **Bundler & Tooling**: Vite 8 with Hot Module Replacement (HMR)
- **Styling**: Tailwind CSS v4 & custom design tokens
- **Data Visualization**: Chart.js (Line, Bar, Donut curves)
- **Real-Time Gateway**: Socket.io Client
- **Iconography**: Lucide React
- **Code Standards**: Oxlint

### Backend Architecture
- **Runtime**: Node.js (ES Modules)
- **Server Framework**: Express.js 4.x
- **Real-Time Engine**: Socket.io Server (WebSocket & HTTP Long-Polling)
- **Security Middleware**: Helmet, CORS origin controls
- **Logging**: Morgan request logger
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), password hashing (`bcryptjs`)

### Database Infrastructure
- **Database Engine**: PostgreSQL 16+
- **Driver**: `pg` (node-postgres connection pool)
- **Migrations**: Automated relational schema migrator with foreign keys and check constraints

---

## 🗄️ Database Schema

The relational database architecture is organized into normalized tables:

```text
├── users              (Account authentication, role-based authorization, contact info)
├── rooms              (Room inventory, classification, rates, cleanliness, occupancy)
├── bookings           (Guest stays, arrival/departure dates, tariff calculations, payments)
├── menu_items         (Culinary catalog, category breakdown, prep time, live stock status)
├── orders             (Room service dining tickets, items array, total costs, order status)
├── staff              (Operational roster, department shifts, duty status)
├── housekeeping_logs  (Audit trail of sanitized rooms, turnover dates, inspector names)
├── activity_logs      (Cross-system event log, category tagging, live timestamping)
└── system_settings    (Hotel parameters, currency, tax rates, operational metadata)
```

---

## 📡 API Reference

All backend endpoints are prefixed with `/api` and require appropriate JWT Bearer tokens for protected resources:

### Authentication & Users
- `POST /api/auth/login` — Authenticate user and receive JWT session token
- `POST /api/auth/register` — Register a new guest account
- `GET  /api/auth/me` — Retrieve currently authenticated user profile
- `GET  /api/users` — *(Admin only)* List all registered users with role and text filters
- `POST /api/users` — *(Admin only)* Create user account with assigned role
- `PUT  /api/users/:id` — *(Admin only)* Update user details, role permissions, or password
- `DELETE /api/users/:id` — *(Admin only)* Permanently delete a user account

### Rooms & Inventory
- `GET   /api/rooms` — List all rooms with filter criteria
- `GET   /api/rooms/available` — Query available rooms for specific dates and guest counts
- `POST  /api/rooms` — *(Admin only)* Add new room to property inventory
- `PUT   /api/rooms/:number` — *(Admin only)* Update room rates, features, or capacity
- `PATCH /api/rooms/:number/cleanliness` — Update cleanliness state (`Clean`, `Dirty`, `Cleaning`, `Inspected`)
- `DELETE /api/rooms/:number` — *(Admin only)* Remove room from inventory

### Bookings & Reservations
- `GET   /api/bookings` — Retrieve all bookings with status filters
- `POST  /api/bookings` — Create walk-in or online reservation
- `PATCH /api/bookings/:id/assign` — Assign room key with dirty status validation
- `GET   /api/bookings/folio/:roomNumber` — Retrieve live guest bill and room service total
- `POST  /api/bookings/checkout/:roomNumber` — Settle guest bill, checkout, and flag room dirty
- `POST  /api/bookings/:id/undo-checkout` — Revert accidental checkout

### Culinary & Room Service
- `GET   /api/menu` — Retrieve culinary catalog
- `POST  /api/menu` — *(Admin only)* Create new dish item
- `PUT   /api/menu/:id` — *(Admin only)* Update dish pricing and recipe
- `PATCH /api/menu/:id/toggle-stock` — Toggle live dish stock (86)
- `GET   /api/orders` — List active room service tickets
- `POST  /api/orders` — Place culinary order linked to room folio
- `PATCH /api/orders/:id/status` — Update culinary ticket stage (`Pending` → `Cooking` → `Ready` → `Delivered`)

---

## 🚀 Getting Started

### Prerequisites

Ensure the following tools are installed on your workstation:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher

---

### 1. Backend Setup

1. Open your terminal and navigate to the `backend` directory:
   ```bash
   cd Efoy-hotel/backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Initialize the PostgreSQL database and execute automated schema migrations:
   ```bash
   npm run migrate
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will be running at [http://localhost:5000](http://localhost:5000) with a health check at [http://localhost:5000/api/health](http://localhost:5000/api/health).*

---

### 2. Frontend Setup

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd Efoy-hotel/frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be running at [http://localhost:5173](http://localhost:5173).*

---

### 3. Running Locally

With both services active:
- Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)**.
- Explore the public luxury landing page, review suite categories, and utilize the reservation engine.
- To access specific role consoles, sign in with your authorized credentials or register a new guest membership.

To build the client application for production deployment:
```bash
npm run build
```

---

## 🔒 Security & Authentication

- **Password Hashing**: Passwords are securely hashed using `bcryptjs` with salt rounds before database persistence.
- **Stateless Tokens**: Authenticated sessions utilize signed JSON Web Tokens (JWT) transmitted via `Authorization: Bearer <token>` headers.
- **HTTP Protection**: Express leverages `helmet` to establish secure HTTP headers, Cross-Origin Resource Policies, and XSS filtering.
- **Self-Account Deletion Guard**: Administrators are prevented from deleting their own active profile, protecting against lockout.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

Copyright © 2026 Efoy Hotel & Suites. All rights reserved.
