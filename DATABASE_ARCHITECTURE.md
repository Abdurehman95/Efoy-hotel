# Efoy Hotel & Suites --- Updated Database & System Functionality Specification

**Project:** Efoy Hotel & Suites Property Management System (PMS)\
**Stack:** PostgreSQL 16+, Express.js, React, Node.js (PERN)\
**Payment gateway:** Chapa (server-to-server integration)\
**Database design:** Relational, normalized, foreign-key constrained,
auditable\
**Currency recommendation:** ETB as the hotel's default currency; store
an ISO currency code on financial records.

------------------------------------------------------------------------

## 1. Scope and requested changes

This specification updates the original Efoy Hotel database and
functionality design.

### Explicit removals

The following are **not part of this version**:

-   `suppliers`
-   `laundry_orders`
-   `laundry_order_items`
-   Supplier management and supplier purchase-order workflows
-   Laundry ordering and laundry item tracking

The word `LAUNDRY` should also be removed from the folio
department/category options unless the hotel later adds that service.

### Payment decision

Use **Chapa as the online payment gateway** for guest payments. The PMS
backend creates Chapa checkout requests, stores payment attempts,
receives Chapa callbacks/webhooks, verifies transactions with Chapa, and
records confirmed payments in the hotel's financial ledger.

Chapa is a payment provider, not the hotel's accounting ledger. The PMS
must retain its own `payments`, `folio_transactions`, and invoice
records. Never trust a browser redirect alone as proof of payment.

The exact payment methods displayed by Chapa depend on the merchant
account and the payment methods enabled for it. Do not hard-code a
promise that every method is available.

------------------------------------------------------------------------

## 2. Recommended architecture

``` mermaid
flowchart LR
    Guest[Guest / Staff] --> React[React Web App]
    React --> API[Express REST API]
    API --> Auth[Authentication & RBAC]
    API --> Services[Hotel Business Services]
    Services --> DB[(PostgreSQL)]
    Services --> Chapa[Chapa API]
    Chapa -->|Webhook / callback| API
    API -->|Verify with Chapa| Chapa
    API -->|Verified result| DB
    API --> Realtime[WebSocket / Socket.IO]
    Realtime --> React
```

**Responsibilities**

-   **React:** guest booking portal, reception dashboard, kitchen
    display, housekeeping dashboard, maintenance dashboard,
    administration and reports.
-   **Express/Node:** authentication, authorization, validation,
    business rules, Chapa integration, database transactions and webhook
    processing.
-   **PostgreSQL:** authoritative data store for bookings, room state,
    folios, payments, inventory and audit records.
-   **Chapa:** online checkout and payment processing. Chapa secrets
    must never be sent to React.
-   **WebSocket/Socket.IO:** real-time order, room-task and
    service-request updates. REST remains the source of truth.

------------------------------------------------------------------------

## 3. Updated database domains and table inventory

The recommended design below contains the original PMS domains, fixes
important relationship gaps, and adds payment, invoice,
inventory-recipe, RBAC and operational support.

### 3.1 Identity, roles and security

  -----------------------------------------------------------------------
  Table                   Key fields              Purpose
  ----------------------- ----------------------- -----------------------
  `users`                 `id` PK, `name`,        Staff accounts and
                          `email` UNIQUE,         optional guest login
                          `password_hash`,        accounts. Keep
                          `phone`, `department`,  authentication identity
                          `shift`, `status`,      separate from guest
                          timestamps              profile details.

  `roles`                 `id` PK, `name` UNIQUE, Defines roles such as
                          `description`           ADMIN, RECEPTIONIST,
                                                  KITCHEN, HOUSEKEEPING,
                                                  MAINTENANCE and
                                                  MANAGER.

  `permissions`           `id` PK, `code` UNIQUE, Fine-grained
                          `description`           permissions such as
                                                  `booking.check_in`,
                                                  `folio.refund` and
                                                  `room.update`.

  `user_roles`            `user_id` FK, `role_id` Allows a user to have
                          FK, composite PK        one or more roles.

  `role_permissions`      `role_id` FK,           Assigns permissions to
                          `permission_id` FK,     roles.
                          composite PK            

  `activity_logs`         `id` PK, `user_id` FK   Security and business
                          nullable, `action`,     audit trail. Record
                          `entity_type`,          important changes
                          `entity_id`, `details`  without storing
                          JSONB, `ip_address`,    passwords, tokens or
                          `created_at`            card data.

  `system_settings`       `key` PK, `value`       Hotel settings such as
                          JSONB, `description`,   check-in time,
                          `updated_by` FK,        check-out time, tax
                          `updated_at`            configuration and
                                                  booking policies.
  -----------------------------------------------------------------------

