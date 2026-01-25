export function renderSVG(vector) {
  const elements = vector.elements.map(el => {
    if (el.type === "circle") {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill || "none"}" stroke="${el.stroke || "none"}" />`;
    }
    if (el.type === "ellipse") {
      return `<ellipse cx="${el.cx}" cy="${el.cy}" rx="${el.rx}" ry="${el.ry}" fill="${el.fill || "none"}" />`;
    }
    if (el.type === "path") {
      return `<path d="${el.d}" fill="${el.fill || "none"}" stroke="${el.stroke || "none"}" />`;
    }
    return "";
  }).join("");

  return `
<svg viewBox="0 0 ${vector.width} ${vector.height}" xmlns="http://www.w3.org/2000/svg">
${elements}
</svg>
`.trim();
}
