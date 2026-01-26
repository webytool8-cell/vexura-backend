// lib/quality/checks.ts
import fs from 'fs';
import path from 'path';
import { iconReferenceList } from './icon-reference';

// ----------- Setup illustration reference cache -----------
const illustrationRefPath = path.join(
  process.cwd(),
  'lib/quality/illustration-reference'
);

let illustrationReferences: any[] = [];

// Load all SVGs once
function loadIllustrationReferences() {
  if (illustrationReferences.length) return illustrationReferences;

  function parseSVGContent(svgContent: string) {
    const elementsMatch = svgContent.match(
      /<(circle|rect|ellipse|polygon|line|path)[^>]*>/g
    );
    return elementsMatch || [];
  }

  function readFolderRecursive(folder: string) {
    const files: string[] = [];
    const entries = fs.readdirSync(folder, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        files.push(...readFolderRecursive(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.svg')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const svgFiles = readFolderRecursive(illustrationRefPath);
  illustrationReferences = svgFiles.map(file => {
    const content = fs.readFileSync(file, 'utf-8');
    return parseSVGContent(content);
  });

  return illustrationReferences;
}

// ----------- Quality check function -----------
type Vector = {
  width: number;
  height: number;
  elements: any[];
};

export function runQualityChecks(vector: Vector, type: 'icon' | 'illustration', prompt?: string) {
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

    // ----------- Reference check for Open Peeps -----------
    if (prompt && /pose|expression|action|gesture|emotion/i.test(prompt)) {
      loadIllustrationReferences();
      let matchedRef = false;
      for (const ref of illustrationReferences) {
        const refPaths = ref.filter((el: string) => el.includes('<path'));
        const genPaths = paths.length;
        if (refPaths.length > 0 && genPaths > 0) {
          matchedRef = true;
          break;
        }
      }
      if (!matchedRef) warnings.push('Illustration may not match typical human poses or expressions in references.');
    }
  }

  return warnings;
}
