import { renderSVG } from "./svg";

export function renderFormats(vector) {
  return {
    json: vector,
    svg: renderSVG(vector)
  };
}

