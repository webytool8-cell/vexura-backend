function CTA() {
    return (
        <section className="py-32 bg-[var(--bg-body)] relative overflow-hidden border-t border-[var(--border-dim)]">
             {/* Gradient Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent)] opacity-[0.03] blur-[150px] rounded-full pointer-events-none"></div>
             
             {/* Background Pattern */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #ccff00 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

             <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
                <h2 className="text-4xl md:text-6xl font-bold font-mono text-[var(--text-main)] uppercase mb-6 tracking-tight">Stop Tracing.<br/>Start Generating.</h2>
                <p className="text-xl text-[var(--text-muted)] mb-12 max-w-2xl mx-auto leading-relaxed">
                    Join thousands of developers and designers building shipping-ready interfaces with VEXURA's AI engine.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <a href="tool.html" className="btn btn-primary btn-primary-animate h-16 px-10 text-lg inline-flex shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:shadow-[0_0_40px_rgba(204,255,0,0.4)] text-black font-bold tracking-wide">
                        LAUNCH GENERATOR
                    </a>
                    <a href="tool.html?upgrade=true" className="group flex items-center gap-2 text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors font-mono text-sm uppercase font-bold tracking-widest">
                        See Pro Features <div className="icon-arrow-right w-4 h-4 transition-transform group-hover:translate-x-1"></div>
                    </a>
                </div>
                
                <div className="mt-12 pt-12 border-t border-[var(--border-dim)] w-full max-w-lg mx-auto">
                    <p className="text-sm text-[var(--text-muted)] mb-4">Just looking for assets?</p>
                    <a href="marketplace.html" className="btn btn-secondary w-full sm:w-auto inline-flex bg-[var(--bg-panel)] hover:bg-[var(--bg-surface)] border-[var(--border-dim)]">
                        <div className="icon-shopping-bag w-4 h-4"></div>
                        EXPLORE MARKETPLACE
                    </a>
                </div>

                <p className="mt-8 text-xs font-mono text-[var(--text-dim)] opacity-60">
                    No credit card required for Starter plan.
                </p>
             </div>
        </section>
    );
}