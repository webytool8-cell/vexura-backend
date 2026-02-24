/**
 * Icon Validator & Auto-Fixer
 * Validates and corrects common issues in generated icons
 */

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  fixed?: any;
}

interface Element {
  type: string;
  [key: string]: any;
}

interface VectorData {
  name: string;
  width: number;
  height: number;
  elements: Element[];
}

/**
 * Main validation function
 */
export function validateAndFixIcon(vectorData: any): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    warnings: [],
    errors: [],
    fixed: null
  };

  // Deep clone to avoid mutating original
  const fixed = JSON.parse(JSON.stringify(vectorData));

  // Validation checks
  checkBasicStructure(fixed, result);
  checkElementCount(fixed, result);
  cleanAttributes(fixed, result);
  checkAndFixBounds(fixed, result);
  checkAndFixCentering(fixed, result);
  enforceCanonicalHeartGeometry(fixed, result);
  roundCoordinates(fixed, result);
  normalizeColors(fixed, result);
  checkStrokeFillConsistency(fixed, result);
  validatePaths(fixed, result);

  // If any errors, mark as invalid
  if (result.errors.length > 0) {
    result.isValid = false;
  }

  result.fixed = fixed;
  return result;
}

/**
 * Check basic structure
 */
function checkBasicStructure(data: any, result: ValidationResult) {
  if (!data.name) {
    result.errors.push('Missing "name" field');
  }
  
  if (!data.width || data.width !== 400) {
    result.warnings.push('Width should be 400');
    data.width = 400;
  }
  
  if (!data.height || data.height !== 400) {
    result.warnings.push('Height should be 400');
    data.height = 400;
  }
  
  if (!Array.isArray(data.elements)) {
    result.errors.push('Elements must be an array');
    data.elements = [];
  }
}

/**
 * Check element count
 */
function checkElementCount(data: VectorData, result: ValidationResult) {
  const count = data.elements.length;
  
  if (count === 0) {
    result.errors.push('Icon has no elements');
  } else if (count > 15) {
    result.warnings.push(`Icon has ${count} elements (recommended: 3-15). Consider simplifying.`);
  }
}

/**
 * Clean unwanted attributes
 */
function cleanAttributes(data: VectorData & Record<string, any>, result: ValidationResult) {
  const forbiddenAttrs = ['class', 'data-id', 'style', 'transform', 'preserveAspectRatio'];
  let cleaned = 0;

  forbiddenAttrs.forEach(attr => {
    if (data[attr] !== undefined) {
      delete data[attr];
      cleaned++;
    }
  });
  
  data.elements.forEach(el => {
    forbiddenAttrs.forEach(attr => {
      if (el[attr] !== undefined) {
        delete el[attr];
        cleaned++;
      }
    });
  });
  
  if (cleaned > 0) {
    result.warnings.push(`Removed ${cleaned} forbidden attributes (class, data-id, etc.)`);
  }
}

/**
 * Check and fix bounds (elements outside viewBox)
 */
function checkAndFixBounds(data: VectorData, result: ValidationResult) {
  const CANVAS_SIZE = 400;
  const PADDING = 40;
  const MIN = PADDING;
  const MAX = CANVAS_SIZE - PADDING;
  
  let outsideCount = 0;
  let safeZoneViolations = 0;
  
  data.elements.forEach((el, idx) => {
    const bounds = getElementBounds(el);
    
    if (!bounds) return;
    
    // Check if outside viewBox (CRITICAL)
    if (bounds.minX < 0 || bounds.maxX > CANVAS_SIZE || 
        bounds.minY < 0 || bounds.maxY > CANVAS_SIZE) {
      result.errors.push(`Element ${idx} (${el.type}) extends outside 400x400 viewBox`);
      outsideCount++;
    }
    
    // Check if violates padding (WARNING)
    if (bounds.minX < MIN || bounds.maxX > MAX || 
        bounds.minY < MIN || bounds.maxY > MAX) {
      result.warnings.push(`Element ${idx} (${el.type}) violates 40px padding guideline`);
      safeZoneViolations++;
    }
  });
  
  if (outsideCount > 0 || safeZoneViolations > 0) {
    // Auto-scale to safe zone, not just viewBox
    scaleToFit(data, result);
  }
}

