# Luxury Home Glam – Design Specification

---

## 1. Design Philosophy

**Premium, simple, fast.** The booking experience should feel like a luxury brand interaction — elegant typography, generous spacing, soft animations — while being ruthlessly simple. A client should go from opening the link to paying a deposit in **under 2 minutes** on a mobile phone.

### Design Principles

| Principle | Description |
|---|---|
| **Mobile-first** | Every screen designed for small screens first, then enhanced for desktop |
| **Luxury minimalism** | Clean layouts with purposeful whitespace; no visual clutter |
| **Transparency** | Real-time pricing breakdown visible at all times during the flow |
| **Speed** | Minimal steps, auto-complete inputs, instant calculations |
| **Trust** | Secure payment badges, clear refund language, professional branding |

---

## 2. Brand Identity

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#C2185B` | CTAs, active elements, accents |
| `--color-primary-light` | `#F8BBD0` | Hover states, highlights, soft accents |
| `--color-primary-dark` | `#880E4F` | Pressed states, headings |
| `--color-bg` | `#FFF8F9` | Page background — warm, soft pink-white |
| `--color-surface` | `#FFFFFF` | Card / form backgrounds |
| `--color-text` | `#1A1A2E` | Primary body text |
| `--color-text-muted` | `#6B7280` | Secondary / helper text |
| `--color-success` | `#059669` | Confirmation states |
| `--color-error` | `#DC2626` | Validation errors |
| `--color-border` | `#E5E7EB` | Subtle dividers and input borders |

### Typography

| Element | Font | Weight | Size (mobile / desktop) |
|---|---|---|---|
| Page title | Playfair Display | 700 | 28px / 36px |
| Section heading | Inter | 600 | 20px / 24px |
| Body text | Inter | 400 | 16px / 16px |
| Label | Inter | 500 | 14px / 14px |
| Helper / caption | Inter | 400 | 12px / 13px |
| Button text | Inter | 600 | 16px / 16px |
| Price numbers | DM Mono | 500 | 18px / 20px |

> [!NOTE]
> **Playfair Display** for luxury headings, **Inter** for clean readability, **DM Mono** for pricing figures to feel data-precise and premium.

### Border Radius

| Element | Radius |
|---|---|
| Buttons | `12px` |
| Cards / forms | `16px` |
| Inputs | `10px` |
| Badges / chips | `999px` (pill) |

### Shadows & Elevation

```css
--shadow-card:   0 2px 12px rgba(0, 0, 0, 0.06);
--shadow-button: 0 4px 14px rgba(194, 24, 91, 0.25);
--shadow-modal:  0 8px 30px rgba(0, 0, 0, 0.12);
```

---

## 3. Page Layout

The entire MVP is a **single-page, multi-step booking flow** — no navigation bar, no footer links. One focused path.

### Viewport Layout

```
┌────────────────────────────────────┐
│          Logo + Tagline            │  ← fixed top on mobile
├────────────────────────────────────┤
│                                    │
│     Step Indicator (1 · 2 · 3)     │
│                                    │
│     ┌──────────────────────────┐   │
│     │                          │   │
│     │      ACTIVE STEP CARD    │   │
│     │                          │   │
│     └──────────────────────────┘   │
│                                    │
│     [ < Back ]        [ Next > ]   │
│                                    │
├────────────────────────────────────┤
│       Pricing Breakdown (sticky)   │  ← always visible
└────────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| Mobile | `< 640px` | Single column, full-width cards, sticky pricing footer |
| Tablet | `640px – 1024px` | Centered card (max 560px), inline pricing sidebar |
| Desktop | `> 1024px` | Two-column: form left (560px) + pricing panel right (320px) |

---

## 4. Multi-Step Flow

### Step 1: Your Details

**Fields:**
- Full Name — text input, required
- Phone Number — tel input with country code prefix, required
- Email — email input, required

**Validation:** Inline, on blur. Red border + helper text on error.

### Step 2: Choose Service & Date

**Service Selection:**
- Grid of service cards (image thumbnail, name, price)
- Multi-select with checkbox/toggle indicator
- Selected cards have a primary-color border + subtle glow

**Date & Time:**
- Date picker (calendar-style, disable past dates)
- Time slot selector (scrollable pill buttons: 9:00 AM, 10:00 AM, …)

### Step 3: Your Address & Review

**Address Input:**
- Google Places Autocomplete text field
- On address selection → auto-trigger distance calculation
- Show: "📍 {distance} miles from base — Travel fee: ${fee}"

**Order Summary Card:**
```
┌──────────────────────────────────────┐
│  Order Summary                       │
│                                      │
│  Bridal Makeup ................. $150 │
│  Lash Extensions .............. $80  │
│  ─────────────────────────────────── │
│  Service Total:              $230.00 │
│  Travel Fee (12 mi × $1):    $12.00  │
│  ─────────────────────────────────── │
│  Grand Total:                $242.00 │
│                                      │
│  ╔══════════════════════════════════╗ │
│  ║ Deposit Due Today (50%): $121.00 ║ │
│  ╚══════════════════════════════════╝ │
│                                      │
│  [ ] Pay in full instead             │
│                                      │
│  [     💳 Pay & Confirm Booking    ] │
└──────────────────────────────────────┘
```

### Step 4: Confirmation (post-payment)

- ✅ Large check animation
- "Booking Confirmed!" heading
- Summary card with booking ID, date, total, deposit paid, balance remaining
- "You'll receive a WhatsApp confirmation shortly"
- "Add to Calendar" button (generates .ics)

---

## 5. Component Specifications

### Buttons

| Variant | Background | Text | Hover | Border |
|---|---|---|---|---|
| Primary | `--color-primary` | `#FFFFFF` | darken 10% + shadow | none |
| Secondary | transparent | `--color-primary` | `--color-primary-light` bg | `1px solid --color-primary` |
| Ghost | transparent | `--color-text-muted` | light gray bg | none |

