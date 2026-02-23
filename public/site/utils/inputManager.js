/**
 * Input Manager
 * Responsible for normalizing user input and enforcing the input contract.
 * Implements deterministic subject classification and scoped geometry rules.
 */

const INPUT_CONSTRAINTS = {
    MAX_LENGTH: 300, 
    FORMATS: ['svg'],
    TYPES: ['icon', 'illustration'],
    STYLES: [
        'outline', 'filled', 'minimal', 'geometric', // Icon styles
        'flat', 'organic', 'abstract', 'technical'   // Illustration styles
    ],
    PALETTES: ['monochrome', 'warm', 'cool', 'pastel', 'vibrant', 'custom'],
    SIZES: [16, 32, 64, 128, 512]
};

// Classification Dictionaries
const SUBJECT_CLASSIFICATION = {
    ORGANIC: [
        'human', 'person', 'people', 'man', 'men', 'woman', 'women', 
        'girl', 'boy', 'child', 'kid', 'face', 'head', 'portrait', 
        // REMOVED: 'user', 'profile', 'avatar' - these are ICON keywords
        'team', 'group', 'family',
        'student', 'worker', 'employee', 'doctor', 'nurse', 'teacher',
        'animal', 'dog', 'cat', 'bird', 'fish', 'creature', 'monster',
        'plant', 'tree', 'flower', 'leaf', 'leaves', 'grass', 'forest', 'garden',
        'terrain', 'mountain', 'hill', 'landscape', 'water', 'river', 'ocean',
        'cloud', 'sky', 'fire', 'smoke', 'fabric', 'cloth', 'hair', 'fur'
    ],
    // Non-organic list is implicit (everything else), but we track some for explicit confirmation
    GEOMETRIC_HINTS: [
        'robot', 'droid', 'cyborg', 'mech',
        'building', 'house', 'city', 'architecture',
        'car', 'vehicle', 'plane', 'ship', 'bike',
        'phone', 'computer', 'screen', 'device', 'interface', 'ui',
        'tool', 'hammer', 'wrench', 'pen', 'pencil',
        'furniture', 'chair', 'table', 'lamp',
        'box', 'cube', 'grid', 'chart', 'graph', 'line', 'shape',
        'icon', 'symbol', 'logo', 'badge',
        // ADDED: Icon-specific human representations
        'user', 'profile', 'avatar', 'account', 'member'
    ]
};

// Intent System Prompts for Illustrations
const ILLUSTRATION_INTENTS = {
    ui: `
CONTEXT: You are generating a user-facing product illustration for a modern SaaS interface.
GOAL: Clarity, hierarchy, and functional UI metaphors.
RULES:
- Avoid abstract networks, floating symbols, or complex diagram layouts.
- Use clear foreground/background separation.
- The illustration should feel like it belongs in a clean, modern digital product.
- Use recognizable UI elements (cards, buttons, toggles) but simplified.
`,

    diagram: `
CONTEXT: You are generating a system or network diagram illustration.
GOAL: Communicate relationships, flow, and structure.
RULES:
- Use nodes, connections, and spatial structure to communicate logic.
- Abstract geometry is acceptable, but maintain visual balance and readability.
- Group related elements logically.
- Avoid chaotic or random placement.
`,

    abstract: `
CONTEXT: You are generating a conceptual illustration.
GOAL: Express ideas through symbolic shapes, color, and composition.
RULES:
- Literal UI components are not required.
- Use metaphors (e.g., growth = plant, speed = motion lines).
- Focus on mood and visual interest over technical accuracy.
`
};

// Base URL for human reference illustrations
const REF_BASE_URL = "https://raw.githubusercontent.com/webytool8-cell/vexura-backend/main/lib/quality/illustration-reference";

