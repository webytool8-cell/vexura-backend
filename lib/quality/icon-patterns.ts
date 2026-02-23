/**
 * Icon Pattern References
 * Structural rules and examples for common icon types
 */

export const iconPatterns = {
  // USER/PROFILE ICONS
  user: {
    category: 'user-profile',
    keywords: ['user', 'profile', 'avatar', 'account', 'person', 'member'],
    
    rules: [
      'Use ONLY geometric shapes - circles and simple paths',
      'Head: Single circle, radius 40-60px, centered at x=200',
      'Body: Simple trapezoid or rounded shape below head',
      'NO facial features whatsoever (no eyes, nose, mouth, ears)',
      'NO realistic human proportions or anatomy',
      'NO hair, clothing details, or textures',
      'Maximum 2-3 elements total',
      'Think: app icon silhouette, NOT portrait'
    ],
    
    goodExample: {
      name: 'User Icon',
      width: 400,
      height: 400,
      elements: [
        {
          type: 'circle',
          cx: 200,
          cy: 160,
          r: 50,
          fill: '#000000'
        },
        {
          type: 'path',
          d: 'M 140 240 Q 140 220 200 220 Q 260 220 260 240 L 280 300 Q 280 320 200 320 Q 120 320 120 300 Z',
          fill: '#000000'
        }
      ]
    },
    
    strictlyForbidden: [
      'Eyes (circles or dots on head)',
      'Nose shape',
      'Mouth or smile',
      'Hair strands or style',
      'Realistic clothing',
      'Multiple circles for head construction',
      'Arms, hands, or legs',
      'Any attempt at facial expression',
      'Ears or facial outline details'
    ],
    
    commonMistakes: [
      'Adding two small circles for eyes - WRONG',
      'Drawing hair on top of head circle - WRONG',
      'Creating realistic body proportions - WRONG',
      'Using multiple elements for head - WRONG (use ONE circle)'
    ]
  },

  // LOCK/SECURITY ICONS
  lock: {
    category: 'security',
    keywords: ['lock', 'secure', 'password', 'private', 'protected', 'security'],
    
    rules: [
      'Shackle: Arc or two vertical lines with rounded top',
      'Body: Rectangle with rounded corners (rx=10-16)',
      'Keyhole: Small circle or vertical line in center',
      'Maximum 3-4 elements',
      'Centered at x=200, shackle above body'
    ],
    
    goodExample: {
      name: 'Lock Icon',
      width: 400,
      height: 400,
      elements: [
        {
          type: 'path',
          d: 'M 160 200 L 160 160 Q 160 120 200 120 Q 240 120 240 160 L 240 200',
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 16,
          strokeLinecap: 'round'
        },
        {
          type: 'rect',
          x: 140,
          y: 200,
          width: 120,
          height: 100,
          rx: 12,
          fill: '#000000'
        },
        {
          type: 'circle',
          cx: 200,
          cy: 240,
          r: 12,
          fill: '#ffffff'
        }
      ]
    },
    
    commonMistakes: [
      'Shackle not connecting properly to body',
      'Off-center composition',
      'Overly complex keyhole design'
    ]
  },

  // ROCKET/LAUNCH ICONS
  rocket: {
    category: 'startup-tech',
    keywords: ['rocket', 'launch', 'startup', 'speed', 'growth', 'takeoff'],
    
    rules: [
      'Nose: Triangle pointing up',
      'Body: Rectangle or rounded rectangle',
      'Fins: Two symmetric triangles at base',
      'Window: Optional circle on body',
      'Flame: Optional triangles below',
      'Maximum 5-7 elements',
      'Must be symmetric around x=200'
    ],
    
    goodExample: {
      name: 'Rocket Icon',
      width: 400,
      height: 400,
      elements: [
        {
          type: 'polygon',
          points: '200,100 170,180 230,180',
          fill: '#000000'
        },
        {
          type: 'rect',
          x: 170,
          y: 180,
          width: 60,
          height: 100,
          rx: 8,
          fill: '#000000'
        },
        {
          type: 'circle',
          cx: 200,
          cy: 220,
          r: 15,
          fill: '#ffffff'
        },
        {
          type: 'polygon',
          points: '150,280 170,320 170,280',
          fill: '#666666'
        },
        {
          type: 'polygon',
          points: '230,280 230,320 250,280',
          fill: '#666666'
        }
      ]
    }
  },

  // HEART/FAVORITE ICONS
  heart: {
    category: 'favorites-love',
    keywords: ['heart', 'like', 'love', 'favorite', 'bookmark', 'save'],
    
    rules: [
      'Use TWO circles for top lobes',
      'Connect with triangle or smooth path for bottom point',
      'Must be perfectly symmetric around x=200',
      'Maximum 3 elements',
      'Smooth, rounded appearance'
    ],
    
    goodExample: {
      name: 'Heart Icon',
      width: 400,
      height: 400,
      elements: [
        {
          type: 'circle',
          cx: 170,
          cy: 170,
          r: 40,
          fill: '#000000'
        },
        {
          type: 'circle',
          cx: 230,
          cy: 170,
          r: 40,
          fill: '#000000'
        },
        {
          type: 'polygon',
          points: '200,280 130,180 270,180',
          fill: '#000000'
        }
      ]
    },
    
    commonMistakes: [
      'Asymmetric circles',
      'Point not centered at x=200',
      'Overly complex curved paths instead of simple circles+triangle'
    ]
  },

  // GEAR/SETTINGS ICONS
  gear: {
    category: 'settings',
    keywords: ['gear', 'settings', 'config', 'options', 'preferences', 'cog'],
    
    rules: [
      'Center: Circle (radius ~40px)',
      'Teeth: 6-8 rectangles radiating outward',
      'Symmetric rotation around center',
      'Maximum 9 elements (1 center + 8 teeth)',
      'Teeth should be evenly spaced (45° apart for 8 teeth)'
    ],
    
    goodExample: {
      name: 'Gear Icon',
      width: 400,
      height: 400,
      elements: [
        {
          type: 'circle',
          cx: 200,
          cy: 200,
          r: 40,
          fill: '#000000'
        },
        // 4 teeth shown (would be 8 total, positioned at 45° intervals)
        {
          type: 'rect',
          x: 190,
          y: 120,
          width: 20,
          height: 40,
          fill: '#000000'
        },
        {
          type: 'rect',
          x: 260,
          y: 190,
          width: 40,
          height: 20,
          fill: '#000000'
        },
        {
          type: 'rect',
          x: 190,
          y: 260,
          width: 20,
          height: 40,
          fill: '#000000'
        },
        {
          type: 'rect',
          x: 120,
          y: 190,
          width: 40,
          height: 20,
          fill: '#000000'
        }
      ]
    },
    
    commonMistakes: [
      'Trying to create all teeth in a single complex path',
      'Uneven tooth spacing',
      'Too many or too few teeth'
    ]
  },

  // NOTIFICATION BELL
  bell: {
    category: 'notifications',
    keywords: ['bell', 'notification', 'alert', 'reminder', 'notify'],
    
    rules: [
      'Bell body: Trapezoid or curved path',
      'Top: Small circle (clapper mount)',
      'Bottom: Small horizontal rectangle or line (clapper)',
      'Maximum 3-4 elements',
      'Centered at x=200'
    ],
    
    goodExample: {
      name: 'Bell Icon',
      width: 400,
      height: 400,
      elements: [
        {
          type: 'circle',
          cx: 200,
          cy: 140,
          r: 8,
          fill: '#000000'
        },
        {
          type: 'path',
          d: 'M 160 160 Q 160 140 200 140 Q 240 140 240 160 L 250 240 Q 250 260 200 260 Q 150 260 150 240 Z',
          fill: '#000000'
        },
        {
          type: 'rect',
          x: 180,
          y: 270,
          width: 40,
          height: 8,
          rx: 4,
          fill: '#000000'
        }
      ]
    }
  },

  // SHIELD/SECURITY
  shield: {
    category: 'security',
    keywords: ['shield', 'protect', 'security', 'defense', 'safe'],
    
    rules: [
      'Shield shape: Pentagon or badge outline',
      'Point at bottom center',
      'Top should be flat or slightly curved',
      'Optional inner elements (checkmark, lock)',
      'Maximum 2-4 elements',
      'Symmetric around x=200'
    ],
    
    goodExample: {
      name: 'Shield Icon',
      width: 400,
      height: 400,
      elements: [
        {
          type: 'path',
          d: 'M 200 100 L 280 120 L 280 220 Q 280 260 200 300 Q 120 260 120 220 L 120 120 Z',
          fill: '#000000'
        }
      ]
    }
  },

  // SEARCH/MAGNIFYING GLASS
  search: {
    category: 'search',
    keywords: ['search', 'find', 'magnify', 'look', 'explore'],
    
    rules: [
      'Lens: Circle (radius ~50px)',
      'Handle: Line or rectangle at 45° angle',
      'Maximum 2 elements',
      'Handle extends from bottom-right of circle'
    ],
    
    goodExample: {
      name: 'Search Icon',
      width: 400,
      height: 400,
      elements: [
        {
          type: 'circle',
          cx: 180,
          cy: 180,
          r: 60,
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 16
        },
        {
          type: 'line',
          x1: 225,
          y1: 225,
          x2: 280,
          y2: 280,
          stroke: '#000000',
          strokeWidth: 16,
          strokeLinecap: 'round'
        }
      ]
    }
  },

  // MENU/HAMBURGER
  menu: {
    category: 'navigation',
    keywords: ['menu', 'hamburger', 'navigation', 'burger', 'bars'],
    
    rules: [
      'Three horizontal lines',
      'Evenly spaced vertically',
      'Same width (typically 120-160px)',
      'Centered at x=200',
      'Use rectangles with rounded corners'
    ],
    
    goodExample: {
      name: 'Menu Icon',
      width: 400,
      height: 400,
      elements: [
        {
          type: 'rect',
          x: 120,
          y: 160,
          width: 160,
          height: 16,
          rx: 8,
          fill: '#000000'
        },
        {
          type: 'rect',
          x: 120,
          y: 200,
          width: 160,
          height: 16,
          rx: 8,
          fill: '#000000'
        },
        {
          type: 'rect',
          x: 120,
          y: 240,
          width: 160,
          height: 16,
          rx: 8,
          fill: '#000000'
        }
      ]
    }
  },

  // DOWNLOAD ICON
  download: {
    category: 'actions',
    keywords: ['download', 'save', 'export', 'get'],
    
    rules: [
      'Arrow pointing down',
      'Base tray or line at bottom',
      'Maximum 3-4 elements',
      'Arrow should be centered'
    ],
    
    goodExample: {
      name: 'Download Icon',
      width: 400,
      height: 400,
      elements: [
        {
          type: 'line',
          x1: 200,
          y1: 120,
          x2: 200,
          y2: 240,
          stroke: '#000000',
          strokeWidth: 16,
          strokeLinecap: 'round'
        },
        {
          type: 'polygon',
          points: '200,260 160,220 240,220',
          fill: '#000000'
        },
        {
          type: 'rect',
          x: 140,
          y: 280,
          width: 120,
          height: 16,
          rx: 8,
          fill: '#000000'
        }
      ]
    }
  }
};

/**
 * Get pattern for a given prompt
 */
export function getPatternForPrompt(prompt: string): any | null {
  const lowerPrompt = prompt.toLowerCase();
  
  for (const [key, pattern] of Object.entries(iconPatterns)) {
    // Check if any keywords match
    const hasMatch = pattern.keywords.some(keyword => lowerPrompt.includes(keyword));
    if (hasMatch) {
      console.log(`✓ Pattern matched: ${pattern.category} for prompt: "${prompt}"`);
      return pattern;
    }
  }
  
  console.log(`✗ No specific pattern found for: "${prompt}"`);
  return null;
}