**Recommendations**

-   Store only password hashes generated by a modern password-hashing
    library; never store plain-text passwords.
-   Enforce permissions on the Express API, not only by hiding React
    buttons.
-   Use `status` values such as ACTIVE, INACTIVE and SUSPENDED
    consistently.
-   Do not use a single hard-coded role column if staff may need
    multiple responsibilities.

### 3.2 Room inventory and room availability

  ------------------------------------------------------------------------
  Table                   Key fields               Purpose
  ----------------------- ------------------------ -----------------------
  `room_categories`       `id` PK, `name` UNIQUE,  Room types such as
                          `description`,           Standard, Deluxe and
                          `default_capacity`,      Suite.
                          `base_rate`, `features`  
                          JSONB, `image_url`,      
                          timestamps               

  `rooms`                 `room_number` PK,        Each physical room and
                          `category_id` FK,        its operational state.
                          `floor`, `capacity`,     
                          `rate`,                  
                          `occupancy_status`,      
                          `housekeeping_status`,   
                          `maintenance_status`,    
                          timestamps               
  ------------------------------------------------------------------------

Keep the three room states separate:

-   `occupancy_status`: VACANT or OCCUPIED.
-   `housekeeping_status`: CLEAN, DIRTY, CLEANING or INSPECTION.
-   `maintenance_status`: AVAILABLE, MAINTENANCE or OUT_OF_SERVICE.

A room is eligible for allocation only when it is not already booked for
overlapping dates, is not out of service, and meets the hotel's
housekeeping/inspection policy. A room being marked VACANT does **not**
mean it is available for every future date.

### 3.3 Guest profiles and reservations

  ---------------------------------------------------------------------------
  Table                      Key fields               Purpose
  -------------------------- ------------------------ -----------------------
  `guest_profiles`           `id` PK, `user_id` FK    Guest CRM profile and
                             nullable, `email`,       stay history. Restrict
                             `first_name`,            access to
                             `last_name`, `phone`,    identity-document
                             `nationality`,           fields.
                             `id_type`, `id_number`,  
                             `vip_tier`,              
                             `is_blacklisted`,        
                             `total_stays`,           
                             `lifetime_spend`,        
                             timestamps               

  `rate_plans`               `id` PK, `name`,         Flexible rate plans
                             `description`,           such as standard,
                             `cancellation_policy`,   refundable and
                             `is_active`              promotional rates.

  `bookings`                 `id` PK,                 Reservation record.
                             `guest_profile_id` FK,   Preserve the agreed
                             `room_number` FK         price and guest details
                             nullable until           needed for the
                             allocation,              reservation.
                             `room_category_id` FK,   
                             `rate_plan_id` FK,       
                             `check_in`, `check_out`, 
                             `guest_count`,           
                             `room_rate`, `currency`, 
                             `status`,                
                             `booking_source`,        
                             `special_requests`,      
                             timestamps               

  `booking_status_history`   `id` PK, `booking_id`    Records reservation
                             FK, `old_status`,        status changes.
                             `new_status`,            
                             `changed_by` FK          
                             nullable, `reason`,      
                             `created_at`             

  `room_blocks`              `id` PK, `room_number`   Blocks rooms for
                             FK, `start_date`,        maintenance, owner use
                             `end_date`, `reason`,    or operational reasons.
                             `status`, `created_by`   
                             FK                       
  ---------------------------------------------------------------------------

**Booking status recommendation:** PENDING_PAYMENT, CONFIRMED,
CHECKED_IN, CHECKED_OUT, CANCELLED and NO_SHOW. If reception can confirm
bookings without online payment, support a clearly controlled CONFIRMED
path.

**Important reservation rule:** availability must be calculated using
date overlap, not only `rooms.occupancy_status`.

Two date ranges overlap when:

``` sql
existing.check_in < requested_check_out
AND existing.check_out > requested_check_in
```

Exclude cancelled/no-show bookings and rooms blocked for any part of the
requested period. Enforce the rule safely in the backend and, where
practical, with PostgreSQL exclusion constraints using a date range and
room identifier. Use a transaction/locking strategy to prevent two
guests reserving the same room at the same time.

