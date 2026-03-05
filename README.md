# 🎰 Food Roulette

Decide where to eat lunch with your team! A simple, fun web app to randomly pick a restaurant from your curated list, with a slot-machine animation and full data management.

## Features

- **Roulette Wheel**: Fun slot-machine spin animation to pick a random restaurant.
- **Weighted Random**: (Coming soon) Pick restaurants more often if they have higher ratings.
- **Data Persistence**: Uses your browser's `localStorage` so your restaurant list is saved.
- **Dark Mode UI**: Beautiful dark theme with amber accents.
- **No Backend**: 100% client-side HTML, CSS, and JS. 

## Local Development

No build steps required! Simply serve the directory with any local static web server. 

For example, using Python 3:
```bash
python3 -m http.server 8765
```
Then open `http://localhost:8765` in your browser.

## Deployment (Netlify)

This app is built to be hosted on Netlify's free tier as a simple static site.

1. Connect your GitHub repository to Netlify.
2. Set the "Build Command" to empty (leave blank).
3. Set the "Publish directory" to `/` (repository root).
4. Deploy!

Netlify will serve the `index.html` file automatically.

## Seed Data
When the app loads for the very first time on a new browser, it fetches seed data from `resto.json`. You can modify `resto.json` before deployment to change the default restaurants for new users.