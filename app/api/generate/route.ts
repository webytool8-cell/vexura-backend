import { NextRequest, NextResponse } from "next/server";

/**
 * Determines whether a node should be organic
 */
function shouldBeOrganic(label: string) {
  const organicKeywords = [
    "human",
    "person",
    "face",
    "body",
    "hand",
    "animal",
    "tree",
    "plant",
    "leaf",
    "flower",
    "mountain",
    "cloud",
    "water",
    "river",
    "hair",
    "skin",
    "nature",
  ];

  return organicKeywords.some(keyword =>
    label.toLowerCase().includes(keyword)
  );
}

/**
 * Generate SVG nodes based on intent
 */
function generateSVG({
  type,
  elements,
}: {
  type: "icon" | "illustration";
  elements: Array<{ label: string }>;
}) {
  let svgContent = "";

  elements.forEach((el, index) => {
    const organic = type === "illustration" && shouldBeOrganic(el.label);

    if (organic) {
      // Organic blob-like shape
      svgContent += `
        <path
          d="M30 ${20 + index * 40}
             C 50 ${10 + index * 40},
               90 ${30 + index * 40},
               70 ${50 + index * 40}
             C 50 ${70 + index * 40},
               20 ${50 + index * 40},
               30 ${20 + index * 40}"
          fill="#000"
        />
      `;
    } else {
      // Geometric shape
      svgContent += `
        <rect
          x="${20 + index * 60}"
          y="20"
          width="40"
          height="40"
          fill="#000"
          rx="${type === "icon" ? 0 : 4}"
        />
      `;
    }
  });

  return `
    <svg
      width="512"
      height="512"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      ${svgContent}
    </svg>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      generationType = "icon",
      elements = [],
    } = body;

    if (!elements.length) {
      return NextResponse.json(
        { error: "No elements provided" },
        { status: 400 }
      );
    }

    const svg = generateSVG({
      type: generationType,
      elements,
    });

    return NextResponse.json({
      success: true,
      svg,
    });
  } catch (error) {
    console.error("SVG generation error:", error);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}