### 3.4 Stays, folios, charges and payments

  ----------------------------------------------------------------------------
  Table                      Key fields                Purpose
  -------------------------- ------------------------- -----------------------
  `stays`                    `id` PK, `booking_id` FK, Actual occupancy period
                             `room_number` FK,         created at check-in. Do
                             `check_in_time`,          not store a reusable
                             `check_out_time`,         physical access secret
                             `status`,                 in plain text.
                             `digital_key_reference`   
                             nullable, timestamps      

  `folios`                   `id` PK, `booking_id` FK, Guest account for room
                             `room_number` FK,         charges and other hotel
                             `folio_type`, `status`,   services.
                             `currency`, `balance`,    
                             timestamps                

  `folio_transactions`       `id` PK, `folio_id` FK,   Immutable financial
                             `transaction_type`,       ledger entries for
                             `department`,             charges, payments,
                             `description`, `amount`,  refunds, discounts and
                             `tax_amount`,             void/reversal records.
                             `reference_type`,         
                             `reference_id`,           
                             `posted_by` FK nullable,  
                             `created_at`              

  `payments`                 `id` PK, `folio_id` FK    Local record of each
                             nullable, `booking_id` FK payment attempt and its
                             nullable, `amount`,       final verified result.
                             `currency`, `provider`,   
                             `provider_tx_ref` UNIQUE  
                             nullable, `checkout_url`  
                             nullable, `status`,       
                             `payment_type`,           
                             `idempotency_key` UNIQUE, 
                             `paid_at`,                
                             `failure_reason`,         
                             timestamps                

  `payment_webhook_events`   `id` PK, `provider`,      Stores webhook/callback
                             `provider_event_id`       processing metadata for
                             nullable, `tx_ref`,       safe retries and
                             `payload` JSONB,          troubleshooting. Do not
                             `signature_valid`,        store secrets or
                             `processing_status`,      unnecessary
                             `received_at`,            personal/payment data
                             `processed_at`            in the payload.

  `invoices`                 `id` PK, `folio_id` FK,   Formal invoice header.
                             `invoice_number` UNIQUE,  
                             `issued_to_name`,         
                             `issued_to_tax_id`        
                             nullable, `subtotal`,     
                             `tax_total`,              
                             `grand_total`,            
                             `currency`, `status`,     
                             `issued_at`               

  `invoice_items`            `id` PK, `invoice_id` FK, Itemized invoice
                             `description`,            details.
                             `quantity`, `unit_price`, 
                             `tax_rate`, `line_total`  
  ----------------------------------------------------------------------------

**Financial rules**

1.  Store monetary values using PostgreSQL `NUMERIC`, not floating-point
    types.
2.  Keep a currency code with financial amounts. Use ETB as the default
    if that is the hotel's operating currency.
3.  `folio_transactions` is the financial history. Do not edit or delete
    posted financial entries to hide mistakes; post a reversal/void
    entry with an audit reason.
4.  `folios.balance` may be maintained as a cached balance for fast
    display, but it must be updated in the same database transaction as
    the ledger entry and periodically reconciled against transactions.
5.  A payment attempt is not a successful payment until the backend has
    verified it with Chapa.
6.  Do not let a payment callback directly overwrite the folio balance
    without recording a payment and corresponding ledger transaction.
7.  Support partial payments, multiple payments, failed attempts,
    refunds and payment reconciliation.

### 3.5 Chapa payment integration

#### Recommended payment flow

``` mermaid
sequenceDiagram
    actor Guest
    participant UI as React
    participant API as Express API
    participant DB as PostgreSQL
    participant Chapa

    Guest->>UI: Selects Pay and confirms amount
    UI->>API: POST /api/payments/initialize
    API->>DB: Create PENDING payment with unique tx_ref
    API->>Chapa: Initialize checkout using secret key
    Chapa-->>API: Checkout URL and initialization response
    API->>DB: Save provider reference and checkout metadata
    API-->>UI: Return checkout URL
    UI->>Guest: Redirect to Chapa checkout
    Guest->>Chapa: Completes or abandons payment
    Chapa-->>API: Webhook/callback notification
    API->>API: Validate notification according to Chapa guidance
    API->>Chapa: Verify transaction using server credentials
    Chapa-->>API: Verified transaction details
    API->>DB: Mark payment successful once only
    API->>DB: Insert folio transaction and update balance atomically
    API-->>UI: Payment status available to guest
```

#### Backend responsibilities

-   Create the payment record before calling Chapa, using a unique
    transaction reference (`tx_ref`) and idempotency key.
