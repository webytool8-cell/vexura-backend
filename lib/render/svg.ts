// lib/render/svg.ts

export function renderSVG(vector: any): string {
  if (!vector || !Array.isArray(vector.elements)) {
    return '<svg></svg>';
  }

  const width = vector.width ?? 400;
  const height = vector.height ?? 400;

  const elementsStr = vector.elements
    .map((el: any) => {
      const { type, ...attrs } = el;
      if (!type) return '';
      const attrStr = Object.entries(attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ');
      return `<${type} ${attrStr} />`;
    })
    .join('\n');

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
${elementsStr}
</svg>`;
}
