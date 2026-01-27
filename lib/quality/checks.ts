// lib/quality/checks.ts
import { iconReferenceList } from './icon-reference';
import fs from 'fs';
import path from 'path';

export type VectorElement = {
  type: string;
  name?: string;
  d?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
};

export type Vector = {
  width: number;
  height: number;
  elements: VectorElement[];
};

export function runQualityChecks(vector: Vector, type: 'icon' | 'illustration') {
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
    const matches = elements.filter(e => e.name && iconReferenceList.includes(e.name));
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

// ---------- AUTO-REPAIR LOGIC ----------
export function autoRepairVector(elements: VectorElement[], type: 'icon' | 'illustration', referenceSvgs: string[]): VectorElement[] {
  const repairedElements = [...elements];

  // Fill/stroke defaults for visibility
  for (const el of repairedElements) {
    if (!el.fill || el.fill === 'none' || el.fill === '#ffffff') {
      el.fill = type === 'icon' ? '#000000' : '#E0E0E0';
    }
    if (!el.stroke || el.stroke === 'none' || el.stroke === '#ffffff') {
      el.stroke = type === 'icon' ? '#000000' : '#333333';
      el.strokeWidth = el.strokeWidth || 1.5;
    }
  }

  // Human figure repair (illustration)
  if (type === 'illustration') {
    const elementNames = new Set(elements.map(e => e.name));

    const mandatoryParts = [
      'torso','neck','head',
      'leftUpperArm','leftForearm','rightUpperArm','rightForearm',
      'leftThigh','leftShin','rightThigh','rightShin'
    ];

    for (const part of mandatoryParts) {
      if (!elementNames.has(part)) {
        const ref = referenceSvgs.find(f => f.includes(part));
        if (ref) {
          repairedElements.push({
            type: 'path',
            name: part,
            d: `<use reference from ${ref}>`,
            fill: '#E0E0E0',
            stroke: '#333333',
            strokeWidth: 2,
          });
        }
      }
    }
  }

  return repairedElements;
}
