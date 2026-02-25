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
