// lib/checks.ts

export type GenerationType = "icon" | "illustration";

export function detectType(prompt: string): GenerationType {
  const iconKeywords = [
    "icon",
    "ui",
    "symbol",
    "button",
    "interface",
    "glyph",
    "logo",
    "pictogram",
    "system",
  ];

  const illustrationKeywords = [
    "illustration",
    "scene",
    "character",
    "concept art",
    "background",
    "story",
    "editorial",
    "visual",
  ];

  const p = prompt.toLowerCase();

  const iconScore = iconKeywords.filter(k => p.includes(k)).length;
  const illustrationScore = illustrationKeywords.filter(k => p.includes(k)).length;

  return illustrationScore > iconScore ? "illustration" : "icon";
}

export function detectIllustrationBias(prompt: string) {
  const organic = [
    "organic",
    "fluid",
    "natural",
    "hand drawn",
    "soft",
    "curvy",
    "flowing",
    "nature",
    "human",
    "expressive",
    "emotional",
    "dynamic",
  ];

  const technical = [
    "technical",
    "modular",
    "grid",
    "system",
    "isometric",
    "geometric",
    "clean",
    "structured",
    "diagram",
  ];

  const p = prompt.toLowerCase();

  const organicScore = organic.filter(k => p.includes(k)).length;
  const technicalScore = technical.filter(k => p.includes(k)).length;

  return organicScore >= technicalScore
    ? "organic"
    : "technical";
}
