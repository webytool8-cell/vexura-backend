/**
 * VEXURA Render Utilities
 * Helpers for processing standard AI output.
 */

window.processVexuraOutput = function(data) {
    // Ensure defaults
    const defaults = {
        width: 400,
        height: 400,
        bg: '#ffffff'
    };
    
    // Guard clause: If data is null/undefined, return safe default
    if (!data || typeof data !== 'object') {
        return { ...defaults, elements: [] };
    }
    
    // Safety check for elements
    const elements = Array.isArray(data.elements) ? data.elements : [];

    return {
        ...defaults,
        ...data,
        // Process elements: Add IDs and normalize visual properties
        elements: elements.map((el, i) => {
            const newEl = {
                ...el,
                id: el.id || `vex-${i}-${Date.now()}`
            };

            // 1. Fix 0px stroke width issue
            // If element has a visible stroke defined but width is missing or 0, force visibility
            if (newEl.stroke && newEl.stroke !== 'none') {
                if (newEl.strokeWidth === undefined || newEl.strokeWidth === null || parseFloat(newEl.strokeWidth) === 0) {
                    newEl.strokeWidth = 2; // Enforce minimum visible weight
                }
            }

            // 2. Fix Completely Invisible Elements
            // If element has NO fill AND NO stroke, it will be invisible. Force a default stroke.
            const hasFill = newEl.fill && newEl.fill !== 'none';
            const hasStroke = newEl.stroke && newEl.stroke !== 'none';
            
            if (!hasFill && !hasStroke) {
                newEl.stroke = '#000000';
                newEl.strokeWidth = 2;
            }

            return newEl;
        })
    };
};