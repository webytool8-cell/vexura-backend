// lib/render/svg.ts

type VectorElement = {
  type: string;
  fill?: string;
  stroke?: string;
  cx?: number;
  cy?: number;
  r?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  points?: string;
  d?: string;
};

type Vector = {
  width: number;
  height: number;
  elements: VectorElement[];
};

// export as renderSVG for compatibility
export function renderSVG(vector: Vector): string {
  const w = vector.width || 100;
  const h = vector.height || 100;

  if (!vector.elements || !vector.elements.length) {
    return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"></svg>`;
  }

  const content = vector.elements
    .map(e => {
      const fill = e.fill && e.fill !== 'none' ? e.fill : 'none';
      const stroke = e.stroke && e.stroke !== 'none' ? e.stroke : 'black';
      switch (e.type) {
        case 'circle':
          return `<circle cx="${e.cx ?? 0}" cy="${e.cy ?? 0}" r="${e.r ?? 5}" fill="${fill}" stroke="${stroke}"/>`;
        case 'rect':
          return `<rect x="${e.x ?? 0}" y="${e.y ?? 0}" width="${e.width ?? 10}" height="${e.height ?? 10}" fill="${fill}" stroke="${stroke}"/>`;
        case 'ellipse':
          return `<ellipse cx="${e.cx ?? 0}" cy="${e.cy ?? 0}" rx="${e.r ?? 5}" ry="${(e.r ?? 5) / 2}" fill="${fill}" stroke="${stroke}"/>`;
        case 'line':
          return `<line x1="${e.x ?? 0}" y1="${e.y ?? 0}" x2="${e.width ?? 10}" y2="${e.height ?? 10}" stroke="${stroke}" fill="none"/>`;
        case 'polygon':
          return `<polygon points="${e.points ?? '0,0 10,0 10,10'}" fill="${fill}" stroke="${stroke}"/>`;
        case 'path':
          return `<path d="${e.d ?? ''}" fill="${fill}" stroke="${stroke}"/>`;
        default:
          return '';
      }
    })
    .join('\n');

  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  ${content}
</svg>`;
}
