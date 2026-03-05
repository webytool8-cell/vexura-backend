# vexura-backend

vexura backend

## Environment notes

Marketplace storage uses `@vercel/kv` and accepts either of these env var pairs:

- `KV_REST_API_URL` + `KV_REST_API_TOKEN`
- `db_KV_REST_API_URL` + `db_KV_REST_API_TOKEN`

If both are present, the non-prefixed `KV_*` values are used first.

## Marketplace admin deletion

The route `DELETE /api/marketplace/[slug]` requires an admin token header:

- Header: `x-admin-token: <token>`
- Server env: `MARKETPLACE_ADMIN_TOKEN`

If `MARKETPLACE_ADMIN_TOKEN` is not configured, delete requests are rejected.

## Pinterest backend pipeline (OAuth + auto-post)

Pinterest auto-post (used by the automation pipeline and manual upload route) is enabled when:

- `PINTEREST_AUTO_POST=true`

### OAuth credentials

Set these to support Pinterest OAuth and token refresh:

- `PINTEREST_APP_ID` (or `PINTEREST_CLIENT_ID`)
- `PINTEREST_APP_SECRET` (or `PINTEREST_CLIENT_SECRET`)
- `PINTEREST_REDIRECT_URI` (must match your Pinterest app redirect)

### OAuth scopes

Default scopes requested by `/api/pinterest/auth/start` are:

- `pins:read`
- `pins:write`
- `boards:read`
- `user_accounts:read`

You can override with:

- `PINTEREST_SCOPES` (comma-separated)

### Token strategy

Supported token sources for pin creation:

1. `PINTEREST_ACCESS_TOKEN` (direct static token), or
2. `PINTEREST_REFRESH_TOKEN` (+ OAuth credentials) for automatic access-token refresh.

### Board configuration

Single-board mode (easiest):

- `PINTEREST_BOARD_TEST`

Also supported:

- `PINTEREST_BOARD_DEFAULT`
- `PINTEREST_BOARD_UI`
- `PINTEREST_BOARD_BRANDING`
- `PINTEREST_BOARD_TECH`
- `PINTEREST_BOARD_NATURE`
- `PINTEREST_BOARD_ABSTRACT`
- `PINTEREST_BOARD_BUSINESS`

If only one board ID is available, set `PINTEREST_BOARD_TEST` and all generated pins will fall back to that board.

### Backend auth routes

- `GET /api/pinterest/auth/start` → returns authorization URL
- `GET /api/pinterest/auth/start?mode=redirect` → redirects to Pinterest consent screen
- `GET /api/pinterest/auth/callback` → exchanges `code` for token payload
- `GET /api/pinterest/auth/status` → returns readiness/missing config keys

## Merge conflict resolution for validator changes

If a PR touches `lib/validators/icon-validator.ts` and `lib/validators/vector-passes.ts`, prefer this merge strategy:

- Keep `icon-validator.ts` as orchestration only (imports + function calls).
- Keep pass implementations in `vector-passes.ts`.
- Do **not** reintroduce pass helper function definitions inside `icon-validator.ts`.

After resolving conflicts, run:

```bash
npm run check:validator-structure
```

This command fails if legacy/duplicate helper definitions are reintroduced during conflict resolution.

## Email automation (SMTP + Nodemailer)

Transactional email sending is available via `POST /api/email/send`.

Required environment variables:

- `SMTP_HOST`
- `SMTP_PORT` (use `465` for secure SMTP)
- `SMTP_USER`
- `SMTP_PASS`

Example request body:

```json
{
  "to": "recipient@example.com",
  "subject": "Welcome to Vexura",
  "title": "Your Vector Asset Is Ready",
  "bodyText": "Your AI-generated vector is now available in your dashboard.",
  "buttonText": "View Asset",
  "buttonLink": "https://vexura.io/dashboard"
}
```

The route uses a reusable dark/minimal Vexura template in `lib/email/template.ts`.

Template variants supported by `/api/email/send`:

- `minimal` (transactional-only, simplest layout)
- `asset-preview` (includes image preview block; requires `assetImageUrl`)
- `marketing` (default; includes eyebrow/secondary copy options)

Plain-text fallback is always included automatically in sent emails.

Example (asset preview):

```json
{
  "to": "recipient@example.com",
  "subject": "Your Vector Asset Is Ready",
  "variant": "asset-preview",
  "title": "Your Vector Asset Is Ready",
  "bodyText": "Your AI-generated vector has been created and is now available.",
  "buttonText": "View Asset",
  "buttonLink": "https://vexura.io/dashboard",
  "assetImageUrl": "https://vexura.io/previews/asset-123.png",
  "assetImageAlt": "Generated vector preview",
  "assetCaption": "Preview of your generated vector"
}
```
