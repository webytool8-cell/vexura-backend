/**
 * Animation Engine
 * analyzing vector structure to create intelligent, grouped motion.
 */

window.AnimationEngine = {
    /**
     * Main entry point to generate animation configuration
     * @param {Array} elements - Vector elements
     * @returns {Object} Animation configuration
     */
    generateConfig: function(elements) {
        if (!elements || elements.length === 0) return null;

        // 1. Spatial Grouping
        const groups = this.groupElementsByProximity(elements);
        
        // 2. Assign Behaviors
        const tracks = groups.map((group, index) => {
            return this.assignBehaviorToGroup(group, index, groups.length);
        });

        return {
            fps: 60,
            duration: 6, // seconds for a full loop
            tracks: tracks
        };
    },

    /**
     * Groups elements that are spatially close or overlapping
     */
    groupElementsByProximity: function(elements) {
        // 1. Calculate bounding boxes for all elements
        const nodes = elements.map(el => {
            // Rough bbox estimation based on type
            let bbox = { x: 0, y: 0, w: 0, h: 0 };
            
            if (el.cx !== undefined) { // Circle/Ellipse
                const rx = el.rx || el.r || 0;
                const ry = el.ry || el.r || 0;
                bbox = { x: el.cx - rx, y: el.cy - ry, w: rx * 2, h: ry * 2 };
            } else if (el.x !== undefined) { // Rect
                bbox = { x: el.x, y: el.y, w: el.width || 0, h: el.height || 0 };
            } else if (el.points) { // Polygon
                // Simple parsing "x,y x,y"
                const points = el.points.split(/[\s,]+/).map(Number);
                const xs = points.filter((_, i) => i % 2 === 0);
                const ys = points.filter((_, i) => i % 2 !== 0);
                const minX = Math.min(...xs);
                const maxX = Math.max(...xs);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);
                bbox = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
            } else if (el.d) { // Path - Hard to guess without SVG DOM, assume centerish
                // For paths, we often treat them as singletons unless we do complex parsing.
                // Fallback: Assume it's a "detail" element.
                bbox = { x: 200, y: 200, w: 10, h: 10, isUnknown: true }; 
            }

            return { id: el.id, bbox, area: bbox.w * bbox.h, el };
        });

        // 2. Simple clustering
        // If bounding boxes intersect or are within threshold, group them
        const groups = [];
        const processed = new Set();
        const THRESHOLD = 20; // px

        nodes.forEach((node, i) => {
            if (processed.has(node.id)) return;

            const currentGroup = [node];
            processed.add(node.id);

            // Look for neighbors
            // Simple O(N^2) is fine for N < 50 elements usually
            let changed = true;
            while(changed) {
                changed = false;
                nodes.forEach(peer => {
                    if (processed.has(peer.id)) return;
                    
                    // Check intersection with any in currentGroup
                    const isConnected = currentGroup.some(member => {
                        return this.checkIntersection(member.bbox, peer.bbox, THRESHOLD);
                    });

                    if (isConnected) {
                        currentGroup.push(peer);
                        processed.add(peer.id);
                        changed = true;
                    }
                });
            }

            groups.push(currentGroup);
        });

        return groups;
    },

    checkIntersection: function(a, b, pad) {
        return (a.x < b.x + b.w + pad) && 
               (a.x + a.w + pad > b.x) && 
               (a.y < b.y + b.h + pad) && 
               (a.y + a.h + pad > b.y);
    },

    assignBehaviorToGroup: function(group, index, totalGroups) {
        // Calculate group metrics
        const totalArea = group.reduce((sum, n) => sum + n.area, 0);
        const center = {
            x: group.reduce((sum, n) => sum + (n.bbox.x + n.bbox.w/2), 0) / group.length,
            y: group.reduce((sum, n) => sum + (n.bbox.y + n.bbox.h/2), 0) / group.length
        };

        const targetIds = group.map(n => n.id);
        const isMainSubject = totalArea > 20000; // heuristic for "big central thing"

        if (isMainSubject) {
            // Main subject: Subtle breathing or slow float
            return {
                targetIds,
                type: 'breathe',
                params: {
                    scaleMin: 0.98,
                    scaleMax: 1.02,
                    duration: 6,
                    delay: 0
                }
            };
        } else {
            // Floating elements
            // Vary phase based on position
            const phase = (center.x + center.y) % 3; 
            
            return {
                targetIds,
                type: 'float',
                params: {
                    yOffset: 10 + (Math.random() * 10),
                    duration: 3 + (Math.random() * 2),
                    delay: Math.random() * -2,
                    rotation: Math.random() > 0.5 ? 5 : -5
                }
            };
        }
    },

    /**
     * Converts configuration to CSS Keyframes and Classes
     */
    generateCSS: function(config) {
        let styles = '';
        
        // Define keyframes
        styles += `
            @keyframes anim-breathe {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            @keyframes anim-float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-15px) rotate(2deg); }
            }
        `;

        return styles;
    }
};