**Size:** `height: 52px; padding: 0 32px;` (mobile full-width)

### Inputs

- Height: `48px`
- Border: `1px solid var(--color-border)`
- Focus: `2px solid var(--color-primary)` + subtle box-shadow
- Error: `border-color: var(--color-error)` + red helper text below
- Label floats above input on focus (material-style)

### Service Cards

- Size: `160px × 180px` (mobile grid 2-col)
- Thumbnail: `100%` width, `100px` height, `object-fit: cover`
- Name: 14px semi-bold
- Price: 16px mono, primary color
- Selected state: primary border, background tint `rgba(194,24,91,0.05)`

### Step Indicator

- Horizontal dots: `12px` circles
- Active: filled primary
- Completed: filled primary + inner check icon
- Upcoming: border-only, muted color
- Connected by thin line

### Pricing Breakdown (Sticky)

- On mobile: fixed to bottom, collapsed by default (shows Grand Total only), tap to expand
- On desktop: right-side panel, always expanded
- Rows: label left-aligned, price right-aligned, monospaced
- Deposit row highlighted with primary-light background

---

## 6. Animations & Micro-Interactions

| Interaction | Animation |
|---|---|
| Step transition | Slide left/right 300ms ease-out |
| Input focus | Border color transition 200ms |
| Service card select | Scale 1.02 + border grow 200ms |
| Price calculation | Number counter animation (count up) |
| Payment button | Subtle pulse on idle, scale down on press |
| Confirmation check | Lottie / CSS checkmark draw animation |
| Page load | Fade-in stagger for form elements (50ms delay each) |

---

## 7. Assets Required

| Asset | Format | Notes |
|---|---|---|
| Logo | SVG / WebP | Already available (`logo.webp`) |
| Hero background | WebP | Already available (`main-bg.webp`) — use as subtle overlay on Step 1 |
| Service thumbnails | WebP | 4–6 images for core services (bridal, lash, etc.) |
| Confirmation Lottie | JSON | Animated checkmark |
| Favicon | ICO + PNG | Derived from logo |

---

## 8. Accessibility

- All form inputs have associated `<label>` elements
- Color contrast ratio ≥ 4.5:1 for text, ≥ 3:1 for large text
- Focus ring visible on all interactive elements
- Form errors announced via `aria-live="polite"`
- Step indicator uses `aria-current="step"` and descriptive labels
- Payment button disabled state has `aria-disabled="true"` and visual indicator

---

## 9. Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Total JS bundle (gzipped) | < 150 KB |

---

## 10. Technical Design Notes

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Vanilla CSS with CSS custom properties (design tokens)
- **State management:** React `useState` / `useReducer` for form + pricing state
- **Maps:** `@react-google-maps/api` for Places Autocomplete + Distance Matrix
- **Payments:** Stripe Checkout Sessions (server-side creation)
- **WhatsApp:** Twilio WhatsApp API or Meta Cloud API — triggered via server webhook
- **Data storage:** Google Sheets API via service account — row appended per booking
- **Font loading:** `next/font` for Inter + Playfair Display; self-hosted DM Mono

> [!IMPORTANT]
> All API keys (Google Maps, Stripe, WhatsApp, Google Sheets) must be stored as environment variables, never committed to source.
