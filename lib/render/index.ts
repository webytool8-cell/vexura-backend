// lib/render/index.ts

import { renderSVG } from "./svg";

// Optional wrapper for multiple formats
export function renderFormats(vector: any) {
  return { svg: renderSVG(vector) };
}
