function HowItWorks() {
    const steps = [
        {
            num: '01',
            title: 'Describe & Generate',
            desc: 'Input a text prompt. Our AI interprets your intent and builds a clean vector structure in seconds.'
        },
        {
            num: '02',
            title: 'Refine & Edit',
            desc: 'Use the Pro Editor to tweak nodes, adjust curves, or recolor elements. Perfect your asset without leaving the app.'
        },
        {
            num: '03',
            title: 'Export & Ship',
            desc: 'Download optimized SVGs, high-res PNGs, or copy the code directly into React/HTML.'
        }
    ];

    return (
        <section id="how-it-works" className="py-24 bg-[var(--bg-body)] border-b border-[var(--border-dim)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-20 items-center">
                    <div className="flex-1">
                        <span className="text-[var(--accent)] font-mono text-xs font-bold uppercase tracking-widest mb-2 block">Workflow</span>
                        <h2 className="text-4xl font-bold font-mono text-[var(--text-main)] uppercase mb-8 leading-tight">From Prompt to <br/>Production</h2>
                        <div className="space-y-10">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex gap-6 group">
                                    <div className="font-mono text-5xl font-bold text-[var(--bg-surface)] group-hover:text-[var(--accent)] stroke-text transition-colors duration-300">
                                        {step.num}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[var(--text-main)] mb-2 uppercase font-mono">{step.title}</h3>
                                        <p className="text-[var(--text-muted)] leading-relaxed max-w-sm">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full relative perspective-1000">
                        {/* Visual representation of the tool interface */}
                        <div className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[4px] p-2 shadow-2xl transform rotate-y-minus-12 hover:rotate-0 transition-transform duration-700 ease-out">
                            {/* Browser Bar */}
                            <div className="h-8 border-b border-[var(--border-dim)] flex items-center px-4 gap-2 mb-2 bg-[var(--bg-surface)]">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                                <div className="ml-4 h-4 w-64 bg-[var(--bg-body)] rounded-[2px] opacity-50"></div>
                            </div>
                            
                            {/* App Interface Mockup */}
                            <div className="flex gap-2 h-80">
                                {/* Sidebar */}
                                <div className="w-1/3 border-r border-[var(--border-dim)] p-4 space-y-4">
                                    <div className="h-24 bg-[var(--bg-body)] border border-[var(--border-dim)] rounded-[2px] p-2">
                                        <div className="h-2 w-12 bg-[var(--text-dim)] opacity-20 mb-2"></div>
                                        <div className="h-2 w-full bg-[var(--text-dim)] opacity-10"></div>
                                    </div>
                                    <div className="h-8 bg-[var(--accent)] w-full rounded-[2px] opacity-90 shadow-[0_0_10px_rgba(204,255,0,0.2)]"></div>
                                    <div className="space-y-2 mt-4">
                                        <div className="h-2 w-full bg-[var(--bg-surface)] rounded-[1px]"></div>
                                        <div className="h-2 w-2/3 bg-[var(--bg-surface)] rounded-[1px]"></div>
                                    </div>
                                </div>
                                {/* Canvas */}
                                <div className="flex-1 bg-[var(--bg-body)] flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                                    <div className="icon-layers w-32 h-32 text-[var(--text-main)] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"></div>
                                    
                                    {/* Editor UI Overlay */}
                                    <div className="absolute top-4 right-4 bg-[var(--bg-panel)] border border-[var(--accent)] p-2 rounded-[2px] shadow-lg animate-pulse">
                                        <div className="w-20 h-2 bg-[var(--accent)] mb-1"></div>
                                        <div className="w-12 h-2 bg-[var(--bg-surface)]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}