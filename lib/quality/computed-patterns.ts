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
  instructions: string[];
};

const PATTERNS: PatternRule[] = [
  {
    type: 'radial',
    triggers: ['gear', 'cog', 'sunburst', 'radial', 'spoke', 'wheel', 'sun rays'],
    algorithmName: 'POLAR_COORDINATE_DISTRIBUTION',
    instructions: [
      'Use angleStep = 360 / elementCount and compute x/y with cos/sin from a shared center.',
      'Snap computed coordinates to the icon grid before output.',
      'Keep angular spacing even and radii consistent.'
    ]
  },
  {
    type: 'star',
    triggers: ['star', 'pentagram', 'hexagram', 'pointed star'],
    algorithmName: 'ALTERNATING_RADIUS_POLYGON',
    instructions: [
      'Build 2*N vertices alternating outerRadius and innerRadius.',
      'Start from the top (-90deg) and use even angular increments.',
      'Output as one polygon/path with mathematically computed points.'
    ]
  },
  {
    type: 'polygon',
    triggers: ['hexagon', 'octagon', 'pentagon', 'heptagon', 'decagon', 'regular polygon'],
    algorithmName: 'REGULAR_POLYGON_VERTICES',
    instructions: [
      'Compute all vertices from center + uniform angleStep.',
      'Ensure equal side length intent (no hand-placed uneven points).'
    ]
  },
  {
    type: 'grid',
    triggers: ['grid', 'matrix', 'tiles', 'checkerboard', 'lattice', 'array'],
    algorithmName: 'RECTANGULAR_GRID_DISTRIBUTION',
    instructions: [
      'Place cells by row/column arithmetic (start + index * pitch).',
      'Maintain uniform x/y spacing and alignment.'
    ]
  },
  {
    type: 'concentric',
    triggers: ['concentric', 'rings', 'ripple', 'target', 'bullseye'],
    algorithmName: 'EVENLY_SPACED_CIRCLES',
    instructions: [
      'Use a shared center and evenly stepped radii.',
      'Do not offset rings independently.'
    ]
  },
  {
    type: 'spiral',
    triggers: ['spiral', 'helix', 'coil', 'vortex'],
    algorithmName: 'ARCHIMEDEAN_SPIRAL_CURVE',
    instructions: [
      'Use progressive radius growth from angle progression.',
      'Keep point density smooth and monotonic along the curve.'
    ]
  }
];

function detectComputedPattern(prompt: string): ComputedPatternType | undefined {
  const p = prompt.toLowerCase();
  const hit = PATTERNS.find(pattern => pattern.triggers.some(t => p.includes(t)));
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
MANDATORY COMPUTED RULES:
${pattern.instructions.map(i => `- ${i}`).join('\n')}
- Calculate coordinates mathematically, do not approximate placements visually.
`;
}

export function getHybridIntegrationRules(prompt: string): string {
  const requirements = analyzeShapeRequirements(prompt);
  if (!requirements.hasBothTypes) return '';

  return `
HYBRID MODE (ORGANIC + COMPUTED):
- Compute structural anchors/positions first using the computed pattern rules.
- Then draw organic surfaces (bezier curves) around those computed anchors.
- Keep one shared center/alignment system so structure and curves stay coherent.
`;
}
