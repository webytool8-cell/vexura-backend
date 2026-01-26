// lib/quality/checks.ts
import { iconReferenceList } from './icon-reference';
import fs from 'fs';
import path from 'path';

type Vector = {
  width: number;
  height: number;
  elements: any[];
  reference?: string; // optional reference used
};

export type GenerationType = 'icon' | 'illustration';

const illustrationRefFolder = path.join(process.cwd(), 'lib/quality/illustration-reference');
const illustrationRefs = fs.existsSync(illustrationRefFolder)
  ? fs.readdirSync(illustrationRefFolder)
  : [];

export function runQualityChecks(vector: Vector, type: GenerationType) {
  const warnings: string[] = [];
  const elements = vector.elements || [];

  if (!elements.length) {
    warnings.push('Vector contains no elements.');
    return { warnings, score: 0 };
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
  let score = 100;

  if (type === 'icon') {
    if (elements.length > 8) {
      warnings.push('Icons should use fewer than 8 elements.');
      score -= 15;
    }
    if (pathRatio > 0.6) {
      warnings.push('Icons should favor simple geometry over complex paths.');
      score -= 15;
    }
    if (curveRatio > 0.35) {
      warnings.push('Icons should avoid excessive curves.');
      score -= 15;
    }
    if (colorCount > 2) {
      warnings.push('Icons should use 1–2 colors maximum.');
      score -= 10;
    }

    const matches = elements.filter(e => iconReferenceList.includes(e.name));
    if (!matches.length) {
      warnings.push('Icon does not resemble reference icons.');
      score -= 20;
    }
  }

  // ---------- ILLUSTRATION RULES ----------
  if (type === 'illustration') {
    if (elements.length < 6) {
      warnings.push('Illustrations should contain more visual detail.');
      score -= 15;
    }
    if (pathRatio < 0.6) {
      warnings.push('Illustrations should rely heavily on path elements.');
      score -= 15;
    }
    if (curveRatio < 0.5) {
      warnings.push('Illustrations should use flowing, organic curves.');
      score -= 15;
    }
    if (colorCount < 3) {
      warnings.push('Illustrations usually require richer color variation.');
      score -= 10;
    }

    const refMatch = illustrationRefs.some(f =>
      vector.reference?.includes(f) || elements.some(e => e.name === f.replace('.svg', ''))
    );
    if (!refMatch) {
      warnings.push('Illustration does not match any reference.');
      score -= 20;
    }
  }

  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, score));

  return { warnings, score };
}