/**
 * Get bounding box of an element
 */
function getElementBounds(el: Element): { minX: number; maxX: number; minY: number; maxY: number } | null {
  switch (el.type) {
    case 'circle':
      return {
        minX: (el.cx || 0) - (el.r || 0),
        maxX: (el.cx || 0) + (el.r || 0),
        minY: (el.cy || 0) - (el.r || 0),
        maxY: (el.cy || 0) + (el.r || 0)
      };
      
    case 'rect':
      return {
        minX: el.x || 0,
        maxX: (el.x || 0) + (el.width || 0),
        minY: el.y || 0,
        maxY: (el.y || 0) + (el.height || 0)
      };
      
    case 'line':
      return {
        minX: Math.min(el.x1 || 0, el.x2 || 0),
        maxX: Math.max(el.x1 || 0, el.x2 || 0),
        minY: Math.min(el.y1 || 0, el.y2 || 0),
        maxY: Math.max(el.y1 || 0, el.y2 || 0)
      };
      
    case 'polygon':
    case 'polyline':
      if (!el.points) return null;
      const coords = parsePoints(el.points);
      if (coords.length === 0) return null;
      return {
        minX: Math.min(...coords.map(c => c.x)),
        maxX: Math.max(...coords.map(c => c.x)),
        minY: Math.min(...coords.map(c => c.y)),
        maxY: Math.max(...coords.map(c => c.y))
      };
      
    case 'path':
      // Rough approximation from path data
      if (!el.d) return null;
      const pathCoords = extractPathCoordinates(el.d);
      if (pathCoords.length === 0) return null;
      return {
        minX: Math.min(...pathCoords.map(c => c.x)),
        maxX: Math.max(...pathCoords.map(c => c.x)),
        minY: Math.min(...pathCoords.map(c => c.y)),
        maxY: Math.max(...pathCoords.map(c => c.y))
      };
      
    default:
      return null;
  }
}

/**
 * Parse points string to coordinates
 */
function parsePoints(points: string): { x: number; y: number }[] {
  const coords: { x: number; y: number }[] = [];
  const pairs = points.trim().split(/[\s,]+/);
  
  for (let i = 0; i < pairs.length - 1; i += 2) {
    coords.push({
      x: parseFloat(pairs[i]),
      y: parseFloat(pairs[i + 1])
    });
  }
  
  return coords;
}

/**
 * Extract coordinates from path data (simplified)
 */
function extractPathCoordinates(d: string): { x: number; y: number }[] {
  const coords: { x: number; y: number }[] = [];
  const matches = d.match(/-?\d+\.?\d*/g);
  
  if (!matches) return coords;
  
  for (let i = 0; i < matches.length - 1; i += 2) {
    coords.push({
      x: parseFloat(matches[i]),
      y: parseFloat(matches[i + 1])
    });
  }
  
  return coords;
}

/**
 * Scale entire icon to fit within canvas
 */
function scaleToFit(data: VectorData, result: ValidationResult) {
  const CANVAS_SIZE = 400;
  const PADDING = 40;
  
  // Calculate overall bounding box
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  data.elements.forEach(el => {
    const bounds = getElementBounds(el);
    if (bounds) {
      minX = Math.min(minX, bounds.minX);
      maxX = Math.max(maxX, bounds.maxX);
      minY = Math.min(minY, bounds.minY);
      maxY = Math.max(maxY, bounds.maxY);
    }
  });
  
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const availableWidth = CANVAS_SIZE - (PADDING * 2);
  const availableHeight = CANVAS_SIZE - (PADDING * 2);
  
  const scaleX = availableWidth / contentWidth;
  const scaleY = availableHeight / contentHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Never scale up
  
  // Calculate translation to center
  const scaledWidth = contentWidth * scale;
  const scaledHeight = contentHeight * scale;
  const translateX = PADDING + (availableWidth - scaledWidth) / 2 - minX * scale;
  const translateY = PADDING + (availableHeight - scaledHeight) / 2 - minY * scale;
  
  // Apply transformation to all elements
  data.elements.forEach(el => {
    scaleAndTranslateElement(el, scale, translateX, translateY);
  });
  
  result.warnings.push(`Auto-scaled icon to fit (scale: ${scale.toFixed(2)})`);
}

