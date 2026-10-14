# Production Stripe Payment Gateway & Gallery UI Betterization — Anandalok Welfare Foundation

Integrate **Stripe Payment Gateway** for secure donations and artisan marketplace checkout, alongside the approved **Section 4 Gallery Section UI Betterization** (interactive 3D/masonry grid, warm glassmorphism, gold glow accents, micro-badges, and multi-photo lightbox).

> [!IMPORTANT]
> - **Stripe Integration**: Connect Stripe as the primary payment gateway for both 80G tax-exempt donations (`DonationModal`) and Artisan Marketplace checkout (`ExtendedCheckoutPage`). Includes server-side payment intent endpoints (`/api/create-payment-intent`), client-side Stripe Elements integration, test-card sandbox support (`4242...`), and instant transaction receipt generation.
> - **Gallery Section UI Betterization**: Upgrades Section 4 into an interactive 3D/masonry layout with category filter tabs, warm glassmorphism with gold glow accents, multi-photo album folders, zoom lightbox, and social share actions.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Stripe Payment Processing**: Users can donate to social causes or purchase handmade artisan crafts using Stripe's secure payment gateway. Donors receive instant verified 80G tax exemption receipts with automated transaction IDs. Marketplace shoppers complete 3-step checkout with real-time address validation and Stripe card processing.
  2. **Gallery Betterization**: Visitors explore field photography via responsive bento/masonry albums with gold glow cards, category filters, and full-screen lightbox with photo zoom and social sharing.
- **Target Audience**: Donors seeking secure card/international contributions with tax receipts, craft patrons supporting rural Bengali women artisans, and supporters browsing community field updates.
- **Key Value**: Replaces simulated or manual payment steps with production-grade Stripe card payments and delivers a modern, warm glassmorphic media gallery.

---

## 2. User Experience & Visual Design

### A. Stripe Payment Flows

1. **Donation Portal (`DonationModal.tsx`)**:
   - **Step 1 (Cause & Amount)**: Donors pick preset amounts (₹500, ₹1,000, ₹2,500, ₹5,000) or custom amount, enter PAN number for 80G tax deduction.
   - **Step 2 (Stripe Payment)**: Secure Stripe Card Element with card number, expiration, CVC, and postal code. Clear test-mode helper badge (`Use 4242... for demo test payments`).
   - **Step 3 (Receipt & Confetti)**: Instant payment verification, unique 80G certificate generation, and downloadable PDF receipt.

2. **Artisan Marketplace Checkout (`ExtendedCheckoutPage.tsx`)**:
   - **Step 1**: Cart review with quantity controls and coupon codes (`ANANDALOK10`).
   - **Step 2**: Delivery address with real-time field validation.
   - **Step 3 (Stripe Payment)**: Direct Stripe payment processing, displaying order subtotal, discount, delivery fee, and encrypted card fields.
   - **Step 4**: Order confirmation with order tracking number, itemized breakdown, and status saved to Firebase.

### B. Gallery Section Betterization (`GallerySection.tsx`)

- **Bento & Masonry Layout**: Multi-row visual grid with featured widescreen folders (`col-span-2`) and compact project snapshots (`col-span-1`).
- **Warm Glassmorphic Aesthetic**: Translucent white panels (`bg-white/90 backdrop-blur-md`), warm amber borders (`border-amber-200/80`), and gold ambient hover glow (`shadow-amber-500/15`).
- **Micro-Badges**: Location pill with map pin, photo count indicator (`3 Photos`), and photographer credit.
- **Interactive Lightbox**: Click any folder to expand into a high-res photo viewer with click-to-zoom, thumbnail carousel, social sharing (WhatsApp/Facebook/Link), and keyboard controls (`ESC`, `←`, `→`).

---

## 3. Technical Architecture & Stripe Integration Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                         Frontend (React 19)                            │
│                                                                        │
│   ┌───────────────────────────┐      ┌─────────────────────────────┐   │
│   │   DonationModal.tsx       │      │  ExtendedCheckoutPage.tsx   │   │
│   │   - 80G Tax Exemption     │      │  - Cart & Delivery Info     │   │
│   │   - Stripe Card Element   │      │  - Stripe Card Processing   │   │
│   └─────────────┬─────────────┘      └──────────────┬──────────────┘   │
└─────────────────┼───────────────────────────────────┼──────────────────┘
                  │ POST /api/create-payment-intent   │
                  ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  Full-Stack Express Server (server.ts)                 │
│                                                                        │
│   - POST /api/create-payment-intent (creates Stripe client_secret)     │
│   - POST /api/verify-payment (validates completed transaction)         │
│   - Vite middleware mounted for seamless development dev server        │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ Stripe API
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Stripe Cloud Services                           │
│   - Secure Tokenization & 3D Secure Authentication                     │
│   - Test Sandbox (4242 4242 4242 4242)                                 │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ Success
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Firebase Firestore Storage                        │
│   - Persists verified donations to 'donations' collection              │
│   - Persists artisan orders to 'orders' collection                     │
└────────────────────────────────────────────────────────────────────────┘
```

### Required Dependencies & Setup:
- Packages to install: `@stripe/stripe-js` (client SDK), `stripe` (server SDK).
- `server.ts`: Express backend handling `/api/create-payment-intent` with `vite.middlewares` mounted in development (`"dev": "tsx server.ts"`).
- `.env.example`: Documents `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY`.

---

## 4. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Stack Express Server with Stripe Backend Proxy**:
  - *Chosen Approach*: Implement `server.ts` with Express and Stripe SDK to generate client secrets securely.
  - *Why*: Never exposes secret keys to the browser, satisfying platform security rules and Stripe best practices.
  - *Resilient Fallback*: If Stripe API keys are not yet configured in the environment, the server provides an intelligent simulated sandbox response so developers and reviewers can test end-to-end checkout seamlessly without runtime crashes.

- **Decision 2: Unified Stripe Gateway for Donations & Marketplace**:
  - *Chosen Approach*: Shared Stripe payment service and reusable card processing UI across both the donation modal and multi-step checkout.
  - *Why*: Provides consistent UI patterns, cohesive error states, and centralized payment telemetry.

---

## 5. Implementation Roadmap

1. **Package Installation**: Install `@stripe/stripe-js` and `stripe`.
2. **Backend Server Setup (`server.ts`)**:
   - Create Express server mounting `/api/create-payment-intent` and `/api/verify-payment`.
   - Update `package.json` `"dev"` script to `"tsx server.ts"` for full-stack Vite support.
   - Add `.env.example` with Stripe configuration variables.
3. **Stripe Client Helper (`src/lib/stripe.ts`)**:
   - Initialize Stripe instance with publishable key and helper functions.
4. **Checkout & Donation Integration**:
   - Upgrade `DonationModal.tsx` to process Stripe payments, handle 3D Secure, and issue 80G receipts.
   - Upgrade `ExtendedCheckoutPage.tsx` with Stripe card inputs and order placement.
5. **Gallery Section Betterization (`src/components/home/GallerySection.tsx`)**:
   - Implement the interactive 3D/masonry grid, warm glassmorphic styling, gold glow hover states, micro-badges, and multi-photo folder lightbox with social sharing.
6. **Verification & Testing**:
   - Run `compile_applet` to confirm clean TypeScript build.
   - Verify Stripe test transactions and Gallery lightbox interactions.
