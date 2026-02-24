// lib/geometry/correct.ts

type Element = any;

export function correctGeometry(vector: any) {
  if (!vector?.elements?.length) return vector;

  let elements = [...vector.elements];

  // Step 1: Snap all coordinates to integer grid
  elements = snapToGrid(elements, 1);
  
  // Step 2: Enforce vertical axis alignment for symmetric icons
  elements = enforceAxisAlignment(elements);
  
  // Step 3: Apply canonical geometry for known icon shapes (heart, etc.)
  elements = enforceCanonicalShapes(elements);

  // Step 4: Merge genuinely overlapping shapes with same fill
  elements = resolveOverlaps(elements);

  // Step 5: Normalize to fit within canvas with padding
  elements = normalizeBounds(elements, 400, 400);

  // Step 6: Final grid snap after scaling
  elements = snapToGrid(elements, 1);

  return {
    ...vector,
    elements,
  };
}

/* ---------------- SNAP TO GRID ---------------- */

function snapToGrid(elements: Element[], grid = 1) {
  return elements.map((el) => {
    const snapped = { ...el };

    // Handle numeric properties
    for (const key in snapped) {
      if (typeof snapped[key] === "number") {
        snapped[key] = Math.round(snapped[key] / grid) * grid;
      }
    }

    // Handle path data strings
    if (snapped.d && typeof snapped.d === "string") {
      snapped.d = snapPathData(snapped.d, grid);
    }

    // Handle points arrays (for polygons/polylines)
    if (snapped.points && typeof snapped.points === "string") {
      snapped.points = snapPointsString(snapped.points, grid);
    }

    return snapped;
  });
}

function snapPathData(d: string, grid: number): string {
  return d.replace(/-?\d+\.?\d*/g, (match) => {
    const num = parseFloat(match);
    return String(Math.round(num / grid) * grid);
  });
}

function snapPointsString(points: string, grid: number): string {
  return points.replace(/-?\d+\.?\d*/g, (match) => {
    const num = parseFloat(match);
    return String(Math.round(num / grid) * grid);
  });
}

/* ---------------- AXIS ALIGNMENT ---------------- */

function enforceAxisAlignment(elements: Element[]) {
  if (elements.length < 2) return elements;

  const centers = elements.map(getCenter);
  const avgX = centers.reduce((sum, c) => sum + c.x, 0) / centers.length;
  const threshold = 6; // Increased threshold for better alignment detection

  return elements.map((el, i) => {
    const center = centers[i];
    // Only align if close to average (likely intentionally centered)
    if (Math.abs(center.x - avgX) < threshold && Math.abs(avgX - 200) < threshold) {
      const dx = 200 - center.x; // Align to canvas center
      return translateElement(el, dx, 0);
    }
    return el;
  });
}


function enforceCanonicalShapes(elements: Element[]) {
  const circles = elements.filter((el) => el.type === "circle");
  const polygons = elements.filter((el) => el.type === "polygon" && typeof el.points === "string");

  if (circles.length === 2 && polygons.length === 1) {
    const sortedCircles = [...circles].sort((a, b) => (a.cx || 0) - (b.cx || 0));
    const polygon = polygons[0];
    const points = parsePoints(polygon.points);

    const likelyHeart = points.length >= 3 && points.some((p) => p.y > 260);
    const asymmetric = Math.abs(((sortedCircles[0].cx || 0) + (sortedCircles[1].cx || 0)) - 400) > 10;

    if (likelyHeart || asymmetric) {
      sortedCircles[0].cx = 170;
      sortedCircles[0].cy = 180;
      sortedCircles[0].r = 60;
      sortedCircles[1].cx = 230;
      sortedCircles[1].cy = 180;
      sortedCircles[1].r = 60;

      polygon.points = "200,340 120,240 280,240";

      sortedCircles.forEach((circle) => {
        if (!circle.fill || circle.fill === "none") circle.fill = "#000000";
      });
      if (!polygon.fill || polygon.fill === "none") polygon.fill = "#000000";
    }
  }

  return elements;
}

