function Hero() {
    // Floating Shapes Data
    const shapes = [
        { type: 'circle', size: 64, x: '10%', y: '20%', delay: '0s', duration: '6s', color: 'rgba(0,0,0,0.1)' },
        { type: 'square', size: 48, x: '85%', y: '15%', delay: '1s', duration: '5s', color: 'rgba(0,0,0,0.1)' },
        { type: 'triangle', size: 56, x: '15%', y: '60%', delay: '2s', duration: '7s', color: 'rgba(0,0,0,0.08)' },
        { type: 'plus', size: 40, x: '80%', y: '70%', delay: '1.5s', duration: '5.5s', color: 'rgba(0,0,0,0.1)' },
        { type: 'circle-outline', size: 80, x: '50%', y: '10%', delay: '3s', duration: '8s', color: 'rgba(0,0,0,0.05)' },
    ];

    const examples = [
        {
            id: 1,
            prompt: "Minimal geometric logo",
            svg: (
                <g>
                    <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="12" fill="none" />
                    <path d="M200 80 L200 200 L280 280" stroke="currentColor" strokeWidth="12" fill="none" strokeLinecap="round" />
                </g>
            )
        },
        {
            id: 4,
            prompt: "Abstract eye symbol",
            svg: (
                <g>
                    <path d="M40 200 Q200 40 360 200 Q200 360 40 200 Z" stroke="currentColor" strokeWidth="12" fill="none" />
                    <circle cx="200" cy="200" r="60" stroke="currentColor" strokeWidth="12" fill="none" />
                </g>
            )
        },
        {
            id: 6,
            prompt: "Modern data chart",
            svg: (
                <g>
                    <path d="M60 340 L60 60" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
                    <path d="M60 340 L340 340" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
                    <rect x="100" y="200" width="40" height="120" fill="currentColor" opacity="0.5" />
                    <rect x="180" y="140" width="40" height="180" fill="currentColor" opacity="0.8" />
                    <rect x="260" y="80" width="40" height="240" fill="currentColor" />
                </g>
            )
        },
        {
            id: 8,
            prompt: "Cloud storage icon",
            svg: (
                <g>
                    <rect x="100" y="140" width="200" height="160" rx="20" stroke="currentColor" strokeWidth="12" fill="none" />
                    <path d="M140 140 L140 100 Q140 60 200 60 Q260 60 260 100 L260 140" stroke="currentColor" strokeWidth="12" fill="none" strokeLinecap="round" />
                    <circle cx="200" cy="220" r="20" fill="currentColor" />
                </g>
            )
        },
        {
            id: 9,
            prompt: "Search magnifying glass",
            svg: (
                <g>
                    <circle cx="180" cy="180" r="100" stroke="currentColor" strokeWidth="12" fill="none" />
                    <line x1="260" y1="260" x2="340" y2="340" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
                    <circle cx="160" cy="160" r="30" fill="currentColor" />
                </g>
            )
        },
        {
            id: 12,
            prompt: "Four squares grid",
            svg: (
                <g>
                    <rect x="60" y="60" width="120" height="120" rx="20" stroke="currentColor" strokeWidth="12" fill="none" />
                    <rect x="220" y="60" width="120" height="120" rx="20" stroke="currentColor" strokeWidth="12" fill="none" />
                    <rect x="60" y="220" width="120" height="120" rx="20" stroke="currentColor" strokeWidth="12" fill="none" />
                    <rect x="220" y="220" width="120" height="120" rx="20" stroke="currentColor" strokeWidth="12" fill="none" />
                </g>
            )
        }
    ];

    const renderShape = (shape) => {
        const style = {
            left: shape.x,
            top: shape.y,
            width: shape.size,
            height: shape.size,
            animation: `float-slow ${shape.duration} ease-in-out infinite`,
            animationDelay: shape.delay,
            color: shape.color
        };

        return (
            <div key={Math.random()} className="absolute pointer-events-none z-0" style={style}>
                 <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                    {shape.type === 'circle' && <circle cx="50" cy="50" r="50" />}
                    {shape.type === 'square' && <rect x="0" y="0" width="100" height="100" rx="10" />}
                    {shape.type === 'triangle' && <polygon points="50,0 100,100 0,100" />}
                    {shape.type === 'plus' && <path d="M35 0 H65 V35 H100 V65 H65 V100 H35 V65 H0 V35 H35 Z" />}
                    {shape.type === 'circle-outline' && <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="10" fill="none" />}
                </svg>
            </div>
        );
    };

    return (
        <section className="relative overflow-hidden py-24 lg:py-32 bg-[#ccff00] text-black">
            {/* 1. Main Gradient Background - Green/Pink/Orange */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #ccff00 0%, #ff80b5 50%, #ff9f43 100%)' }}></div>

            {/* 2. Floating Shapes Layer */}
            <div className="absolute inset-0 overflow-hidden">
                {shapes.map(renderShape)}
            </div>

            {/* 3. Subtle Dark Overlay Tint */}
            <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
            
            {/* 4. Grid Pattern Overlay (Dark version) */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                 style={{ 
                     backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
                     backgroundSize: '40px 40px' 
                 }}>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">
                
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 border border-black/10 mb-8 backdrop-blur-sm shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
                    <span className="text-xs font-mono font-bold tracking-wide text-black/70">VEXURA PRO LIVE</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 font-mono uppercase leading-[0.9] drop-shadow-sm text-black">
                    Professional<br/>
                    Vectors
                </h1>

                <p className="max-w-2xl text-lg md:text-xl font-medium mb-12 leading-relaxed text-black/70">
                    Generate production-ready SVG icons and organic illustrations instantly with AI.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-8">
                    <a href="/tool" className="btn h-14 px-8 text-base bg-black text-white hover:bg-black/80 hover:scale-105 border-transparent shadow-xl shadow-black/10 font-bold transform transition-all">
                        <div className="icon-wand w-5 h-5"></div>
                        START CREATING
                    </a>
                    <a href="#pricing" className="btn h-14 px-8 text-base bg-white/20 backdrop-blur-md border-2 border-black/5 text-black hover:bg-black hover:text-white hover:border-black transition-all font-bold">
                        <div className="icon-crown w-5 h-5"></div>
                        VIEW PRICING
                    </a>
                </div>

                <div className="mb-24 flex items-center justify-center gap-2 text-sm font-medium text-black/70 animate-in fade-in slide-in-from-bottom-2 delay-300">
                    <span>Need instant assets?</span>
                    <a href="/marketplace" className="flex items-center gap-1 text-black font-bold hover:underline decoration-2 underline-offset-2">
                        Browse the Marketplace <div className="icon-arrow-right w-4 h-4"></div>
                    </a>
                </div>

                {/* Engaging Showcase Section */}
                <div className="w-full max-w-4xl relative">
                    {/* Header for Showcase */}
                    <div className="flex items-center justify-between mb-6 px-2 opacity-80">
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                            <span className="text-xs font-mono font-bold uppercase tracking-widest text-black/60">Recent Generations</span>
                         </div>
                         <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-black/40">
                            <span>Live Preview</span>
                            <div className="w-4 h-[1px] bg-black/20"></div>
                         </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                        {examples.map((item, i) => (
                            <div 
                                key={item.id} 
                                className="group relative aspect-square"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                {/* Card Container */}
                                <div className="absolute inset-0 bg-white/20 backdrop-blur-md border border-white/30 rounded-[16px] shadow-lg shadow-black/5 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:bg-white/30 overflow-hidden flex flex-col items-center justify-center p-6">
                                    
                                    {/* Icon */}
                                    <svg 
                                        viewBox="0 0 400 400" 
                                        className="w-2/3 h-2/3 text-black/80 group-hover:text-black group-hover:scale-110 transition-all duration-500 drop-shadow-sm"
                                    >
                                        {item.svg}
                                    </svg>
                                    
                                    {/* Prompt Label (Appears on Hover) */}
                                    <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-black/5 backdrop-blur-sm border-t border-white/20">
                                        <div className="flex items-center gap-2 text-[10px] font-mono text-black/70">
                                            <span className="text-black/40">&gt;</span>
                                            <span className="truncate">{item.prompt}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Bottom Fade to Dark Body */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[var(--bg-body)] to-transparent pointer-events-none"></div>
        </section>
    );
}