// lib/quality/checks.ts

type VectorElement = {
  type: string;
  [key: string]: any;
};

type VectorData = {
  width: number;
  height: number;
  elements: VectorElement[];
};

/* =========================
   ICON QUALITY RULES
   (Freepik / Vecteezy icon style)
========================= */

const iconChecks = [
  (vector: VectorData) => {
    if (vector.elements.length < 2 || vector.elements.length > 12) {
      return "Icons should contain between 2 and 12 elements.";
    }
    return null;
  },

  (vector: VectorData) => {
    const hasStrokeOnly = vector.elements.every(
      el => !el.fill || el.fill === "none"
    );
    if (hasStrokeOnly) {
      return "Icons should include at least one filled shape.";
    }
    return null;
  },

  (vector: VectorData) => {
    const pathCount = vector.elements.filter(el => el.type === "path").length;
    if (pathCount > 6) {
      return "Too many paths may reduce clarity for icon usage.";
    }
    return null;
  },

  (vector: VectorData) => {
    const unsupported = vector.elements.some(
      el =>
        !["circle", "rect", "ellipse", "polygon", "path", "line"].includes(el.type)
    );
    if (unsupported) {
      return "Icons contain unsupported SVG elements.";
    }
    return null;
  }
];

/* =========================
   ILLUSTRATION QUALITY RULES
   (Organic / nature-inspired)
========================= */

const illustrationChecks = [
  (vector: VectorData) => {
    const pathCount = vector.elements.filter(el => el.type === "path").length;
    if (pathCount < 2) {
      return "Illustrations should use multiple path elements for organic forms.";
    }
    return null;
  },

  (vector: VectorData) => {
    const hasBezierCurves = vector.elements.some(
      el => el.type === "path" && typeof el.d === "string" && /[CS]/.test(el.d)
    );
    if (!hasBezierCurves) {
      return "Illustrations should include Bezier curves (C or S commands) for natural flow.";
    }
    return null;
  },

  (vector: VectorData) => {
    const straightLines = vector.elements.filter(el => el.type === "line").length;
    if (straightLines > 2) {
      return "Too many straight lines reduce the organic feel of illustrations.";
    }
    return null;
  },

  (vector: VectorData) => {
    const perfectCircles = vector.elements.filter(el => el.type === "circle").length;
    if (perfectCircles > 3) {
      return "Overuse of perfect circles can make illustrations feel too mechanical.";
    }
    return null;
  },

  (vector: VectorData) => {
    if (vector.elements.length < 4) {
      return "Illustrations typically require more elements to convey depth and form.";
    }
    return null;
  }
];

/* =========================
   QUALITY CHECK RUNNER
========================= */

export function runQualityChecks(
  vector: VectorData,
  type: "icon" | "illustration"
) {
  const checks = type === "illustration" ? illustrationChecks : iconChecks;

  const warnings = checks
    .map(check => check(vector))
    .filter(Boolean);

  return warnings;
}
