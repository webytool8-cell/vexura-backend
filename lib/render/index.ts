// lib/render/index.ts
import { renderSVG } from './svg';

// Optional wrapper for multiple formats (currently just SVG)
export function renderFormats(vector: any) {
  return { svg: renderSVG(vector) };
}
