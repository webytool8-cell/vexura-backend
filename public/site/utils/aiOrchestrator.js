// VEXURA AI Orchestrator (Browser)
// Goal: Always initialize window.orchestrateDesign and avoid CORS by using same-origin /api/generate

(function () {
  // Safe config defaults (works even if utils/apiConfig.js is missing or broken)
  const DEFAULT_CONFIG = {
    // Same-origin endpoint (no CORS) when frontend is hosted on the same Vercel project as /api/*
    PRODUCTION_API: "/api/generate",

    // If you ever run the frontend somewhere else (ex: Trickle), you can override with window.VEXURA_CONFIG.DEV_API
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
    const url = isDevHost() ? cfg.DEV_API : cfg.PRODUCTION_API;
    return url;
  };

  async function callGenerateAPI(payload) {
    const endpoint = resolveEndpoint();

    // Debug line (helps you confirm which endpoint is used)
    console.log(">> Orchestrator endpoint:", endpoint);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // same-origin default is fine; if endpoint is absolute on another domain, browser will enforce CORS
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Backend Error: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
    }

    return res.json();
  }

  async function orchestrateDesign(payload) {
    // If someone passes localOnly, try local generator (if it exists), otherwise proceed to API
    if (payload && payload.localOnly) {
      if (window.LocalGenerator && typeof window.LocalGenerator.generate === "function") {
        console.log(">> Using LocalGenerator (localOnly=true)");
        return window.LocalGenerator.generate(payload);
      }
      console.warn(">> localOnly requested but LocalGenerator not available; falling back to API");
    }

    // If API is required but payload is missing, fail clearly
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid payload");
    }

    return callGenerateAPI(payload);
  }

  // ✅ This is what Generator.js expects
  window.orchestrateDesign = orchestrateDesign;

  console.log(">> AI Orchestrator Initialized (window.orchestrateDesign ready)");
})();
