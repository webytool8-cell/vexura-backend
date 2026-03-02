import { analyzePromptForOrganicNeeds, pathContainsBezierCurves } from "../quality/organic-shapes";
import { analyzeShapeRequirements } from "../quality/computed-patterns";

type Element = { type: string; [key: string]: any };
type Bounds = { minX: number; maxX: number; minY: number; maxY: number };
type VectorData = { elements: Element[] };
type ValidationResult = { warnings: string[] };

export function applyParentContainmentPass(
  data: VectorData,
  result: ValidationResult,
  helpers: {
    getElementBounds: (el: Element) => Bounds | null;
    scaleAndTranslateElement: (el: Element, scale: number, tx: number, ty: number) => void;
  }
) {
  const { getElementBounds, scaleAndTranslateElement } = helpers;
  const parentCandidates = data.elements
    .map((el, idx) => ({ idx, bounds: getElementBounds(el), area: calcBoundsAreaForContainment(el, getElementBounds) }))
    .filter(item => item.bounds && item.area > 0)
    .sort((a, b) => b.area - a.area);

  if (parentCandidates.length === 0) return;

  let fixes = 0;

  data.elements.forEach((child, childIdx) => {
    const childBounds = getElementBounds(child);
    if (!childBounds) return;

    const parent = parentCandidates.find(candidate => {
      if (candidate.idx === childIdx || !candidate.bounds) return false;

      const childArea = calcBoundsAreaForContainment(child, getElementBounds);
      if (childArea <= 0 || candidate.area <= childArea * 1.8) return false;

      const childCenterX = (childBounds.minX + childBounds.maxX) / 2;
      const childCenterY = (childBounds.minY + childBounds.maxY) / 2;

      return (
        childCenterX >= candidate.bounds.minX &&
        childCenterX <= candidate.bounds.maxX &&
        childCenterY >= candidate.bounds.minY &&
        childCenterY <= candidate.bounds.maxY
      );
    });

    if (!parent?.bounds) return;

    const margin = 2;
    const overflowLeft = Math.max(0, parent.bounds.minX + margin - childBounds.minX);
    const overflowRight = Math.max(0, childBounds.maxX - (parent.bounds.maxX - margin));
    const overflowTop = Math.max(0, parent.bounds.minY + margin - childBounds.minY);
    const overflowBottom = Math.max(0, childBounds.maxY - (parent.bounds.maxY - margin));

    if (overflowLeft === 0 && overflowRight === 0 && overflowTop === 0 && overflowBottom === 0) return;

    const dx = overflowLeft > 0 ? overflowLeft : overflowRight > 0 ? -overflowRight : 0;
    const dy = overflowTop > 0 ? overflowTop : overflowBottom > 0 ? -overflowBottom : 0;

    if (dx !== 0 || dy !== 0) {
      scaleAndTranslateElement(child, 1, dx, dy);
      fixes++;
    }
  });

  if (fixes > 0) {
    result.warnings.push(`Adjusted ${fixes} element(s) to stay contained within likely parent boundaries`);
  }
}

function calcBoundsAreaForContainment(el: Element, getElementBounds: (el: Element) => Bounds | null): number {
  const bounds = getElementBounds(el);
  if (!bounds) return 0;
  const width = Math.max(0, bounds.maxX - bounds.minX);
  const height = Math.max(0, bounds.maxY - bounds.minY);
  return width * height;
}

export function enforceOrganicShapeIntegrity(
  data: VectorData,
  result: ValidationResult,
  options?: { prompt?: string; iconTypeHint?: "icon" | "illustration" }
) {
  const prompt = options?.prompt;
  if (!prompt) return;

  const analysis = analyzePromptForOrganicNeeds(prompt);
  if (analysis.organicShapes.length === 0) return;

  const primary = analysis.organicShapes[0].keyword;

  if (primary === 'heart' || /\b(heart|love|favorite)\b/i.test(prompt)) {
    const converted = convertHeartPrimitivesToUnifiedPath(data);
    if (converted) {
      result.warnings.push('Converted fragmented heart primitives to a single unified curved path');
    }
  }

  const pathElements = data.elements.filter(el => el.type === 'path');
  const nonPathOrganicCandidates = data.elements.filter(el =>
    ['circle', 'rect', 'polygon', 'polyline'].includes(el.type)
  ).length;

  if (pathElements.length === 0 && nonPathOrganicCandidates > 0) {
    result.warnings.push(
      `Organic prompt detected (${primary}) but output has no path silhouette. Prefer unified curved path elements.`
    );
    return;
  }

  const curvedPathCount = pathElements.filter(el => pathContainsBezierCurves(el.d)).length;
  if (curvedPathCount === 0 && pathElements.length > 0) {
    result.warnings.push('Organic path detected without bezier curves; prefer C/Q/S/T commands for smooth realism');
  }

  if (options?.iconTypeHint === 'icon' && pathElements.length > 2) {
    result.warnings.push('Organic icon has fragmented silhouette; prefer 1-2 unified paths for clean icon readability');
  }
}

