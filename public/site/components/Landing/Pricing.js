function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-[var(--bg-body)] border-b border-[var(--border-dim)] relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)] opacity-[0.03] blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold font-mono text-gradient uppercase mb-4 inline-block">Flexible Plans</h2>
                    <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
                        Scale your design workflow. Start generating SVGs for free, or unlock the full power of our <span className="text-[var(--text-main)] font-bold">AI Vector Editor</span>.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Tier */}
                    <div className="card bg-[var(--bg-panel)] flex flex-col relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
                        <div className="p-8 flex-1">
                            <h3 className="text-xl font-mono font-bold text-[var(--text-main)] mb-2">STARTER</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-[var(--text-main)]">$0</span>
                                <span className="text-[var(--text-dim)] font-mono">/mo</span>
                            </div>
                            <p className="text-sm text-[var(--text-muted)] mb-8 border-b border-[var(--border-dim)] pb-8 leading-relaxed">
                                Ideal for hobbyists and developers testing the AI engine. Generate clean assets instantly.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                                    <div className="icon-check w-4 h-4 text-[var(--text-dim)]"></div>
                                    <span>10 Free Credits / Day</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                                    <div className="icon-check w-4 h-4 text-[var(--text-dim)]"></div>
                                    <span>Standard AI Models</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                                    <div className="icon-check w-4 h-4 text-[var(--text-dim)]"></div>
                                    <span>SVG & PNG Export</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--text-dim)] opacity-60">
                                    <div className="icon-lock w-4 h-4 text-[var(--border-dim)]"></div>
                                    <span>Vector Editor (View Only)</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--text-dim)] opacity-60">
                                    <div className="icon-x w-4 h-4 text-[var(--border-dim)]"></div>
                                    <span className="line-through">Commercial License</span>
                                </li>
                            </ul>
                        </div>
                        <div className="p-8 pt-0 mt-auto">
                            <a href="/tool" className="btn btn-secondary w-full py-3 hover:border-[var(--text-muted)]">START FREE</a>
                        </div>
                    </div>

                    {/* Pro Tier */}
                    <div className="card bg-[var(--bg-surface)] shadow-[0_0_40px_rgba(204,255,0,0.08)] flex flex-col relative overflow-hidden p-[1px] bg-[var(--bg-panel)] group transform hover:-translate-y-2 transition-all duration-300">
                         {/* Gradient Border Trick */}
                        <div className="absolute inset-0 bg-[var(--gradient-border)] opacity-60 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute inset-[1px] bg-[var(--bg-surface)] rounded-[1px]"></div>

                        <div className="absolute top-0 right-0 bg-[var(--accent)] text-black text-[10px] font-bold font-mono px-3 py-1 uppercase z-10 tracking-wider">
                            Most Popular
                        </div>
                        <div className="p-8 flex-1 relative z-10">
                            <h3 className="text-xl font-mono font-bold text-[var(--accent)] mb-2 flex items-center gap-2">
                                PRO TOOLKIT <div className="icon-sparkles w-4 h-4"></div>
                            </h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-[var(--text-main)]">$24.99</span>
                                <span className="text-[var(--text-dim)] font-mono">/mo</span>
                            </div>
                            <p className="text-sm text-[var(--text-muted)] mb-8 border-b border-[var(--border-dim)] pb-8 leading-relaxed">
                                The complete suite for professional designers. Unlock the <strong>Vector Editor</strong> and unlimited generations.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-sm text-[var(--text-main)]">
                                    <div className="icon-check w-4 h-4 text-[var(--accent)]"></div>
                                    <span><strong>Unlimited</strong> AI Generations</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--text-main)]">
                                    <div className="icon-check w-4 h-4 text-[var(--accent)]"></div>
                                    <span><strong>Full Vector Editor</strong> (Nodes, Layers)</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--text-main)]">
                                    <div className="icon-check w-4 h-4 text-[var(--accent)]"></div>
                                    <span>Commercial Usage License</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--text-main)]">
                                    <div className="icon-check w-4 h-4 text-[var(--accent)]"></div>
                                    <span>Advanced Style Models</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--text-main)]">
                                    <div className="icon-check w-4 h-4 text-[var(--accent)]"></div>
                                    <span>Priority Fast-Track Queue</span>
                                </li>
                            </ul>
                        </div>
                        <div className="p-8 pt-0 mt-auto relative z-10">
                            <a href="/tool?upgrade=true" className="btn btn-primary btn-primary-animate w-full py-3 font-bold shadow-lg shadow-black/20">GET PRO ACCESS</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}