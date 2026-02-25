#!/usr/bin/env node
import fs from 'node:fs/promises';

const DOMAIN = process.env.VEXURA_DOMAIN || 'https://www.vexura.io';
const ADMIN_TOKEN = process.env.MARKETPLACE_ADMIN_TOKEN || '';
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const positional = args.filter((a) => !a.startsWith('--'));
const BATCH_PATH = positional[0] || 'marketing/pinterest-batch.json';
const MANIFEST_PATH = positional[1] || 'marketing/manual-upload-assets-50/manifest.json';
const DELAY_MS = Number(process.env.REPLACE_DELAY_MS || 1200);

const DELETE_CONCURRENCY = 5;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function readJson(path) {
  const raw = await fs.readFile(path, 'utf8');
  return JSON.parse(raw);
}

async function deleteSlug(slug) {
  const url = `${DOMAIN}/api/marketplace/${encodeURIComponent(slug)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'x-admin-token': ADMIN_TOKEN
    }
  });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(`Delete failed (${res.status}) for ${slug}: ${body.error || JSON.stringify(body)}`);
  }

  return body;
}

async function generateOne(prompt, price) {
  const url = `${DOMAIN}/api/automate/generate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, price })
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.success) {
    throw new Error(`Generate failed (${res.status}) for "${prompt}": ${body.error || JSON.stringify(body)}`);
  }

  return {
    prompt,
    price,
    slug: body.listing?.slug,
    id: body.listing?.id,
    score: body.validation?.score,
    warnings: body.validation?.warnings || []
  };
}

async function deleteAll(slugs) {
  let i = 0;
  const results = [];

  async function worker() {
    while (i < slugs.length) {
      const idx = i++;
      const slug = slugs[idx];
      try {
        const result = await deleteSlug(slug);
        console.log(`🗑️  deleted: ${slug}`);
        results.push({ slug, success: true, result });
      } catch (e) {
        console.error(`❌ delete error: ${slug} :: ${e.message}`);
        results.push({ slug, success: false, error: e.message });
      }
    }
  }

  await Promise.all(Array.from({ length: DELETE_CONCURRENCY }, () => worker()));
  return results;
}

async function main() {
  const manifest = await readJson(MANIFEST_PATH);
  const batch = await readJson(BATCH_PATH);

  const slugs = (manifest.items || []).map((it) => String(it.file || '').replace(/\.json$/i, '').replace(/^\d+-/, ''));
  const prompts = (batch.prompts || []).map((p) => ({
    prompt: typeof p === 'string' ? p : p.prompt,
    price: typeof p === 'string' ? 0 : (Number.isFinite(p.price) ? p.price : 0)
  }));

  if (slugs.length === 0) throw new Error('No slugs found in manifest.');
  if (prompts.length === 0) throw new Error('No prompts found in batch file.');

  console.log(`🌐 Domain: ${DOMAIN}`);
  console.log(`🗑️  Slugs to delete: ${slugs.length}`);
  console.log(`⚙️  Prompts to regenerate: ${prompts.length}`);

  if (DRY_RUN) {
    console.log('DRY RUN enabled; no API calls will be made.');
    return;
  }

  if (!ADMIN_TOKEN) {
    throw new Error('Missing MARKETPLACE_ADMIN_TOKEN env var for delete step.');
  }

  const deleted = await deleteAll(slugs);
  const deleteFailures = deleted.filter((d) => !d.success);
  if (deleteFailures.length > 0) {
    throw new Error(`Delete phase had ${deleteFailures.length} failures. Aborting regenerate phase.`);
  }

  const generated = [];
  const failed = [];

  for (let idx = 0; idx < prompts.length; idx++) {
    const item = prompts[idx];
    const marker = `[${idx + 1}/${prompts.length}]`;
    try {
      const result = await generateOne(item.prompt, item.price);
      generated.push(result);
      console.log(`✅ ${marker} generated: ${result.slug} (score=${result.score ?? 'n/a'})`);
    } catch (e) {
      failed.push({ prompt: item.prompt, price: item.price, error: e.message });
      console.error(`❌ ${marker} ${e.message}`);
    }
    await wait(DELAY_MS);
  }

  await fs.mkdir('marketing/output', { recursive: true });
  const outPath = `marketing/output/replace-manual-assets-${Date.now()}.json`;
  await fs.writeFile(outPath, JSON.stringify({
    domain: DOMAIN,
    deleted,
    generated,
    failed
  }, null, 2));

  console.log(`\n📝 Saved run summary: ${outPath}`);
  console.log(`✅ Generated: ${generated.length}`);
  console.log(`❌ Failed: ${failed.length}`);

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