-   Initialize Chapa checkout from the Express backend using credentials
    stored in environment variables.
-   Return only the checkout URL and safe status information to React.
-   Verify the transaction with Chapa on the backend before treating it
    as paid.
-   Validate webhook authenticity using the current Chapa documentation
    and the configured verification mechanism. Do not assume a browser
    redirect or unverified webhook body is sufficient.
-   Make webhook handling idempotent: processing the same event more
    than once must not create duplicate payments or duplicate folio
    charges.
-   Check that verified amount, currency and transaction reference match
    the local pending payment.
-   Record successful payment, folio transaction and balance update in
    one PostgreSQL transaction.
-   Record failed, cancelled, expired and pending outcomes without
    falsely marking them paid.
-   Provide a reconciliation process for payments whose callback was
    delayed or missed.

#### Suggested API endpoints

  -------------------------------------------------------------------------------
  Method                  Endpoint                        Purpose
  ----------------------- ------------------------------- -----------------------
  `POST`                  `/api/payments/initialize`      Create local payment
                                                          attempt and initialize
                                                          Chapa checkout.

  `GET`                   `/api/payments/:id`             Return the
                                                          authenticated user's
                                                          payment status.

  `POST`                  `/api/payments/chapa/webhook`   Receive Chapa server
                                                          notification and verify
                                                          transaction.

  `POST`                  `/api/payments/:id/reconcile`   Staff/admin-protected
                                                          reconciliation action,
                                                          if needed.

  `POST`                  `/api/payments/:id/refund`      Authorized refund
                                                          workflow, subject to
                                                          provider support and
                                                          verification.
  -------------------------------------------------------------------------------

The exact callback/webhook URL, request fields, signature/verification
method, response format and refund support must follow the current Chapa
merchant/API documentation. Treat this document as the PMS design, not
as a replacement for Chapa's current integration contract.

#### Environment variables

``` env
CHAPA_SECRET_KEY=your_server_side_secret
CHAPA_BASE_URL=the_current_chapa_api_base_url
CHAPA_CALLBACK_URL=https://your-domain.example/api/payments/chapa/webhook
APP_BASE_URL=https://your-domain.example
```

Use the actual values from the Chapa merchant dashboard/documentation.
Keep `.env` out of Git, commit only a `.env.example` with placeholder
values, and never expose `CHAPA_SECRET_KEY` in React environment
variables or browser code. Use HTTPS in production.

### 3.6 Restaurant, room service and kitchen display

  ------------------------------------------------------------------------
  Table                   Key fields               Purpose
  ----------------------- ------------------------ -----------------------
  `menu_items`            `id` PK, `name`,         Food and beverage menu.
                          `category`, `price`,     
                          `currency`,              
                          `prep_time_minutes`,     
                          `is_available`,          
                          `description`,           
                          `image_url`, timestamps  

  `orders`                `id` PK, `room_number`   Room-service and, if
                          FK nullable,             enabled, restaurant
                          `booking_id` FK          orders.
                          nullable,                
                          `guest_profile_id` FK    
                          nullable, `order_type`,  
                          `status`, `subtotal`,    
                          `tax_total`, `total`,    
                          `currency`, `notes`,     
                          `created_by` FK          
                          nullable, timestamps     

  `order_items`           `id` PK, `order_id` FK,  Order lines. Store name
                          `menu_item_id` FK,       and price snapshots so
                          `item_name_snapshot`,    historical receipts do
                          `unit_price_snapshot`,   not change when menu
                          `quantity`,              prices change.
                          `line_total`, `notes`    

  `recipes`               `id` PK, `menu_item_id`  Recipe definition for a
                          FK UNIQUE,               menu item.
                          `instructions`,          
                          timestamps               

  `recipe_items`          `id` PK, `recipe_id` FK, Many-to-many
                          `inventory_item_id` FK,  recipe-to-ingredient
                          `quantity_required`,     mapping.
                          `unit`                   

  `inventory_items`       `id` PK, `name`,         Food, beverage and
                          `category`,              operational stock
                          `quantity_on_hand`,      items.
                          `unit`,                  
                          `minimum_quantity`,      
                          `cost_per_unit`,         
                          `status`, timestamps     

  `stock_movements`       `id` PK,                 Auditable stock
                          `inventory_item_id` FK,  additions, usage, waste
                          `movement_type`,         and corrections.
                          `quantity`, `unit_cost`, 
                          `reference_type`,        
                          `reference_id`,          
                          `performed_by` FK,       
                          `created_at`             
  ------------------------------------------------------------------------

