// lib/quality/checks.ts
import fs from 'fs';
import path from 'path';
import { iconReferenceList } from './icon-reference';

export type Vector = {
  width: number;
  height: number;
  elements: any[];
};

export type GenerationType = 'icon' | 'illustration';

const illustrationRefPath = path.join(process.cwd(), 'lib/quality/illustration-references');

export function getIllustrationReferences(): string[] {
  if (!fs.existsSync(illustrationRefPath)) return [];
  return fs.readdirSync(illustrationRefPath).filter(f => f.endsWith('.svg'));
}

// ---------- BIAS AND SCORE FUNCTION ----------
export function scoreIllustration(vector: Vector) {
  const elements = vector.elements || [];
  const paths = elements.filter(e => e.type === 'path');
  const shapes = elements.filter(e => ['circle', 'rect', 'ellipse', 'polygon', 'line'].includes(e.type));

  // Score for heads
  let headScore = 0;
  const headElements = elements.filter(e => e.name?.toLowerCase()?.includes('head'));
  headElements.forEach(h => {
    if (h.type === 'path') headScore += 2;
    else if (h.type === 'circle' || h.type === 'ellipse') headScore += 0.5;
  });

  // Score for proportion
  let proportionScore = 0;
  const torso = elements.find(e => e.name?.toLowerCase()?.includes('torso'));
  const limbs = elements.filter(e => /arm|leg/i.test(e.name || ''));
  if (headElements.length && torso && limbs.length) {
    const headHeight = headElements[0].height || 1;
    const torsoHeight = torso.height || 1;
    const limbHeights = limbs.map(l => l.height || 1);
    const totalBody = headHeight + torsoHeight + limbHeights.reduce((a, b) => a + b, 0);
    const headRatio = headHeight / totalBody;
    proportionScore = headRatio >= 0.12 && headRatio <= 0.18 ? 2 : 0.5;
  }

  // Curve Score
  let bezierCount = 0;
  let lineCount = 0;
  paths.forEach(p => {
    bezierCount += (p.d?.match(/[CQ]/g) || []).length;
    lineCount += (p.d?.match(/[LHV]/g) || []).length;
  });
  const curveScore = bezierCount / Math.max(bezierCount + lineCount, 1);

  // Color richness
  const colorSet = new Set<string>();
  elements.forEach(e => {
    if (e.fill && e.fill !== 'none') colorSet.add(e.fill);
    if (e.stroke && e.stroke !== 'none') colorSet.add(e.stroke);
  });
  const colorScore = Math.min(colorSet.size / 5, 1); // max 1

  // Reference matching score
  const illustrationRefs = getIllustrationReferences();
  const refMatch = elements.filter(e => illustrationRefs.includes(e.name));
  const refScore = Math.min(refMatch.length / 5, 1); // scale 0-1

  // Final weighted score (0-100)
  const finalScore =
    20 * Math.min(headScore, 2) +       // heads 0-20
    20 * Math.min(proportionScore, 2) + // proportion 0-20
    20 * Math.min(curveScore, 1) +      // curves 0-20
    20 * colorScore +                    // colors 0-20
    20 * refScore;                       // reference 0-20

  return Math.round(finalScore);
}

// ---------- QUALITY CHECKS ----------
export function runQualityChecks(vector: Vector, type: GenerationType) {
  const warnings: string[] = [];
  const elements = vector.elements || [];

  if (!elements.length) {
    warnings.push('Vector contains no elements.');
    return warnings;
  }

  const paths = elements.filter(e => e.type === 'path');
  const pathRatio = paths.length / elements.length;

  const colorSet = new Set<string>();
  elements.forEach(e => {
    if (e.fill && e.fill !== 'none') colorSet.add(e.fill);
    if (e.stroke && e.stroke !== 'none') colorSet.add(e.stroke);
  });

  const colorCount = colorSet.size;

  // ICON RULES
  if (type === 'icon') {
    if (elements.length > 8) warnings.push('Icons should use fewer than 8 elements.');
    if (pathRatio > 0.6) warnings.push('Icons should favor simple geometry.');
    if (colorCount > 2) warnings.push('Icons should use 1–2 colors max.');

    const matches = elements.filter(e => iconReferenceList.includes(e.name));
    if (!matches.length) warnings.push('Icon does not resemble reference icons.');
  }

  // ILLUSTRATION RULES
  if (type === 'illustration') {
    if (elements.length < 6) warnings.push('Illustrations need more visual detail.');
    if (pathRatio < 0.6) warnings.push('Illustrations should rely on paths.');
    if (colorCount < 3) warnings.push('Illustrations should use richer color variation.');

    const score = scoreIllustration(vector);
    if (score < 60) warnings.push(`Illustration score low (${score}/100). Consider using references, more curves, or better human proportions.`);
  }

  return warnings;
}
