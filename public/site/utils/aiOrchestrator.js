// utils/aiOrchestrator.js
// Same-origin API calls to avoid CORS.
// This assumes your Vercel deployment serves /api/* from the Next app.

(function () {
  const DEFAULT_TIMEOUT_MS = 120000;

  function withTimeout(promise, ms = DEFAULT_TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);

    return {
      signal: controller.signal,
      run: (async () => {
        try {
          return await promise(controller.signal);
        } finally {
          clearTimeout(timer);
        }
      })(),
    };
  }

  async function requestJson(path, payload, { timeoutMs } = {}) {
    const { signal, run } = withTimeout(async (sig) => {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {}),
        signal: sig,
      });

      // Read text first (helps debug when server returns HTML)
      const text = await res.text();

      if (!res.ok) {
        const msg =
          `Backend error (${res.status}) ${path}\n` +
          (text ? text.slice(0, 2000) : "");
        throw new Error(msg);
      }

      if (!text) return null;

      try {
        return JSON.parse(text);
      } catch (e) {
        // Backend returned non-JSON
        return { raw: text };
      }
    }, timeoutMs || DEFAULT_TIMEOUT_MS);

    return run;
  }

  // Public API
  window.aiOrchestrator = {
    // Main generate call
    generate: async (params) => {
      // IMPORTANT: Same-origin call to avoid CORS
      return requestJson("/api/generate", params);
    },

    // Optional: render endpoint if your backend has one
    render: async (params) => {
      return requestJson("/api/render", params);
    },

    // Optional: checkout / billing endpoints if used
    checkout: async (params) => {
      return requestJson("/api/checkout", params);
    },
  };
})();
