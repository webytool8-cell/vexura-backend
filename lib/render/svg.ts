// lib/render/svg.ts
export function svg(vector: any): string {
  if (!vector || !Array.isArray(vector.elements)) return "<svg></svg>";

  const { width = 400, height = 400, elements = [] } = vector;

  const content = elements
    .map((el: any) => {
      switch (el.shape) {
        case "circle":
          return `<circle cx="${el.x}" cy="${el.y}" r="${el.r}" fill="${el.fill}" />`;
        case "rect":
          return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" />`;
        case "ellipse":
          return `<ellipse cx="${el.cx}" cy="${el.cy}" rx="${el.rx}" ry="${el.ry}" fill="${el.fill}" />`;
        case "line":
          return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" />`;
        case "polygon":
          return `<polygon points="${el.points}" fill="${el.fill}" />`;
        case "path":
          return `<path d="${el.d}" fill="${el.fill}" />`;
        default:
          return "";
      }
    })
    .join("\n");

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
${content}
</svg>`;
}
