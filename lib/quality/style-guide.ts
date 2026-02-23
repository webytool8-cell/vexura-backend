/**
 * Visual Style Guidelines for Icon Generation
 */

export const styleGuide = {
  // Canvas & Spacing
  canvas: {
    size: 400,
    padding: 40,
    center: { x: 200, y: 200 },
    safeZone: { min: 60, max: 340 }
  },

  // Coordinate System
  coordinates: {
    gridSize: 10,
    snapTo: 20,
    
    rules: [
      'All coordinates MUST be multiples of 10',
      'Major structural points should be multiples of 20',
      'Align to pixel grid for crisp rendering at all sizes',
      'Example GOOD: 200, 180, 220, 160',
      'Example BAD: 226, 245, 193, 157'
    ],
    
    examples: {
      good: [200, 180, 160, 220, 240, 280, 120],
      bad: [226, 245, 152, 193, 267]
    }
  },

  // Stroke Guidelines
  strokes: {
    thin: 8,
    regular: 16,
    thick: 24,
    bold: 32,
    
    rules: [
      'Use consistent stroke width across entire icon',
      'Minimum stroke: 8px (ensures visibility when scaled)',
      'Recommended: 16px for most icons',
      'Always use round caps and joins for modern appearance',
      'Choose strokes OR fills, never mix both'
    ],
    
    attributes: {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    },
    
    whenToUse: 'Icons with 2-5 simple elements (arrows, checkmarks, basic shapes)'
  },

  // Fill Guidelines
  fills: {
    rules: [
      'Use solid fills for most icons',
      'NO gradients, patterns, or textures',
      'Monochrome (#000000) or single accent color',
      'Black fills work in both light and dark mode'
    ],
    
    whenToUse: 'Icons with 5+ elements or complex shapes'
  },

  // Element Count
  complexity: {
    simple: { 
      min: 2, 
      max: 5, 
      use: 'Basic UI icons (check, plus, minus, arrow, close)',
      example: 'Checkmark (2 lines), Plus (2 rects), Search (2 elements)'
    },
    medium: { 
      min: 5, 
      max: 10, 
      use: 'Standard application icons (user, lock, heart, bell)',
      example: 'User (2-3), Lock (3-4), Heart (3), Bell (3-4)'
    },
    complex: { 
      min: 10, 
      max: 15, 
      use: 'Detailed technical icons (gear, network, chart)',
      example: 'Gear (9), Chart (10-12), Network diagram (12-15)'
    },
    
    hardLimit: 15,
    rule: 'NEVER exceed 15 elements. If you need more, the design is too complex. Simplify.'
  },

  // Symmetry
  symmetry: {
    verticalAxis: 200,
    
    rules: [
      'Most icons should be vertically symmetric around x=200',
      'For symmetric icons: left element at x → right element at (400 - x)',
      'Use geometric relationships, not visual approximations',
      'Examples: User, Heart, Lock, Shield, Bell should all be symmetric'
    ],
    
    examples: {
      symmetric: ['user', 'heart', 'lock', 'shield', 'bell', 'gear'],
      asymmetric: ['search', 'arrow', 'play button']
    }
  },

  // Forbidden Attributes & Features
  forbidden: {
    attributes: [
      'class',
      'data-*',
      'style',
      'transform',
      'id',
      'preserveAspectRatio'
    ],
    
    visualEffects: [
      'filter',
      'gradients (linearGradient, radialGradient)',
      'patterns',
      'clipPath (unless absolutely essential)',
      'mask',
      'shadow effects',
      'blur effects'
    ],
    
    reasoning: 'These attributes pollute the SVG, break portability, and complicate rendering'
  },

  // Color Palette
  colors: {
    primary: '#000000',  // Black - works everywhere
    accent: '#ccff00',   // VEXURA brand green
    white: '#ffffff',    // For negative space
    
    rules: [
      'Default to monochrome (black only)',
      'Use accent color sparingly for highlights',
      'Never use more than 2-3 colors in one icon',
      'Ensure high contrast for accessibility'
    ]
  },

  // Validation Checklist
  validationChecklist: [
    'All coordinates within 0-400?',
    'Visual center near (200, 200)?',
    'Coordinates are multiples of 10?',
    'Element count under 15?',
    'Consistent stroke OR fill (not mixed)?',
    'No forbidden attributes?',
    'Symmetric (if applicable)?',
    'Passes 24px scale test (still recognizable when small)?'
  ]
};

/**
 * Get stroke width recommendation based on element count
 */
export function getRecommendedStrokeWidth(elementCount: number): number {
  if (elementCount <= 3) return styleGuide.strokes.regular;
  if (elementCount <= 5) return styleGuide.strokes.regular;
  return 0; // Use fills instead
}

/**
 * Validate coordinates against grid
 */
export function validateCoordinate(coord: number): boolean {
  return coord % styleGuide.coordinates.gridSize === 0;
}

/**
 * Snap coordinate to grid
 */
export function snapToGrid(coord: number): number {
  return Math.round(coord / styleGuide.coordinates.gridSize) * styleGuide.coordinates.gridSize;
}
