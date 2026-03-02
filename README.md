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
