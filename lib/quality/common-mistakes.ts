/**
 * Common Generation Mistakes and How to Fix Them
 */

export const commonMistakes = {
  // CRITICAL MISTAKES (Auto-reject)
  critical: {
    outsideViewBox: {
      severity: 'CRITICAL',
      problem: 'Elements extend beyond 400x400 canvas',
      examples: [
        'Path with y=420 when viewBox is 0-400',
        'Circle at cx=450 (outside canvas)',
        'Polygon points including 390, 440'
      ],
      detection: 'Any coordinate < 0 or > 400',
      solution: 'Scale entire icon to fit within canvas with 40px padding',
      autoFix: true,
      fixMethod: 'scaleToFit()'
    },

    brokenPaths: {
      severity: 'CRITICAL',
      problem: 'Path commands create malformed or nonsensical shapes',
      examples: [
        'M 200 100 L 200 100 (line to same point)',
        'Arc with wrong radius creating distorted curve',
        'Unclosed path missing Z command'
      ],
      detection: 'NaN values, duplicate consecutive points, malformed arc',
      solution: 'Regenerate with simpler path or use primitives instead',
      autoFix: false,
      fixMethod: 'reject_and_regenerate'
    },

    emptyElements: {
      severity: 'CRITICAL',
      problem: 'Element has no visual output (no stroke and no fill)',
      examples: [
        'Circle with fill="none" and stroke="none"',
        'Path with neither fill nor stroke'
      ],
      detection: 'Element has fill="none" AND stroke="none"',
      solution: 'Add either fill or stroke',
      autoFix: true,
      fixMethod: 'Add fill="#000000" if missing both'
    }
  },

  // MAJOR MISTAKES (Auto-fix with warning)
  major: {
    offCenter: {
      severity: 'MAJOR',
      problem: 'Icon visually off-center',
      examples: [
        'User icon head at cx=270 instead of cx=200',
        'Lock body starting at x=209 instead of centered',
        'Heart with left circle at cx=150 but right at cx=250 (asymmetric)'
      ],
      detection: 'Visual center more than 20px from (200, 200)',
      solution: 'Calculate bounding box, then translate all elements to center',
      autoFix: true,
      fixMethod: 'centerIcon()'
    },

    coordinateChaos: {
      severity: 'MAJOR',
      problem: 'Random decimal coordinates that don\'t align to grid',
      examples: [
        'cx: 226.73849',
        'Points at 152.3, 245.7, 319.2 (no pattern)',
        'Path coords like 197.5, 203.8, 188.1'
      ],
      detection: 'Coordinates not multiples of 10',
      solution: 'Round all coordinates to nearest 10',
      autoFix: true,
      fixMethod: 'roundCoordinates()'
    },

    wrongViewBox: {
      severity: 'MAJOR',
      problem: 'ViewBox not set to 0 0 400 400',
      examples: [
        'viewBox="0 0 100 100"',
        'viewBox="0 0 500 500"',
        'Missing viewBox entirely'
      ],
      detection: 'width !== 400 || height !== 400',
      solution: 'Set width=400, height=400',
      autoFix: true,
      fixMethod: 'normalizeViewBox()'
    }
  },

  // STYLE MISTAKES (Warnings)
  style: {
    mixedStyles: {
      severity: 'WARNING',
      problem: 'Mixing strokes and fills in same icon',
      examples: [
        'Circle with stroke="#000", Rectangle with fill="#000"',
        'Some elements stroked, others filled'
      ],
      detection: 'Some elements have stroke, others have fill',
      solution: 'Choose ONE approach: all strokes OR all fills',
      autoFix: false,
      recommendation: 'Use fills for icons with 5+ elements, strokes for simpler icons'
    },

    thinStrokes: {
      severity: 'WARNING',
      problem: 'Stroke width too thin, will disappear when scaled',
      examples: [
        'stroke-width="2" on 400px canvas',
        'stroke-width="1"'
      ],
      detection: 'stroke-width < 8',
      solution: 'Use minimum 8px stroke width, recommended 16px',
      autoFix: true,
      fixMethod: 'Set stroke-width to 16'
    },

    tooManyElements: {
      severity: 'WARNING',
      problem: 'Icon has too many elements',
      examples: [
        'User icon with 20+ circles trying to show realistic details',
        'Gear with 30 individual teeth elements'
      ],
      detection: 'Element count > 15',
      solution: 'Simplify design, combine elements, use simpler primitives',
      autoFix: false,
      recommendation: 'Redesign with fewer elements'
    }
  },

  // ICON-SPECIFIC MISTAKES
  iconSpecific: {
    userIcon: {
      problem: 'Realistic human features on user icon',
      examples: [
        'Two small circles for eyes',
        'Line or curve for mouth/smile',
        'Multiple circles trying to show hair',
        'Detailed ears or facial outline'
      ],
      detection: 'Keywords: user, person, avatar, profile',
      criticalRule: 'User icons are SYMBOLS not PORTRAITS',
      solution: 'Use ONLY: 1 circle (head) + 1 path/shape (body). NO facial features.',
      strictlyForbidden: [
        'Any circles inside head circle (eyes)',
        'Any paths on head (facial features)',
        'More than 3 total elements',
        'Realistic body proportions'
      ]
    },

    lockIcon: {
      problem: 'Shackle not properly formed or connected',
      examples: [
        'Arc command with wrong radius',
        'Shackle floating above lock body',
        'Asymmetric shackle'
      ],
      detection: 'Keywords: lock, secure, password',
      solution: 'Use proper arc: M x1 y1 L x1 y2 Q x1 ytop xcenter ytop Q x2 ytop x2 y2 L x2 y1'
    },

    heartIcon: {
      problem: 'Asymmetric or overly complex heart',
      examples: [
        'Left circle different size than right',
        'Complex bezier curves instead of simple circles+triangle',
        'Not centered at x=200'
      ],
      detection: 'Keywords: heart, love, favorite',
      solution: 'Use exactly 3 elements: 2 symmetric circles + 1 triangle/path for point'
    }
  }
};

/**
 * Get mistakes relevant to a specific icon type
 */
export function getMistakesForIconType(prompt: string): string[] {
  const lowerPrompt = prompt.toLowerCase();
  const mistakes: string[] = [];

  // Add universal critical mistakes
  mistakes.push('Elements must stay within 0-400 viewBox');
  mistakes.push('Coordinates must be multiples of 10');
  mistakes.push('Maximum 15 elements');

  // Add icon-specific mistakes
  if (lowerPrompt.match(/user|person|profile|avatar/)) {
    mistakes.push('NO FACIAL FEATURES (eyes, nose, mouth)');
    mistakes.push('NO realistic human proportions');
    mistakes.push('Use only: 1 circle (head) + 1 shape (body)');
  }

  if (lowerPrompt.match(/lock|secure|password/)) {
    mistakes.push('Shackle must properly connect to lock body');
    mistakes.push('Must be symmetric');
  }

  if (lowerPrompt.match(/heart|love|favorite/)) {
    mistakes.push('Must use exactly 2 symmetric circles for top lobes');
    mistakes.push('Must be centered at x=200');
  }

  return mistakes;
}