/**
 * Scale and translate an element
 */
function scaleAndTranslateElement(el: Element, scale: number, tx: number, ty: number) {
  switch (el.type) {
    case 'circle':
      if (el.cx !== undefined) el.cx = el.cx * scale + tx;
      if (el.cy !== undefined) el.cy = el.cy * scale + ty;
      if (el.r !== undefined) el.r = el.r * scale;
      break;
      
    case 'rect':
      if (el.x !== undefined) el.x = el.x * scale + tx;
      if (el.y !== undefined) el.y = el.y * scale + ty;
      if (el.width !== undefined) el.width = el.width * scale;
      if (el.height !== undefined) el.height = el.height * scale;
      break;
      
    case 'line':
      if (el.x1 !== undefined) el.x1 = el.x1 * scale + tx;
      if (el.y1 !== undefined) el.y1 = el.y1 * scale + ty;
      if (el.x2 !== undefined) el.x2 = el.x2 * scale + tx;
      if (el.y2 !== undefined) el.y2 = el.y2 * scale + ty;
      break;
      
    case 'polygon':
    case 'polyline':
      if (el.points) {
        const coords = parsePoints(el.points);
        el.points = coords.map(c => 
          `${c.x * scale + tx},${c.y * scale + ty}`
        ).join(' ');
      }
      break;
      
    case 'path':
      if (el.d) {
        el.d = scalePathData(el.d, scale, tx, ty);
      }
      break;
  }
  
  // Scale stroke width if present
  if (el.strokeWidth !== undefined) {
    el.strokeWidth = el.strokeWidth * scale;
  }
  if (el['stroke-width'] !== undefined) {
    el['stroke-width'] = el['stroke-width'] * scale;
  }
}

/**
 * Scale path data (simplified)
 */
function scalePathData(d: string, scale: number, tx: number, ty: number): string {
  return d.replace(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, (match, x, y) => {
    const newX = parseFloat(x) * scale + tx;
    const newY = parseFloat(y) * scale + ty;
    return `${newX} ${newY}`;
  });
}

/**
 * Check and fix centering
 */
function checkAndFixCentering(data: VectorData, result: ValidationResult) {
  // Calculate visual center
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  data.elements.forEach(el => {
    const bounds = getElementBounds(el);
    if (bounds) {
      minX = Math.min(minX, bounds.minX);
      maxX = Math.max(maxX, bounds.maxX);
      minY = Math.min(minY, bounds.minY);
      maxY = Math.max(maxY, bounds.maxY);
    }
  });
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const idealCenter = 200;
  
  const offsetX = Math.abs(centerX - idealCenter);
  const offsetY = Math.abs(centerY - idealCenter);
  
  // If off-center by more than 20px, auto-translate and warn
  if (offsetX > 20 || offsetY > 20) {
    result.warnings.push(`Icon off-center: visual center at (${centerX.toFixed(0)}, ${centerY.toFixed(0)}), should be near (200, 200)`);

    const dx = idealCenter - centerX;
    const dy = idealCenter - centerY;

    data.elements.forEach(el => {
      scaleAndTranslateElement(el, 1, dx, dy);
    });

    result.warnings.push('Auto-centered icon composition to (200, 200)');
  }
}

/**
 * Normalize classic heart geometry if icon looks like two circles + one polygon.
 */
