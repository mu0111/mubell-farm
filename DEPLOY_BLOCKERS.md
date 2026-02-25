# Mubell Farm — Deployment Blockers & Next Steps

The frontend is live and the OAuth bridging worker is deployed (`mubell-farm-oauth.murat-armbruster.workers.dev`), but we need Murat's manual intervention to complete the security and GitHub integration.

## 1. Create GitHub OAuth App
Since we cannot create OAuth Apps via the API, Murat needs to do this manually:
1. Go to **GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App**.
2. **Application name:** `Mubell Farm CMS`
3. **Homepage URL:** `https://mubell-farm.pages.dev`
4. **Authorization callback URL:** `https://mubell-farm-oauth.murat-armbruster.workers.dev/callback`
5. Click **Register application**.
6. Generate a **New client secret**. Keep the Client ID and Client Secret handy.

## 2. Add Secrets to Cloudflare Worker
Run these commands in your terminal and paste the ID/Secret from step 1:
```bash
wrangler secret put GITHUB_CLIENT_ID --name mubell-farm-oauth
wrangler secret put GITHUB_CLIENT_SECRET --name mubell-farm-oauth
```

## 3. Editor Account for Bellis
Decide how Bellis will authenticate with GitHub:
- **Option A (Simpler):** Invite `Clausen.Bellis@gmail.com` as a collaborator to the `mu0111/mubell-farm` repository. She creates a GitHub account and uses it to log in.
- **Option B (Shared):** Create a dedicated `mubell-farm-editor` GitHub account, give it write access to the repo, and share the credentials with Bellis so she can authorize the CMS.

## 4. Cloudflare Access (Optional)
Currently, the site uses Basic Auth (`mubell:mubell2026`). 
To implement the email magic link for Bellis:
1. Go to **Cloudflare Dashboard → Zero Trust → Access → Applications**.
2. Add an application for `mubell-farm.pages.dev/admin*`.
3. Set an Include policy for emails: `Clausen.Bellis@gmail.com` and `murat.armbruster@gmail.com`.
4. Remove the `functions/_middleware.js` Basic Auth once Zero Trust is active.
