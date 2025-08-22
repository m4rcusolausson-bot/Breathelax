# Breathelax (Vite + React) — Netlify Deploy

## One‑click (from GitHub)
1. Create a **new GitHub repo** and push this project (see commands below).
2. Go to **Netlify → Add new site → Import an existing project**.
3. Connect GitHub and select your repo.
4. In the build settings, set:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - (Optional) **Environment:** `NODE_VERSION=18`
5. Click **Deploy**. Netlify will build and host the site on a URL like `https://your-site.netlify.app`.

> `netlify.toml` in this repo already sets those values for you. Netlify will auto‑detect and use it.

## Push to GitHub (from project root)
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
# replace with your own repo URL:
git remote add origin https://github.com/<your-user>/breathelax.git
git push -u origin main
```

## Manual deploy (no GitHub) using Netlify CLI
> Requires building locally once.

```bash
npm install
npm run build
npm install -g netlify-cli
netlify login
netlify deploy --dir=dist       # draft URL
netlify deploy --dir=dist --prod
```

## Notes
- App is built with **Vite + React** and includes **local Tailwind** (no CDN).
- SPA fallback is configured via `netlify.toml` (all routes → `index.html`).
- PWA: `public/manifest.json` and `public/service-worker.js` are included.
- Dev locally: `npm run dev` (default port 5173; add `-- --port 5174` to change).
