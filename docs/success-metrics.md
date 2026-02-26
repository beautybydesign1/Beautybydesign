# Luxury Home Glam – Success Metrics & KPI Tracking Plan

---

## 1. Overview

This document defines the measurable success criteria for the MVP launch. Metrics are organized into three categories: **Business**, **User Experience**, and **Operational**. Each metric includes a definition, target, data source, and measurement method.

---

## 2. Business Metrics

### 2.1 Deposit Collection Rate

| Attribute | Value |
|---|---|
| **Definition** | % of completed bookings where the 50% deposit was successfully collected |
| **Target** | ≥ 70% |
| **Formula** | `(Bookings with deposit paid / Total confirmed bookings) × 100` |
| **Data Source** | Stripe Dashboard + Google Sheets |
| **Frequency** | Weekly |

### 2.2 Pricing Chat Reduction

| Attribute | Value |
|---|---|
| **Definition** | % reduction in WhatsApp messages where clients ask "how much is…?" or similar pricing questions |
| **Target** | ≥ 40% reduction vs. pre-MVP baseline |
| **Formula** | `((Pre-MVP pricing chats/week − Post-MVP pricing chats/week) / Pre-MVP pricing chats/week) × 100` |
| **Data Source** | Manual WhatsApp message count (beautician self-report) |
| **Frequency** | Bi-weekly for first month, then monthly |

> [!NOTE]
> Establish the baseline by counting pricing-related messages for 2 weeks before launch.

### 2.3 Booking Completion Rate

| Attribute | Value |
|---|---|
| **Definition** | % of users who start the booking form and complete payment |
| **Target** | ≥ 50% |
| **Formula** | `(Completed payments / Booking form starts) × 100` |
| **Data Source** | Google Analytics events + Stripe |
| **Frequency** | Weekly |

### 2.4 Revenue per Booking

| Attribute | Value |
|---|---|
| **Definition** | Average total booking value (service + travel fee) |
| **Target** | Tracking only (no target for MVP) |
| **Formula** | `Sum of all grand totals / Total bookings` |
| **Data Source** | Google Sheets |
| **Frequency** | Monthly |

---

## 3. User Experience Metrics

### 3.1 Booking Completion Time

| Attribute | Value |
|---|---|
| **Definition** | Time from first page load to successful payment completion |
| **Target** | ≤ 2 minutes (median) |
| **Formula** | `Median(payment_timestamp − page_load_timestamp)` |
| **Data Source** | Google Analytics (custom timing events) |
| **Frequency** | Weekly |

### 3.2 Form Abandonment by Step

| Attribute | Value |
|---|---|
| **Definition** | Drop-off rate at each step of the booking flow |
| **Target** | No single step > 30% drop-off |
| **Tracking Events** | `step_1_complete`, `step_2_complete`, `step_3_complete`, `payment_success` |
| **Data Source** | Google Analytics funnel |
| **Frequency** | Weekly |

### 3.3 Mobile Performance Score

| Attribute | Value |
|---|---|
| **Definition** | Google Lighthouse Performance score on mobile |
| **Target** | ≥ 90 |
| **Tool** | Lighthouse CI or PageSpeed Insights |
| **Frequency** | On every deployment + weekly spot-check |

### 3.4 Mobile Responsiveness

| Attribute | Value |
|---|---|
| **Definition** | No horizontal scroll, no overlapping elements, no clipped text on viewports 320px–428px |
| **Target** | 100% pass |
| **Tool** | Manual QA on Chrome DevTools device emulation (iPhone SE, iPhone 14, Pixel 7) |
| **Frequency** | On every deployment |

---

## 4. Operational Metrics

### 4.1 WhatsApp Confirmation Delivery Rate

| Attribute | Value |
|---|---|
| **Definition** | % of bookings where both client and beautician received WhatsApp messages |
| **Target** | 100% |
| **Formula** | `(Successful message deliveries / (Total bookings × 2)) × 100` |
| **Data Source** | Twilio delivery logs / Meta WhatsApp API status callbacks |
| **Frequency** | Real-time monitoring + weekly summary |

### 4.2 Manual Price Calculations

| Attribute | Value |
|---|---|
| **Definition** | Number of times the beautician manually calculates a price for a client |
| **Target** | 0 (zero) |
| **Data Source** | Beautician self-report |
| **Frequency** | Weekly for first month |

### 4.3 Payment Webhook Reliability

| Attribute | Value |
|---|---|
| **Definition** | % of Stripe payment events successfully processed by the webhook |
| **Target** | ≥ 99.5% |
| **Formula** | `(Successful webhook executions / Total Stripe events received) × 100` |
| **Data Source** | Server logs + Stripe webhook dashboard |
| **Frequency** | Daily monitoring |

### 4.4 System Uptime

| Attribute | Value |
|---|---|
| **Definition** | % of time the booking page is accessible and functional |
| **Target** | ≥ 99.5% |
| **Data Source** | Uptime monitoring service (e.g., UptimeRobot, Better Stack) |
| **Frequency** | Continuous |

---

## 5. Analytics Implementation Plan

### Required Tracking Events

| Event Name | Trigger | Properties |
|---|---|---|
| `booking_started` | User loads booking page | `timestamp`, `referrer`, `device` |
| `step_1_complete` | User submits details | `timestamp` |
| `step_2_complete` | User selects service(s) + date | `services_selected`, `timestamp` |
| `address_entered` | Address autocomplete selected | `distance_miles`, `travel_fee` |
| `step_3_complete` | User views order summary | `grand_total`, `deposit_amount` |
| `payment_initiated` | User clicks Pay button | `amount`, `payment_type` (deposit/full) |
| `payment_success` | Stripe confirms payment | `booking_id`, `amount`, `stripe_session_id` |
| `payment_failed` | Stripe reports failure | `error_code`, `timestamp` |
| `whatsapp_sent` | WhatsApp message delivered | `recipient_type` (client/beautician), `status` |

### Tools

| Tool | Purpose |
|---|---|
| **Google Analytics 4** | Funnel tracking, user behavior, timing events |
| **Stripe Dashboard** | Payment metrics, revenue tracking |
| **Twilio / Meta Console** | WhatsApp delivery monitoring |
| **Google Sheets** | Booking record of truth |
| **Lighthouse CI** | Performance regression monitoring |

---

## 6. Reporting Cadence

| Report | Frequency | Audience | Contents |
|---|---|---|---|
| **Weekly Dashboard** | Every Monday | Beautician (owner) | Bookings this week, revenue, deposit rate, completion rate |
| **Monthly Review** | 1st of month | Beautician + Developer | All KPIs, trends, action items |
| **Incident Report** | As needed | Developer | Webhook failures, downtime, payment errors |

---

## 7. MVP Success Criteria (Go / No-Go)

The MVP is considered **successful** if, within **4 weeks of launch**, the following thresholds are met:

| Criterion | Threshold | Status |
|---|---|---|
| Deposit collection rate | ≥ 70% | ⬜ |
| Booking completion rate | ≥ 50% | ⬜ |
| Median booking time | ≤ 2 min | ⬜ |
| WhatsApp delivery rate | 100% | ⬜ |
| Manual price calculations | 0 | ⬜ |
| Mobile Lighthouse score | ≥ 90 | ⬜ |

> [!IMPORTANT]
> If 4+ of 6 criteria are met, the MVP is a **go** for continued iteration. If fewer than 4 are met, conduct a retrospective before further development.