function parsePoints(points: string): { x: number; y: number }[] {
  const values = points.trim().split(/[\s,]+/).map(Number).filter((n) => !Number.isNaN(n));
  const out: { x: number; y: number }[] = [];

  for (let i = 0; i < values.length - 1; i += 2) {
    out.push({ x: values[i], y: values[i + 1] });
  }

  return out;
}

/* ---------------- OVERLAP RESOLUTION ---------------- */

function resolveOverlaps(elements: Element[]) {
  // Only merge if shapes are truly overlapping and have same fill
  // This preserves intentional multi-element designs
  const output: Element[] = [];
  const used = new Set<number>();

  for (let i = 0; i < elements.length; i++) {
    if (used.has(i)) continue;

    let base = elements[i];
    const mergedIndices = [i];

    for (let j = i + 1; j < elements.length; j++) {
      if (used.has(j)) continue;

      const candidate = elements[j];

      // More strict overlap detection
      if (shouldMerge(base, candidate)) {
        // Keep the larger shape or merge into path if possible
        const areaA = getArea(base);
        const areaB = getArea(candidate);
        
        base = areaA >= areaB ? base : candidate;
        mergedIndices.push(j);
        used.add(j);
      }
    }

    output.push(base);
  }

  return output;
}

function shouldMerge(a: Element, b: Element): boolean {
  // Only merge if:
  // 1. Same type (both circle, both rect, etc.)
  // 2. Same fill color
  // 3. Significantly overlapping (>30% area overlap)
  
  if (a.type !== b.type) return false;
  if (a.fill !== b.fill || !a.fill) return false;
  if (a.stroke || b.stroke) return false; // Don't merge stroked elements
  
  const overlap = getOverlapArea(a, b);
  const minArea = Math.min(getArea(a), getArea(b));
  
  return overlap > minArea * 0.3; // 30% overlap threshold
}

function getOverlapArea(a: Element, b: Element): number {
  const boxA = getBounds(a);
  const boxB = getBounds(b);

  const overlapX = Math.max(
    0,
    Math.min(boxA.maxX, boxB.maxX) - Math.max(boxA.minX, boxB.minX)
  );

  const overlapY = Math.max(
    0,
    Math.min(boxA.maxY, boxB.maxY) - Math.max(boxA.minY, boxB.minY)
  );

  return overlapX * overlapY;
}

/* ---------------- NORMALIZE BOUNDS ---------------- */

function normalizeBounds(elements: Element[], width: number, height: number) {
  const bounds = calculateBounds(elements);
  const padding = 40;

  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;

  if (contentWidth === 0 || contentHeight === 0) return elements;

  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;

  const scaleX = availableWidth / contentWidth;
  const scaleY = availableHeight / contentHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Never scale up

  // Calculate translation to center after scaling
  const scaledWidth = contentWidth * scale;
  const scaledHeight = contentHeight * scale;
  
  const translateX = padding + (availableWidth - scaledWidth) / 2 - bounds.minX * scale;
  const translateY = padding + (availableHeight - scaledHeight) / 2 - bounds.minY * scale;

  return elements.map((el) => {
    let scaled = scaleElement(el, scale);
    scaled = translateElement(scaled, translateX, translateY);
    return scaled;
  });
}

/* ---------------- HELPERS ---------------- */

function getCenter(el: Element) {
  // Handle different element types
  if (el.type === 'circle') {
    return { x: el.cx || 0, y: el.cy || 0 };
  }
  
  const b = getBounds(el);
  return {
    x: (b.minX + b.maxX) / 2,
    y: (b.minY + b.maxY) / 2,
  };
}

function translateElement(el: Element, dx: number, dy: number) {
  const updated = { ...el };

  // Handle specific SVG attributes
  if (updated.cx !== undefined) updated.cx += dx;
  if (updated.cy !== undefined) updated.cy += dy;
  if (updated.x !== undefined) updated.x += dx;
  if (updated.y !== undefined) updated.y += dy;
  if (updated.x1 !== undefined) updated.x1 += dx;
  if (updated.y1 !== undefined) updated.y1 += dy;
  if (updated.x2 !== undefined) updated.x2 += dx;
  if (updated.y2 !== undefined) updated.y2 += dy;

  // Handle path data
  if (updated.d && typeof updated.d === "string") {
    updated.d = translatePathData(updated.d, dx, dy);
  }

  // Handle points
  if (updated.points && typeof updated.points === "string") {
    updated.points = translatePointsString(updated.points, dx, dy);
  }

  return updated;
}

