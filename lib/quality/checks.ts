// lib/quality/checks.ts
import fs from 'fs';
import path from 'path';
import { iconReferenceList } from './icon-reference';

export type GenerationType = 'icon' | 'illustration';

type VectorElement = {
  type: string;
  name?: string;
  d?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  [key: string]: any;
};

type Vector = {
  width: number;
  height: number;
  elements: VectorElement[];
};

// --------- Human illustration references ---------
const illustrationReferencePath = path.join(process.cwd(), 'lib/quality/references/illustrations/humans');
export function getIllustrationReferences(): string[] {
  if (!fs.existsSync(illustrationReferencePath)) return [];
  return fs.readdirSync(illustrationReferencePath).filter(f => f.endsWith('.svg'));
}

// --------- Illustration bias detection & scoring ---------
export function detectIllustrationBias(vector: Vector): { score: number; warnings: string[] } {
  const warnings: string[] = [];
  let score = 0;

  const elements = vector.elements || [];
  if (!elements.length) {
    warnings.push('Vector contains no elements.');
    return { score, warnings };
  }

  // Paths vs shapes
  const paths = elements.filter(e => e.type === 'path');
  const shapes = elements.filter(e =>
    ['circle', 'rect', 'ellipse', 'polygon', 'line'].includes(e.type)
  );

  const pathRatio = paths.length / elements.length;
  const bezierScore = paths.reduce((sum, p) => sum + ((p.d?.match(/[CQ]/g)?.length) || 0), 0);
  const lineScore = paths.reduce((sum, p) => sum + ((p.d?.match(/[LHV]/g)?.length) || 0), 0);
  const curveRatio = bezierScore / Math.max(bezierScore + lineScore, 1);

  // Color variation
  const colorSet = new Set<string>();
  elements.forEach(e => {
    if (e.fill && e.fill !== 'none') colorSet.add(e.fill);
    if (e.stroke && e.stroke !== 'none') colorSet.add(e.stroke);
  });
  const colorCount = colorSet.size;

  // ---------- HUMAN FIGURE SPECIFIC CHECKS ----------
  const humanElements = elements.filter(e => e.name?.toLowerCase().includes('head') || e.name?.toLowerCase().includes('body'));
  const headElements = humanElements.filter(e => e.name?.toLowerCase().includes('head'));

  if (headElements.length) {
    headElements.forEach(h => {
      // Warn if head is a circle
      if (h.type === 'circle') warnings.push('Head drawn as simple circle. Use oval or proportional shape.');
      else score++;
    });
  }

  if (humanElements.length) {
    score++; // at least some human structure
    // Bonus: reference match
    const references = getIllustrationReferences();
    const matched = humanElements.filter(e => references.includes(`${e.name}.svg`));
    if (!matched.length) warnings.push('Human figure does not match reference poses.');
    else score++;
  }

  // Curve and path checks
  if (curveRatio > 0.5) score++;
  else warnings.push('Illustration curves could be smoother.');

  // Element count check
  if (elements.length >= 6 && elements.length <= 12) score++;
  else warnings.push('Illustration element count may be too low or too high.');

  // Color richness
  if (colorCount >= 3) score++;
  else warnings.push('Illustration could use more color variation.');

  return { score, warnings };
}

// ---------- GENERAL QUALITY CHECKS ----------
export function runQualityChecks(vector: Vector, type: GenerationType) {
  const warnings: string[] = [];
  const elements = vector.elements || [];

  if (!elements.length) {
    warnings.push('Vector contains no elements.');
    return warnings;
  }

  const paths = elements.filter(e => e.type === 'path');
  const pathRatio = paths.length / elements.length;
  const bezierScore = paths.reduce((sum, p) => sum + ((p.d?.match(/[CQ]/g)?.length) || 0), 0);
  const lineScore = paths.reduce((sum, p) => sum + ((p.d?.match(/[LHV]/g)?.length) || 0), 0);
  const curveRatio = bezierScore / Math.max(bezierScore + lineScore, 1);

  const colorSet = new Set<string>();
  elements.forEach(e => {
    if (e.fill && e.fill !== 'none') colorSet.add(e.fill);
    if (e.stroke && e.stroke !== 'none') colorSet.add(e.stroke);
  });
  const colorCount = colorSet.size;

  if (type === 'icon') {
    if (elements.length > 8) warnings.push('Icons should use fewer than 8 elements.');
    if (pathRatio > 0.6) warnings.push('Icons should favor simple geometry over complex paths.');
    if (curveRatio > 0.35) warnings.push('Icons should avoid excessive curves.');
    if (colorCount > 2) warnings.push('Icons should use 1–2 colors maximum.');
    const matches = elements.filter(e => iconReferenceList.includes(e.name || ''));
    if (!matches.length) warnings.push('Icon does not resemble reference icons.');
  }

  if (type === 'illustration') {
    if (elements.length < 6) warnings.push('Illustrations should contain more visual detail.');
    if (pathRatio < 0.6) warnings.push('Illustrations should rely heavily on path elements.');
    if (curveRatio < 0.5) warnings.push('Illustrations should use flowing, organic curves.');
    if (colorCount < 3) warnings.push('Illustrations usually require richer color variation.');

    // Run human figure bias detection if human elements exist
    const humanScore = detectIllustrationBias(vector);
    warnings.push(...humanScore.warnings);
  }

  return warnings;
}