**Why recipes and recipe items?** A single menu item can consume several
ingredients, and one ingredient can be used by many menu items. A single
`linked_menu_item_id` on inventory cannot model this correctly.

**Order status:** PENDING, ACCEPTED, COOKING, READY, DELIVERED and
CANCELLED. Define allowed transitions in the backend.

**Folio charging:** Decide whether room-service charges are posted when
an order is delivered or when it is accepted. Recommended: post once
when delivered; if the hotel takes direct payment at ordering time, use
the payment flow instead. Use a unique reference to prevent duplicate
charges after retries.

### 3.7 Housekeeping and room operations

  ------------------------------------------------------------------------
  Table                    Key fields              Purpose
  ------------------------ ----------------------- -----------------------
  `housekeeping_tasks`     `id` PK, `room_number`  Room cleaning queue and
                           FK, `priority`,         assignment.
                           `assigned_to` FK        
                           nullable, `status`,     
                           `started_at`,           
                           `completed_at`,         
                           `created_at`            

  `housekeeping_history`   `id` PK, `room_number`  Historical cleaning and
                           FK, `task_id` FK        inspection record.
                           nullable, `cleaner_id`  
                           FK, `inspected_by` FK   
                           nullable, `action`,     
                           `notes`,                
                           `duration_minutes`,     
                           `status`,               
                           `completed_at`          

  `service_requests`       `id` PK, `room_number`  Concierge, extra
                           FK nullable,            towels, luggage
                           `booking_id` FK         assistance, amenities
                           nullable,               and other guest
                           `guest_profile_id` FK   requests.
                           nullable,               
                           `service_type`,         
                           `priority`, `status`,   
                           `department`,           
                           `assigned_to` FK        
                           nullable,               
                           `charge_amount`,        
                           `created_at`,           
                           `completed_at`          

  `maintenance_tickets`    `id` PK, `room_number`  Repairs, defects and
                           FK nullable,            room availability
                           `severity`, `status`,   restrictions.
                           `inventory_impact`,     
                           `issue_description`,    
                           `reported_by` FK,       
                           `assigned_to` FK        
                           nullable, `start_date`, 
                           `end_date`,             
                           `estimated_cost`,       
                           `actual_cost`,          
                           timestamps              
  ------------------------------------------------------------------------

Use user IDs for assignments, not staff names stored as free-text.
Display names can be joined from `users`.

### 3.8 Night audit and reporting

  --------------------------------------------------------------------------
  Table                   Key fields                 Purpose
  ----------------------- -------------------------- -----------------------
  `night_audit_logs`      `id` PK, `business_date`   Snapshot of daily
                          UNIQUE, `closed_at`,       operational and
                          `auditor_id` FK,           financial metrics.
                          `rooms_occupied`,          
                          `total_available_rooms`,   
                          `rooms_out_of_order`,      
                          `occupancy_rate`,          
                          `total_room_revenue`,      
                          `total_fnb_revenue`,       
                          `total_tax_collected`,     
                          `adr`, `revpar`            

  --------------------------------------------------------------------------

Compute reporting values from validated source records and store the
audit snapshot for historical comparison. Clearly define the hotel's
business-day cutoff; it may not be midnight.

------------------------------------------------------------------------

## 4. Relationship overview

``` mermaid
erDiagram
    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : assigned
    ROLES ||--o{ ROLE_PERMISSIONS : grants
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : included

    ROOM_CATEGORIES ||--o{ ROOMS : classifies
    ROOMS ||--o{ BOOKINGS : allocated
    GUEST_PROFILES ||--o{ BOOKINGS : makes
    RATE_PLANS ||--o{ BOOKINGS : prices
    BOOKINGS ||--o{ STAYS : creates
    BOOKINGS ||--o| FOLIOS : owns
    ROOMS ||--o{ STAYS : accommodates

    FOLIOS ||--o{ FOLIO_TRANSACTIONS : records
    FOLIOS ||--o{ PAYMENTS : receives
    BOOKINGS ||--o{ PAYMENTS : paid_by
    FOLIOS ||--o{ INVOICES : invoiced
    INVOICES ||--|{ INVOICE_ITEMS : contains
    PAYMENTS ||--o{ PAYMENT_WEBHOOK_EVENTS : notified

    MENU_ITEMS ||--o{ ORDER_ITEMS : selected
    ORDERS ||--|{ ORDER_ITEMS : contains
    BOOKINGS ||--o{ ORDERS : associated
    MENU_ITEMS ||--o| RECIPES : prepared_with
    RECIPES ||--|{ RECIPE_ITEMS : requires
    INVENTORY_ITEMS ||--o{ RECIPE_ITEMS : ingredient
    INVENTORY_ITEMS ||--o{ STOCK_MOVEMENTS : tracked

    ROOMS ||--o{ HOUSEKEEPING_TASKS : cleaned
    HOUSEKEEPING_TASKS ||--o{ HOUSEKEEPING_HISTORY : history
    ROOMS ||--o{ MAINTENANCE_TICKETS : maintained
    ROOMS ||--o{ SERVICE_REQUESTS : requested
    BOOKINGS ||--o{ SERVICE_REQUESTS : initiates
    USERS ||--o{ ACTIVITY_LOGS : performs
```

