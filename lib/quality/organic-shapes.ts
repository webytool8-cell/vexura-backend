export type ShapeKind = 'organic' | 'geometric' | 'hybrid';

export type OrganicShapeSpec = {
  keyword: string;
  curveType: 'smooth-bezier' | 'sinusoidal' | 'bubble-curves' | 'irregular-spikes' | 'adaptive';
  mustBeClosed: boolean;
  requiresUnifiedPath: boolean;
};

export type ShapeAnalysis = {
  organicShapes: OrganicShapeSpec[];
  geometricShapes: string[];
  hybridShapes: string[];
  dominantType: ShapeKind;
};

type ShapeRule = {
  kind: ShapeKind;
  curveType?: OrganicShapeSpec['curveType'];
  mustBeClosed?: boolean;
  requiresUnifiedPath?: boolean;
};

const SHAPE_DATABASE: Record<string, ShapeRule> = {
  heart: { kind: 'organic', curveType: 'smooth-bezier', mustBeClosed: true, requiresUnifiedPath: true },
  love: { kind: 'organic', curveType: 'smooth-bezier', mustBeClosed: true, requiresUnifiedPath: true },
  leaf: { kind: 'organic', curveType: 'smooth-bezier', mustBeClosed: true, requiresUnifiedPath: true },
  petal: { kind: 'organic', curveType: 'smooth-bezier', mustBeClosed: true, requiresUnifiedPath: true },
  cloud: { kind: 'organic', curveType: 'bubble-curves', mustBeClosed: true, requiresUnifiedPath: true },
  wave: { kind: 'organic', curveType: 'sinusoidal', mustBeClosed: false, requiresUnifiedPath: true },
  flame: { kind: 'organic', curveType: 'irregular-spikes', mustBeClosed: true, requiresUnifiedPath: true },
  blob: { kind: 'organic', curveType: 'bubble-curves', mustBeClosed: true, requiresUnifiedPath: true },

  square: { kind: 'geometric' },
  circle: { kind: 'geometric' },
  triangle: { kind: 'geometric' },
  hexagon: { kind: 'geometric' },

  badge: { kind: 'hybrid' },
  flower: { kind: 'hybrid' }
};

function extractShapeKeywords(prompt: string): string[] {
  const normalized = prompt.toLowerCase();
  const detected = Object.keys(SHAPE_DATABASE).filter((keyword) =>
    new RegExp(`\\b${keyword}\\b`, 'i').test(normalized)
  );

  // In practice, these imply organic treatment even when not explicit nouns above.
  const impliedOrganic = ['organic', 'nature', 'flowing', 'fluid', 'curvy'].some((token) =>
    new RegExp(`\\b${token}\\b`, 'i').test(normalized)
  );

  if (impliedOrganic && !detected.includes('blob')) {
    detected.push('blob');
  }

  return detected;
}

export function analyzePromptForOrganicNeeds(prompt: string): ShapeAnalysis {
  const keywords = extractShapeKeywords(prompt);

  const organicShapes: OrganicShapeSpec[] = [];
  const geometricShapes: string[] = [];
  const hybridShapes: string[] = [];

  keywords.forEach((keyword) => {
    const rule = SHAPE_DATABASE[keyword];
    if (!rule) return;

    if (rule.kind === 'organic') {
      organicShapes.push({
        keyword,
        curveType: rule.curveType ?? 'adaptive',
        mustBeClosed: !!rule.mustBeClosed,
        requiresUnifiedPath: !!rule.requiresUnifiedPath
      });
    } else if (rule.kind === 'geometric') {
      geometricShapes.push(keyword);
    } else {
      hybridShapes.push(keyword);
    }
  });

  const dominantType: ShapeKind =
    organicShapes.length > geometricShapes.length ? 'organic' :
    geometricShapes.length > organicShapes.length ? 'geometric' :
    organicShapes.length > 0 ? 'organic' :
    hybridShapes.length > 0 ? 'hybrid' :
    'geometric';

  return { organicShapes, geometricShapes, hybridShapes, dominantType };
}

export function getOrganicPromptInjection(prompt: string): string {
  const analysis = analyzePromptForOrganicNeeds(prompt);
  if (analysis.organicShapes.length === 0) return '';

  const primary = analysis.organicShapes[0];

  const templates: Record<string, string> = {
    heart: 'M 200 160 C 160 120 110 120 110 160 C 110 200 150 240 200 280 C 250 240 290 200 290 160 C 290 120 240 120 200 160 Z',
    wave: 'M 100 200 C 133 150 166 150 200 200 C 233 250 266 250 300 200',
    leaf: 'M 200 100 C 240 120 250 180 200 240 C 150 180 160 120 200 100 Z',
    cloud: 'M 150 200 Q 130 180 150 160 Q 170 140 200 150 Q 230 140 250 160 Q 270 180 250 200 Q 230 220 200 210 Q 170 220 150 200 Z'
  };

  const refTemplate = templates[primary.keyword] ?? templates.heart;

  return `
ORGANIC SHAPE DETECTED: ${primary.keyword.toUpperCase()}
MANDATORY ORGANIC RULES:
- Use a SINGLE unified path for the main organic silhouette.
- Use curve commands (C/Q/S/T). Avoid constructing organic silhouettes with separate circles/rect/polygon primitives.
- ${primary.mustBeClosed ? 'The silhouette must be a closed path ending with Z.' : 'Open path is allowed for this silhouette.'}
- Keep curve transitions smooth and realistic (no accidental kinks).
- Keep all child detail visually contained inside its parent silhouette.

REFERENCE PATH STRUCTURE EXAMPLE:
${refTemplate}
`;
}

export function pathContainsBezierCurves(d?: string): boolean {
  if (!d) return false;
  return /[CcQqSsTt]/.test(d);
}
