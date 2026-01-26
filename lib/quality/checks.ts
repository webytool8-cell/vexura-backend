// lib/quality/checks.ts

type Vector = {
  width: number;
  height: number;
  elements: any[];
};

export function runQualityChecks(
  vector: Vector,
  type: 'icon' | 'illustration',
  style: string,
  palette: string,
  customColors?: string[]
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

  // -------- ICON RULES --------
  if (type === 'icon') {
    if (elements.length > 8)
      warnings.push('Icons should use fewer than 8 elements.');

    if (style === 'minimal' && elements.length > 6)
      warnings.push('Minimal icons should be extremely simple.');

    if (style === 'outline' && elements.some(e => e.fill && e.fill !== 'none'))
      warnings.push('Outline icons should not use fills.');

    if (style === 'filled' && elements.some(e => e.stroke && e.stroke !== 'none'))
      warnings.push('Filled icons should not use strokes.');

    if (style === 'geometric' && curveRatio > 0.25)
      warnings.push('Geometric icons should avoid organic curves.');

    if (colorCount > 2)
      warnings.push('Icons should use 1–2 colors maximum.');
  }

  // -------- ILLUSTRATION RULES --------
  if (type === 'illustration') {
    if (elements.length < 6)
      warnings.push('Illustrations should contain more detail.');

    if (pathRatio < 0.6)
      warnings.push('Illustrations should rely heavily on paths.');

    if (style === 'organic' && curveRatio < 0.6)
      warnings.push('Organic illustrations need flowing curves.');

    if (style === 'technical' && curveRatio > 0.4)
      warnings.push('Technical illustrations should be more rigid.');

    if (colorCount < 3)
      warnings.push('Illustrations usually require richer color variation.');
  }

  // -------- PALETTE RULES --------
  if (palette === 'mono' && colorCount > 1)
    warnings.push('Monochrome palette should use one color.');

  if (palette === 'custom' && customColors?.length) {
    elements.forEach(e => {
      if (
        (e.fill && !customColors.includes(e.fill)) ||
        (e.stroke && !customColors.includes(e.stroke))
      ) {
        warnings.push('Used colors outside custom palette.');
      }
    });
  }

  return warnings;
}
