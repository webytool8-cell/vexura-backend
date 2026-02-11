/**
 * Centralized API routing for VEXURA (Trickle preview vs Production).
 * - In Trickle preview, routes calls through Trickle proxy to avoid CORS.
 * - In Production (Vercel/custom domain), calls backend directly.
 *
 * Update BACKEND_BASE if your backend project URL changes.
 */
(function () {
  const BACKEND_BASE = "https://vexura-backend-aces-projects-a13cbb83.vercel.app";
  const IS_TRICKLE_ENV =
    window.location.hostname.includes("trickle-app.host") ||
    window.location.hostname.includes("trickle.so");

  function withProxyIfNeeded(url) {
    if (!IS_TRICKLE_ENV) return url;
    return `https://proxy-api.trickle-app.host/?url=${encodeURIComponent(url)}`;
  }

  window.VexuraAPI = {
    isTrickle: () => IS_TRICKLE_ENV,
    backendBase: () => BACKEND_BASE,
    url: (path) => {
      const normalized = path.startsWith("/") ? path : `/${path}`;
      return withProxyIfNeeded(`${BACKEND_BASE}${normalized}`);
    },
    // Convenience
    generateUrl: () => withProxyIfNeeded(`${BACKEND_BASE}/api/generate`),
    checkoutUrl: () => withProxyIfNeeded(`${BACKEND_BASE}/api/checkout`)
  };
})();
