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
