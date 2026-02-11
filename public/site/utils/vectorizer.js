/**
 * Vectorizer Utility
 * Handles client-side raster-to-vector conversion using ImageTracerJS.
 * Upgraded to support Color Segmentation, Region Masking (internal), and Style Enforcement.
 */

window.Vectorizer = {
    /**
     * Traces a raster image File object to SVG data
     * @param {File} file - The image file to trace
     * @param {Object} config - Vectorization options
     * @param {string} config.mode - 'icon' | 'element' | 'shape'
     * @param {string} config.style - 'minimal' | 'organic' | 'exact'
     * @param {string} config.colors - 'bw' | 'low' | 'medium' | 'high'
     * @returns {Promise<{svg: string, elements: Array}>}
     */
    trace: function(file, config = {}) {
        const {
            mode = 'icon',
            style = 'minimal',
            colors = 'low'
        } = config;

        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error("No file provided"));
                return;
            }

            if (!file.type.startsWith('image/')) {
                reject(new Error("File must be an image"));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this._processImage(img, { mode, style, colors })
                        .then(resolve)
                        .catch(reject);
                };
                img.onerror = () => reject(new Error("Failed to load image"));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
        });
    },

    /**
     * Internal processing: Resizes, preprocesses, and traces the image
     */
    _processImage: function(img, config) {
        return new Promise((resolve, reject) => {
            // 1. Setup Canvas for Preprocessing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Limit size to max 1024px for performance
            const MAX_SIZE = 1024;
            let width = img.width;
            let height = img.height;
            
            if (width > MAX_SIZE || height > MAX_SIZE) {
                const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw image (on white background to handle transparency)
            ctx.fillStyle = '#FFFFFF'; 
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            const imageData = ctx.getImageData(0, 0, width, height);

            // 2. Configure ImageTracer options based on "Smart Vectorization" guide
            const tracerOptions = this._getTracerOptions(config);

            try {
                // 3. Trace using ImageTracer
                const svgString = window.ImageTracer.imagedataToSVG(imageData, tracerOptions);
                
                // 4. Normalize & Parse
                const result = this._normalizeOutput(svgString, tracerOptions);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    },

    /**
     * Maps high-level user constraints to low-level ImageTracer options
     */
    _getTracerOptions: function({ mode, style, colors }) {
        const options = {
            // Defaults
            ltres: 1,
            qtres: 1,
            pathomit: 8,
            rightangleenhance: false,
            
            // Color defaults
            colorsampling: 2, // Deterministic sampling
            numberofcolors: 4,
            mincolorratio: 0,
            colorquantcycles: 3,
            
            // Rendering
            strokewidth: 0,
            linefilter: false,
            scale: 1,
            roundcoords: 1,
            viewbox: true,
            desc: false,
            lcpr: 0,
            qcpr: 0,
            blurradius: 0,
            blurdelta: 20
        };

        // --- STEP 2: Color Segmentation Configuration ---
        if (colors === 'bw') {
            options.colorsampling = 0; // Disabled (palette defined below)
            options.numberofcolors = 2;
            options.pal = [{r:0,g:0,b:0,a:255}, {r:255,g:255,b:255,a:255}]; // Force B&W
        } else if (colors === 'low') {
            options.numberofcolors = 4;
            options.mincolorratio = 0.02; // Ignore tiny color specs
        } else if (colors === 'medium') {
            options.numberofcolors = 8;
            options.mincolorratio = 0.01;
        } else if (colors === 'high') {
            options.numberofcolors = 16; // Max reasonable for vector
            options.mincolorratio = 0.005;
        }

        // --- STEP 4: Vector Tracing (Per Region) Configuration ---
        
        // Mode: Controls Geometry Simplification
        if (mode === 'icon') {
            options.ltres = 1;      // Linear error threshold (Higher = simpler)
            options.qtres = 1;      // Quadratic error threshold
            options.pathomit = 10;  // Ignore small paths (noise reduction)
            options.rightangleenhance = true; // Attempt to fix corners
        } else if (mode === 'element') {
            options.ltres = 0.5;
            options.qtres = 0.5;
            options.pathomit = 4;
        } else if (mode === 'shape') {
            options.ltres = 0.1;    // Very precise
            options.qtres = 0.1;
            options.pathomit = 1;   // Keep detail
        }

        // Style: Controls smoothing and post-processing "feel"
        if (style === 'minimal') {
            options.blurradius = 0; // Sharp
            options.blurdelta = 20; 
        } else if (style === 'organic') {
            options.blurradius = 2; // Pre-blur for smoother curves
            options.blurdelta = 10;
        } else if (style === 'exact') {
            options.blurradius = 0;
            options.roundcoords = 2; // More precision
        }

        return options;
    },

    /**
     * Normalizes the raw SVG string and extracts elements for the editor
     */
    _normalizeOutput: function(rawSvg) {
        // Create a temporary DOM parser to read the SVG
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawSvg, "image/svg+xml");
        const svgEl = doc.querySelector('svg');
        
        if (!svgEl) {
            throw new Error("Tracing failed to produce valid SVG");
        }

        // Fix ViewBox to standard 400x400 for consistency with our app
        const oldWidth = parseFloat(svgEl.getAttribute('width') || 1024);
        const oldHeight = parseFloat(svgEl.getAttribute('height') || 1024);
        
        // Remove width/height attrs
        svgEl.removeAttribute('width');
        svgEl.removeAttribute('height');
        svgEl.setAttribute('viewBox', '0 0 400 400');
        
        // Extract Paths
        const paths = Array.from(svgEl.querySelectorAll('path'));
        const elements = [];
        
        // Scale factor
        const scaleX = 400 / oldWidth;
        const scaleY = 400 / oldHeight;
        // Keep aspect ratio
        const scale = Math.min(scaleX, scaleY);
        
        // Center offset
        const offsetX = (400 - (oldWidth * scale)) / 2;
        const offsetY = (400 - (oldHeight * scale)) / 2;

        paths.forEach((p, i) => {
            const d = p.getAttribute('d');
            const fill = p.getAttribute('fill');
            const opacity = p.getAttribute('fill-opacity'); // ImageTracer sometimes uses this
            
            // --- STEP 6: SVG Normalization ---
            
            // Skip white/transparent background paths if they act as canvas
            // Heuristic: If it covers most of the area and is white/light
            // (Simplified: Just check color for now)
            if (fill === 'rgb(255,255,255)' || fill === '#ffffff' || fill === 'white' || fill === 'rgba(255,255,255,1)') {
                // Check if user wants background removal? Assuming yes for "Vector" tool
                 return;
            }

            // Convert RGB to Hex if needed, though browsers handle RGB fine.
            // ImageTracer outputs RGB usually.

            elements.push({
                id: `trace-path-${i}-${Date.now()}`,
                type: 'path',
                d: d,
                fill: fill || '#000000',
                stroke: 'none',
                opacity: opacity ? parseFloat(opacity) : 1,
                transform: `translate(${offsetX}, ${offsetY}) scale(${scale})` // Apply normalization transform
            });
        });

        // Re-construct clean SVG string
        const cleanSvg = `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            ${elements.map(el => `<path d="${el.d}" fill="${el.fill}" opacity="${el.opacity}" transform="${el.transform}" />`).join('')}
        </svg>`;

        return {
            svg: cleanSvg,
            elements: elements,
            source: 'upload'
        };
    }
};