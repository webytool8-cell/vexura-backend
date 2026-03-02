import fs from 'node:fs';

const source = fs.readFileSync('lib/validators/icon-validator.ts', 'utf8');

const requiredExactlyOne = [
  'function applyParentContainmentPass(',
  'function calcBoundsAreaForContainment(',
  'function enforceOrganicShapeIntegrity(',
  'function convertHeartPrimitivesToUnifiedPath('
];

const forbiddenLegacy = [
  'function checkAndFixParentContainment(',
  'function enforceParentContainment(',
  'function getElementArea(',
  'function computeElementBoundsArea('
];

let hasError = false;
for (const signature of requiredExactlyOne) {
  const count = source.split(signature).length - 1;
  if (count !== 1) {
    console.error(`Expected exactly 1 occurrence of "${signature}", found ${count}.`);
    hasError = true;
  }
}

for (const signature of forbiddenLegacy) {
  const count = source.split(signature).length - 1;
  if (count !== 0) {
    console.error(`Expected 0 occurrences of legacy signature "${signature}", found ${count}.`);
    hasError = true;
  }
}

if (hasError) process.exit(1);

console.log('icon-validator structure check passed');
