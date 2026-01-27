// lib/render/index.ts

export { renderSVG } from './svg';

// Optional wrapper for multiple formats
export function renderFormats(vector: any) {
  return { svg: renderSVG(vector) };
}
