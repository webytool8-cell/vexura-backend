/**
 * Image Export Utilities
 * Handles conversion of SVG nodes to raster images (PNG, JPG)
 */

window.ImageUtils = {
    /**
     * Downloads an SVG element as an image
     * @param {SVGElement} svgElement - The DOM node of the SVG
     * @param {string} filename - Output filename (without extension)
     * @param {string} format - 'png' | 'jpeg'
     * @param {number} scale - Scale factor (1, 2, 4)
     * @param {string} backgroundColor - Background color for JPG/PNG
     */
    downloadSvgAsImage: function(svgElement, filename, format = 'png', scale = 1, backgroundColor = '#ffffff') {
        return new Promise((resolve, reject) => {
            try {
                // 1. Serialize SVG
                const serializer = new XMLSerializer();
                let svgString = serializer.serializeToString(svgElement);
                
                // Get dimensions
                const width = 400; // Fixed base size from our system
                const height = 400;
                
                // 2. Create Image
                const img = new Image();
                const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                
                img.onload = () => {
                    // 3. Draw to Canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = width * scale;
                    canvas.height = height * scale;
                    const ctx = canvas.getContext('2d');
                    
                    // Fill background
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw image
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // 4. Download
                    const link = document.createElement('a');
                    link.download = `${filename}@${scale}x.${format}`;
                    link.href = canvas.toDataURL(`image/${format}`, 0.9);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    URL.revokeObjectURL(url);
                    resolve();
                };
                
                img.onerror = (e) => {
                    URL.revokeObjectURL(url);
                    reject(e);
                };
                
                img.src = url;
            } catch (err) {
                reject(err);
            }
        });
    }
};