// VEXURA AI Orchestrator (Browser)
// Enhanced Design Intelligence Layer
// Same-origin /api/generate – No CORS

(function () {

  const DEFAULT_CONFIG = {
    PRODUCTION_API: "/api/generate",
    DEV_API: "/api/generate",
  };

  const getConfig = () => {
    const cfg = (window.VEXURA_CONFIG && typeof window.VEXURA_CONFIG === "object")
      ? window.VEXURA_CONFIG
      : {};
    return {
      PRODUCTION_API: cfg.PRODUCTION_API || DEFAULT_CONFIG.PRODUCTION_API,
      DEV_API: cfg.DEV_API || DEFAULT_CONFIG.DEV_API,
    };
  };

  const isDevHost = () => {
    const host = (window.location && window.location.hostname) ? window.location.hostname : "";
    return host.includes("trickle") || host.includes("localhost") || host.includes("127.0.0.1");
  };

  const resolveEndpoint = () => {
    const cfg = getConfig();
    return isDevHost() ? cfg.DEV_API : cfg.PRODUCTION_API;
  };

  // ------------------------------------------------------------
  // 🧠 PROFESSIONAL DESIGN RULES LAYER
  // ------------------------------------------------------------

  function buildIconConstraints(style) {
    const baseRules = `
You are a senior vector icon designer creating production-ready SVG icons.

STRICT ICON SYSTEM RULES:

GRID:
- Design within a 24x24 viewBox.
- Center composition optically.
- Maintain balanced negative space.

STROKE:
- Use consistent 2px stroke for outline icons.
- Rounded linecaps and joins unless geometric style.
- No inconsistent stroke thickness.

SIMPLICITY:
- Use minimal anchor points.
- Avoid unnecessary path fragmentation.
- Avoid redundant overlapping shapes.
- No decorative noise.

GEOMETRY:
- Use even pixel values.
- Maintain symmetry when appropriate.
- Keep curves smooth and controlled.
- Consistent corner radius.

VISUAL BALANCE:
- Avoid visual weight imbalance.
- Preserve recognizability at small sizes.

DO NOT:
- Use gradients
- Use filters
- Use raster effects
- Over-detail
- Output explanations

Return ONLY structured vector JSON.
`;

    const styleModifiers = {
      minimal: "Extremely simplified form. Remove all unnecessary detail.",
      outline: "Stroke-only construction. No filled shapes.",
      filled: "Solid filled shapes. Avoid strokes.",
      geometric: "Strict geometric primitives. Clean angles. Mathematical precision.",
      auto: ""
    };

    return baseRules + "\nSTYLE:\n" + (styleModifiers[style] || "");
  }

  function buildIllustrationConstraints(intent) {
    const baseRules = `
You are a professional vector illustrator creating clean scalable SVG illustrations.

RULES:
- Balanced composition
- Clear hierarchy
- Controlled color palette
- Avoid visual clutter
- Clean path construction
- No gradients or raster effects
- No excessive node counts
- Output structured vector JSON only
`;

    const intentModifiers = {
      ui: "Flat SaaS-style UI elements. Clean rectangles. Subtle rounded corners.",
      diagram: "Structured layout. Even spacing. Straight connectors. Clear system flow.",
      abstract: "Conceptual composition. Balanced asymmetry. Controlled shapes."
    };

    return baseRules + "\nINTENT:\n" + (intentModifiers[intent] || "");
  }

  function enhancePayload(original) {
    if (!original || typeof original !== "object") return original;

    const enhanced = { ...original };

    if (original.type === "icon") {
      enhanced.systemInstructions = buildIconConstraints(original.style);
    }

    if (original.type === "illustration") {
      enhanced.systemInstructions = buildIllustrationConstraints(original.intent);
    }

    return enhanced;
  }

  // ------------------------------------------------------------
  // 🔌 API CALL
  // ------------------------------------------------------------

  async function callGenerateAPI(payload) {
    const endpoint = resolveEndpoint();

    console.log(">> Orchestrator endpoint:", endpoint);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Backend Error: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
    }

    return res.json();
  }

  async function orchestrateDesign(payload) {

    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid payload");
    }

    // 🔥 Apply professional constraints
    const enhancedPayload = enhancePayload(payload);

    return callGenerateAPI(enhancedPayload);
  }

  // Required by Generator.js
  window.orchestrateDesign = orchestrateDesign;

  console.log(">> AI Orchestrator Initialized (Enhanced Design Mode)");

})();
