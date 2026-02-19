/**
 * Image & File Export Utilities
 */

window.ImageUtils = {
  /**
   * Download SVG as raster image
   */
  downloadSvgAsImage: function (
    svgElement,
    filename,
    format = "png",
    scale = 1,
    backgroundColor = "#ffffff"
  ) {
    return new Promise((resolve, reject) => {
      try {
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);

        const width = 400;
        const height = 400;

        const img = new Image();
        const svgBlob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = width * scale;
          canvas.height = height * scale;

          const ctx = canvas.getContext("2d");

          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const link = document.createElement("a");
          link.download = `${filename}@${scale}x.${format}`;
          link.href = canvas.toDataURL(`image/${format}`, 0.92);

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
  },

  /**
   * Download raw SVG
   */
  downloadSvg: function (svgElement, filename) {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

/**
 * Download enriched JSON vector data (Marketplace Ready)
 */
downloadJson: function (data, filename) {
  const enrichedExport = {
    meta: {
      title: data.name || filename,
      description: `Premium vector ${data.type || "icon"} generated with VEXURA.`,
      keywords: [
        data.name,
        data.type,
        "vector",
        "svg",
        "icon",
        "design",
        "ui",
        "marketplace"
      ].filter(Boolean),
      category: data.type || "icon",
      tags: [data.type, "clean", "minimal", "geometric"].filter(Boolean),
      createdAt: new Date().toISOString(),
      version: "1.0.0",
      platform: "VEXURA",
      license: "commercial",
      author: "VEXURA AI",
      dimensions: {
        width: data.width || 400,
        height: data.height || 400
      }
    },
    vector: data
  };

  const blob = new Blob([JSON.stringify(enrichedExport, null, 2)], {
    type: "application/json",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
},


  /**
   * Download HTML wrapper
   */
  downloadHtml: function (svgElement, filename) {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${filename}</title>
</head>
<body style="background:#111;display:flex;align-items:center;justify-content:center;height:100vh;">
${svgString}
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