function convertHeartPrimitivesToUnifiedPath(data: VectorData): boolean {
  const circles = data.elements.filter(el => el.type === 'circle');
  const polygons = data.elements.filter(el => el.type === 'polygon');

  if (circles.length < 2) return false;

  const [left, right] = [...circles].sort((a, b) => (a.cx || 0) - (b.cx || 0));
  const centerX = ((left.cx || 0) + (right.cx || 0)) / 2;
  const topY = ((left.cy || 0) + (right.cy || 0)) / 2;
  const radius = Math.max(20, ((left.r || 0) + (right.r || 0)) / 2);
  const size = Math.max(80, radius * 4);

  const fill = left.fill || right.fill || polygons[0]?.fill || '#000000';
  const stroke = left.stroke || right.stroke || polygons[0]?.stroke;

  data.elements = [generateHeartPath(centerX || 200, topY || 180, size, fill, stroke)];
  return true;
}

function generateHeartPath(centerX: number, centerY: number, size: number, fill: string, stroke?: string) {
  const d = [
    `M ${centerX} ${centerY - size * 0.1}`,
    `C ${centerX - size * 0.22} ${centerY - size * 0.35} ${centerX - size * 0.5} ${centerY - size * 0.2} ${centerX - size * 0.5} ${centerY + size * 0.05}`,
    `C ${centerX - size * 0.5} ${centerY + size * 0.3} ${centerX - size * 0.23} ${centerY + size * 0.5} ${centerX} ${centerY + size * 0.65}`,
    `C ${centerX + size * 0.23} ${centerY + size * 0.5} ${centerX + size * 0.5} ${centerY + size * 0.3} ${centerX + size * 0.5} ${centerY + size * 0.05}`,
    `C ${centerX + size * 0.5} ${centerY - size * 0.2} ${centerX + size * 0.22} ${centerY - size * 0.35} ${centerX} ${centerY - size * 0.1}`,
    'Z'
  ].join(' ');

  return {
    type: 'path',
    d,
    fill,
    ...(stroke ? { stroke } : {})
  };
}


export function enforceComputedPatternIntegrity(
  data: VectorData,
  result: ValidationResult,
  options: {
    prompt?: string;
    getElementBounds: (el: Element) => Bounds | null;
  }
) {
  const prompt = options.prompt;
  if (!prompt) return;

  const requirements = analyzeShapeRequirements(prompt);
  if (!requirements.hasComputedPattern || !requirements.computedType) return;

  const centers = data.elements
    .map((el) => options.getElementBounds(el))
    .filter((b): b is Bounds => !!b)
    .map((b) => ({ x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 }));

  if (centers.length < 3) return;

  if (requirements.computedType === 'grid') {
    const xs = [...new Set(centers.map(c => Math.round(c.x / 10) * 10))].sort((a, b) => a - b);
    const ys = [...new Set(centers.map(c => Math.round(c.y / 10) * 10))].sort((a, b) => a - b);
    if (xs.length * ys.length !== centers.length) {
      result.warnings.push('Computed grid prompt detected but element centers do not form a clean row/column matrix');
    }
    return;
  }

  const center = { x: 200, y: 200 };
  const radii = centers.map(c => Math.hypot(c.x - center.x, c.y - center.y));
  const avgR = radii.reduce((a, b) => a + b, 0) / radii.length;
  const variance = radii.reduce((a, r) => a + Math.abs(r - avgR), 0) / radii.length;

  if ((requirements.computedType === 'radial' || requirements.computedType === 'star' || requirements.computedType === 'concentric') && variance > 14) {
    result.warnings.push(`Computed ${requirements.computedType} pattern detected, but radii are uneven. Prefer mathematically consistent placement.`);
  }
}
