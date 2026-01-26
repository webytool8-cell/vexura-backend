// lib/quality/checks.ts

/**
 * General quality check system for vectors.
 * Covers Freepik/Vecteezy style rules for icons & illustrations.
 * Modular, so you can expand rules over time.
 */

// Main function to run all checks
export function runQualityChecks(vector: any, type: "icon" | "illustration") {
  const errors: string[] = [];

  if (!vector || !vector.elements || !Array.isArray(vector.elements)) {
    throw new Error("Invalid vector format");
  }

  // Run type-specific checks
  if (type === "icon") {
    iconChecks(vector).forEach((err) => errors.push(err));
  } else {
    illustrationChecks(vector).forEach((err) => errors.push(err));
  }

  // Run general rules
  generalChecks(vector).forEach((err) => errors.push(err));

  if (errors.length > 0) {
    throw new Error("Quality check failed: " + errors.join("; "));
  }
}

/** General rules that apply to all vector types */
function generalChecks(vector: any): string[] {
  const errs: string[] = [];

  // Dimensions should be positive
  if (vector.width <= 0 || vector.height <= 0) {
    errs.push("Vector must have positive width and height");
  }

  // Limit total elements (avoid overcrowding)
  if (vector.elements.length > 50) {
    errs.push("Vector has too many elements (>50)");
  }

  // Check for duplicate elements (exact same coordinates/type)
  const seenElements = new Set();
  vector.elements.forEach((el, idx) => {
    const key = JSON.stringify(el);
    if (seenElements.has(key)) {
      errs.push(`Element ${idx} is a duplicate`);
    } else {
      seenElements.add(key);
    }
  });

  return errs;
}

/** Icon-specific rules (Freepik-style) */
function iconChecks(vector: any): string[] {
  const errs: string[] = [];

  // Element count
  if (vector.elements.length < 3 || vector.elements.length > 12) {
    errs.push("Icons should have 3-12 elements");
  }

  // Allowed element types
  const allowed = ["circle", "rect", "ellipse", "path", "line", "polygon"];
  vector.elements.forEach((el, idx) => {
    if (!allowed.includes(el.type)) {
      errs.push(`Element ${idx} has invalid type: ${el.type}`);
    }
  });

  // Colors: hex only, limited palette
  const colors = new Set<string>();
  vector.elements.forEach((el, idx) => {
    if (el.fill && !/^#([0-9A-F]{3}){1,2}$/i.test(el.fill)) {
      errs.push(`Element ${idx} has invalid fill color: ${el.fill}`);
    }
    if (el.stroke && !/^#([0-9A-F]{3}){1,2}$/i.test(el.stroke)) {
      errs.push(`Element ${idx} has invalid stroke color: ${el.stroke}`);
    }
    if (el.fill) colors.add(el.fill);
    if (el.stroke) colors.add(el.stroke);
  });
  if (colors.size > 4) errs.push(`Icons should use 4 or fewer colors, found ${colors.size}`);

  // Stroke width consistency
  const strokes = vector.elements.map((el) => el.strokeWidth).filter((sw) => sw !== undefined);
  if (strokes.length > 0 && new Set(strokes).size > 1) {
    errs.push("Stroke widths should be consistent across icon elements");
  }

  return errs;
}

/** Illustration-specific rules (Freepik-style) */
function illustrationChecks(vector: any): string[] {
  const errs: string[] = [];

  // Dimensions: standard viewBox
  if (vector.width !== 400 || vector.height !== 400) {
    errs.push("Illustrations should have 400x400 viewBox");
  }

  // Minimum elements for richness
  if (vector.elements.length < 5) {
    errs.push("Illustrations should have at least 5 elements for richness");
  }

  // Max colors to keep palette harmonious
  const maxColors = 6;
  const colors = new Set<string>();
  vector.elements.forEach((el) => {
    if (el.fill) colors.add(el.fill);
    if (el.stroke) colors.add(el.stroke);
  });
  if (colors.size > maxColors) {
    errs.push(`Too many colors used (${colors.size}), max is ${maxColors}`);
  }

  // Optional: basic symmetry/alignment checks (centered elements)
  const midX = vector.width / 2;
  const midY = vector.height / 2;
  vector.elements.forEach((el, idx) => {
    if (["circle", "rect", "ellipse"].includes(el.type)) {
      const cx = el.cx ?? el.x ?? midX;
      const cy = el.cy ?? el.y ?? midY;
      if (Math.abs(cx - midX) > vector.width * 0.6 || Math.abs(cy - midY) > vector.height * 0.6) {
        errs.push(`Element ${idx} is too far from center`);
      }
    }
  });

  return errs;
}
