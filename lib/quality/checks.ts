// lib/quality/checks.ts

export type GenerationType = "icon" | "illustration";

type VectorElement = {
  type: string;
  d?: string;
  fill?: string;
  stroke?: string;
};

type Vector = {
  width: number;
  height: number;
  elements: VectorElement[];
};

export function runQualityChecks(
  vector: Vector,
  type: GenerationType
) {
  const warnings: string[] = [];
  const elements = vector.elements ?? [];

  if (!elements.length) {
    warnings.push("Vector contains no elements.");
    return warnings;
  }

  const paths = elements.filter(e => e.type === "path");

  // ---- Curve vs Line analysis
  let curveCommands = 0;
  let lineCommands = 0;

  for (const p of paths) {
    if (!p.d) continue;
    curveCommands += (p.d.match(/[CQST]/g) || []).length;
    lineCommands += (p.d.match(/[LHV]/g) || []).length;
  }

  const curveRatio = curveCommands / Math.max(curveCommands + lineCommands, 1);

  // ---- Color complexity
  const colors = new Set<string>();
  elements.forEach(e => {
    if (e.fill && e.fill !== "none") colors.add(e.fill);
    if (e.stroke && e.stroke !== "none") colors.add(e.stroke);
  });

  // ---- ICON RULES
  if (type === "icon") {
    if (elements.length > 8)
      warnings.push("Icons should use fewer than 8 elements.");

    if (curveRatio > 0.4)
      warnings.push("Icons should avoid excessive organic curves.");

    if (colors.size > 2)
      warnings.push("Icons should use 1–2 colors maximum.");
  }

  // ---- ILLUSTRATION RULES
  if (type === "illustration") {
    if (elements.length < 6)
      warnings.push("Illustrations need more visual detail.");

    if (curveRatio < 0.55)
      warnings.push("Illustrations should favor smooth organic curves.");

    if (colors.size < 3)
      warnings.push("Illustrations benefit from richer color palettes.");

    detectBrokenHumanAnatomy(paths, warnings);
  }

  return warnings;
}

// ---------------- HUMAN ANATOMY VALIDATION ----------------

function detectBrokenHumanAnatomy(
  paths: VectorElement[],
  warnings: string[]
) {
  const limbLikePaths = paths.filter(p =>
    p.d?.match(/(arm|leg|hand|foot)/i)
  );

  // Duplicate / mirrored limbs
  if (limbLikePaths.length >= 4) {
    const identical = limbLikePaths.filter(
      (p, _, arr) => arr.filter(o => o.d === p.d).length > 1
    );

    if (identical.length > 0) {
      warnings.push(
        "Detected mirrored or duplicated limbs. Human poses should avoid symmetry."
      );
    }
  }

  // Unnatural bends
  for (const p of limbLikePaths) {
    const sharpTurns = (p.d?.match(/L/g) || []).length;
    const curves = (p.d?.match(/[CQ]/g) || []).length;

    if (sharpTurns > curves * 2) {
      warnings.push(
        "Limb paths contain unnatural sharp bends. Use smooth Bézier curves."
      );
      break;
    }
  }
}
