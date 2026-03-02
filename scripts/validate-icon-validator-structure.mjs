import fs from 'node:fs';

const validatorSource = fs.readFileSync('lib/validators/icon-validator.ts', 'utf8');
const passesSource = fs.readFileSync('lib/validators/vector-passes.ts', 'utf8');

const requiredValidator = [
  'applyParentContainmentPass(fixed, result, { getElementBounds, scaleAndTranslateElement });',
  'enforceOrganicShapeIntegrity(fixed, result, { prompt: options?.prompt, iconTypeHint: options?.iconTypeHint });'
];

const requiredPassesExactlyOne = [
  'export function applyParentContainmentPass(',
  'function calcBoundsAreaForContainment(',
  'export function enforceOrganicShapeIntegrity(',
  'function convertHeartPrimitivesToUnifiedPath('
];

const forbiddenLegacyInValidator = [
  'function checkAndFixParentContainment(',
  'function enforceParentContainment(',
  'function applyParentContainmentPass(',
  'function getElementArea(',
  'function computeElementBoundsArea(',
  'function calcBoundsAreaForContainment(',
  'function enforceOrganicShapeIntegrity(',
  'function convertHeartPrimitivesToUnifiedPath('
];

let hasError = false;
for (const signature of requiredValidator) {
  const count = validatorSource.split(signature).length - 1;
  if (count !== 1) {
    console.error(`Expected validator to include exactly 1 occurrence of "${signature}", found ${count}.`);
    hasError = true;
  }
}

for (const signature of requiredPassesExactlyOne) {
  const count = passesSource.split(signature).length - 1;
  if (count !== 1) {
    console.error(`Expected vector-passes to include exactly 1 occurrence of "${signature}", found ${count}.`);
    hasError = true;
  }
}

for (const signature of forbiddenLegacyInValidator) {
  const count = validatorSource.split(signature).length - 1;
  if (count !== 0) {
    console.error(`Expected validator to include 0 occurrences of "${signature}", found ${count}.`);
    hasError = true;
  }
}

if (hasError) process.exit(1);

console.log('icon-validator structure check passed');
