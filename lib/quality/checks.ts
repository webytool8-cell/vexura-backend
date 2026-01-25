export function iconChecks(vector) {
  const hasElements = Array.isArray(vector.elements) && vector.elements.length > 0;
  const elementCount = vector.elements.length >= 5 && vector.elements.length <= 12;
  const correctSize = vector.width === 400 && vector.height === 400;
  const strokesExist = vector.elements.every(el => el.stroke && el.stroke !== "none");

  return { hasElements, elementCount, correctSize, strokesExist };
}

