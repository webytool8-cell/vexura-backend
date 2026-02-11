function Testimonials() {
    return (
        <section className="py-20 bg-[var(--bg-panel)] border-b border-[var(--border-dim)]">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-center text-3xl font-bold font-mono text-[var(--text-main)] uppercase mb-12">User Feedback</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card bg-[var(--bg-surface)]">
                        <p className="text-[var(--text-muted)] mb-4 italic">"Finally, a vector tool that generates actual usable SVGs, not just weird images. The code output is clean."</p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[var(--bg-body)] rounded-full flex items-center justify-center text-[var(--text-dim)] font-mono text-xs">A</div>
                            <div>
                                <div className="text-sm font-bold text-[var(--text-main)]">Alex Chen</div>
                                <div className="text-xs text-[var(--text-dim)]">Frontend Dev</div>
                            </div>
                        </div>
                    </div>
                    <div className="card bg-[var(--bg-surface)]">
                        <p className="text-[var(--text-muted)] mb-4 italic">"I use VEXURA for all my wireframing. It's faster than searching through icon libraries."</p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[var(--bg-body)] rounded-full flex items-center justify-center text-[var(--text-dim)] font-mono text-xs">S</div>
                            <div>
                                <div className="text-sm font-bold text-[var(--text-main)]">Sarah M.</div>
                                <div className="text-xs text-[var(--text-dim)]">Product Designer</div>
                            </div>
                        </div>
                    </div>
                    <div className="card bg-[var(--bg-surface)]">
                        <p className="text-[var(--text-muted)] mb-4 italic">"The strict grid system and clean topology make these icons ready for production immediately."</p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[var(--bg-body)] rounded-full flex items-center justify-center text-[var(--text-dim)] font-mono text-xs">D</div>
                            <div>
                                <div className="text-sm font-bold text-[var(--text-main)]">David K.</div>
                                <div className="text-xs text-[var(--text-dim)]">Tech Lead</div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </section>
    );
}