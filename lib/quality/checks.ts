// lib/quality/checks.ts
import fs from 'fs';
import path from 'path';
import { iconReferenceList } from './icon-reference';

type VectorElement = {
  type: string;
  d?: string;
  fill?: string;
  stroke?: string;
  name?: string;
};

type Vector = {
  width: number;
  height: number;
  elements: VectorElement[];
};

/* ---------------------------------------------
   Load illustration SVG references (SERVER ONLY)
---------------------------------------------- */
const ILLUSTRATION_REF_DIR = path.join(
  process.cwd(),
  'lib/quality/illustration-reference'
);

function loadIllustrationSVGs(): string[] {
  try {
    if (!fs.existsSync(ILLUSTRATION_REF_DIR)) return [];

    return fs
      .readdirSync(ILLUSTRATION_REF_DIR)
      .filter(file => file.endsWith('.svg'))
      .map(file =>
        fs.readFileSync(path.join(ILLUSTRATION_REF_DIR, file), 'utf-8')
      );
  } catch {
    return [];
  }
}

const illustrationReferences = loadIllustrationSVGs();

/* ---------------------------------------------
   Main Quality Check Logic
---------------------------------------------- */
export function runQualityChecks(
  vector: Vector,
  type: 'icon' | 'illustration'
) {
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

  const curveRatio =
    bezierScore / Math.max(bezierScore + lineScore, 1);

  const colorSet = new Set<string>();
  elements.forEach(e => {
    if (e.fill && e.fill !== 'none') colorSet.add(e.fill);
    if (e.stroke && e.stroke !== 'none') colorSet.add(e.stroke);
  });

  const colorCount = colorSet.size;

  /* ---------------------------------------------
     ICON RULES
  ---------------------------------------------- */
  if (type === 'icon') {
    if (elements.length > 8)
      warnings.push('Icons should use fewer than 8 elements.');

    if (pathRatio > 0.6)
      warnings.push('Icons should favor simple geometry over complex paths.');

    if (curveRatio > 0.35)
      warnings.push('Icons should avoid excessive curves.');

    if (colorCount > 2)
      warnings.push('Icons should use 1–2 colors maximum.');

    // Reference heuristic (name / semantic match)
    const matched = elements.some(e =>
      e.name && iconReferenceList.includes(e.name)
    );

    if (!matched)
      warnings.push('Icon does not resemble common reference icons.');
  }

  /* ---------------------------------------------
     ILLUSTRATION RULES
  ---------------------------------------------- */
  if (type === 'illustration') {
    if (elements.length < 6)
      warnings.push('Illustrations should contain more visual detail.');

    if (pathRatio < 0.6)
      warnings.push('Illustrations should rely heavily on path elements.');

    if (curveRatio < 0.5)
      warnings.push('Illustrations should use flowing, organic curves.');

    if (colorCount < 3)
      warnings.push('Illustrations usually require richer color variation.');

    if (!illustrationReferences.length)
      warnings.push('Illustration reference library not found.');
  }

  return warnings;
}
