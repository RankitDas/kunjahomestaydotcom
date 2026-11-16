# Kunja Homestay — Website Documentation & Implementation Guide

Welcome to the official repository and codebase for **Kunja Homestay** (`kunjahomestay.com`), an authentic, boutique homestay officially registered and recognized by the **Department of Tourism, Government of West Bengal** (Registration ID: `WBT/HOMESTAY/KLM-2024-089`).

---

## 1. Design System & Anti-"AI Slop" Directives
This site was built strictly adhering to independent boutique editorial aesthetics (Condé Nast Traveler / Kinfolk inspired) with zero generic SaaS patterns, sterile cards, or cliché AI copy:
- **Warm Raw-Silk Canvas:** `#FAF7F2` for tactile warmth.
- **Deep Bengal Forest Green:** `#1E352B` for grounded typography and primary anchors.
- **Laterite Terracotta Clay:** `#B85D3B` for organic action highlights and natural accents.
- **Antique Muted Brass:** `#C59B5F` for the official Government of West Bengal certification seal.
- **Editorial Typography:** Refined serif (`Lora` / `Cormorant Garamond`) paired with humanist sans (`Plus Jakarta Sans`) using fluid CSS `clamp()`.

---

## 2. Dynamic Features & Interactive Architecture
All data is stored in structured, CMS-ready JSON state within `app.js`:

1. **Official Government Recognition Badge & Expandable Certificate:**
   - Displayed both in the top announcement bar and header.
   - Clicking opens the **Official Verification Credential Modal** displaying registration ID, Silver Tier classification, and audit status.
2. **Atmospheric Hero & Instant Availability Bar:**
   - Pre-fills check-in, check-out, and guest counts, and formats a clean message to the host's WhatsApp or inquiry modal.
3. **Dynamic Room Showcase (`app.js` -> `roomsContainer`):**
   - Interactive photo carousels for each room (`Heritage Verandah Room`, `Courtyard Family Suite`, `Garden View Room`).
   - Amenities tags, transparent nightly tariffs, and 1-click booking inquiry triggers.
4. **Joyful Moments & Shareable Lightbox Gallery (`#gallery`):**
   - Filter tabs: *All Moments*, *The Ambiance*, *Our Rooms*, *Guest Smiles & Gatherings*.
   - Lightbox modal with story captions and active **Social Share features**:
     - **Web Share API** (native iOS & Android sheet).
     - **WhatsApp 1-Click Share**.
     - **Facebook Share**.
     - **Copy Shareable Link** with query parameter deep-linking (`?photo=g1#gallery`).
   - Interactive **"Share Your Memory"** modal allowing past guests to submit photos and stories into the dynamic page state.
5. **Living Guestbook & Reviews (`#reviews`):**
   - Aggregated 4.95 / 5 rating.
   - Interactive **"Write a Review"** form that validates and appends new reviews instantly into the page state with a confirmation toast.
6. **Mobile UX & Thumb-friendly Bar:**
   - Sticky bottom navigation bar on mobile screen sizes (`< 768px`) with **Call Host** and **WhatsApp / Enquire** actions.
   - Accessible slide-out drawer menu.

---

## 3. SEO & Local Search Checklist
To capitalize on West Bengal regional search intent, follow these 5 actions:

1. **Google Business Profile (GBP):**
   - Claim Kunja Homestay on Google Maps under *Homestay* and *Bed & Breakfast*.
   - Use the official registration number `WBT/HOMESTAY/KLM-2024-089` for verification.
2. **Government Backlink Authority:**
   - Ensure your homestay listing on the [wbtourism.gov.in](https://wbtourism.gov.in/) portal links directly to `https://kunjahomestay.com`.
3. **Structured Data:**
   - Pre-configured `LodgingBusiness` / `BedAndBreakfast` schema embedded in `index.html` with ratings, coordinates, and contact details.
4. **Optimized Imagery:**
   - Drop your property photos into an `assets/` folder, format as WebP under 200KB, with descriptive filenames (`kunja-homestay-verandah-kalimpong.webp`).
5. **Social Previews:**
   - Open Graph (`og:image`, `og:title`, `og:description`) and Twitter Card tags configured for instant rich preview on WhatsApp and Facebook.

---

## 4. How to Update Content
To update room tariffs, images, phone numbers, or add new gallery moments:
- Open [app.js](file:///d:/kunjahomestaydotcom/app.js) and modify the `kunjaData` object.
- The UI automatically updates all calculations, room cards, gallery masonry items, and reviews.
