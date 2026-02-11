/**
 * VEXURA AI Orchestrator
 * Responsibilities:
 * 1) Transport normalized payload to backend
 * 2) Return normalized result
 * 3) Environment-aware routing (Trickle Proxy vs Direct Vercel)
 *
 * NOTE: Backend URLs are centralized in utils/apiConfig.js (window.VexuraAPI)
 */

window.orchestrateDesign = async function (payload) {
  if (!window.VexuraAPI) {
    throw new Error("VexuraAPI not initialized. Ensure utils/apiConfig.js is loaded before aiOrchestrator.js");
  }

  const endpoint = window.VexuraAPI.generateUrl();
  console.log(`>> Environment: ${window.VexuraAPI.isTrickle() ? "Trickle Preview (Using Proxy)" : "Production (Using Direct API)"}`);
  console.log(">> Outbound Payload:", payload);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Backend returned non-JSON response (HTTP ${response.status}): ${text.slice(0, 200)}`);
    }

    if (!response.ok) {
      const msg = (data && (data.error || data.message)) ? (data.error || data.message) : `HTTP Error: ${response.status}`;
      throw new Error(msg);
    }

    // Backend contract: { success, svg, vector, warnings, score, error }
    if (!data.success) {
      const errorMsg = data.error || "Backend reported generation failure";

      if (String(errorMsg).includes("No elements")) {
        console.warn("Backend returned no elements. Returning empty default.");
        return {
          vector: { elements: [] },
          svg: "",
          warnings: ["Generation produced no elements. Try a simpler prompt."],
          score: 0,
        };
      }

      console.error("SVG generation failed:", data.error || data);
      throw new Error(errorMsg);
    }

    const svgVector = data.vector || {};
    svgVector.elements = Array.isArray(svgVector.elements) ? svgVector.elements : [];

    if (Array.isArray(data.warnings) && data.warnings.length > 0) {
      console.warn("SVG generation warnings:", data.warnings);
    }

    return {
      vector: svgVector,
      svg: data.svg || "",
      warnings: data.warnings || [],
      score: typeof data.score === "number" ? data.score : 0,
    };
  } catch (error) {
    console.error("<< Orchestration Error:", error);
    throw error;
  }
};
