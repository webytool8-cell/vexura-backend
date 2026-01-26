// lib/quality/checks.ts

export type GenerationType = "icon" | "illustration";

type Vector = {
  width: number;
  height: number;
  elements: any[];
};

export function detectType(prompt: string): GenerationType {
  const illustrationKeywords = [
    "scene",
    "character",
    "abstract",
    "organic",
    "flowing",
    "illustration",
    "background",
    "editorial",
    "dynamic",
  ];

  const lower = prompt.toLowerCase();

  return illustrationKeywords.some(k => lower.includes(k))
    ? "illustration"
    : "icon";
}

export function detectIllustrationBias(prompt: string): "organic" | "technical" {
  const organicKeywords = [
    "organic",
    "natural",
    "fluid",
    "flowing",
    "hand drawn",
    "expressive",
    "dynamic",
  ];

  const lower = prompt.toLowerCase();

  return organicKeywords.some(k => lower.includes(k))
    ? "organic"
    : "technical";
}

export function runQualityChecks(vector: Vector, type: GenerationType) {
  const warnings: string[] = [];
  const elements = vector.elements || [];

  if (!elements.length) {
    warnings.push("Vector contains no elements.");
    return warnings;
  }

  const paths = elements.filter(e => e.type === "path");
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
    if (e.fill && e.fill !== "none") colorSet.add(e.fill);
    if (e.stroke && e.stroke !== "none") colorSet.add(e.stroke);
  });

  const colorCount = colorSet.size;

  // ICON RULES
  if (type === "icon") {
    if (elements.length > 8)
      warnings.push("Icons should use fewer than 8 elements.");

    if (curveRatio > 0.35)
      warnings.push("Icons should avoid excessive curves.");

    if (colorCount > 2)
      warnings.push("Icons should use 1–2 colors maximum.");
  }

  // ILLUSTRATION RULES
  if (type === "illustration") {
    if (pathRatio < 0.6)
      warnings.push("Illustrations should rely heavily on path elements.");

    if (curveRatio < 0.45)
      warnings.push("Illustrations should use flowing, organic curves.");

    if (colorCount < 3)
      warnings.push("Illustrations usually require richer color variation.");
  }

  return warnings;
}
