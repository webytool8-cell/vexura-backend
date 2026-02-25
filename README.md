# vexura-backend

vexura backend

## Environment notes

Marketplace storage uses `@vercel/kv` and accepts either of these env var pairs:

- `KV_REST_API_URL` + `KV_REST_API_TOKEN`
- `db_KV_REST_API_URL` + `db_KV_REST_API_TOKEN`

If both are present, the non-prefixed `KV_*` values are used first.
