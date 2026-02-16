// lib/geometry/correct.ts

type Element = any;

export function correctGeometry(vector: any) {
  if (!vector?.elements?.length) return vector;

  let elements = [...vector.elements];

  elements = snapToGrid(elements, 1);
  elements = enforceAxisAlignment(elements);
  elements = resolveOverlaps(elements);
  elements = normalizeBounds(elements, 400, 400);

  return {
    ...vector,
    elements,
  };
}

/* ---------------- SNAP TO GRID ---------------- */

function snapToGrid(elements: Element[], grid = 1) {
  return elements.map((el) => {
    const snapped = { ...el };

    for (const key in snapped) {
      if (typeof snapped[key] === "number") {
        snapped[key] = Math.round(snapped[key] / grid) * grid;
      }
    }

    return snapped;
  });
}

/* ---------------- AXIS ALIGNMENT ---------------- */

function enforceAxisAlignment(elements: Element[]) {
  if (elements.length < 2) return elements;

  const centers = elements.map(getCenter);
  const avgX =
    centers.reduce((sum, c) => sum + c.x, 0) / centers.length;

  return elements.map((el, i) => {
    const center = centers[i];
    if (Math.abs(center.x - avgX) < 4) {
      const dx = avgX - center.x;
      return translateElement(el, dx, 0);
    }
    return el;
  });
}

/* ---------------- OVERLAP RESOLUTION ---------------- */

function resolveOverlaps(elements: Element[]) {
  const output: Element[] = [];
  const used = new Set<number>();

  for (let i = 0; i < elements.length; i++) {
    if (used.has(i)) continue;

    let base = elements[i];

    for (let j = i + 1; j < elements.length; j++) {
      if (used.has(j)) continue;

      const candidate = elements[j];

      if (
        base.fill &&
        candidate.fill &&
        base.fill === candidate.fill &&
        detectOverlap(base, candidate)
      ) {
        // Simple merge strategy:
        // Keep the larger bounding shape
        const areaA = getArea(base);
        const areaB = getArea(candidate);

        base = areaA >= areaB ? base : candidate;
        used.add(j);
      }
    }

    output.push(base);
  }

  return output;
}

function detectOverlap(a: Element, b: Element) {
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

  return overlapX * overlapY > 4;
}

/* ---------------- NORMALIZE BOUNDS ---------------- */

function normalizeBounds(
  elements: Element[],
  width: number,
  height: number
) {
  const bounds = calculateBounds(elements);
  const padding = 40;

  const scaleX =
    (width - padding * 2) / (bounds.maxX - bounds.minX || 1);
  const scaleY =
    (height - padding * 2) / (bounds.maxY - bounds.minY || 1);

  const scale = Math.min(scaleX, scaleY, 1);

  return elements.map((el) => scaleElement(el, scale));
}

/* ---------------- HELPERS ---------------- */

function getCenter(el: Element) {
  const b = getBounds(el);
  return {
    x: (b.minX + b.maxX) / 2,
    y: (b.minY + b.maxY) / 2,
  };
}

function translateElement(el: Element, dx: number, dy: number) {
  const updated = { ...el };

  for (const key in updated) {
    if (typeof updated[key] === "number") {
      if (key.includes("x")) updated[key] += dx;
      if (key.includes("y")) updated[key] += dy;
    }
  }

  return updated;
}

function scaleElement(el: Element, scale: number) {
  const updated = { ...el };

  for (const key in updated) {
    if (typeof updated[key] === "number") {
      updated[key] *= scale;
    }
  }

  return updated;
}

function getBounds(el: Element) {
  const nums = Object.values(el).filter(
    (v) => typeof v === "number"
  ) as number[];

  const minX = Math.min(...nums.filter((_, i) => i % 2 === 0), 0);
  const minY = Math.min(...nums.filter((_, i) => i % 2 === 1), 0);
  const maxX = Math.max(...nums.filter((_, i) => i % 2 === 0), 0);
  const maxY = Math.max(...nums.filter((_, i) => i % 2 === 1), 0);

  return { minX, minY, maxX, maxY };
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