The diagram is a conceptual overview. Implement all foreign keys,
nullability and uniqueness rules in the actual PostgreSQL migrations.

------------------------------------------------------------------------

## 5. Recommended system functionality by user role

### 5.1 Guest / public visitor

1.  Browse room categories, room photos, facilities and prices.
2.  Search availability by check-in date, check-out date and guest
    count.
3.  View the total price, taxes/fees and cancellation policy before
    booking.
4.  Create a reservation and receive a unique booking reference.
5.  Pay online through Chapa when online prepayment is required.
6.  View booking and payment status.
7.  Request cancellation or modification subject to hotel policy.
8.  Register/sign in and manage profile information.
9.  For an in-house guest: view folio, order room service, request hotel
    services and download an invoice.
10. Receive booking, payment and service status notifications.

Do not expose other guests' booking details, identity documents or
folios.

### 5.2 Reception / front desk

1.  Search bookings by reference, guest name or date.
2.  Create walk-in reservations.
3.  Verify guest identity and update the guest profile.
4.  Assign an eligible room.
5.  Check in a confirmed guest and create a stay.
6.  View room occupancy, housekeeping and maintenance states.
7.  Add authorized charges to a guest folio.
8.  Record approved non-online payment methods only if hotel policy
    requires them; Chapa remains the online gateway.
9.  Process checkout after reviewing all charges and payments.
10. Generate and print/download invoices.
11. Record no-shows, cancellations and approved adjustments with
    reasons.

### 5.3 Kitchen team

1.  View new orders in a real-time KDS queue.
2.  Accept or reject an order with a reason.
3.  Move an order through preparation states.
4.  Mark an order ready and delivered.
5.  View order notes and room/booking references only as required.
6.  Mark menu items unavailable when ingredients are insufficient.
7.  See low-stock alerts for ingredients.

### 5.4 Housekeeping

1.  View assigned cleaning tasks.
2.  Prioritize checkout, VIP and urgent tasks.
3.  Start cleaning and update task status.
4.  Submit a room for inspection.
5.  Record inspection pass/fail and notes.
6.  Return a failed room to cleaning.
7.  View housekeeping history for authorized rooms.

### 5.5 Maintenance

1.  Report a room or facility defect.
2.  Assign a technician and severity.
3.  Mark the room as maintenance/out of service when required.
4.  Update repair progress and cost.
5.  Record resolution notes.
6.  Release a room only after the required maintenance and housekeeping
    checks.

### 5.6 Administrator / manager

1.  Manage staff, roles and permissions.
2.  Manage room categories, rooms, rates and rate plans.
3.  Configure taxes, check-in/out times and cancellation rules.
4.  Monitor reservations, occupancy, revenue and payment status.
5.  Review Chapa payment reconciliation and failed/pending transactions.
6.  Manage menu items, recipes and stock.
7.  Review maintenance, housekeeping and service performance.
8.  Run night audit and export management reports.
9.  Review audit logs and investigate unusual actions.

------------------------------------------------------------------------

## 6. Critical end-to-end workflows

### 6.1 Online reservation and Chapa payment

1.  Guest selects dates and room category.
2.  API checks date-overlap availability and room restrictions.
3.  Guest enters required information and confirms the booking terms.
4.  API creates a PENDING_PAYMENT booking (or a short-lived reservation
    hold).
5.  API creates a pending payment attempt and unique `tx_ref`.
6.  API initializes Chapa checkout and returns the checkout URL.
7.  Guest completes payment on Chapa.
8.  Backend receives a callback/webhook and verifies the transaction
    with Chapa.
