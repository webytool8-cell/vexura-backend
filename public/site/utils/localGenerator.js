/**
 * Local Fallback Generator
 * Provides deterministic vector output when the AI backend is unreachable or fails.
 */

(function() {
    console.log(">> Initializing Local Generator...");

    window.generateLocalVector = function(payload) {
        // Fallback safety for payload
        const safePayload = payload || { prompt: 'unknown' };
        const prompt = safePayload.prompt || 'unknown';
        const type = safePayload.type || 'icon';
        const palette = safePayload.palette || 'auto';
        
        console.log(`>> Executing Local Gen for: "${prompt}" [${type}]`);
        
        const cleanPrompt = prompt.toLowerCase();
        const width = 400;
        const height = 400;
        const elements = [];
        
        // Color Determination
        const colors = {
            primary: '#000000',
            secondary: '#71717a',
            accent: '#ccff00',
            bg: 'none'
        };

        // Simple Palette Logic
        if (palette === 'warm') { colors.primary = '#ea580c'; colors.secondary = '#fdba74'; colors.accent = '#fca5a5'; }
        else if (palette === 'cool') { colors.primary = '#0284c7'; colors.secondary = '#7dd3fc'; colors.accent = '#bae6fd'; }
        else if (palette === 'vibrant') { colors.primary = '#7c3aed'; colors.secondary = '#c084fc'; colors.accent = '#e879f9'; }
        else if (palette === 'monochrome') { colors.primary = '#18181b'; colors.secondary = '#52525b'; colors.accent = '#d4d4d8'; }

        // Shape Logic Keywords
        const isRound = /circle|round|sphere|ball|world|globe|planet/.test(cleanPrompt);
        const isTri = /triangle|pyramid|mountain|sharp|arrow/.test(cleanPrompt);
        const isTech = /tech|chip|data|code|server|upload|download|digital/.test(cleanPrompt);
        const isNature = /leaf|tree|flower|nature|organic|growth/.test(cleanPrompt);

        // Seed generation from prompt string for deterministic output
        let seed = 0;
        for (let i = 0; i < prompt.length; i++) seed += prompt.charCodeAt(i);
        
        const getRand = (mod) => (seed = (seed * 9301 + 49297) % 233280) % mod;

        // Base Container
        if (isRound) {
            elements.push({
                id: 'base-circle', type: 'circle',
                cx: 200, cy: 200, r: 180,
                fill: 'none', stroke: colors.primary, strokeWidth: 4
            });
        } else if (isTri) {
            elements.push({
                id: 'base-tri', type: 'polygon',
                points: "200,40 360,340 40,340",
                fill: 'none', stroke: colors.primary, strokeWidth: 4
            });
        } else {
            // Default Rounded Rect
            elements.push({
                id: 'base-rect', type: 'rect',
                x: 40, y: 40, width: 320, height: 320, rx: 32,
                fill: 'none', stroke: colors.primary, strokeWidth: 4
            });
        }

        // Inner Content Generation
        const complexity = (seed % 4) + 3; // 3 to 6 shapes

        for (let i = 0; i < complexity; i++) {
            const size = 60 + getRand(100);
            const xPos = 100 + getRand(200);
            const yPos = 100 + getRand(200);
            const isFilled = getRand(10) > 5;
            
            // Tech-style grid dots or lines
            if (isTech && i % 2 === 0) {
                 elements.push({
                    id: `tech-el-${i}`, type: 'rect',
                    x: xPos - 20, y: yPos - 10, width: 40, height: 20, rx: 4,
                    fill: isFilled ? colors.secondary : 'none',
                    stroke: colors.primary, strokeWidth: 2
                });
                continue;
            }

            // Nature-style curves
            if (isNature && i % 2 === 0) {
                elements.push({
                    id: `nature-el-${i}`, type: 'circle',
                    cx: xPos, cy: yPos, r: size / 2,
                    fill: isFilled ? colors.accent : 'none',
                    stroke: colors.primary, strokeWidth: 2,
                    opacity: 0.6
                });
                continue;
            }

            // Default Geometric Shapes
            if (i % 2 === 0) {
                elements.push({
                    id: `geo-circle-${i}`, type: 'circle',
                    cx: xPos, cy: yPos, r: size / 3,
                    fill: i === 0 ? colors.accent : (isFilled ? colors.secondary : 'none'),
                    stroke: colors.primary, strokeWidth: 2
                });
            } else {
                elements.push({
                    id: `geo-rect-${i}`, type: 'rect',
                    x: xPos - size/2, y: yPos - size/2, width: size, height: size,
                    rx: 8,
                    fill: 'none', stroke: colors.secondary, strokeWidth: 2
                });
            }
        }

        // Center Accent
        elements.push({
            id: 'center-accent', type: 'circle',
            cx: 200, cy: 200, r: 10,
            fill: colors.accent, stroke: 'none'
        });

        return {
            name: prompt.substring(0, 15) + (prompt.length > 15 ? '...' : ''),
            width,
            height,
            elements
        };
    };
})();