// lib/quality/checks.ts
import fs from 'fs';
import path from 'path';
import { iconReferenceList } from './icon-reference';

// Define types
export type Vector = {
  width: number;
  height: number;
  elements: any[];
};

export type GenerationType = 'icon' | 'illustration';

// ---------- REFERENCE FOLDER PATH ----------
const illustrationRefPath = path.join(process.cwd(), 'lib/quality/illustration-references');

// ---------- HELPER FUNCTIONS ----------
function getIllustrationReferences(): string[] {
  if (!fs.existsSync(illustrationRefPath)) return [];
  return fs.readdirSync(illustrationRefPath).filter(f => f.endsWith('.svg'));
}

function detectIllustrationBias(vector: Vector): { headQuality: number; proportionScore: number; curveScore: number } {
  let headQuality = 0;
  let proportionScore = 0;
  let curveScore = 0;

  const elements = vector.elements || [];

  // Head check: penalize primitive circle, reward path-based heads
  const headElements = elements.filter(e => e.name?.toLowerCase()?.includes('head'));
  if (headElements.length) {
    headElements.forEach(h => {
      if (h.type === 'circle' || h.type === 'ellipse') headQuality -= 1;
      if (h.type === 'path') headQuality += 2;
    });
  }

  // Proportion check: compare heights of head, torso, limbs if named
  const torso = elements.find(e => e.name?.toLowerCase()?.includes('torso'));
  const limbs = elements.filter(e => /arm|leg/i.test(e.name || ''));
  if (headElements.length && torso && limbs.length) {
    const headHeight = headElements[0].height || 1;
    const torsoHeight = torso.height || 1;
    const limbHeights = limbs.map(l => l.height || 1);
    const totalBody = headHeight + torsoHeight + limbHeights.reduce((a, b) => a + b, 0);
    const headRatio = headHeight / totalBody;
    if (headRatio >= 0.12 && headRatio <= 0.18) proportionScore += 2;
    else proportionScore -= 1;
  }

  // Curve check: reward smooth Bézier curves
  const paths = elements.filter(e => e.type === 'path' && e.d);
  let bezierCount = 0;
  let lineCount = 0;
  paths.forEach(p => {
    bezierCount += (p.d.match(/[CQ]/g) || []).length;
    lineCount += (p.d.match(/[LHV]/g) || []).length;
  });
  curveScore = bezierCount / Math.max(bezierCount + lineCount, 1);

  return { headQuality, proportionScore, curveScore };
}

// ---------- QUALITY CHECK FUNCTION ----------
export function runQualityChecks(vector: Vector, type: GenerationType) {
  const warnings: string[] = [];
  const elements = vector.elements || [];

  if (!elements.length) {
    warnings.push('Vector contains no elements.');
    return warnings;
  }

  // Basic metrics
  const paths = elements.filter(e => e.type === 'path');
  const shapes = elements.filter(e => ['circle', 'rect', 'ellipse', 'polygon', 'line'].includes(e.type));
  const pathRatio = paths.length / elements.length;

  const colorSet = new Set<string>();
  elements.forEach(e => {
    if (e.fill && e.fill !== 'none') colorSet.add(e.fill);
    if (e.stroke && e.stroke !== 'none') colorSet.add(e.stroke);
  });
  const colorCount = colorSet.size;

  // ---------- ICON RULES ----------
  if (type === 'icon') {
    if (elements.length > 8) warnings.push('Icons should use fewer than 8 elements.');
    if (pathRatio > 0.6) warnings.push('Icons should favor simple geometry over complex paths.');
    if (colorCount > 2) warnings.push('Icons should use 1–2 colors maximum.');

    // Reference similarity
    const matches = elements.filter(e => iconReferenceList.includes(e.name));
    if (!matches.length) warnings.push('Icon does not resemble reference icons.');
  }

  // ---------- ILLUSTRATION RULES ----------
  if (type === 'illustration') {
    if (elements.length < 6) warnings.push('Illustrations should contain more visual detail.');
    if (pathRatio < 0.6) warnings.push('Illustrations should rely heavily on path elements.');
    if (colorCount < 3) warnings.push('Illustrations usually require richer color variation.');

    // Human and organic figure scoring
    const biasScores = detectIllustrationBias(vector);

    if (biasScores.headQuality < 1) warnings.push('Heads are too primitive; use path shapes instead of circles.');
    if (biasScores.proportionScore < 1) warnings.push('Human figure proportions are off.');
    if (biasScores.curveScore < 0.5) warnings.push('Figures should use more flowing, organic curves.');

    // Reference check
    const illustrationRefs = getIllustrationReferences();
    const matchedRefs = elements.filter(e => illustrationRefs.includes(e.name));
    if (!matchedRefs.length) warnings.push('Illustration does not match reference pose or style.');
  }

  return warnings;
}