9.  Backend checks reference, amount and currency.
10. In one database transaction, mark payment successful, add the folio
    payment entry, update the balance and confirm the booking.
11. Guest sees confirmed booking and payment receipt.
12. If payment fails or expires, release the temporary room hold
    according to the configured timeout and policy.

### 6.2 Check-in

1.  Reception searches the booking reference.
2.  Verify booking status, guest identity, payment/deposit policy and
    room readiness.
3.  Confirm the assigned room is still eligible.
4.  In one PostgreSQL transaction, update booking status, create the
    stay, mark the room occupied and write the activity log.
5.  Issue the hotel's approved key/card process.
6.  Show the active stay and folio to authorized staff.

### 6.3 Room service and folio

1.  Guest selects menu items and quantities.
2.  API validates availability and calculates prices/taxes from trusted
    database values.
3.  Create order and order items using price snapshots.
4.  Broadcast the new order to KDS.
5.  Kitchen updates order status.
6.  When the order reaches the configured charge event (recommended:
    DELIVERED), create one folio charge.
7.  Update the folio balance atomically and notify the guest.
8.  A retry must not create another charge for the same order.

### 6.4 Checkout

1.  Reception opens the active stay and folio.
2.  API calculates all charges, taxes, payments, discounts and refunds.
3.  Resolve outstanding balance: collect it through Chapa or another
    explicitly authorized hotel payment process.
4.  Verify Chapa payment server-side before settlement.
5.  Issue invoice/receipt.
6.  In one transaction, settle folio, complete stay, check out booking,
    mark room vacant and dirty, and create a housekeeping task.
7.  Housekeeping cleans and inspects the room before it becomes ready
    for the next guest.

### 6.5 Maintenance

1.  Staff reports a defect.
2.  Create maintenance ticket and assign technician.
3.  If guest safety or room usability is affected, mark room
    OUT_OF_SERVICE.
4.  Technician records repair work, used stock (if applicable) and cost.
5.  Supervisor verifies resolution.
6.  Restore maintenance availability only after required checks.
7.  If room became dirty during repair, housekeeping must clean and
    inspect it before allocation.

------------------------------------------------------------------------

## 7. Database integrity and implementation rules

Implement these constraints and rules in PostgreSQL and the Express
service layer:

-   Use primary keys and explicit foreign keys for all relationships.
-   Use `NOT NULL` for required fields and `UNIQUE` for emails, room
    numbers, invoice numbers and provider transaction references where
    appropriate.
-   Use `CHECK` constraints for positive quantities, non-negative prices
    and valid date order (`check_out > check_in`).
-   Use PostgreSQL `NUMERIC(12,2)` or a suitable precision for money;
    never JavaScript floating-point arithmetic as the authoritative
    financial calculation.
-   Use `TIMESTAMPTZ` for event timestamps and a clearly defined hotel
    timezone/business date.
-   Use database transactions for check-in, checkout, payment posting,
    folio updates and stock consumption.
-   Use `ON DELETE RESTRICT` for important financial and booking
    history. Prefer soft deactivation over deleting operational records.
-   Add indexes to common search fields: booking dates/status, guest
    email/phone, room status, folio ID, payment `tx_ref`, order
    status/created time and task assignment/status.
-   Keep payment and financial audit records immutable; use reversal
    entries for corrections.
-   Store user assignments as foreign keys, not names.
-   Use snapshots for historical prices and invoice line descriptions.
-   Add pagination, filtering and server-side validation to list
    endpoints.
-   Use UTC timestamps internally; convert to the hotel's configured
    timezone in the UI and business-date logic.

### Suggested PostgreSQL data types

  ---------------------------------------------------------------------------
  Data                                Type
  ----------------------------------- ---------------------------------------
  IDs                                 `BIGINT GENERATED ALWAYS AS IDENTITY`
                                      or UUID, used consistently

  Money                               `NUMERIC(12,2)`

  Currency                            `CHAR(3)`

  Date-only booking dates             `DATE`

  Event timestamps                    `TIMESTAMPTZ`

  Flexible settings/details           `JSONB`

  Status values                       PostgreSQL ENUM or `VARCHAR` with
                                      `CHECK` constraint
  ---------------------------------------------------------------------------

Choose either UUID or identity-based IDs consistently. Human-readable
booking references can be separate unique columns; do not use them as a
substitute for internal relational keys.

------------------------------------------------------------------------

## 8. Security and payment safety checklist

