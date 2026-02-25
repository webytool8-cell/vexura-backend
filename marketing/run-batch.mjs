#!/usr/bin/env node
import fs from 'node:fs/promises';

const DOMAIN = 'https://vexura.io';
const API_URL = `${DOMAIN}/api/automate/batch`;
const payloadPath = process.argv[2] || 'marketing/pinterest-batch.json';

async function main() {
  const raw = await fs.readFile(payloadPath, 'utf8');
  const payload = JSON.parse(raw);

  if (!Array.isArray(payload.prompts) && !Array.isArray(payload.items)) {
    throw new Error('Batch file must include either "prompts" or "items" array');
  }

  // Backward/forward compatibility: route expects prompts
  if (!payload.prompts && payload.items) {
    payload.prompts = payload.items;
    delete payload.items;
  }

  console.log(`🚀 Sending batch to ${API_URL}`);
  console.log(`📦 Total prompts: ${payload.prompts.length}`);

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response (${res.status}): ${text.slice(0, 500)}`);
  }

  if (!res.ok) {
    throw new Error(`Batch failed (${res.status}): ${JSON.stringify(data)}`);
  }

  const successful = data.successful ?? data.results?.filter(r => r.success).length ?? 0;
  const failed = data.failed ?? data.results?.filter(r => !r.success).length ?? 0;

  console.log(`✅ Batch complete. Successful: ${successful}, Failed: ${failed}`);

  await fs.mkdir('marketing/output', { recursive: true });
  const outFile = `marketing/output/batch-result-${Date.now()}.json`;
  await fs.writeFile(outFile, JSON.stringify(data, null, 2));
  console.log(`📝 Saved response: ${outFile}`);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
