# Efoy Hotel & Suites — Functional System Improvement & Update Specification

> **Document Version:** 1.0.0  
> **Target System:** Efoy Hotel & Suites (Full-Stack PERN: PostgreSQL, Express, React, Node.js + Tailwind CSS)  
> **Status:** Functional Architectural Specification & Implementation Roadmap  
> **Date:** October 2026  

---

## Table of Contents
1. [Executive Summary & Objectives](#1-executive-summary--objectives)
2. [Task 1: Browser Autofill Elimination & Form Sanitization](#2-task-1-browser-autofill-elimination--form-sanitization)
3. [Task 2: Dynamic User Identity in Dashboard Navigation Headers](#3-task-2-dynamic-user-identity-in-dashboard-navigation-headers)
4. [Task 3: Removal of Demo 5-Actor Shortcut Buttons from Auth Modal](#4-task-3-removal-of-demo-5-actor-shortcut-buttons-from-auth-modal)
5. [Task 4: Complete Purge of Mock/Hardcoded Demo Data & Storage Sync](#5-task-4-complete-purge-of-mockhardcoded-demo-data--storage-sync)
6. [Task 5: Architectural Unification of Staff Directory & User Accounts](#6-task-5-architectural-unification-of-staff-directory--user-accounts)
7. [Task 6: Password Confirmation Security & Default Pagination Adjustment](#7-task-6-password-confirmation-security--default-pagination-adjustment)
8. [Consolidated Implementation & Verification Checklist](#8-consolidated-implementation--verification-checklist)

---

## 1. Executive Summary & Objectives

This document establishes the functional requirements, architectural analysis, and precise technical implementation specifications for upgrading the **Efoy Hotel & Suites** property management and guest experience platform.

The system is transitioning from a hybrid demo/prototype environment into a **pure production-grade enterprise PMS**, enforcing:
- Robust browser credential privacy (no unwanted autofill overlays).
- True authenticated user identity rendering across all actor dashboards.
- Elimination of public demo shortcuts and artificial mock data.
- Relational consolidation of redundant staff and user account features into a unified, backend-integrated security model.
- Strong password verification workflows and optimized default table pagination (5 rows per page).

---

## 2. Task 1: Browser Autofill Elimination & Form Sanitization

### 2.1 The Problem & Root Cause Analysis
Users frequently observe unexpected browser autofill dropdowns (saved passwords, personal email addresses, browser credit cards, and addresses) populating fields across:
1. **Authentication Modal** (`frontend/src/components/AuthModal.jsx`).
2. **Admin Create User / Add Staff Modals** (`frontend/src/components/admin/AdminDashboard.jsx`).
3. **Walk-In Guest Registration** (`frontend/src/components/receptionist/ReceptionistDashboard.jsx`).
4. **Maintenance & Concierge Forms**.

#### Why standard `autoComplete="off"` fails:
Modern browser engines (Chromium/Google Chrome, Microsoft Edge, Apple Safari, and Mozilla Firefox) intentionally **ignore** `autocomplete="off"` on `<form>` tags and `<input>` elements containing attributes like `type="email"`, `type="password"`, `name="email"`, `name="username"`, or `name="password"`. 

The browser's internal heuristic credential-saving engine scans the DOM for combinations of standard input names and input types, forcing saved login overlays onto the UI even inside internal administrative dashboards.

---

### 2.2 Functional Requirements
- **FR-1.1:** Authentication modal login and sign-up inputs must never display unwanted browser password manager overlays over custom modal UI.
- **FR-1.2:** Administrative user creation and front desk guest check-in forms must be recognized as management inputs, preventing the browser from attempting to fill the administrator's own personal saved passwords into new user or guest fields.
- **FR-1.3:** Password input fields intended for new accounts or password resets must explicitly signal to password engines that this is a fresh credential, not an existing credential lookup.

---

### 2.3 Technical Implementation Plan

#### Step 1: Form-Level Disabling
Add explicit `autoComplete="off"` and decoy dummy credentials at the head of sensitive forms:
```jsx
<form 
  onSubmit={handleSubmit} 
  autoComplete="off" 
  className="space-y-4"
>
  {/* Decoy fields to intercept aggressive Chromium heuristic autofill */}
  <input type="text" name="prevent_autofill" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
  <input type="password" name="prevent_password_autofill" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
```

#### Step 2: Attribute Hardening on Inputs
Apply the following standard attribute combinations to each form input:

| Input Field | Required Attributes | Purpose |
| :--- | :--- | :--- |
| **Email (Login/Register)** | `autoComplete="new-off"` or `autoComplete="one-time-code"` | Bypasses standard email address book prompt |
| **Password (Sign-Up / Add User)** | `autoComplete="new-password"` | Instructs browser this is an unrecorded secret, stopping login popups |
| **Password (Login Modal)** | `autoComplete="current-password"` | Allows user-initiated credential fill only when explicitly chosen |
| **Guest/Staff Name** | `autoComplete="off"` `name="guest_unique_name"` | Prevents personal OS user name suggestion |
| **Phone Number** | `autoComplete="off"` `name="contact_phone_no_fill"` | Blocks phone autofill dropdowns |

#### Step 3: Walk-In & Admin Form Sanitization
In [AdminDashboard.jsx](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/frontend/src/components/admin/AdminDashboard.jsx) and [ReceptionistDashboard.jsx](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/frontend/src/components/receptionist/ReceptionistDashboard.jsx):
- Ensure `name` and `email` input fields for creating accounts or registering guests use non-generic attribute names:
  ```jsx
  <input
    type="email"
    name="new_user_account_email"
    autoComplete="off"
    aria-autocomplete="none"
    value={userForm.email}
    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
  />
  ```

---

## 3. Task 2: Dynamic User Identity in Dashboard Navigation Headers

### 3.1 The Problem & Root Cause Analysis
Currently, when a user logs in with their own registered credentials, the top navigation headers and sidebar profile badges across several dashboards display hardcoded demo names or artificial fallbacks:
- **Admin Dashboard:** Displays `'Alexander Sterling'` and `'General Manager'` with static `'AS'` avatar initials.
- **Receptionist Dashboard:** Displays `'Julian Vance'` and `'Head Receptionist'` with static `'JV'` initials.
- **Kitchen Dashboard:** Displays `'Chef Marco Bellini'` with `'Executive Head Chef'`.
- **Housekeeping Dashboard:** Displays `'Maria Santos'` with `'Executive Housekeeper'`.
- **Guest Dashboard:** References `'Lord Alexander Wright'` in filtering rules and greetings.

#### Root Cause in Source Code:
In all dashboard components, fallback expressions such as `{user?.name || 'Alexander Sterling'}` are used. Furthermore, avatar initials are hardcoded as static strings rather than calculated dynamically from the user object stored in `localStorage` / JWT session.

---

### 3.2 Functional Requirements
- **FR-2.1:** When any user logs in, the navigation header and profile section adjacent to the **Log Out** button must display their actual **given name** (`user.name`) retrieved from the authentication session.
- **FR-2.2:** If the user has only an email address on file, display the username prefix of the email (e.g., `abebe@gmail.com` -> `Abebe`), never a random fictional demo name.
- **FR-2.3:** Dynamic avatar initials must be generated from the authenticated user's real name (e.g., "Samuel Tadesse" -> `ST`, "Abeni" -> `AB`).
- **FR-2.4:** The role badge displayed beneath or next to the user's name must reflect their actual system role:
  - `admin` -> "System Administrator"
  - `receptionist` -> "Front Desk Officer"
  - `kitchen` -> "Culinary Staff"
  - `housekeeping` -> "Housekeeping Specialist"
  - `guest` -> "Verified Guest"

---

### 3.3 Technical Implementation Plan

#### Step 1: Universal Initials & Display Name Helper
Create a reusable helper utility in `frontend/src/utils/userUtils.js`:
```javascript
export const getUserDisplayName = (user) => {
  if (user?.name && user.name.trim().length > 0) {
    return user.name.trim();
  }
  if (user?.email) {
    const prefix = user.email.split('@')[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  return 'Authenticated User';
};

export const getUserInitials = (user) => {
  const name = getUserDisplayName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const getUserRoleLabel = (role) => {
  const map = {
    admin: 'System Administrator',
    receptionist: 'Front Desk Officer',
    kitchen: 'Culinary Department',
    housekeeping: 'Housekeeping Specialist',
    guest: 'Valued Guest Member',
  };
  return map[role?.toLowerCase()] || 'Staff Member';
};
```

#### Step 2: Dashboard Header Updates

1. **[AdminDashboard.jsx](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/frontend/src/components/admin/AdminDashboard.jsx):**
   - Replace lines 708–710 and 862–870:
   ```jsx
   <div className="w-8 h-8 rounded-full bg-dark-900 text-gold-500 font-serif font-semibold text-xs flex items-center justify-center border border-gold-500/30 shrink-0">
     {getUserInitials(user)}
   </div>
   <div className="hidden sm:block text-left leading-tight">
     <div className="text-xs font-semibold text-dark-900 truncate max-w-[140px]">
       {getUserDisplayName(user)}
     </div>
     <div className="text-[10px] text-gray-500">
       {getUserRoleLabel(user?.role || 'admin')}
     </div>
   </div>
   ```

2. **[ReceptionistDashboard.jsx](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/frontend/src/components/receptionist/ReceptionistDashboard.jsx):**
   - Replace `{user?.name || 'Julian Vance'}` with `{getUserDisplayName(user)}`.
   - Update initials from `'JV'` to `{getUserInitials(user)}`.

3. **[KitchenDashboard.jsx](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/frontend/src/components/kitchen/KitchenDashboard.jsx):**
   - Replace `{user?.name || 'Chef Marco Bellini'}` with `{getUserDisplayName(user)}`.
   - Update initials from `'MB'` to `{getUserInitials(user)}`.

4. **[HousekeepingDashboard.jsx](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/frontend/src/components/housekeeping/HousekeepingDashboard.jsx):**
   - Replace `const cleanerName = user?.name || 'Maria Santos'` with:
   ```javascript
   const cleanerName = getUserDisplayName(user);
   ```
   - Update initials from `'HK'` to `{getUserInitials(user)}`.

5. **[GuestDashboard.jsx](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/frontend/src/components/guest/GuestDashboard.jsx):**
   - Remove references to `'Lord Alexander Wright'`.
   - Use `{getUserDisplayName(user)}` in all greetings, digital keycard banners, and invoice previews.

---

## 4. Task 3: Removal of Demo Shortcut Logins from Auth Modal

### 4.1 The Problem & Root Cause Analysis
In [AuthModal.jsx](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/frontend/src/components/AuthModal.jsx) (lines 50–56 and lines 648–665), there is a public shortcut block titled **"Quick Demo Role Access"**:
```javascript
const QUICK_ROLES = [
  { label: 'Guest', email: 'guest@efoyhotel.com', pass: '123456', role: 'guest' },
  { label: 'Admin', email: 'admin@efoyhotel.com', pass: '123456', role: 'admin' },
  { label: 'Front Desk', email: 'reception@efoyhotel.com', pass: '123456', role: 'receptionist' },
  { label: 'Kitchen', email: 'kitchen@efoyhotel.com', pass: '123456', role: 'kitchen' },
  { label: 'Housekeeping', email: 'housekeeping@efoyhotel.com', pass: '123456', role: 'housekeeping' },
];
```
Clicking these buttons bypasses standard user login by pre-filling or instantly authenticating demo personas. This exposes demo accounts and prevents real user testing.

---

### 4.2 Functional Requirements
- **FR-3.1:** Completely remove the "Quick Demo Role Access" container and the 5 buttons (`Guest`, `Admin`, `Front Desk`, `Kitchen`, `Housekeeping`) from the modal.
- **FR-3.2:** Completely remove the `QUICK_ROLES` constant and `handleQuickFill` function.
- **FR-3.3:** The login screen must only present standard, secure authentication controls:
  - Email Address input.
  - Password input (with toggleable show/hide eye icon).
  - "Remember Me" checkbox.
  - "Forgot Password?" trigger.
  - Primary "Sign In" action button.
  - Link to switch to "Create an Account" (Sign Up mode).

---

### 4.3 Technical Implementation Plan
In `frontend/src/components/AuthModal.jsx`:
1. Delete the `QUICK_ROLES` declaration (lines 50–56).
2. Delete the `handleQuickFill` handler.
3. Remove JSX lines 648–665:
   ```jsx
   {/* REMOVE THIS ENTIRE BLOCK */}
   <div className="pt-2">
     <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 text-center">
       Quick Demo Role Access
     </div>
     <div className="flex flex-wrap justify-center gap-1.5">
       {QUICK_ROLES.map((r) => ( ... ))}
     </div>
   </div>
   ```
4. Retain standard layout with the modal footer security badge: "Encrypted 256-Bit TLS • 5-Star Hospitality Portal".

---

## 5. Task 4: Complete Purge of Mock/Hardcoded Demo Data & Storage Sync

### 5.1 The Problem & Root Cause Analysis
In [HotelContext.jsx](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/frontend/src/context/HotelContext.jsx), when the frontend boots up, state variables (`rooms`, `bookings`, `menuItems`, `orders`, `staffList`, `usersList`, `activityLogs`) initialize from `localStorage` fallbacks:
```javascript
const [rooms, setRooms] = useState(() => {
  try {
    const saved = localStorage.getItem('efoy_hotel_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  } catch {
    return INITIAL_ROOMS;
  }
});
```
Where `INITIAL_ROOMS`, `INITIAL_BOOKINGS`, `INITIAL_STAFF`, etc. contain dozens of hardcoded mock records created during early UI prototyping.

#### Issues this creates:
1. When a new user registers or a real room is modified in the PostgreSQL database, the user's browser may continue reading stale mock data cached in `localStorage`.
2. Mock bookings for guests like "Sophia Montgomery" and "Lord Alexander Wright" persist indefinitely even after clearing the database.
3. Front desk, housekeeping, and kitchen dashboards show fake tickets that cannot be updated via the backend API.

---

### 5.2 Functional Requirements
- **FR-4.1:** All dashboards must fetch and display data directly from the **PostgreSQL relational backend** via the existing Express REST APIs:
  - Rooms & Categories: `/api/rooms`, `/api/rooms/categories`
  - Reservations: `/api/bookings`
  - Kitchen Menu: `/api/menu`
  - Kitchen Orders: `/api/orders`
  - Housekeeping Tasks: `/api/housekeeping/tasks`, `/api/housekeeping/history`
  - Concierge & Services: `/api/service-requests`
  - Maintenance Work Orders: `/api/maintenance`
  - System Users & Staff: `/api/users`
  - Activity Logs: `/api/logs`
- **FR-4.2:** Initial React states must default to clean empty arrays (`[]`), displaying elegant skeleton loaders until API responses arrive.
- **FR-4.3:** Local storage caching of mock entities must be purged so that the browser client never overrides fresh database records.

---

### 5.3 Technical Implementation Plan

1. **Purge Stale LocalStorage on Application Boot:**
   In `frontend/src/context/HotelContext.jsx`, introduce an automatic cache migration version:
   ```javascript
   const APP_DATA_VERSION = 'v2_backend_synced';
   if (localStorage.getItem('efoy_cache_version') !== APP_DATA_VERSION) {
     [
       'efoy_hotel_rooms',
       'efoy_hotel_bookings',
       'efoy_hotel_menu',
       'efoy_hotel_orders',
       'efoy_hotel_hk_tasks',
       'efoy_hotel_hk_history',
       'efoy_hotel_service_requests',
       'efoy_hotel_maintenance_tickets',
       'efoy_hotel_staff',
       'efoy_hotel_users',
       'efoy_hotel_logs'
     ].forEach((key) => localStorage.removeItem(key));
     localStorage.setItem('efoy_cache_version', APP_DATA_VERSION);
   }
   ```

2. **Initialize State to Empty Arrays:**
   ```javascript
   const [rooms, setRooms] = useState([]);
   const [roomCategories, setRoomCategories] = useState([]);
   const [bookings, setBookings] = useState([]);
   const [menuItems, setMenuItems] = useState([]);
   const [orders, setOrders] = useState([]);
   const [housekeepingTasks, setHousekeepingTasks] = useState([]);
   const [housekeepingHistory, setHousekeepingHistory] = useState([]);
   const [serviceRequests, setServiceRequests] = useState([]);
   const [maintenanceTickets, setMaintenanceTickets] = useState([]);
   const [inventoryItems, setInventoryItems] = useState([]);
   const [usersList, setUsersList] = useState([]);
   const [activityLogs, setActivityLogs] = useState([]);
   const [isLoadingBackend, setIsLoadingBackend] = useState(true);
   ```

3. **Backend-Driven Hydration via `Promise.allSettled`:**
   Ensure `fetchBackendData()` populates state directly from API endpoints and sets `isLoadingBackend = false`.

4. **Empty State UI:**
   Ensure tables and grids display clean, hospitality-themed empty notices ("No active reservations found in database", "No orders pending in kitchen queue") rather than failing or showing fake records.

---

## 6. Task 5: Architectural Unification of Staff Directory & User Accounts

### 6.1 Architectural Flaw Analysis

In the current codebase, **AdminDashboard.jsx** provides two separate tabs that attempt to manage personnel:

```
Tab 8: "Staff Management" (Staff Personnel Directory)
Tab 9: "User Accounts"    (User Accounts & Access Control)
```

#### Comparison of the Two Implementations:

| Dimension | "Staff Management" (Tab 8) | "User Accounts" (Tab 9) |
| :--- | :--- | :--- |
| **Database Table** | `staff` table | `users` table |
| **Authentication** | ❌ No password, no hash, cannot log in | ✅ Full `password_hash`, JWT authentication |
| **Roles Supported** | 'Receptionist', 'Chef', 'Housekeeper' (strings) | `admin`, `receptionist`, `kitchen`, `housekeeping`, `guest` (enum) |
| **Metadata Tracked** | Department, Shift, Active Duty status | Email, Phone, Role, Account ID, Date Joined |
| **Backend API** | `/api/staff` (read-only or local mock) | `/api/users` (full REST CRUD: GET, POST, PUT, DELETE) |
| **Operational Impact**| Adding someone here does NOT give them access | Adding someone here lets them log in, but lacks shift info |

#### Why this is broken:
- If an administrator creates a receptionist in **Staff Management**, that employee **cannot log into** the Receptionist Dashboard because no record was created in `users`.
- If an administrator creates a receptionist in **User Accounts**, they **can log in**, but they do not appear on the Staff schedule or shift roster.

---

### 6.2 The Solution: Unified "User & Staff Management"

We will **eliminate the redundant standalone Staff Management tab** and upgrade **User Accounts** into a consolidated **"User & Staff Management"** module integrated directly with the backend database.

#### Schema Enhancement:
Enhance the existing `users` table in PostgreSQL to include operational staff metadata:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'General';
ALTER TABLE users ADD COLUMN IF NOT EXISTS shift VARCHAR(100) DEFAULT 'Day Shift (08:00 - 16:30)';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active Duty';
```

#### Updated Tab Structure in Admin Dashboard:
Replace Tab 8 ("Staff Management") and Tab 9 ("User Accounts") with a single, comprehensive management center:

**New Tab Title:** `User & Staff Management`  
**Icon:** `Users` or `ShieldCheck`  

#### Role-Based Views within the Unified Module:
Provide tabbed filters at the top of the unified screen:
1. **All Accounts** (Full relational view).
2. **Hotel Staff Personnel** (Filtered to roles `admin`, `receptionist`, `kitchen`, `housekeeping` with shift and department badges).
3. **Guest Members** (Filtered to role `guest` with stay history and contact details).

#### Single Source of Truth for Adding Users / Staff:
A single modal **"+ Add User or Staff Member"** capturing:
- Full Legal Name
- Official Email (Login username)
- Phone Number
- System Role (`guest`, `receptionist`, `kitchen`, `housekeeping`, `admin`)
- Department (`Front Desk`, `Kitchen & Dining`, `Housekeeping`, `Executive Management`, `Guest Services`)
- Shift Schedule (for staff roles)
- Password + **Password Confirmation**

This guarantees that:
- Every staff member has authenticated credentials to access their respective dashboard.
- Administrators manage all access rights, passwords, shifts, and accounts from a single interface.
- 100% of user data is stored in the PostgreSQL `users` table and synced via `/api/users`.

---

## 7. Task 6: Password Confirmation Security & Default Pagination Adjustment

### 7.1 Password Confirmation Field

#### The Problem:
Neither the public registration form (`AuthModal.jsx`) nor the administrative user creation modal (`AdminDashboard.jsx`) includes a **"Confirm Password"** input field. This allows users or administrators to make typographical errors during account creation, resulting in immediate account lockouts.

#### Functional Requirements:
- **FR-6.1:** Add a `Confirm Password` input field to:
  1. `AuthModal.jsx` (Sign-Up / Register mode).
  2. `AdminDashboard.jsx` (Add New User modal).
  3. `AdminDashboard.jsx` (Reset Password modal).
- **FR-6.2:** Real-time client-side validation:
  - If passwords match: display a subtle green confirmation indicator (`✓ Passwords match`).
  - If passwords do not match: display an amber/red warning (`⚠️ Passwords do not match`), and disable the submit button.
- **FR-6.3:** Form submission must be blocked if password lengths are under 6 characters or if `password !== confirmPassword`.

#### Technical Specification for AuthModal:
```jsx
{/* Confirm Password (Sign Up only) */}
{mode === 'signup' && (
  <div>
    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
      Confirm Password *
    </label>
    <div className="relative">
      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="password"
        required
        autoComplete="new-password"
        placeholder="••••••••••••"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        className={`w-full pl-10 pr-3.5 py-3 bg-white border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
          formData.confirmPassword && formData.password !== formData.confirmPassword
            ? 'border-rose-400 focus:border-rose-500'
            : 'border-slate-200 focus:border-gold-500'
        }`}
      />
    </div>
    {formData.confirmPassword && (
      <div className="mt-1 text-[11px] flex items-center gap-1 font-medium">
        {formData.password === formData.confirmPassword ? (
          <span className="text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={12} /> Passwords match
          </span>
        ) : (
          <span className="text-rose-600 flex items-center gap-1">
            <AlertCircle size={12} /> Passwords do not match
          </span>
        )}
      </div>
    )}
  </div>
)}
```

---

### 7.2 Default Pagination Setting Adjustment (Change from 10 to 5)

#### The Problem:
Currently, the shared pagination hook `usePagination.js` defaults `initialPageSize` to `10`. Similarly, dashboard components instantiate their pagination hooks with a default of `10`. The user requirement states:
> *"at last change the default pagination from 10 to 5"*

#### Functional Requirements:
- **FR-6.4:** Change the default page size across **all dashboards** from `10` to `5`.
- **FR-6.5:** The dropdown selector must strictly retain all required options: **`5, 10, 15, 20`** items per page.
- **FR-6.6:** When any dashboard table or grid loads for the first time, it must display exactly **5 entries per page**, with the dropdown defaulting to `5`.
- **FR-6.7:** If a user selects `10`, `15`, or `20` from the dropdown, the table must dynamically expand to that size and recompute `totalPages` and navigation bounds immediately.

#### Technical Code Updates:

1. **In [usePagination.js](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/frontend/src/hooks/usePagination.js):**
   ```javascript
   // Change default initialPageSize from 10 to 5
   export function usePagination(items = [], initialPageSize = 5) {
     const [currentPage, setCurrentPage] = useState(1);
     const [pageSize, setPageSize] = useState(initialPageSize);
     ...
   ```

2. **In [AdminDashboard.jsx](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/frontend/src/components/admin/AdminDashboard.jsx):**
   ```javascript
   const bookingsPagination = usePagination(filteredBookings, 5);
   const roomsPagination = usePagination(filteredRooms, 5);
   const categoriesPagination = usePagination(filteredRoomCategories, 5);
   const menuPagination = usePagination(filteredMenuItems, 5);
   const inventoryPagination = usePagination(filteredInventoryItems, 5);
   const staffPagination = usePagination(filteredStaff, 5);
   const usersPagination = usePagination(filteredUsers, 5);
   const logsPagination = usePagination(filteredActivityLogs, 5);
   ```

3. **In [ReceptionistDashboard.jsx](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/frontend/src/components/receptionist/ReceptionistDashboard.jsx):**
   ```javascript
   const bookingsPagination = usePagination(filteredBookings, 5);
   const roomsPagination = usePagination(filteredRooms, 5);
   const billingPagination = usePagination(billingGuests, 5);
   const servicesPagination = usePagination(serviceRequests, 5);
   const invoicesPagination = usePagination(bookings, 5);
   ```

4. **In [KitchenDashboard.jsx](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/frontend/src/components/kitchen/KitchenDashboard.jsx):**
   ```javascript
   const ordersPagination = usePagination(orders, 5);
   const menuPagination = usePagination(menuItems, 5);
   const inventoryPagination = usePagination(inventoryItems || [], 5);
   const deliveredPagination = usePagination(deliveredOrders, 5);
   ```

5. **In [HousekeepingDashboard.jsx](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/frontend/src/components/housekeeping/HousekeepingDashboard.jsx):**
   ```javascript
   const queuePagination = usePagination(filteredQueue, 5);
   const roomsPagination = usePagination(filteredFloorRooms, 5);
   const maintPagination = usePagination(maintenanceTickets, 5);
   const historyPagination = usePagination(housekeepingHistory, 5);
   ```

6. **In [GuestDashboard.jsx](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/frontend/src/components/guest/GuestDashboard.jsx):**
   ```javascript
   const bookingsPagination = usePagination(myBookings, 5);
   const menuPagination = usePagination(filteredMenu, 5);
   const ordersPagination = usePagination(guestOrders, 5);
   const servicesPagination = usePagination(guestServiceRequests, 5);
   ```

---

## 8. Consolidated Implementation & Verification Checklist

| Item # | Focus Area | Detailed Acceptance Test | Status |
| :---: | :--- | :--- | :---: |
| **1** | **Autofill Removal** | Verify no browser address or credential overlays pop up unexpectedly in AuthModal, Add User modal, or Walk-In form. | 📋 Ready for Execution |
| **2** | **Dynamic User Header** | Log in as newly registered user (e.g. `Abebe Bekele`). Verify the top header displays `Abebe Bekele`, initials `AB`, and correct role label next to Log Out button across all 5 dashboards. | 📋 Ready for Execution |
| **3** | **Remove Demo Shortcuts** | Open Login modal. Verify bottom 5 shortcut role buttons ("Quick Demo Role Access") are completely gone. | 📋 Ready for Execution |
| **4** | **Purge Hardcoded Data** | Verify all dashboard metrics and tables hydrate strictly from PostgreSQL via REST API, with no legacy mock items cached in localStorage. | 📋 Ready for Execution |
| **5** | **Staff / User Unification**| Retire standalone Staff tab. Verify unified "User & Staff Management" allows creating, listing, and modifying all staff roles and guest accounts with full backend persistence. | 📋 Ready for Execution |
| **6A**| **Password Confirmation** | Attempt registration with mismatching passwords. Confirm error shows and submit is disabled until both passwords match. | 📋 Ready for Execution |
| **6B**| **Default Pagination = 5** | Load any dashboard table. Confirm it defaults to 5 items per page with dropdown selector showing `5` selected, while allowing switching to `10`, `15`, or `20`. | 📋 Ready for Execution |

---

*This document is located at [UPDATE.md](file:///c:/Users/PC/Documents/my%20project/efoy%20hotel/Efoy-hotel/UPDATE.md) in the project workspace for full architectural alignment and implementation reference.*