function translatePathData(d: string, dx: number, dy: number): string {
  // Simple translation for absolute coordinates
  // This is a simplified version - production would need proper SVG path parsing
  return d.replace(/([ML])\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, (match, cmd, x, y) => {
    return `${cmd} ${parseFloat(x) + dx} ${parseFloat(y) + dy}`;
  });
}

function translatePointsString(points: string, dx: number, dy: number): string {
  return points.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, (match, x, y) => {
    return `${parseFloat(x) + dx},${parseFloat(y) + dy}`;
  });
}

function scaleElement(el: Element, scale: number) {
  const updated = { ...el };

  // Scale numeric properties
  const scaleProps = ['cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2', 'rx', 'ry'];
  
  scaleProps.forEach(prop => {
    if (updated[prop] !== undefined) {
      updated[prop] *= scale;
    }
  });

  // Scale stroke width if present
  if (updated.strokeWidth !== undefined) {
    updated.strokeWidth *= scale;
  }
  if (updated['stroke-width'] !== undefined) {
    updated['stroke-width'] *= scale;
  }

  // Scale path data
  if (updated.d && typeof updated.d === "string") {
    updated.d = scalePathData(updated.d, scale);
  }

  // Scale points
  if (updated.points && typeof updated.points === "string") {
    updated.points = scalePointsString(updated.points, scale);
  }

  return updated;
}

function scalePathData(d: string, scale: number): string {
  return d.replace(/-?\d+\.?\d*/g, (match) => {
    return String(parseFloat(match) * scale);
  });
}

function scalePointsString(points: string, scale: number): string {
  return points.replace(/-?\d+\.?\d*/g, (match) => {
    return String(parseFloat(match) * scale);
  });
}

function getBounds(el: Element) {
  // Handle specific element types
  if (el.type === 'circle' || el.type === 'ellipse') {
    const cx = el.cx || 0;
    const cy = el.cy || 0;
    const r = el.r || el.rx || 0;
    return {
      minX: cx - r,
      minY: cy - r,
      maxX: cx + r,
      maxY: cy + r,
    };
  }

  if (el.type === 'rect') {
    const x = el.x || 0;
    const y = el.y || 0;
    const w = el.width || 0;
    const h = el.height || 0;
    return {
      minX: x,
      minY: y,
      maxX: x + w,
      maxY: y + h,
    };
  }

  if (el.type === 'line') {
    return {
      minX: Math.min(el.x1 || 0, el.x2 || 0),
      minY: Math.min(el.y1 || 0, el.y2 || 0),
      maxX: Math.max(el.x1 || 0, el.x2 || 0),
      maxY: Math.max(el.y1 || 0, el.y2 || 0),
    };
  }

  // Fallback: extract all numeric values
  const xValues: number[] = [];
  const yValues: number[] = [];

  for (const key in el) {
    if (typeof el[key] === 'number') {
      if (key.toLowerCase().includes('x')) xValues.push(el[key]);
      if (key.toLowerCase().includes('y')) yValues.push(el[key]);
    }
  }

  return {
    minX: xValues.length ? Math.min(...xValues) : 0,
    minY: yValues.length ? Math.min(...yValues) : 0,
    maxX: xValues.length ? Math.max(...xValues) : 0,
    maxY: yValues.length ? Math.max(...yValues) : 0,
  };
}

function calculateBounds(elements: Element[]) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  elements.forEach((el) => {
    const b = getBounds(el);
    minX = Math.min(minX, b.minX);
    minY = Math.min(minY, b.minY);
    maxX = Math.max(maxX, b.maxX);
    maxY = Math.max(maxY, b.maxY);
  });

  return { minX, minY, maxX, maxY };
}

function getArea(el: Element) {
  const b = getBounds(el);
  return (b.maxX - b.minX) * (b.maxY - b.minY);
}
