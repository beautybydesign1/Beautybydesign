# Beauty By Design – Lean MVP PRD

---

# 1. Product Overview

## Product Name

Luxury Home Glam – Smart Booking Link (MVP)

## Vision

Create a simple, premium booking link that automatically calculates service + travel cost, collects a 50% deposit, and sends instant WhatsApp confirmations — without an admin dashboard.

This MVP focuses only on solving the beautician’s core pain points:

* Manual travel fee calculation
* Back-and-forth pricing chats
* Chasing deposits
* Manual confirmations

No dashboards. No complex systems. Just automation.

---

# 2. Problem Statement

Currently:

* Travel fees are calculated manually
* Clients ask for total price repeatedly
* Deposits are not automatically enforced
* Booking confirmations are sent manually

This creates friction, delays, and inconsistent payment collection.

---

# 3. MVP Goals

## Primary Goals

1. Automatically calculate travel fee ($1 per mile)
2. Display full transparent pricing breakdown
3. Require 50% deposit before confirmation
4. Send automatic WhatsApp confirmations to both parties
5. Store booking record in a simple external system (Google Sheets / Airtable)

## Non-Goals (Out of Scope for MVP)

* Admin dashboard
* Complex reporting
* Loyalty systems
* Multi-staff management
* Subscription plans

---

# 4. Target User

Primary user: Solo home-service beautician
Secondary user: Clients booking makeup services at their homes

---

# 5. Core User Flow

## Client Booking Flow

1. Client opens booking link
2. Enters:

   * Full name
   * Phone number (WhatsApp enabled)
   * Email
3. Selects service(s)
4. Enters service address
5. System calculates:

   * Distance from beautician’s base location
   * Travel fee = Distance × $1
   * Service total
   * Grand total
   * Required deposit (50%)
6. Client proceeds to payment
7. After successful payment:

   * Booking is confirmed
   * WhatsApp sent to beautician
   * WhatsApp confirmation sent to client
   * Email receipt sent to client
   * Booking saved to Google Sheets

Total time to book: Under 2 minutes.

---

# 6. Functional Requirements

## 6.1 Booking Form

Fields:

* Full Name (Required)
* Phone Number (Required)
* Email (Required)
* Address (Google Autocomplete)
* Date
* Time
* Service Selection (Single or Multi-select)

---

## 6.2 Pricing Engine

Inputs:

* Base location (hardcoded in system)
* Service price(s)
* Distance API

Logic:

* Distance = Calculated via Maps API
* Travel Fee = Distance × $1
* Service Total = Sum of selected services
* Grand Total = Service Total + Travel Fee
* Deposit Required = 50% of Grand Total

Display:

Service Total: $XXX
Travel Fee: $XXX
----------------

Grand Total: $XXX
Deposit Due Today (50%): $XXX

---

## 6.3 Payment Integration

* Stripe Checkout (recommended)
* Pay deposit only (default)
* Optional: Pay in full toggle
* Secure hosted checkout page

On payment success:

* Trigger webhook
* Save booking record
* Send WhatsApp notifications

---

## 6.4 WhatsApp Automation

Integration Options:

* Twilio WhatsApp API
* Meta WhatsApp Cloud API

### Beautician Notification Template

New Booking ✨
Client: {Name}
Service: {Service}
Date: {Date}
Address: {Address}
Deposit Paid: ${Deposit}
Remaining Balance: ${Balance}

### Client Confirmation Template

Hi {Name} 💄✨
Your booking is confirmed!
Service: {Service}
Date: {Date}
Total: ${Total}
Deposit Paid: ${Deposit}
Remaining: ${Balance}
We look forward to glam you!

---

# 7. Data Storage (No Dashboard)

Bookings stored in:

* Google Sheets (via API or Zapier)

Columns:

* Booking ID
* Name
* Phone
* Email
* Address
* Date
* Service
* Distance
* Travel Fee
* Total
* Deposit Paid
* Remaining Balance
* Payment Status
* Timestamp

Beautician manages everything via:

* WhatsApp notifications
* Google Calendar (optional auto-sync)
* Stripe dashboard

---

# 8. Technical Architecture (Lean)

Frontend:

* Next.js or React
* Mobile-first responsive design

Backend:

* Node.js / Express
* REST API

Integrations:

* Google Maps Distance Matrix API
* Stripe
* WhatsApp API
* Google Sheets API

---

# 9. Success Metrics (MVP)

Business Metrics:

* ≥ 70% bookings with deposit paid
* ≥ 40% reduction in pricing-related chats
* ≥ 50% booking completion rate

User Metrics:

* Booking completion under 2 minutes
* Mobile performance score ≥ 90

Operational Metrics:

* 100% automated WhatsApp confirmations
* Zero manual price calculations

---

# 10. Implementation Timeline (Lean Build)

Phase 1:

* Finalize pricing logic
* Design UI

Phase 2:

* Build frontend form
* Integrate Maps API

Phase 3:

* Integrate Stripe
* Implement webhook logic

Phase 4:

* WhatsApp automation
* Google Sheets integration
* Testing & launch

---

# 11. Value Proposition

"A luxury home beauty booking experience with instant pricing, transparent travel fees, and secure deposit — all in under 2 minutes."

---

# 12. Future Expansion (Optional)

Only if business scales:

* Admin dashboard
* Promo codes
* Reminder automation
* Multi-staff support
* Analytics dashboard

For MVP: Keep it simple. Automate the pain. Launch fast.
