# Marketing Batch Run

Run the Pinterest/marketplace 50-prompt batch directly against production:

```bash
node marketing/run-batch.mjs marketing/pinterest-batch.json
```

Target domain is hardcoded to:

- `https://vexura.io`
- Endpoint: `https://vexura.io/api/automate/batch`

## Smaller test run (10 prompts)

```bash
node marketing/run-batch.mjs marketing/pinterest-batch-10.json
```

## Replace previously uploaded placeholder assets with real pipeline output

If you uploaded the `manual-upload-assets-50` placeholder vectors, use this script to:

1. Delete those slugs from marketplace via authenticated admin delete endpoint (when supported).
2. Regenerate each prompt through `/api/automate/generate` (the real pipeline), which overwrites same slugs.
   - Type is now inferred per prompt (`illustration` prompts generate illustrations; others generate icons).

### macOS/Linux (bash/zsh)

```bash
MARKETPLACE_ADMIN_TOKEN=your_admin_token \
VEXURA_DOMAIN=https://www.vexura.io \
node marketing/replace-manual-assets.mjs marketing/pinterest-batch.json marketing/manual-upload-assets-50/manifest.json
```

### Windows Command Prompt (cmd.exe)

```bat
set MARKETPLACE_ADMIN_TOKEN=your_admin_token
set VEXURA_DOMAIN=https://www.vexura.io
node marketing/replace-manual-assets.mjs marketing/pinterest-batch.json marketing/manual-upload-assets-50/manifest.json
```

### Windows PowerShell

```powershell
$env:MARKETPLACE_ADMIN_TOKEN="your_admin_token"
$env:VEXURA_DOMAIN="https://www.vexura.io"
node marketing/replace-manual-assets.mjs marketing/pinterest-batch.json marketing/manual-upload-assets-50/manifest.json
```

### If your current deployment returns `405` on DELETE

Use overwrite-only mode (skip delete):

```bash
node marketing/replace-manual-assets.mjs marketing/pinterest-batch.json marketing/manual-upload-assets-50/manifest.json --skip-delete
```

By default, the script also tolerates `405` on delete and continues regeneration (`--strict-delete` disables that fallback).

Dry run (no API calls):

```bash
node marketing/replace-manual-assets.mjs --dry-run
```

Notes:

- Requires server-side env `MARKETPLACE_ADMIN_TOKEN` to be set for delete support (`DELETE /api/marketplace/[slug]`).
- This script writes an execution log into `marketing/output/replace-manual-assets-<timestamp>.json`.
