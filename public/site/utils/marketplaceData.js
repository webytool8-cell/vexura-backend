/**
 * VEXURA Marketplace Data
 * Static repository of free and premium assets and collections.
 */

window.MarketplaceData = [
    {
        id: "ui-icons-essential-pack",
        title: "Essential UI Icon Set",
        slug: "essential-ui-icons",
        category: "icons",
        type: "collection", // New field
        isPremium: false,
        price: 0,
        tags: ["ui", "interface", "web", "minimal", "essential", "navigation"],
        description: "A comprehensive collection of 6 essential user interface icons. Perfect for building clean, modern dashboards and mobile apps. Includes navigation, user actions, and system status icons.",
        previewSvg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><g opacity="0.8"><rect x="40" y="40" width="140" height="140" rx="12" fill="#27272a" stroke="#52525b"/><path d="M110 90 L130 130 H90 Z" fill="#ccff00" transform="translate(-20, -20)"/><rect x="220" y="40" width="140" height="140" rx="12" fill="#27272a" stroke="#52525b"/><circle cx="290" cy="110" r="30" stroke="#fff" stroke-width="4" fill="none"/><rect x="40" y="220" width="140" height="140" rx="12" fill="#27272a" stroke="#52525b"/><path d="M80 290 L140 290" stroke="#fff" stroke-width="4" stroke-linecap="round"/><rect x="220" y="220" width="140" height="140" rx="12" fill="#27272a" stroke="#52525b"/><rect x="270" y="270" width="40" height="40" fill="#fff"/></g><text x="200" y="380" font-family="monospace" font-size="12" fill="#71717a" text-anchor="middle">6 ICONS INCLUDED</text></svg>`,
        items: [
             { name: "home", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>` },
             { name: "user", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>` },
             { name: "settings", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>` },
             { name: "search", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>` },
             { name: "bell", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>` },
             { name: "menu", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>` }
        ]
    },
    {
        id: "geo-nebula-01",
        title: "Geometric Nebula Gradient",
        slug: "geometric-nebula",
        category: "gradients",
        type: "single",
        isPremium: false,
        price: 0,
        tags: ["gradient", "space", "purple", "background", "modern"],
        description: "A deep purple and blue gradient mesh with geometric overlay. Perfect for SaaS hero sections.",
        svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4c1d95"/><stop offset="100%" stop-color="#2563eb"/></linearGradient></defs><rect width="400" height="400" fill="url(#g1)"/><circle cx="200" cy="200" r="150" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/><circle cx="200" cy="200" r="100" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/><path d="M200 50 L350 350 L50 350 Z" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2"/></svg>`
    },
    {
        id: "startup-illustration-pack",
        title: "Startup Launch Illustration Kit",
        slug: "startup-launch-pack",
        category: "illustrations",
        type: "collection",
        isPremium: true,
        price: 12,
        tags: ["startup", "rocket", "business", "growth", "launch", "team"],
        description: "Complete vector illustration kit for startup landing pages. Includes rocket launch, team collaboration, and growth chart scenes.",
        previewSvg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="200" r="160" fill="#27272a"/><path d="M200 80 L260 200 H140 Z" fill="#ccff00"/><rect x="170" y="200" width="60" height="100" fill="#ccff00"/><path d="M170 300 L140 340 M230 300 L260 340" stroke="#ccff00" stroke-width="8"/><circle cx="120" cy="150" r="10" fill="#fff"/><circle cx="280" cy="120" r="15" fill="#fff" opacity="0.5"/><text x="200" y="370" font-family="monospace" font-size="14" fill="#71717a" text-anchor="middle">3 ILLUSTRATIONS</text></svg>`,
        items: [
             { name: "rocket-launch", svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><path d="M200 50 C250 50 300 150 300 250 H100 C100 150 150 50 200 50 Z" fill="none" stroke="currentColor" stroke-width="8"/><path d="M100 250 L50 350 M300 250 L350 350" stroke="currentColor" stroke-width="8"/><circle cx="200" cy="150" r="30" stroke="currentColor" stroke-width="8"/></svg>` },
             { name: "team-collab", svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><circle cx="150" cy="150" r="40" stroke="currentColor" stroke-width="8"/><circle cx="250" cy="150" r="40" stroke="currentColor" stroke-width="8"/><path d="M150 200 V300 M250 200 V300" stroke="currentColor" stroke-width="8"/><rect x="100" y="300" width="200" height="20" fill="currentColor"/></svg>` },
             { name: "growth-chart", svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="350" x2="350" y2="350" stroke="currentColor" stroke-width="8"/><line x1="50" y1="350" x2="50" y2="50" stroke="currentColor" stroke-width="8"/><path d="M50 300 L150 200 L250 250 L350 100" fill="none" stroke="currentColor" stroke-width="8"/><circle cx="350" cy="100" r="10" fill="currentColor"/></svg>` }
        ]
    },
    {
        id: "abstract-flow-waves",
        title: "Abstract Flow Waves",
        slug: "abstract-flow-waves",
        category: "shapes",
        type: "single",
        isPremium: true,
        price: 5,
        tags: ["abstract", "waves", "organic", "lines", "divider"],
        description: "Smooth, organic line waves suitable for footer backgrounds or section dividers. Premium quality topology.",
        svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><path d="M0 200 Q100 100 200 200 T400 200" fill="none" stroke="#ccff00" stroke-width="4"/><path d="M0 220 Q100 120 200 220 T400 220" fill="none" stroke="#ccff00" stroke-width="4" opacity="0.8"/><path d="M0 240 Q100 140 200 240 T400 240" fill="none" stroke="#ccff00" stroke-width="4" opacity="0.6"/><path d="M0 260 Q100 160 200 260 T400 260" fill="none" stroke="#ccff00" stroke-width="4" opacity="0.4"/></svg>`
    },
    {
        id: "cyber-grid-pattern",
        title: "Cyber Grid Pattern",
        slug: "cyber-grid-pattern",
        category: "patterns",
        type: "single",
        isPremium: true,
        price: 8,
        tags: ["cyberpunk", "grid", "tech", "overlay", "matrix"],
        description: "A seamless perspective grid pattern with glowing nodes. High-tech aesthetic for modern apps.",
        svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#000"/><stop offset="100%" stop-color="#ccff00" stop-opacity="0.2"/></linearGradient></defs><path d="M0 400 L200 200 L400 400" fill="url(#g2)"/><line x1="0" y1="300" x2="400" y2="300" stroke="#ccff00" stroke-width="1" opacity="0.3"/><line x1="50" y1="350" x2="350" y2="350" stroke="#ccff00" stroke-width="1" opacity="0.5"/><line x1="200" y1="200" x2="200" y2="400" stroke="#ccff00" stroke-width="1" opacity="0.5"/><line x1="100" y1="200" x2="0" y2="400" stroke="#ccff00" stroke-width="1" opacity="0.3"/><line x1="300" y1="200" x2="400" y2="400" stroke="#ccff00" stroke-width="1" opacity="0.3"/></svg>`
    },
    {
        id: "glassmorphism-shapes",
        title: "Glassmorphism Shape Pack",
        slug: "glassmorphism-shapes",
        category: "shapes",
        type: "collection",
        isPremium: false,
        price: 0,
        tags: ["glass", "blur", "modern", "ui", "shapes", "trendy"],
        description: "Frosted glass effect vector shapes. Includes cards, bubbles, and abstract forms. Use with backdrop-filter CSS for best results.",
        previewSvg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect x="50" y="50" width="150" height="150" rx="20" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/><circle cx="250" cy="250" r="80" fill="rgba(204,255,0,0.1)" stroke="rgba(204,255,0,0.2)" stroke-width="1"/><rect x="180" y="80" width="100" height="100" rx="50" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)"/></svg>`,
        items: [
            { name: "glass-card", svg: `<svg viewBox="0 0 200 200"><rect x="10" y="10" width="180" height="180" rx="20" fill="rgba(255,255,255,0.1)" stroke="white" stroke-width="1" stroke-opacity="0.3"/></svg>` },
            { name: "glass-bubble", svg: `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" fill="rgba(255,255,255,0.1)" stroke="white" stroke-width="1" stroke-opacity="0.3"/></svg>` },
            { name: "glass-pill", svg: `<svg viewBox="0 0 200 100"><rect x="10" y="10" width="180" height="80" rx="40" fill="rgba(255,255,255,0.1)" stroke="white" stroke-width="1" stroke-opacity="0.3"/></svg>` }
        ]
    }
];

window.getAssetBySlug = function(slug) {
    return window.MarketplaceData.find(a => a.slug === slug);
};

window.getAssetsByCategory = function(category) {
    if (category === 'all') return window.MarketplaceData;
    return window.MarketplaceData.filter(a => a.category === category);
};