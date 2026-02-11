# VEXURA Frontend (Vercel-ready)

This is a static HTML/JS frontend exported from Trickle and hardened for production hosting on Vercel.

## What was changed (vs Trickle export)
- Removed Trickle-only folder (`/trickle`) to avoid deploying internal docs/metadata.
- Replaced Trickle-hosted CDN scripts with public CDNs (unpkg) for React/ReactDOM/Babel.
- Centralized backend routing in `utils/apiConfig.js`:
  - Trickle preview uses Trickle Proxy
  - Production (Vercel/custom domain) calls backend directly
- Updated AI and Stripe checkout calls to use `window.VexuraAPI.*` URLs.
- Added `vercel.json` for clean URLs.

## Deploy (online-only)
1. Upload this folder contents to a GitHub repo (web UI is fine).
2. In Vercel: Add New → Project → Import repo
   - Framework: Other
   - Build/Output: leave blank
3. Add your domain in Vercel → Settings → Domains.

## Important
If you use Firebase Auth, add your Vercel domain(s) to Firebase Console → Authentication → Settings → Authorized domains.
