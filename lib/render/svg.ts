// lib/render/svg.ts

export const renderFormats = {
  svg: (vector: any) => {
    const elements = vector.elements
      .map((el: any) => {
        switch (el.type) {
          case "circle":
            return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill || "none"}" stroke="${el.stroke || "none"}" />`;
          case "ellipse":
            return `<ellipse cx="${el.cx}" cy="${el.cy}" rx="${el.rx}" ry="${el.ry}" fill="${el.fill || "none"}" />`;
          case "rect":
            return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill || "none"}" stroke="${el.stroke || "none"}" />`;
          case "path":
            return `<path d="${el.d}" fill="${el.fill || "none"}" stroke="${el.stroke || "none"}" />`;
          case "line":
            return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke || "none"}" stroke-width="${el.strokeWidth || 1}" />`;
          case "polygon":
            return `<polygon points="${el.points}" fill="${el.fill || "none"}" stroke="${el.stroke || "none"}" />`;
          default:
            return "";
        }
      })
      .join("");

    return `<svg viewBox="0 0 ${vector.width} ${vector.height}" xmlns="http://www.w3.org/2000/svg">
${elements}
</svg>`.trim();
  },
};
