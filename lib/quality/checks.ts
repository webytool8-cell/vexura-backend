// lib/quality/checks.ts

export enum GenerationType {
  ICON = 'icon',
  ILLUSTRATION = 'illustration',
}

export function runQualityChecks(vector: any, type: GenerationType) {
  const warnings: string[] = [];

  if (!vector.elements || vector.elements.length === 0) {
    warnings.push('Vector has no elements.');
  }

  // Example: check for invisible nodes
  vector.elements?.forEach((el: any) => {
    if (!el.fill) warnings.push(`Element of type ${el.type} has no fill.`);
  });

  // Add more checks for human limbs, joints, symmetry, etc.

  return warnings;
}
