# MuBell Farm — Deploy Checklist

**EVERY deploy must follow these steps. No exceptions.**

## The 3-Step Deploy

```bash
cd /Users/feral/.openclaw/workspace/mubell-farm

# 1. BUILD — generates dist/ from source files
node build.js

# 2. VERIFY — check the build output looks right
ls dist/        # should have all .html files + images/ css/ js/

# 3. DEPLOY — push dist/ to Cloudflare Pages
npx wrangler pages deploy dist --project-name mubell-farm
```

## Common Mistakes

### ❌ "I pushed to git but the site didn't update"
Git push does NOT trigger a Cloudflare Pages build. This project uses **direct upload** via `wrangler pages deploy`, not git-based builds. You MUST run the deploy command manually.

### ❌ "I deployed but nothing changed"
You probably deployed the old `dist/` without rebuilding first. Always run `node build.js` BEFORE `wrangler pages deploy`.

### ❌ "The build succeeded but pages are missing"
Check that your source files (templates, content) are correct. The build script reads from `templates/` and `content/` — if a source file is missing or malformed, the page won't generate.

## Verification After Deploy

After deploying, verify the live site:

```bash
# Check a few key pages
curl -s -u "mubell:mubell2026" -o /dev/null -w "%{http_code}" https://mubell-farm.pages.dev/lagotto
curl -s -u "mubell:mubell2026" -o /dev/null -w "%{http_code}" https://mubell-farm.pages.dev/events

# Check nav links are absolute (should see href="/om-os" not href="om-os")
curl -s -u "mubell:mubell2026" https://mubell-farm.pages.dev/events | grep -oE 'href="[^"]*"' | head -15
```

## Full Rebuild + Deploy (One-Liner)

```bash
node build.js && npx wrangler pages deploy dist --project-name mubell-farm
```

## Auth (Dev Mode)
Site is behind Basic Auth: `mubell` / `mubell2026`
Remove auth when ready to go live.

---
*Created 2026-02-25 after deploy gap incident (fixes committed to git but never built+deployed).*
