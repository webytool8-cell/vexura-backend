// utils/aiEngine.js
// Universal compatibility shim so Generator.js can find an "AI Engine"
// regardless of what name/flags it expects.
// Uses same-origin /api/* to avoid CORS.

(function () {
  async function requestJson(path, payload) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(
        `Backend error (${res.status}) ${path}\n` + (text ? text.slice(0, 2000) : "")
      );
    }

    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }

  // Core engine implementation (same-origin)
  const core = {
    generate: (params) => requestJson("/api/generate", params),
    render: (params) => requestJson("/api/render", params),
    checkout: (params) => requestJson("/api/checkout", params),

    // Some generator versions call init() before generate()
    init: async () => true,

    // Some generator versions check these flags
    initialized: true,
    isInitialized: true,
    ready: true,
    isReady: true,
    status: "ready",
  };

  // Expose under ALL likely global names
  window.aiOrchestrator = core;
  window.aiEngine = core;

  // Many builds look specifically for this:
  window.AI_ENGINE = core;

  // Some builds check a separate boolean
  window.AI_ENGINE_READY = true;

  // Some builds look for a function that returns the engine
  window.getAIEngine = () => core;

  // Debug line (harmless)
  console.log(">> AI Engine shim installed:", {
    aiEngine: !!window.aiEngine,
    AI_ENGINE: !!window.AI_ENGINE,
    ready: window.AI_ENGINE_READY,
  });
})();
