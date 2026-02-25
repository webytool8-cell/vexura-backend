import fs from 'node:fs/promises';
import path from 'node:path';

const batchPath = path.resolve('marketing/pinterest-batch.json');
const outDir = path.resolve('marketing/manual-upload-assets-50');

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function generateLocalVector(payload) {
  const safePayload = payload || { prompt: 'unknown' };
  const prompt = safePayload.prompt || 'unknown';
  const type = safePayload.type || 'icon';
  const palette = safePayload.palette || 'auto';

  const cleanPrompt = prompt.toLowerCase();
  const width = 400;
  const height = 400;
  const elements = [];

  const colors = {
    primary: '#000000',
    secondary: '#71717a',
    accent: '#ccff00',
    bg: 'none'
  };

  if (palette === 'warm') { colors.primary = '#ea580c'; colors.secondary = '#fdba74'; colors.accent = '#fca5a5'; }
  else if (palette === 'cool') { colors.primary = '#0284c7'; colors.secondary = '#7dd3fc'; colors.accent = '#bae6fd'; }
  else if (palette === 'vibrant') { colors.primary = '#7c3aed'; colors.secondary = '#c084fc'; colors.accent = '#e879f9'; }
  else if (palette === 'monochrome') { colors.primary = '#18181b'; colors.secondary = '#52525b'; colors.accent = '#d4d4d8'; }

  const isRound = /circle|round|sphere|ball|world|globe|planet/.test(cleanPrompt);
  const isTri = /triangle|pyramid|mountain|sharp|arrow/.test(cleanPrompt);
  const isTech = /tech|chip|data|code|server|upload|download|digital/.test(cleanPrompt);
  const isNature = /leaf|tree|flower|nature|organic|growth/.test(cleanPrompt);

  let seed = 0;
  for (let i = 0; i < prompt.length; i++) seed += prompt.charCodeAt(i);

  const getRand = (mod) => (seed = (seed * 9301 + 49297) % 233280) % mod;

  if (isRound) {
    elements.push({ id: 'base-circle', type: 'circle', cx: 200, cy: 200, r: 180, fill: 'none', stroke: colors.primary, strokeWidth: 4 });
  } else if (isTri) {
    elements.push({ id: 'base-tri', type: 'polygon', points: '200,40 360,340 40,340', fill: 'none', stroke: colors.primary, strokeWidth: 4 });
  } else {
    elements.push({ id: 'base-rect', type: 'rect', x: 40, y: 40, width: 320, height: 320, rx: 32, fill: 'none', stroke: colors.primary, strokeWidth: 4 });
  }

  const complexity = (seed % 4) + 3;

  for (let i = 0; i < complexity; i++) {
    const size = 60 + getRand(100);
    const xPos = 100 + getRand(200);
    const yPos = 100 + getRand(200);
    const isFilled = getRand(10) > 5;

    if (isTech && i % 2 === 0) {
      elements.push({ id: `tech-el-${i}`, type: 'rect', x: xPos - 20, y: yPos - 10, width: 40, height: 20, rx: 4, fill: isFilled ? colors.secondary : 'none', stroke: colors.primary, strokeWidth: 2 });
      continue;
    }

    if (isNature && i % 2 === 0) {
      elements.push({ id: `nature-el-${i}`, type: 'circle', cx: xPos, cy: yPos, r: size / 2, fill: isFilled ? colors.accent : 'none', stroke: colors.primary, strokeWidth: 2, opacity: 0.6 });
      continue;
    }

    if (i % 2 === 0) {
      elements.push({ id: `geo-circle-${i}`, type: 'circle', cx: xPos, cy: yPos, r: size / 3, fill: i === 0 ? colors.accent : (isFilled ? colors.secondary : 'none'), stroke: colors.primary, strokeWidth: 2 });
    } else {
      elements.push({ id: `geo-rect-${i}`, type: 'rect', x: xPos - size / 2, y: yPos - size / 2, width: size, height: size, rx: 8, fill: 'none', stroke: colors.secondary, strokeWidth: 2 });
    }
  }

  elements.push({ id: 'center-accent', type: 'circle', cx: 200, cy: 200, r: 10, fill: colors.accent, stroke: 'none' });

  return {
    name: prompt.substring(0, 40) + (prompt.length > 40 ? '...' : ''),
    width,
    height,
    elements
  };
}

const batchRaw = await fs.readFile(batchPath, 'utf8');
const batch = JSON.parse(batchRaw);
const prompts = Array.isArray(batch.prompts) ? batch.prompts : [];

if (prompts.length !== 50) {
  throw new Error(`Expected 50 prompts, got ${prompts.length}`);
}

await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(outDir, { recursive: true });

const manifest = [];
for (let i = 0; i < prompts.length; i++) {
  const p = prompts[i];
  const prompt = typeof p === 'string' ? p : p.prompt;
  const price = typeof p === 'string' ? 0 : (Number.isFinite(p.price) ? p.price : 0);
  const vector = generateLocalVector({ prompt, type: 'icon' });

  const fileBase = `${String(i + 1).padStart(2, '0')}-${slugify(prompt)}`;
  const fileName = `${fileBase}.json`;
  const target = path.join(outDir, fileName);
  await fs.writeFile(target, `${JSON.stringify(vector, null, 2)}\n`, 'utf8');

  manifest.push({
    index: i + 1,
    file: fileName,
    prompt,
    suggestedPrice: price
  });
}

await fs.writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify({ total: manifest.length, generatedBy: 'marketing/export-local-assets.mjs', sourceBatch: 'marketing/pinterest-batch.json', items: manifest }, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(outDir, 'README.md'), `# Manual Upload Asset Pack (50)

This folder contains 50 vector JSON files generated from \
\
- \
\

the prompts in \`marketing/pinterest-batch.json\` using the deterministic local generator logic.

## Upload steps
1. Open \`/dashboard\` in your app.
2. Drag/drop all \`.json\` files in this folder (exclude \`manifest.json\` and this README).
3. Upload order is prefixed in the filename (\`01-...\` to \`50-...\`).

## Notes
- These are local deterministic vectors intended as a manual-upload pack.
- Suggested prices from the original batch are listed in \`manifest.json\`.
`, 'utf8');

console.log(`Generated ${manifest.length} assets in ${outDir}`);
