# Efoy Hotel & Suites (Grand Horizon / Aura Grand)

A Five-Star luxury hotel management and operations platform built with **React 19**, **Vite**, and **Tailwind CSS v4**. The system features a public guest-facing landing page alongside an authenticated real-time **Hotel Operations & Admin Dashboard Portal** matching enterprise property management systems.

---

## 🌟 Architecture & Features

### 1. Public Guest Experience (Home Landing Page)
- **Forbes Five-Star Accolades & Hero Banner**: High-resolution showcase with dynamic booking reservation bar (Check-in, Check-out, Guests, Preferred Tier).
- **Suites & Accommodations Rack**: Interactive suite listings (Rooms 1 through 8) with category filtering and reservation triggers.
- **Dining & Culinary Artistry**: Fine dining presentation, Michelin-star dining showcases, and reservations.
- **Wellness, Spa & Services**: Hydrotherapy, wellness retreats, 24/7 concierge, chauffeur, and butler services.
- **Location & Contact**: Waterfront map with transit markers and direct contact form.
- **Privilege Club Authentication Modal**:
  - Seamless tabs for **Log In** and **Sign Up**.
  - One-click **Demo Admin Credentials** auto-fill helper.

---

### 2. Hotel Operations & Admin Dashboard Portal
*Accessible exclusively when logged in as administrator with automatic redirection.*

- **Left Luxury Operations Sidebar**:
  - Brand header & navigation: Dashboard, Analytics, Bookings, Room Management, Menu Management, Staff Management, Activity Logs, Settings.
  - **Live Occupancy Widget**: Real-time 84% capacity tracker (`142/170 Filled`, `28 Free`).
  - Help Center documentation trigger and system version tag.
- **Top Operations Bar**:
  - Global guest search with keyboard shortcut (`⌘K`).
  - Live clock and date display (`Wednesday, Oct 24 • 10:45AM`).
  - Property switcher dropdown (`Aura Grand Downtown (Main)`).
  - Notification center and Administrator Profile (*Alexander Sterling, General Manager*).
  - One-click session logout and "Public Website" switchers.
- **Operations Overview Header**:
  - System status indicator (`● SYSTEM OPTIMAL`).
  - Date filter ranges: `Today`, `Last 7 Days`, `MTD`, `YTD`.
  - Action buttons: `+ Reservation`, `Check-in`, and `Export Report`.
- **6 Operational KPI Cards**:
  1. **Total Revenue**: `$48,920 today` (+14.2%, MTD $342,800, progress to goal $55k at 88.9%).
  2. **Occupancy Rate**: `83.5% capacity` (+5.1%, 142/170 keys, visual segment bars).
  3. **Inventory Keys**: `170 Total` (8 Floors, Operational 100%, 0 Out of Order).
  4. **Ready Available**: `24 clean` (Immediate status, 4 in housekeeping).
  5. **Today's Bookings**: `38 reservations` (+18%, Channel split 18 Web / 20 OTA, Direct 47%).
  6. **In-House Guests**: `216 heads` (VIP: 12, Turnover 42 Arrive / 31 Depart, Peak 2-4 PM).
- **Analytics & Performance Row**:
  - **Revenue & Occupancy Trend**: Comparative dual-bar chart (ADR $345 vs RevPAR $288) over 7 days with peak indicator.
  - **Room Category Yield**: Occupancy and revenue contribution for Double Executive, Single Deluxe, Luxury Suite, and Penthouse.
  - **Booking Acquisition**: Donut chart breakdown (Direct Web 45%, Corp Direct 25%, OTA GDS 22%, Walk-in 8%) and OTA commission savings ($6,480).
- **Room Inventory & Live Rack (Interactive Table)**:
  - Filters by room type (Single, Double, Suites) and status (Available, Occupied, Housekeeping, Maintenance).
  - Real-time guest details, folio management, and action triggers (Assign Guest, Inspect Room, Concierge VIP, Work Order).
- **Staff Directory & Roster**:
  - Departmental filters (Reception, Kitchen & F&B, Housekeeping).
  - Shift schedules, duty statuses (Active Duty, On Break), and personnel management actions.
- **In-Room Dining & Culinary Inventory**:
  - Category filters (Breakfast, All-Day Dining, Chef Specials, Desserts).
  - Dynamic dish cards with prep times, daily order counts, pricing, and live interactive stock toggle switches.
- **Operational Logs & Audit Trail**:
  - Real-time synchronized system event logs across front desk, F&B, turnover, and cashiering with live sync pulse (`1.5s`).
- **Interactive Action Dialogs**:
  - Quick modals for creating reservations, front desk check-in, adding rooms, adding staff, and menu item updates.

---

## 🔑 Demo Admin Credentials

To access the Admin Dashboard:
1. Click **Log In** in the top navigation bar.
2. Use the **Auto Fill** button in the Demo Admin box, or enter:
   - **Email**: `admin@efoyhotel.com` (or `admin@auragrand.com`)
   - **Password**: `admin123` (or `admin`)
3. Click **Log In to Account**.
4. The application automatically authorizes and redirects to the **Admin Dashboard**.
5. To return to the public site, click **Public Website** in the sidebar or use the **Log Out** button.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS v4
- **Icons**: Lucide React
- **Typography**: Google Fonts (Inter, Playfair Display)
- **Code Quality**: Oxlint

---

## 🚀 Getting Started

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/Abdurehman95/Efoy-hotel.git

# Navigate to frontend
cd Efoy-hotel/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
npm run build
```

---

## 📄 License
MIT License. © 2026 Efoy Hotel & Suites. All rights reserved.
