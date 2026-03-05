# Food Roulette — Implementation Plan

Build a single-page web app that randomly picks a restaurant for lunch, with CRUD management and optional team ratings for weighted roulette. Plain HTML/CSS/JS with `localStorage` for persistence, seeded from `resto.json`. Deployed on Netlify free tier.

---

## Development Phases

### Phase 1 — Roulette Core *(MVP)*

> **Goal:** A working roulette that loads `resto.json` and picks a random restaurant with a fun spin animation. Usable on day one.

| Item | Detail |
|---|---|
| `index.html` | SPA shell with nav tabs (Roulette tab active, Restaurants tab placeholder) |
| `index.css` | Full design system — dark theme, colors, typography (Inter), buttons, cards, animations |
| `app.js` | Data layer (`localStorage` + seed from `resto.json`), spin logic (uniform random), slot-machine animation, result card display |

**Deliverable:** Open `index.html` → see restaurant list cycling → click **Spin** → get a random pick with animation.

---

### Phase 2 — Restaurant CRUD

> **Goal:** View, add, edit, and delete restaurants. Search/filter the list.

| Item | Detail |
|---|---|
| Restaurants tab | Card grid showing all restaurants with name, address, tag badges |
| Search/filter | Text search by name or tag |
| Add modal | Form: name (required), address (required), tags (chip input) |
| Edit modal | Pre-filled form, save updates |
| Delete | Confirmation prompt, remove from list |
| Toast notifications | Feedback on create/update/delete actions |

**Deliverable:** Full CRUD on the Restaurants tab. Changes persist in `localStorage`.

---

### Phase 3 — Team Ratings & Weighted Roulette

> **Goal:** Teammates can rate restaurants. Roulette can optionally use ratings as weights.

| Item | Detail |
|---|---|
| Rating panel | Per-restaurant modal: enter your name + 1–5 star rating |
| Rating display | Average rating + rater count on each restaurant card |
| Weighted mode toggle | On Roulette tab, off by default. When on, higher-rated restos are more likely to be picked |
| Weighted random logic | Use average rating as probability weight; unrated restos default to 3 |

**Deliverable:** Rate restos, toggle weighted mode, spin favors highly-rated picks.

---

### Phase 4 — Import/Export & Polish

> **Goal:** Data portability and final polish.

| Item | Detail |
|---|---|
| Export JSON | Download current restaurant list (with ratings) as `.json` |
| Import JSON | Upload `.json` to replace/merge data |
| Responsive polish | Ensure mobile layout works perfectly |
| Edge cases | Empty states, validation messages, animation smoothness |
| `README.md` | Update with project info, local dev, and Netlify deploy instructions |

**Deliverable:** Production-ready app, deployable to Netlify.

---

## Project Structure

```
food-roulette/
├── index.html          # [NEW]  SPA shell with two tabs
├── index.css           # [NEW]  Design system + all styles
├── app.js              # [NEW]  All application logic
├── resto.json          # [EXISTING] Seed data
├── REQUIREMENTS.md     # [EXISTING] Requirements doc
├── IMPLEMENTATION_PLAN.md # [NEW] This file
└── README.md           # [MODIFY] Project info & deploy instructions
```

---

## File Details

### `index.css` — Design System

- CSS custom properties: colors (dark theme, amber/orange accents), spacing, radii, shadows
- Google Font import (Inter)
- Base resets, global styles
- Components: nav tabs, cards, buttons, modals, form inputs, star-rating widget, toggle switch, toast, tag badges
- Roulette animation: slot-machine card carousel via CSS keyframes
- Responsive breakpoints

### `index.html` — SPA Shell

- Meta tags (SEO, viewport), font import
- Tab navigation: **🎲 Roulette** | **🍽️ Restaurants**
- Roulette section: animation container, spin button, weighted toggle, result card
- Restaurants section: search bar, add button, card grid, import/export buttons
- Shared modal container
- Toast container
- `<script src="app.js">`

### `app.js` — Application Logic

**Data Layer**
- `loadRestos()` — Read `localStorage`; if empty, `fetch('resto.json')` to seed with auto-generated UUIDs
- `saveRestos(restos)` — Write to `localStorage`

**Roulette**
- `spin(weighted)` — Uniform or weighted random pick
- `weightedRandom(restos)` — Probability proportional to avg rating (default 3 for unrated)
- `animateSpin(result)` — Slot-machine card shuffle → reveal winner

**CRUD**
- `addResto(name, address, tags)` → validate, save, render, toast
- `updateResto(id, data)` → merge, save, render, toast
- `deleteResto(id)` → confirm, remove, save, render, toast
- `renderRestoList(filter?)` → build card grid

**Ratings**
- `addRating(restoId, person, score)` → upsert (one rating per person per resto)
- `getAvgRating(resto)` → average or null
- `renderRatingPanel(restoId)` → star input + existing ratings

**Import/Export**
- `exportJSON()` → trigger download
- `importJSON(file)` → FileReader → parse → validate → save → render

**UI Utilities**
- `showToast(msg)` → timed notification
- `openModal(content)` / `closeModal()`
- Tab switching

---

## Verification Plan

Browser-based testing after each phase:

| Phase | Test |
|---|---|
| **1** | App loads, 7 seed restos visible in animation, spin works, result card displays |
| **2** | Add/edit/delete restaurants, search/filter, data persists on reload |
| **3** | Rate a resto, average displays, weighted toggle works, weighted spin runs |
| **4** | Export downloads valid JSON, import loads it, responsive layout on mobile width |
