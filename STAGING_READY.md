# Mubell Farm — Staging Deployment Ready

The staging site and CMS backend have been successfully deployed to Cloudflare!

**Staging URL:** [https://mubell-farm.pages.dev](https://mubell-farm.pages.dev)  
**Admin URL:** [https://mubell-farm.pages.dev/admin](https://mubell-farm.pages.dev/admin)

## Current Access (Temporary)
Because the Cloudflare Access (magic link) isn't fully configured yet, the site and admin panel are currently protected by a basic password:
- **Username:** `mubell`
- **Password:** `mubell2026`

## Bellis Login Instructions
Once Murat completes the final auth steps (see `DEPLOY_BLOCKERS.md`), Bellis can log in by:
1. Going to `https://mubell-farm.pages.dev/admin`
2. Entering the basic password above (if still active)
3. Clicking **"Login with GitHub"** on the Decap CMS screen.
4. (She will authenticate using either her own GitHub account or the shared `mubell-farm-editor` account depending on how Murat sets it up).

*Note: The Decap CMS interface will load right now, but the GitHub login will fail until the OAuth App is configured by Murat.*
