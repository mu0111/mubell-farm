# MuBell Farm Website

**mubell.farm** — Static site with Decap CMS for self-editing.  
Primary language: Danish 🇩🇰 — Secondary: English 🇬🇧

---

## Architecture at a Glance

```
Content authors (Bellis) → Decap CMS at /admin
  → commits markdown to GitHub
  → Cloudflare Pages runs `node build.js`
  → static HTML lives at dist/ and goes live in ~30s
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Build the site
node build.js

# 3. Preview locally (optional — needs `serve`)
npx serve dist
```

The site is output to `dist/`. Danish at `/`, English at `/en/`.

---

## Cloudflare Pages Deployment

1. Push this repo to GitHub (see GitHub setup below)
2. In Cloudflare Pages:
   - **Build command:** `npm install && node build.js`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (default)
3. Connect your custom domain: `mubell.farm`

---

## GitHub Repository Setup

**TODO for Murat:**

1. Create a GitHub repo: `mubell-farm` (private or public, your call)
2. Push this folder to it:
   ```bash
   cd /path/to/mubell-farm
   git init
   git add .
   git commit -m "Initial site with Decap CMS"
   git remote add origin https://github.com/OWNER/mubell-farm.git
   git push -u origin main
   ```
3. Update `static/config.yml` — replace `OWNER/mubell-farm` with the actual GitHub path

---

## OAuth Worker Deployment

Decap CMS needs a GitHub OAuth flow. We use a lightweight Cloudflare Worker.

**Deploy once:**

1. Follow the [Decap CMS GitHub OAuth guide](https://decapcms.org/docs/github-backend/)
2. Create a GitHub OAuth App:
   - Homepage URL: `https://mubell.farm`
   - Authorization callback: `https://mubell-farm-oauth.workers.dev/callback`
3. Deploy the worker to `mubell-farm-oauth.workers.dev`
   - Use: [netlify/netlify-cms-proxy-server](https://github.com/netlify/netlify-cms-proxy-server) or the simpler [Cloudflare Workers OAuth template](https://github.com/decaporg/decap-cms/blob/main/packages/netlify-cms-backend-github/README.md)

**TODO for Murat:** Set the GitHub OAuth client ID + secret in Cloudflare Worker environment variables.

---

## Cloudflare Access (Login for Bellis)

To protect `/admin` so only Bellis can access it:

1. Go to Cloudflare Zero Trust → Access → Applications
2. Create an application:
   - **Domain:** `mubell.farm/admin/*`
   - **Policy:** allow email = `[Bellis's email]`
   - **Login method:** One-time PIN (magic link to email)
3. Bellis receives an email → clicks link → lands in CMS

**TODOs:**
- [ ] Confirm Bellis's email address
- [ ] Set up the Access policy

---

## How Bellis Logs In and Edits

1. Go to `https://mubell.farm/admin`
2. Enter her email → receive a magic link (Cloudflare Access)
3. In the CMS dashboard she can:
   - **Heste** — Add/edit horse profiles (name, photo, description, category)
   - **Nyheder** — Write news posts (title, text, photo, date)
   - **Anbefalinger** — Add testimonials (name, quote, photo)
   - **Sider** — Edit page content (Danish + English)
   - **Indstillinger** — Update contact info, phone, address
4. Click **Publish** → changes go live in ~30 seconds

*Bellis never needs to touch GitHub, code, or any technical tools.*

---

## Content Structure

```
content/
├── pages/          ← Page content in .da.md and .en.md files
├── horses/         ← One .da.md + .en.md per horse
├── news/           ← News posts (date-prefixed filenames)
├── testimonials/   ← Customer testimonials
└── settings.json   ← Site-wide settings (contact info, etc.)
```

---

## TODOs for Murat

| # | Item | Detail |
|---|------|--------|
| 1 | GitHub repo name | Create `OWNER/mubell-farm` and update `static/config.yml` |
| 2 | Bellis's email | Needed for Cloudflare Access policy |
| 3 | OAuth Worker | Deploy once to `mubell-farm-oauth.workers.dev` with GitHub OAuth credentials |
| 4 | Horse names | Bellis adds real horse profiles via CMS once it's live |
| 5 | Phone number | Add to `content/settings.json` |
| 6 | Hero photo | Confirm `images/hero.jpg` is the right aerial shot |
| 7 | Testimonials | Replace placeholder with real quotes from boarders |

---

## Reference

- Design inspiration: [langiltegaard.dk](https://langiltegaard.dk)
- Decap CMS docs: [decapcms.org](https://decapcms.org)
- Cloudflare Pages docs: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
