// utils/aiEngine.js
// Compatibility layer: exposes the "AI Engine" API the UI expects.
// Internally uses same-origin /api routes to avoid CORS.

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

  // Canonical orchestrator
  const orchestrator = {
    generate: (params) => requestJson("/api/generate", params),
    render: (params) => requestJson("/api/render", params),
    checkout: (params) => requestJson("/api/checkout", params),
  };

  // Expose modern API
  window.aiOrchestrator = orchestrator;

  // Expose legacy names that your Generator.js might be expecting
  window.aiEngine = orchestrator;
  window.AI_ENGINE = orchestrator;

  console.log(">> AI Engine initialized (same-origin /api/*)");
})();
