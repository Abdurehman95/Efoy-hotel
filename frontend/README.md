# Efoy Hotel & Suites — Luxury Hospitality Platform

A high-performance luxury hotel management system built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Chart.js**.

---

## 🏨 Key Dashboards & Modules

1. **General Manager & Operations (Admin Dashboard)**:
   - Live Occupancy tracking, property KPIs, and financial curves.
   - Interactive Chart.js analytics for daily revenue and room type share.
   - Master Reservation folios with status filtering and guest search.
   - Room Inventory configuration with nightly tariff and capacity management.
   - In-Room Dining culinary catalog with real-time stock toggles.
   - Staff directory and shift schedule management.
   - Synchronized activity logs and property configuration settings.

2. **Front Desk & Receptionist Portal**:
   - One-step walk-in check-in and room assignments.
   - Smart Dirty Room alerts preventing arrival room violations.
   - Live guest bill calculation combining room tariffs and room service.
   - Folio settlement with printable invoice generation.

3. **Kitchen Display System (KDS)**:
   - Real-time room service order tracking (Pending → Cooking → Ready → Delivered).
   - Order timers and elapsed delivery countdowns.
   - Brigade server assignments and guest dietary notes.

4. **Housekeeping Hub**:
   - One-click room sanitization and turnover inspection.
   - Real-time clean/dirty status synchronization with Front Desk.
   - Housekeeping history logs and turnover audit trails.

5. **Guest & Member Self-Service Portal**:
   - Digital suite booking and instantaneous reservation confirmations.
   - In-room dining ordering directly billed to guest folios.
   - Digital keycard access, concierge requests, and live stay summary.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Production build
npm run build

# Code linting
npm run lint
```

---

## 🔐 Role-Based Access

The frontend supports distinct authenticated views depending on the user's role:
- **Administrator**: Comprehensive operations, revenue analytics, inventory, staff, and user account management.
- **Receptionist**: Front desk console, walk-in check-ins, room rack, and folio settlements.
- **Kitchen Staff**: Real-time Kitchen Display System (KDS) order tracking and preparation workflows.
- **Housekeeping**: Room sanitization turnover and inspection certification.
- **Guest Member**: Digital suite reservation, NFC keycard, in-room dining, and concierge requests.

Accounts can be registered directly through the Guest Registration modal or provisioned securely by an Administrator in the Admin Console.

