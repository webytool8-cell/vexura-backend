// lib/quality/checks.ts
import fs from 'fs';
import path from 'path';

// -------- TYPE DEFINITIONS --------
export type VectorElement = {
  type: string;
  d?: string; // for path
  cx?: number;
  cy?: number;
  r?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  name?: string; // optional reference name
};

export type Vector = {
  width: number;
  height: number;
  elements: VectorElement[];
};

// -------- ENUMS --------
export enum GenerationType {
  ICON = 'icon',
  ILLUSTRATION = 'illustration',
}

// -------- ICON REFERENCES --------
import { iconReferenceList } from './icon-reference';

// -------- ILLUSTRATION REFERENCES --------
const illustrationRefFolder = path.join(process.cwd(), 'lib/quality/illustration-references');
export function getIllustrationReferences(): string[] {
  if (!fs.existsSync(illustrationRefFolder)) return [];
  return fs.readdirSync(illustrationRefFolder).filter(f => f.endsWith('.svg'));
}

// -------- QUALITY CHECK & AUTO REPAIR --------
export function runQualityChecks(vector: Vector, type: GenerationType) {
  const warnings: string[] = [];
  const elements = vector.elements || [];

  if (!elements.length) {
    warnings.push('Vector contains no elements.');
    return warnings;
  }

  // Identify paths vs simple shapes
  const paths = elements.filter(e => e.type === 'path');
  const shapes = elements.filter(e =>
    ['circle', 'rect', 'ellipse', 'polygon', 'line'].includes(e.type)
  );

  const pathRatio = paths.length / Math.max(elements.length, 1);

  // Curve scoring
  const bezierScore = paths.reduce((sum, p) => sum + (p.d?.match(/[CQ]/g)?.length || 0), 0);
  const lineScore = paths.reduce((sum, p) => sum + (p.d?.match(/[LHV]/g)?.length || 0), 0);
  const curveRatio = bezierScore / Math.max(bezierScore + lineScore, 1);

  // Color analysis
  const colorSet = new Set<string>();
  elements.forEach(e => {
    if (e.fill && e.fill !== 'none') colorSet.add(e.fill);
    if (e.stroke && e.stroke !== 'none') colorSet.add(e.stroke);
  });
  const colorCount = colorSet.size;

  // ---------- ICON RULES ----------
  if (type === GenerationType.ICON) {
    if (elements.length > 8) warnings.push('Icons should use fewer than 8 elements.');
    if (pathRatio > 0.6) warnings.push('Icons should favor simple geometry over complex paths.');
    if (curveRatio > 0.35) warnings.push('Icons should avoid excessive curves.');
    if (colorCount > 2) warnings.push('Icons should use 1–2 colors maximum.');

    // Check against reference icons
    const matches = elements.filter(e => e.name && iconReferenceList.includes(e.name));
    if (!matches.length) warnings.push('Icon does not resemble reference icons.');

    // Auto-fix missing fills
    elements.forEach(e => {
      if (!e.fill || e.fill === 'none') e.fill = '#000000';
    });
  }

  // ---------- ILLUSTRATION RULES ----------
  if (type === GenerationType.ILLUSTRATION) {
    if (elements.length < 6) warnings.push('Illustrations should contain more visual detail.');
    if (pathRatio < 0.6) warnings.push('Illustrations should rely heavily on path elements.');
    if (curveRatio < 0.5) warnings.push('Illustrations should use flowing, organic curves.');
    if (colorCount < 3) warnings.push('Illustrations usually require richer color variation.');

    // Suggest references for Open Peeps / human poses
    const references = getIllustrationReferences();
    const matchedRefs = elements.filter(e => e.name && references.includes(e.name));
    if (!matchedRefs.length && elements.some(e => e.type === 'path')) {
      warnings.push('Illustration could use reference poses or human elements from library.');
    }

    // Auto-fix missing fills
    elements.forEach(e => {
      if (!e.fill || e.fill === 'none') e.fill = '#cccccc';
    });
  }

  return warnings;
}

// -------- OPTIONAL: Auto repair vector elements --------
export function autoRepairVector(vector: Vector, type: GenerationType): Vector {
  const repaired = { ...vector, elements: vector.elements.map(e => ({ ...e })) };

  repaired.elements.forEach(e => {
    // Fill invisible elements
    if (!e.fill || e.fill === 'none') {
      e.fill = type === GenerationType.ICON ? '#000000' : '#cccccc';
    }

    // Ensure width/height for shapes
    if (['rect', 'ellipse'].includes(e.type)) {
      if (!e.width) e.width = 50;
      if (!e.height) e.height = 50;
    }

    // Default path strokeWidth
    if (e.type === 'path' && e.strokeWidth === undefined) e.strokeWidth = 1;
  });

  return repaired;
}
