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

## Pinterest auto-post environment

Pinterest auto-post (used by automation pipeline) is enabled when:

- `PINTEREST_AUTO_POST=true`

Required token:

- `PINTEREST_ACCESS_TOKEN`

Board configuration (new easiest option):

- `PINTEREST_BOARD_TEST` (single-board mode)

Also supported:

- `PINTEREST_BOARD_DEFAULT`
- `PINTEREST_BOARD_UI`
- `PINTEREST_BOARD_BRANDING`
- `PINTEREST_BOARD_TECH`
- `PINTEREST_BOARD_NATURE`
- `PINTEREST_BOARD_ABSTRACT`
- `PINTEREST_BOARD_BUSINESS`

If only one board ID is available, set `PINTEREST_BOARD_TEST` and all generated pins will fall back to that board.

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