window.InputManager = {
    /**
     * Normalizes and validates user input into a single contract object.
     * Returns: { prompt: string, type: "icon" | "illustration", style?: string, palette?: string, reference_images?: string[] }
     */
    createPayload: function(rawInput, options = {}) {
        const {
            type = 'icon',
            style = 'auto',
            palette = 'auto',
            hexColor = '',
            variation = null,
            intent = 'abstract' // New: ui | diagram | abstract
        } = options;

        // 1. Normalize Text
        let cleanText = (rawInput || '').trim();
        cleanText = cleanText.replace(/\s+/g, ' '); 
        
        if (cleanText.length > INPUT_CONSTRAINTS.MAX_LENGTH) {
            cleanText = cleanText.substring(0, INPUT_CONSTRAINTS.MAX_LENGTH);
        }

        if (!cleanText) {
            throw new Error("Input cannot be empty");
        }

        // 2. Classify Elements & Determine Geometry Mode
        // We scan the input for organic keywords to apply scoped rules.
        const lowerText = cleanText.toLowerCase();
        
        // Find specific organic matches in the prompt
        const organicMatches = SUBJECT_CLASSIFICATION.ORGANIC.filter(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            return regex.test(lowerText);
        });
        
        const hasOrganicSubjects = organicMatches.length > 0;
        
        // 3. Construct Scoped Prompt Instructions
        let instructionBlock = "";

        // Smart Style Detection for 'auto' mode
        let impliedStyleRule = "";
        if (type === 'icon' && style === 'auto') {
            const filledKeywords = ['solid', 'filled', 'bold', 'block', 'silhouette', 'glyph', 'heavy', 'black', 'dark'];
            const isImplicitlyFilled = filledKeywords.some(k => lowerText.includes(k));
            
            if (isImplicitlyFilled) {
                impliedStyleRule = "- STYLE: PREFER_FILLED. Use solid shapes (fill) over strokes.";
            } else {
                impliedStyleRule = "- STYLE: ADAPTIVE. Use Filled style for solid objects (e.g. HDD, Battery, Wallet) and Outline for linear objects. Do NOT default to outline if filled is more legible.";
            }
        }

        // NEW: Intent Injection for Illustrations
        let intentBlock = "";
        if (type === 'illustration') {
            intentBlock = ILLUSTRATION_INTENTS[intent] || ILLUSTRATION_INTENTS.abstract;
        }

        if (type === 'icon') {
            // RULE: Icons are ALWAYS geometric
            instructionBlock = `
CRITICAL GEOMETRY RULES (ICON):
- MODE: STRICT_GEOMETRIC_PRIMITIVES
${impliedStyleRule}
- VISUAL LANGUAGE: Engineering drafting, not sketching.
- CONSTRAINTS: Use ONLY circle, rect, polygon, and straight lines.
- FORBIDDEN: Organic curves, hand-drawn paths, wobbly lines, complex bezier curves.
- ABSTRACTION: Even if the subject is organic (e.g. face, leaf, water), you MUST abstract it into pure geometric shapes (circles/squares).
- Maintain perfect symmetry and consistent stroke weights.

SPECIAL RULE FOR USER/PROFILE/AVATAR ICONS:
- These are SYMBOLIC REPRESENTATIONS, NOT portraits
- Use ONLY: 1 circle (head) + 1 simple shape (body)
- NO facial features (no eyes, nose, mouth, ears)
- NO realistic human proportions
- Think: iOS Settings icon, Material Design account icon
- Maximum 2-3 elements total`;
        
        } else {
            // Illustrations: Mixed Mode
            if (hasOrganicSubjects) {
                // Mixed Mode: Organic for matches, Geometric for rest
                const organicListStr = organicMatches.join(', ');
                instructionBlock = `
CRITICAL GEOMETRY RULES (MIXED):
1. ORGANIC ELEMENTS ([${organicListStr}]):
   - Use natural curvature, fluid paths, and varying line weights.
   - Allowed: Asymmetry, soft edges, hand-drawn feel.
   - Apply organic rules ONLY to these specific elements.

2. ALL OTHER ELEMENTS (Background, Objects, Tools, Architecture):
   - MODE: STRICT_GEOMETRIC
   - Use straight lines, clean Bézier curves, and structural logic.
   - NO blobs or unintentional wiggles.
   - Mechanical/Man-made objects must look engineered.`;

            } else {
                // No organic subjects detected -> Default to geometric illustration
                instructionBlock = `
CRITICAL GEOMETRY RULES (STRUCTURAL):
- MODE: STRICT_GEOMETRIC_ILLUSTRATION
- Treat this as a technical or architectural drawing.
- Use precise paths, geometric primitives, and consistent spacing.
- NO organic drift. NO blobs.`;
            }
        }

        // 4. Append Additional Constraints
        let promptSuffix = '';
        if (palette === 'custom' && hexColor) {
            promptSuffix += ` [Color Palette: ${hexColor}]`;
        }
        if (variation === 'simpler') promptSuffix += ` [Constraint: Simplify details, reduce node count]`;
        if (variation === 'detailed') promptSuffix += ` [Constraint: Add structural detail, maintain clarity]`;
        if (variation === 'quality') promptSuffix += ` [Constraint: Focus on symmetry, clean lines, and geometric precision]`;

        // 5. Final Prompt Assembly
        // Combine Intent (if illustration) + Subject + Constraints + Geometry Rules
        const finalPrompt = type === 'illustration' 
            ? `${intentBlock}\n\nSUBJECT_REQUEST: ${cleanText}${promptSuffix}\n${instructionBlock}`
            : `SUBJECT: ${cleanText}${promptSuffix}\n${instructionBlock}`;

        // 6. Build Contract Payload
        const payload = {
            prompt: finalPrompt,
            type: type,
            style: style,      // ALWAYS send
            intent: intent,    // ALWAYS send
            palette: palette   // optional but consistent
        };

        // 7. Reference Logic (FIXED - Only for REALISTIC human requests)
        // NEW: Only inject references for REALISTIC portraits or ACTUAL human illustrations
        // NOT for user/profile/avatar icons
        const realisticHumanKeywords = ['portrait', 'face', 'realistic person', 'photograph', 'headshot'];
        const isRealisticHuman = realisticHumanKeywords.some(keyword => {
            return lowerText.includes(keyword);
        });

        // Additional check: Is this explicitly an icon?
        const isIconRequest = type === 'icon' || 
                             lowerText.includes('icon') || 
                             lowerText.includes('symbol') ||
                             lowerText.includes('logo');

        // Only inject human references if:
        // 1. It's a realistic human request, AND
        // 2. It's NOT an icon request
        if (isRealisticHuman && !isIconRequest) {
            // Select 2 distinct references
            const getRef = () => {
                const num = Math.floor(Math.random() * 20) + 1;
                const formattedNum = num.toString().padStart(2, '0');
                return `${REF_BASE_URL}/peep-${formattedNum}.svg`;
            };

            const ref1 = getRef();
            let ref2 = getRef();
            while (ref2 === ref1) ref2 = getRef();

            payload.reference_images = [ref1, ref2];
            console.log(">> Realistic human portrait detected. References injected.");
        } else if (lowerText.match(/\b(user|profile|avatar|account)\b/i)) {
            console.log(">> User/profile/avatar icon detected. Using geometric icon mode (NO realistic references).");
        } else {
            console.log(">> Standard icon generation.");
        }

        return payload;
    },

    getConstraints: function() {
        return INPUT_CONSTRAINTS;
    },

    // Optional: Auto-detect intent based on keywords
    detectIntent: function(prompt) {
        const p = prompt.toLowerCase();
        if (p.includes('screen') || p.includes('ui') || p.includes('dashboard') || p.includes('app') || p.includes('interface'))
            return 'ui';
        if (p.includes('network') || p.includes('blockchain') || p.includes('flow') || p.includes('chart') || p.includes('graph') || p.includes('system') || p.includes('structure'))
            return 'diagram';
        return 'abstract';
    }
};
```

---

## Key Changes:

### 1. **Moved `user`, `profile`, `avatar` out of ORGANIC list** (lines 14-16)
They're now in `GEOMETRIC_HINTS` (line 28) since they're icon representations, not realistic humans.

### 2. **Added special rule for user icons** (lines 109-115)
Explicitly tells the AI these are symbolic, not portraits.

### 3. **Fixed reference injection logic** (lines 157-180)
Now only injects realistic human references when:
- User asks for "portrait", "face", "realistic person", etc.
- AND it's NOT an icon request

### 4. **Better console logging** (lines 175-180)
Now shows which mode it detected.

---

## Expected Console Output After Fix:

**Before (broken):**
```
>> Human subject detected. References injected.
```

**After (fixed):**
```
>> User/profile/avatar icon detected. Using geometric icon mode (NO realistic references).
