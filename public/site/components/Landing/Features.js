function Features() {
    const features = [
        {
            icon: 'icon-pen-tool',
            title: 'Advanced Editor',
            desc: 'Go beyond generation. Manipulate nodes, adjust paths, and manage layers directly in the browser with our Pro vector editor.'
        },
        {
            icon: 'icon-cpu',
            title: 'Semantic AI Engine',
            desc: 'Our engine understands abstract concepts, delivering precise icons and organic illustrations from simple text prompts.'
        },
        {
            icon: 'icon-code',
            title: 'Clean SVG Topology',
            desc: 'Production-ready code. No messy auto-trace artifacts—just pure, editable paths and logical groups optimized for web.'
        },
        {
            icon: 'icon-palette',
            title: 'Style Control',
            desc: 'Define your aesthetic. Choose from Outline, Filled, Flat, or Geometric styles, and apply custom color palettes instantly.'
        }
    ];

    return (
        <section id="features" className="py-24 bg-[var(--bg-panel)] border-b border-[var(--border-dim)] relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20 relative">
                    <span className="text-[var(--accent)] font-mono text-xs font-bold uppercase tracking-widest mb-2 block">Why VEXURA?</span>
                    <h2 className="text-3xl md:text-4xl font-bold font-mono text-[var(--text-main)] uppercase mb-6">Engineered for Designers</h2>
                    <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg leading-relaxed">
                        The only AI tool that combines generative power with precision vector editing controls.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feat, idx) => (
                        <div key={idx} className="card group hover:bg-[var(--bg-surface)] hover:border-[var(--accent)] transition-all duration-300 relative overflow-hidden p-8">
                            
                            <div className="w-14 h-14 bg-[var(--bg-body)] border border-[var(--border-dim)] rounded-[2px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-[var(--accent)] shadow-sm">
                                <div className={`${feat.icon} w-7 h-7`}></div>
                            </div>
                            
                            <h3 className="text-lg font-mono font-bold text-[var(--text-main)] mb-3 uppercase tracking-tight">{feat.title}</h3>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                {feat.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}