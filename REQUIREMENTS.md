# 🎰 Food Roulette — Requirements Document

> **Problem:** Deciding where to eat lunch with officemates is a daily struggle. Too many options, too many opinions, zero decisions.
>
> **Solution:** A web-based **Food Roulette** app that randomly picks a restaurant for you, with full CRUD to manage the restaurant list.

---

## 1. Core Features

### 1.1 🎲 Roulette / Randomizer

| Requirement | Description |
|---|---|
| **Spin** | A prominent "Spin" button that randomly selects one restaurant from the list. |
| **Animation** | A visually engaging roulette/slot-machine animation while selecting (not just instant result). |
| **Result Display** | Show the selected restaurant's **name**, **address**, and **tags** clearly after the spin. |
| **Weighted Mode** | *(Optional, off by default)* A toggle to switch from **uniform random** to **weighted random** based on average team ratings. Higher-rated restos have a higher chance of being picked. When off, every restaurant has an equal chance. |
| **Filter Before Spin** | *(Optional)* Allow filtering by tag before spinning (e.g., only "Spicy" or "Street Food"). |
| **Spin History** | *(Optional)* Track the last few spin results to avoid repetition. |

### 1.2 📋 Restaurant CRUD

| Operation | Description |
|---|---|
| **Create** | Add a new restaurant with **name** (required), **address** (required), and **tags** (optional, multi-value). |
| **Read** | View the full list of restaurants in a card/table layout. Support search/filter by name or tag. Shows average rating if ratings exist. |
| **Update** | Edit any restaurant's name, address, or tags. |
| **Delete** | Remove a restaurant from the list with a confirmation prompt. |

### 1.3 ⭐ Team Ratings *(Optional Feature)*

| Requirement | Description |
|---|---|
| **Rate** | Any team member can rate a restaurant from **1–5 stars**. Each person enters their name and rating. |
| **One Rating Per Person Per Resto** | A teammate can update their existing rating but cannot submit multiple ratings for the same restaurant. |
| **View Ratings** | Each restaurant card shows the **average rating** and **number of raters**. Clicking reveals individual ratings. |
| **No Login Required** | Ratings are identified by a self-entered name (honor system — no auth needed). |
| **Weighted Spin** | When the "Weighted Mode" toggle is on, restaurants with higher average ratings have proportionally higher chances of being selected. Unrated restaurants use a neutral default weight (e.g., equivalent to 3 stars). |

### 1.4 Data Model

Based on the existing `resto.json`, extended with ratings:

```json
{
  "id": "string (auto-generated UUID)",
  "name": "string (required)",
  "address": "string (required)",
  "tags": ["string"],
  "ratings": [
    { "person": "string", "score": 1-5 }
  ]
}
```

> `ratings` array is empty by default and only populated when team members choose to rate.

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Frontend** | HTML + Vanilla CSS + JavaScript | Simple, no build tooling needed, fast to ship. |
| **Data Storage** | `localStorage` + JSON import/export | No backend needed. Data persists in browser. |
| **Seed Data** | `resto.json` | Pre-loaded on first visit if `localStorage` is empty. |
| **Hosting** | Netlify (Free Tier) | Zero-config static site hosting, auto-deploy from Git. |

---

## 3. Pages / Sections

### 3.1 Home — Roulette Page
- Hero section with the roulette wheel / slot-machine animation.
- **"Spin!"** button front and center.
- **Weighted Mode toggle** — clearly labeled, off by default (uniform random). When on, shows a brief explainer like *"Higher-rated restos are more likely to be picked."*
- Result card displayed after spin with restaurant details.
- Optional: tag filter chips above the spin button to narrow the pool.

### 3.2 Restaurant List Page
- Card-based grid or table of all restaurants.
- Each card shows name, address, and tag badges.
- Search bar to filter by name or tag.
- **"+ Add Restaurant"** button.
- Edit / Delete actions on each card.

### 3.3 Add / Edit Restaurant (Modal or Inline Form)
- Form fields: Name, Address, Tags (comma-separated or chip input).
- Save / Cancel buttons.
- Validation: name and address are required.

### 3.4 Rating Panel (Per Restaurant)
- Accessible from each restaurant card (e.g., "Rate" button or expandable section).
- Enter your name + select 1–5 stars.
- Shows all existing ratings with names and scores.
- Displays computed average prominently.

---

## 4. UX Requirements

| Area | Requirement |
|---|---|
| **Responsive** | Must work on both desktop and mobile (officemates will use their phones). |
| **Dark Mode** | Modern dark theme as default with vibrant accent colors. |
| **Animations** | Smooth spin animation (CSS/JS), hover effects, micro-interactions on buttons and cards. |
| **Typography** | Modern font (e.g., Inter or Outfit from Google Fonts). |
| **Feedback** | Toast/snackbar notifications for CRUD actions (e.g., "Restaurant added!"). |

---

## 5. Data Persistence

1. On **first load**, if `localStorage` is empty, import the seed data from `resto.json`.
2. All CRUD operations read/write to `localStorage`.
3. **Export**: Button to download current restaurant list as JSON.
4. **Import**: Button to upload a JSON file to replace/merge the restaurant list.

---

## 6. Non-Functional Requirements

| Aspect | Requirement |
|---|---|
| **No backend** | Fully client-side, deployable as a static site on Netlify free tier. |
| **No build step** | Plain HTML/CSS/JS — no build command needed; Netlify serves files as-is. |
| **Performance** | Instant interactions, lightweight bundle. Well within Netlify free tier limits (100 GB bandwidth/month). |
| **Browser Support** | Modern browsers (Chrome, Firefox, Safari, Edge). |

---

## 7. Deployment (Netlify Free Tier)

| Item | Detail |
|---|---|
| **Platform** | [Netlify](https://www.netlify.com/) — free tier. |
| **Deploy Method** | Connect the GitHub repo → auto-deploy on push to `main`. |
| **Build Command** | *(none)* — static files, no build step. |
| **Publish Directory** | `/` (repo root, where `index.html` lives). |
| **Custom Domain** | *(Optional)* Free `*.netlify.app` subdomain by default. |
| **HTTPS** | Included automatically by Netlify. |

> **Free tier limits:** 100 GB bandwidth/month, 300 build minutes/month — more than enough for a team lunch picker.

---

## 8. Nice-to-Haves (Future)

- 🏷️ Filter roulette by tags before spinning.
- 📊 Spin history log with date/time.
- 🚫 "Exclude recently picked" toggle to avoid repeats.
- 🗺️ Link to Google Maps for each restaurant's address.
- 👥 Multi-user mode: each person spins and majority wins.
- 📈 Rating trends over time.
