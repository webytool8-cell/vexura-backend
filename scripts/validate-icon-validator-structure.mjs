import fs from 'node:fs';

const source = fs.readFileSync('lib/validators/icon-validator.ts', 'utf8');

const signatures = [
  'function enforceParentContainment(',
  'function computeElementBoundsArea(',
  'function enforceOrganicShapeIntegrity(',
  'function convertHeartPrimitivesToUnifiedPath('
];

let hasError = false;
for (const signature of signatures) {
  const count = source.split(signature).length - 1;
  if (count !== 1) {
    console.error(`Expected exactly 1 occurrence of "${signature}", found ${count}.`);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

console.log('icon-validator structure check passed');