-   [x] Chapa secret key exists only on the backend.
-   [x] `.env` is excluded from Git and production secrets are stored
    securely.
-   [x] HTTPS is enabled in production.
-   [x] Backend verifies every successful payment directly with Chapa.
-   [x] Amount, currency and `tx_ref` are matched to the local payment
    record.
-   [x] Duplicate callbacks/webhooks cannot duplicate payment or folio
    entries.
-   [x] Webhook authenticity is validated using the current Chapa
    integration instructions.
-   [x] Payment initialization and refund endpoints require
    authentication/authorization where appropriate.
-   [x] Guest endpoints can access only the authenticated guest's own
    bookings, payments and folios.
-   [x] Admin/refund actions are permission-protected and audited.
-   [x] No card number, CVV, secret key or access token is stored in PMS
    tables or logs.
-   [x] Rate limiting is enabled on login, booking and payment
    initialization endpoints.
-   [x] Input validation, SQL parameterization and secure error handling
    are used.
-   [x] Sensitive identity fields are access-controlled and excluded
    from ordinary logs.

------------------------------------------------------------------------

## 9. Recommended delivery roadmap

Implement in small, testable phases rather than building every module at
once.

  -----------------------------------------------------------------------
  Phase                   Scope                   Completion criteria
  ----------------------- ----------------------- -----------------------
  1                       Database foundation,    Constraints,
                          migrations, users,      migrations,
                          RBAC, activity logs     authentication and
                                                  permission tests pass.

  2                       Room categories, rooms, Room CRUD, state
                          room states and room    transitions and room
                          blocks                  eligibility tests pass.

  3                       Guest profiles, rate    Date-overlap,
                          plans, reservation      concurrent booking,
                          calendar and booking    cancellation and
                                                  modification tests
                                                  pass.

  4                       Chapa payments, payment Success, failure,
                          attempts, webhook       duplicate webhook,
                          verification and        wrong amount, timeout
                          reconciliation          and retry tests pass.

  5                       Check-in, stays,        Full guest financial
                          folios, transactions,   lifecycle and atomic
                          invoices and checkout   transaction tests pass.

  6                       Menu, orders, KDS,      Order lifecycle, stock
                          recipes and inventory   depletion and duplicate
                                                  folio-charge tests
                                                  pass.

  7                       Housekeeping, service   Assignment, inspection,
                          requests and            room release and audit
                          maintenance             tests pass.

  8                       Night audit, dashboard, Financial totals
                          reports and             reconcile with source
                          notifications           records and role access
                                                  is tested.

  9                       Hardening and           Security,
                          deployment              backup/restore,
                                                  performance, monitoring
                                                  and end-to-end tests
                                                  pass.
  -----------------------------------------------------------------------

### Required testing at every phase

-   **Database:** migration up/down where supported, constraints,
    foreign keys and transaction rollback.
-   **Backend:** unit tests and integration tests for endpoints,
    validation, authorization and business rules.
-   **Frontend:** component and workflow tests for loading, success,
    error and permission states.
-   **End-to-end:** realistic guest and staff workflows.
-   **Concurrency:** simultaneous room booking and duplicate payment
    callback scenarios.
-   **Financial correctness:** totals, tax, partial payments, refunds,
    reversals and reconciliation.

Do not mark a phase complete just because the UI renders. Its acceptance
tests must pass.

------------------------------------------------------------------------

## 10. Important business decisions to confirm before implementation

These are configurable policy choices, not facts that the database can
decide:

1.  Does every online booking require full payment, a deposit, or can it
    be confirmed without prepayment?
2.  How long should an unpaid reservation hold a room before expiry?
3.  What are the hotel's cancellation, no-show and refund rules?
4.  Is Chapa used only for online prepayment and checkout, or also for
    restaurant/other service payments?
5.  Are walk-in cash or bank-transfer payments permitted? If yes, which
    roles can record them and what evidence is required?
6.  What tax rates, invoice fields and business-day cutoff does the
    hotel require?
7.  Can guests choose a room number during booking, or does reception
    allocate the physical room later?

Store approved policies in `system_settings` or dedicated configuration
tables; do not scatter business rules across React components.

------------------------------------------------------------------------

## 11. Final recommended scope

This version keeps the hotel PMS focused on:

-   Identity, staff roles and audit history
-   Room categories, rooms, availability and reservations
-   Guest profiles and actual stays
-   Folios, payments through Chapa, invoices and reconciliation
-   Restaurant/room-service orders and kitchen display
-   Inventory, recipes and stock movements

