import { analyzePromptForOrganicNeeds } from './organic-shapes';

export type ComputedPatternType = 'radial' | 'star' | 'polygon' | 'grid' | 'concentric' | 'spiral';

export type ShapeRequirements = {
  hasOrganicCurves: boolean;
  hasComputedPattern: boolean;
  hasBothTypes: boolean;
  organicType?: string;
  computedType?: ComputedPatternType;
};

type PatternRule = {
  type: ComputedPatternType;
  triggers: string[];
  algorithmName: string;
  instructions: string;
};

const PATTERNS: PatternRule[] = [
  {
    type: 'radial',
    triggers: ['gear', 'cog', 'sunburst', 'radial', 'spoke', 'wheel', 'sun rays'],
    algorithmName: 'POLAR_COORDINATE_DISTRIBUTION',
    instructions: `
- Use centerX=200, centerY=200.
- For N teeth, compute totalVertices = N * 2 (outer/inner alternating).
- For each vertex i:
  angleDeg = (i * 180 / N) - 90
  angleRad = angleDeg * (PI / 180)
  radius = (i % 2 === 0) ? outerRadius : innerRadius
  x = round((200 + cos(angleRad) * radius) / 10) * 10
  y = round((200 + sin(angleRad) * radius) / 10) * 10
- Build polygon/path points from those computed coordinates only.
- Do NOT hand-place approximate points.
`
  },
  {
    type: 'star',
    triggers: ['star', 'pentagram', 'hexagram', 'pointed star'],
    algorithmName: 'ALTERNATING_RADIUS_POLYGON',
    instructions: `
- Use alternating outerRadius/innerRadius for exactly 2*N vertices.
- Use even angular increments: angleStep = 180 / N.
- Start at -90 degrees and compute each vertex by cos/sin.
- Snap coordinates to the grid after calculation.
`
  },
  {
    type: 'polygon',
    triggers: ['hexagon', 'octagon', 'pentagon', 'heptagon', 'decagon', 'regular polygon'],
    algorithmName: 'REGULAR_POLYGON_VERTICES',
    instructions: `
- Compute all vertices from one center with angleStep = 360 / sides.
- Ensure mathematically equal side/angle intent (no visual guessing).
`
  },
  {
    type: 'grid',
    triggers: ['grid', 'matrix', 'tiles', 'checkerboard', 'lattice', 'array'],
    algorithmName: 'RECTANGULAR_GRID_DISTRIBUTION',
    instructions: `
- Place cells by row/column arithmetic: x = startX + col * pitchX, y = startY + row * pitchY.
- Keep spacing uniform and axis-aligned.
`
  },
  {
    type: 'concentric',
    triggers: ['concentric', 'rings', 'ripple', 'target', 'bullseye'],
    algorithmName: 'EVENLY_SPACED_CIRCLES',
    instructions: `
- Use one shared center for all rings.
- Radius progression must be evenly stepped.
`
  },
  {
    type: 'spiral',
    triggers: ['spiral', 'helix', 'coil', 'vortex'],
    algorithmName: 'ARCHIMEDEAN_SPIRAL_CURVE',
    instructions: `
- Radius should increase progressively with angle (r = a + b*theta).
- Keep point density smooth/consistent along the curve.
`
  }
];

function includesWordOrPhrase(haystack: string, token: string): boolean {
  if (token.includes(' ')) {
    return haystack.includes(token);
  }

  return new RegExp(`\\b${token}\\b`, 'i').test(haystack);
}

function detectComputedPattern(prompt: string): ComputedPatternType | undefined {
  const p = prompt.toLowerCase();
  const hit = PATTERNS.find(pattern => pattern.triggers.some(t => includesWordOrPhrase(p, t)));
  return hit?.type;
}

export function analyzeShapeRequirements(prompt: string): ShapeRequirements {
  const organic = analyzePromptForOrganicNeeds(prompt);
  const computedType = detectComputedPattern(prompt);

  const hasOrganicCurves = organic.organicShapes.length > 0;
  const hasComputedPattern = !!computedType;

  return {
    hasOrganicCurves,
    hasComputedPattern,
    hasBothTypes: hasOrganicCurves && hasComputedPattern,
    organicType: organic.organicShapes[0]?.keyword,
    computedType
  };
}

export function getComputedPatternPromptInjection(prompt: string): string {
  const requirements = analyzeShapeRequirements(prompt);
  if (!requirements.computedType) return '';

  const pattern = PATTERNS.find(p => p.type === requirements.computedType);
  if (!pattern) return '';

  return `
COMPUTED PATTERN DETECTED: ${pattern.algorithmName}
CRITICAL: This is a mathematical placement task, not visual approximation.
MANDATORY COMPUTED RULES:
${pattern.instructions}
`;
}

export function getHybridIntegrationRules(prompt: string): string {
  const requirements = analyzeShapeRequirements(prompt);
  if (!requirements.hasBothTypes) return '';

  return `
HYBRID MODE (ORGANIC + COMPUTED):
- Compute structural anchors first using computed pattern rules.
- Then draw organic surfaces (bezier curves) around those anchors.
- Keep one shared center/alignment system for both.
`;
}
