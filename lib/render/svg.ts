// lib/render/svg.ts

export function renderSVG(vector: any) {
  if (!vector || !vector.elements) return '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

  let svg = `<svg width="${vector.width || 100}" height="${vector.height || 100}" xmlns="http://www.w3.org/2000/svg">`;

  vector.elements.forEach((el: any) => {
    switch (el.type) {
      case 'circle':
        svg += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill || 'black'}" />`;
        break;
      case 'rect':
        svg += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill || 'gray'}" />`;
        break;
      case 'line':
        svg += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke || 'black'}" stroke-width="${el.strokeWidth || 2}" />`;
        break;
      // Add other shapes as needed
    }
  });

  svg += `</svg>`;
  return svg;
}
