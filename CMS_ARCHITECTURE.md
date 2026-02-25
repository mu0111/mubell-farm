# Mubell Farm — CMS Architecture Decision
**Date:** 2026-02-22  
**Decision:** Decap CMS (formerly Netlify CMS)  
**Status:** Approved by Mati + Sam, pending Murat sign-off

---

## The Decision

**Decap CMS at `/admin`** — Bellis edits the site herself. Zero monthly cost. Stays on Cloudflare Pages.

**Why Decap over alternatives:**
| | Decap | Tina | CloudCannon | Custom admin.html |
|---|---|---|---|---|
| Cost | Free | Free (self-host) | 💰 Paid | Free |
| i18n (DA/EN) | ✅ Native | ⚠️ Manual | ✅ Yes | 🔧 DIY |
| Photo uploads | ✅ Drag & drop | ✅ Yes | ✅ Yes | 🔧 Fragile |
| Non-technical UX | ✅ Clean | ⚠️ Steeper | ✅ Slickest | ❌ JSON editing |
| Cloudflare Pages | ✅ Works | ⚠️ Needs adapter | ⚠️ Needs git sync | ✅ Native |
| Maintenance | Low | Medium | Low (but $$$) | High |

---

## Folder Structure

```
mubell-farm/
├── admin/
│   └── index.html          ← Decap CMS app (CDN-loaded)
├── content/
│   ├── pages/
│   │   ├── index.da.md     ← Danish (primary)
│   │   ├── index.en.md     ← English
│   │   ├── opstaldning.da.md
│   │   ├── opstaldning.en.md
│   │   └── ... (undervisning, events, om-os, kontakt)
│   ├── horses/
│   │   └── horse-name.md   ← One file per horse (bilingual frontmatter)
│   ├── news/
│   │   └── YYYY-MM-DD-title.md
│   ├── testimonials/
│   │   └── testimonial-name.md
│   └── settings.json       ← Site-wide settings
├── images/                 ← 149 classified photos from review
├── static/
│   └── config.yml          ← Decap config
├── templates/              ← HTML templates
└── build.js                ← Lightweight SSG (reads content/ → static HTML)
```

---

## config.yml (Decap)

```yaml
backend:
  name: github
  repo: murat-or-org/mubell-farm    # adjust to actual repo
  branch: main
  base_url: https://mubell-farm-oauth.workers.dev  # lightweight CF Worker

publish_mode: editorial_workflow    # draft → review → publish
media_folder: images
public_folder: /images

i18n:
  structure: multiple_files
  locales: [da, en]
  default_locale: da

collections:
  - name: pages
    label: "Sider / Pages"
    i18n: true
    files:
      - name: index
        label: "Forside (Home)"
        file: content/pages/index.md
        i18n: true
        fields:
          - { name: hero_image, label: "Hovedbillede", widget: image }
          - { name: hero_title, label: "Overskrift", widget: string, i18n: true }
          - { name: hero_subtitle, label: "Undertekst", widget: string, i18n: true }
          - { name: body, label: "Indhold", widget: markdown, i18n: true }
      - name: opstaldning
        label: "Opstaldning (Boarding)"
        file: content/pages/opstaldning.md
        i18n: true
        fields:
          - { name: title, label: "Titel", widget: string, i18n: true }
          - { name: body, label: "Indhold", widget: markdown, i18n: true }
          - { name: photos, label: "Billeder", widget: list, field: { name: image, widget: image } }
      # same pattern: undervisning, events, om-os, kontakt

  - name: horses
    label: "Heste / Horses"
    folder: content/horses
    create: true
    i18n: true
    slug: "{{name}}"
    fields:
      - { name: name, label: "Navn", widget: string }
      - { name: category, label: "Kategori", widget: select, options: ["Hoppe", "Hingst"] }
      - { name: photo, label: "Billede", widget: image }
      - { name: facebook_url, label: "Facebook link", widget: string, required: false }
      - { name: body, label: "Beskrivelse", widget: markdown, i18n: true }

  - name: news
    label: "Nyheder / News"
    folder: content/news
    create: true
    i18n: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - { name: title, label: "Titel", widget: string, i18n: true }
      - { name: date, label: "Dato", widget: datetime }
      - { name: featured_image, label: "Billede", widget: image, required: false }
      - { name: body, label: "Indhold", widget: markdown, i18n: true }

  - name: testimonials
    label: "Anbefalinger / Testimonials"
    folder: content/testimonials
    create: true
    fields:
      - { name: name, label: "Navn", widget: string }
      - { name: role, label: "Rolle (f.eks. 'Hesteejer')", widget: string, required: false }
      - { name: quote, label: "Citat", widget: text }
      - { name: photo, label: "Billede", widget: image, required: false }

  - name: settings
    label: "Indstillinger / Settings"
    files:
      - name: site
        label: "Sideindstillinger"
        file: content/settings.json
        fields:
          - { name: site_title, label: "Sidetitel", widget: string }
          - { name: logo, label: "Logo", widget: image, required: false }
          - { name: phone, label: "Telefon", widget: string }
          - { name: email, label: "Email", widget: string }
          - { name: address, label: "Adresse", widget: text }
          - { name: tikob_link, label: "Tikøb Kommune link", widget: string, default: "https://tikobkommune.dk" }
```

---

## Auth Flow

1. **Cloudflare Access** gates `/admin/*` — Bellis gets a magic link to her email
2. **Lightweight OAuth Worker** (`mubell-farm-oauth.workers.dev`) — bridges Decap ↔ GitHub (~50 lines, deploy once)
3. **Bellis never sees GitHub** — she sees: email link → admin dashboard → edit → publish

**One-time setup:** Create a shared `mubell-farm-editor@` GitHub account. Decap requires GitHub for commits, but Bellis never logs in directly.

---

## Build Pipeline

```
Bellis edits in /admin
  → Decap commits to GitHub
  → Cloudflare Pages auto-rebuilds (build.js SSG)
  → Site live in ~30 seconds
```

`build.js` reads `content/` markdown, applies `templates/`, outputs static HTML. No heavy framework. Existing v11 HTML structure stays almost intact — just extract text into markdown files.

---

## Content Model Summary

- **Pages** (6): index, opstaldning, undervisning, events, om-os, kontakt — each with `da` + `en` fields
- **Horses**: individual profiles (name, photo, category, Facebook link, description)
- **News/Events**: date, title, body, photos — Bellis adds these herself
- **Testimonials**: name, role, quote, photo — grows organically over time
- **Site Settings**: hero photo, logo, contact info

---

## Pitch to Murat (exact language)

> "Decap CMS integrated into the static build. Bellis gets a visual editor at `/admin` — she edits horses, news, and pages herself, publishes with one click. Cloudflare Access handles login via email magic link. Site stays on Cloudflare Pages. Zero monthly cost. Bilingual baked in. Say the word and Claude Code wires it up."

---

## Next Steps (post-approval)

1. Confirm GitHub repo name/org
2. Deploy OAuth worker to Cloudflare Workers
3. Set up Cloudflare Access policy for `/admin/*` (Bellis's email)
4. Create `mubell-farm-editor@` GitHub account
5. Claude Code integration: extract v13 content → markdown files, wire Decap, test build
6. Bellis walkthrough doc (Danish)