function enforceCanonicalHeartGeometry(data: VectorData, result: ValidationResult) {
  const circles = data.elements.filter(el => el.type === 'circle');
  const polygons = data.elements.filter(el => el.type === 'polygon');

  if (circles.length !== 2 || polygons.length !== 1) {
    return;
  }

  const polygon = polygons[0];
  const points = typeof polygon.points === 'string' ? parsePoints(polygon.points) : [];

  const hasComplexBottom = points.length > 3;
  const circlesAreAsymmetric = Math.abs((circles[0].cx || 0) + (circles[1].cx || 0) - 400) > 10;

  if (hasComplexBottom || circlesAreAsymmetric) {
    circles[0].cx = 170;
    circles[0].cy = 180;
    circles[0].r = 60;

    circles[1].cx = 230;
    circles[1].cy = 180;
    circles[1].r = 60;

    polygon.points = '200,340 120,240 280,240';

    result.warnings.push('Detected malformed heart geometry; auto-corrected to symmetric 2-circle + triangle structure');
  }
}

/**
 * Round coordinates to nearest 10
 */
function roundCoordinates(data: VectorData, result: ValidationResult) {
  let rounded = 0;
  
  data.elements.forEach(el => {
    const numericProps = ['cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2'];
    
    numericProps.forEach(prop => {
      if (el[prop] !== undefined && typeof el[prop] === 'number') {
        const original = el[prop];
        el[prop] = Math.round(el[prop] / 10) * 10;
        if (original !== el[prop]) rounded++;
      }
    });

    if (typeof el.points === 'string') {
      const roundedPoints = parsePoints(el.points)
        .map(c => `${Math.round(c.x / 10) * 10},${Math.round(c.y / 10) * 10}`)
        .join(' ');
      if (roundedPoints !== el.points) {
        el.points = roundedPoints;
        rounded++;
      }
    }
  });
  
  if (rounded > 0) {
    result.warnings.push(`Rounded ${rounded} coordinates to nearest 10 for pixel-perfect scaling`);
  }
}

/**
 * Normalize icon colors to monochrome black/white defaults.
 */
function normalizeColors(data: VectorData, result: ValidationResult) {
  let normalized = 0;

  data.elements.forEach(el => {
    if (el.fill && el.fill !== 'none' && el.fill.toLowerCase() !== '#000000' && el.fill.toLowerCase() !== '#ffffff') {
      el.fill = '#000000';
      normalized++;
    }

    if (el.stroke && el.stroke !== 'none' && el.stroke.toLowerCase() !== '#000000' && el.stroke.toLowerCase() !== '#ffffff') {
      el.stroke = '#000000';
      normalized++;
    }
  });

  if (normalized > 0) {
    result.warnings.push(`Normalized ${normalized} colors to monochrome palette (#000000/#ffffff)`);
  }
}

/**
 * Check stroke/fill consistency
 */
function checkStrokeFillConsistency(data: VectorData, result: ValidationResult) {
  let hasStrokes = 0;
  let hasFills = 0;
  
  data.elements.forEach(el => {
    if (el.stroke && el.stroke !== 'none') hasStrokes++;
    if (el.fill && el.fill !== 'none') hasFills++;
  });
  
  if (hasStrokes > 0 && hasFills > 0) {
    result.warnings.push('Icon mixes strokes and fills. Recommended: use only strokes OR only fills.');
  }
}

/**
 * Validate path data
 */
function validatePaths(data: VectorData, result: ValidationResult) {
  data.elements.forEach((el, idx) => {
    if (el.type === 'path') {
      if (!el.d) {
        result.errors.push(`Path element ${idx} missing 'd' attribute`);
        return;
      }
      
      // Count commands
      const commands = (el.d.match(/[MLHVCSQTAZ]/gi) || []).length;
      if (commands > 20) {
        result.warnings.push(`Path element ${idx} has ${commands} commands (recommended: <20). Consider simplifying.`);
      }
      
      // Check for malformed commands
      if (el.d.includes('NaN') || el.d.includes('undefined')) {
        result.errors.push(`Path element ${idx} has malformed data (NaN/undefined)`);
      }
    }
  });
}

/**
 * Generate a quality score
 */
export function calculateQualityScore(validationResult: ValidationResult): number {
  let score = 100;
  
  // Deduct for errors (critical)
  score -= validationResult.errors.length * 20;
  
  // Deduct for warnings (minor)
  score -= validationResult.warnings.length * 5;
  
  return Math.max(0, Math.min(100, score));
}
