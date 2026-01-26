// lib/quality/checks.ts
import { iconReferenceList } from './icon-reference';
import fs from 'fs';
import path from 'path';

export type GenerationType = 'icon' | 'illustration';

type Vector = {
  width: number;
  height: number;
  elements: any[];
};

// Detect if the prompt is suggesting humans, animals, or organic shapes
export function detectIllustrationBias(prompt: string): boolean {
  const humanKeywords = [
    'person', 'human', 'character', 'face', 'body',
    'people', 'pose', 'expression', 'animal', 'creature', 'organic'
  ];
  const lower = prompt.toLowerCase();
  return humanKeywords.some(word => lower.includes(word));
}

// Main quality check function
export function runQualityChecks(vector: Vector, type: GenerationType) {
  const warnings: string[] = [];
  const elements = vector.elements || [];

  if (!elements.length) {
    warnings.push('Vector contains no elements.');
    return warnings;
  }

  const paths = elements.filter(e => e.type === 'path');
  const shapes = elements.filter(e =>
    ['circle', 'rect', 'ellipse', 'polygon', 'line'].includes(e.type)
  );

  const pathRatio = paths.length / elements.length;

  const bezierScore = paths.reduce((sum, p) => {
    if (!p.d) return sum;
    return sum + (p.d.match(/[CQ]/g)?.length || 0);
  }, 0);

  const lineScore = paths.reduce((sum, p) => {
    if (!p.d) return sum;
    return sum + (p.d.match(/[LHV]/g)?.length || 0);
  }, 0);

  const curveRatio = bezierScore / Math.max(bezierScore + lineScore, 1);

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
    if (curveRatio > 0.35) warnings.push('Icons should avoid excessive curves.');
    if (colorCount > 2) warnings.push('Icons should use 1–2 colors maximum.');

    // Check against reference icons
    const matches = elements.filter(e => iconReferenceList.includes(e.name));
    if (!matches.length) warnings.push('Icon does not resemble reference icons.');
  }

  // ---------- ILLUSTRATION RULES ----------
  if (type === 'illustration') {
    if (elements.length < 6) warnings.push('Illustrations should contain more visual detail.');
    if (pathRatio < 0.6) warnings.push('Illustrations should rely heavily on path elements.');
    if (curveRatio < 0.5) warnings.push('Illustrations should use flowing, organic curves.');
    if (colorCount < 3) warnings.push('Illustrations usually require richer color variation.');
  }

  return warnings;
}

// ---------- OPTIONAL: Reference folder for illustration human/animal poses ----------
export function getIllustrationReferences(): string[] {
  const folder = path.join(process.cwd(), 'lib', 'quality', 'illustration-references');
  try {
    return fs.readdirSync(folder).filter(file => file.endsWith('.svg'));
  } catch (e) {
    console.warn('Illustration reference folder not found.');
    return [];
  }
}
