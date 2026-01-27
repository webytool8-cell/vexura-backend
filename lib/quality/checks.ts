// lib/quality/checks.ts
import fs from 'fs';
import path from 'path';
import { renderFormats } from '../render/svg';

export type GenerationType = 'icon' | 'illustration';

export type VectorElement = {
  type: 'circle' | 'rect' | 'ellipse' | 'polygon' | 'path' | 'line';
  name?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  d?: string; // for paths
  parent?: string; // parent element for hierarchical validation
  children?: string[]; // child elements
};

export type Vector = {
  width: number;
  height: number;
  elements: VectorElement[];
};

// ---------- ICON REFERENCE ----------
// List of icon names to match against
import { iconReferenceList } from './icon-reference';

// ---------- ILLUSTRATION REFERENCE ----------
// Folder path with SVG references for human poses / figures
const illustrationRefPath = path.join(process.cwd(), 'lib', 'quality', 'illustration-references');
const illustrationReferenceList = fs.existsSync(illustrationRefPath)
  ? fs.readdirSync(illustrationRefPath).filter(f => f.endsWith('.svg'))
  : [];

// ---------- SKELETON & LIMB VALIDATION ----------

type SkeletonNode = {
  name: string;
  parent?: string;
  children?: string[];
  optional?: boolean;
};

const HUMAN_SKELETON: SkeletonNode[] = [
  { name: 'torso' },
  { name: 'neck', parent: 'torso' },
  { name: 'head', parent: 'neck' },
  { name: 'leftUpperArm', parent: 'torso' },
  { name: 'leftForearm', parent: 'leftUpperArm' },
  { name: 'leftHand', parent: 'leftForearm', optional: true },
  { name: 'rightUpperArm', parent: 'torso' },
  { name: 'rightForearm', parent: 'rightUpperArm' },
  { name: 'rightHand', parent: 'rightForearm', optional: true },
  { name: 'leftThigh', parent: 'torso' },
  { name: 'leftShin', parent: 'leftThigh' },
  { name: 'leftFoot', parent: 'leftShin', optional: true },
  { name: 'rightThigh', parent: 'torso' },
  { name: 'rightShin', parent: 'rightThigh' },
  { name: 'rightFoot', parent: 'rightShin', optional: true },
];

function validateSkeleton(vector: Vector): string[] {
  const warnings: string[] = [];
  const elementMap = new Map<string, VectorElement>();
  vector.elements.forEach(el => {
    if (el.name) elementMap.set(el.name, el);
  });

  for (const node of HUMAN_SKELETON) {
    const el = elementMap.get(node.name);
    if (!el) {
      if (!node.optional) {
        warnings.push(`Missing mandatory skeleton part: ${node.name}`);
      }
      // Remove all downstream children if parent is missing
      HUMAN_SKELETON.filter(n => n.parent === node.name).forEach(child => {
        if (elementMap.has(child.name)) {
          warnings.push(`Removed child ${child.name} because parent ${node.name} is missing`);
        }
      });
    } else if (node.parent && !elementMap.has(node.parent)) {
      warnings.push(`Parent ${node.parent} missing for ${node.name}`);
    }
  }

  return warnings;
}

// ---------- RUN QUALITY CHECKS ----------

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

    const matches = elements.filter(e => e.name && iconReferenceList.includes(e.name));
    if (!matches.length) warnings.push('Icon does not resemble reference icons.');
  }

  // ---------- ILLUSTRATION RULES ----------
  if (type === 'illustration') {
    if (elements.length < 6) warnings.push('Illustrations should contain more visual detail.');
    if (pathRatio < 0.6) warnings.push('Illustrations should rely heavily on path elements.');
    if (curveRatio < 0.5) warnings.push('Illustrations should use flowing, organic curves.');
    if (colorCount < 3) warnings.push('Illustrations usually require richer color variation.');

    // Validate skeleton
    warnings.push(...validateSkeleton(vector));
  }

  return warnings;
}

// ---------- GET ILLUSTRATION REFERENCES ----------
export function getIllustrationReferences() {
  return illustrationReferenceList;
}
