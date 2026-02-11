/**
 * Prompt Data & Generator Logic
 * Centralized repository of seeded prompts for icons and illustrations.
 */

window.PromptData = {
    icons: [
        // Objects & Symbols
        "Minimal vector icon of a compass",
        "Shield icon with clean geometry",
        "Lock symbol, outline only",
        "Cloud upload icon, flat",
        "Eye visibility icon",
        "Calendar date icon",
        "Bell notification icon",
        "Battery charging icon",
        "Folder open icon",
        "Gear settings icon",
        
        // UI / System
        "Hamburger menu icon",
        "Search magnifying glass icon",
        "Play button icon",
        "Pause icon, flat",
        "Arrow right icon",
        "Close (X) icon",
        "Checkmark confirmation icon",
        "Warning triangle icon",
        "Info circle icon",
        "Download icon",
        
        // Business / Web
        "Wallet icon",
        "Credit card icon",
        "Chart upward icon",
        "User profile icon",
        "Team users icon",
        "Briefcase icon",
        "Document file icon",
        "Link chain icon",
        "Location pin icon",
        "Clock time icon",
        
        // Creative / Abstract
        "Spark icon",
        "Wave signal icon",
        "Lightbulb idea icon",
        "Flame energy icon",
        "Heart like icon",
        "Star favorite icon",
        "Bookmark icon",
        "Filter funnel icon",
        "Grid layout icon",
        "Layers stack icon",
        
        // Tech
        "API connection icon",
        "Code brackets icon",
        "Database cylinder icon",
        "Server stack icon",
        "Wifi signal icon",
        "QR code icon",
        "AI chip icon",
        "Blockchain node icon",
        "Robot head icon",
        "Terminal command icon"
    ],
    
    illustrations: [
        // People / Lifestyle
        "Person working on a laptop at a cafe, smooth vector illustration",
        "Designer sketching ideas at a desk",
        "Developer coding late at night with city view",
        "Freelancer working from home",
        "Team brainstorming around a table",
        "Person meditating in a calm room",
        "Artist painting on a digital tablet",
        "Student studying with headphones",
        "Person drinking coffee by a window",
        "Remote worker in a cozy space",
        
        // Tech / Digital
        "Abstract cloud computing scene",
        "AI system visualized as flowing data",
        "Mobile app development workspace",
        "Data analytics dashboard scene",
        "Cybersecurity protection concept",
        "Blockchain network illustration",
        "Server infrastructure with soft lighting",
        "Virtual reality workspace",
        "Smart home ecosystem",
        "SaaS platform overview scene",
        
        // Nature / Organic
        "Flowing river through abstract landscape",
        "Mountains with soft gradients",
        "Sun and clouds in curved style",
        "Tree growing from digital device",
        "Leaves floating in air",
        "Ocean waves with smooth motion",
        "Desert landscape with soft shadows",
        "Night sky with stars and curves",
        "Wind flowing through fields",
        "Garden growth concept",
        
        // Abstract / Conceptual
        "Creativity flowing as shapes and lines",
        "Ideas connecting as abstract nodes",
        "Time passing illustrated with motion",
        "Balance between technology and nature",
        "Energy moving through space",
        "Focus and productivity concept",
        "Learning and growth metaphor",
        "Collaboration and connection theme",
        "Innovation pathway illustration",
        "Calm vs chaos contrast",
        
        // UI / Product
        "Onboarding screens concept illustration",
        "Payment success screen illustration",
        "Error state with friendly visuals",
        "Empty state dashboard illustration",
        "Upload process visualization",
        "Account creation flow illustration",
        "Analytics overview illustration",
        "Subscription upgrade illustration",
        "Security confirmation illustration",
        "AI assistant helping user illustration"
    ],

    /**
     * Get a random prompt based on type
     * @param {string} type - 'icon' | 'illustration'
     */
    getRandomPrompt: function(type = 'icon') {
        const source = type === 'illustration' ? this.illustrations : this.icons;
        return source[Math.floor(Math.random() * source.length)];
    }
};