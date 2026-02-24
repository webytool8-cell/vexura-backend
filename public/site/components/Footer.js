function Footer() {
    const currentYear = 2026;

    return (
        <footer className="bg-[var(--bg-panel)] border-t border-[var(--border-dim)] py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2">
                        <Logo className="w-6 h-6 drop-shadow-[0_0_2px_rgba(204,255,0,0.2)]" />
                        <span className="font-mono font-bold text-sm text-[var(--text-main)]">
                            VEXURA
                        </span>
                    </div>
                    
                    {/* Links and Copyright */}
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm font-mono">
                        <div className="flex items-center gap-6 text-[var(--text-dim)]">
                            <a href="/marketplace" className="hover:text-[var(--text-interactive)] transition-colors font-bold text-[var(--text-main)]">Marketplace</a>
                            <a href="/contact" className="hover:text-[var(--text-interactive)] transition-colors">Contact</a>
                            <a href="#" className="hover:text-[var(--text-interactive)] transition-colors">Terms</a>
                            <a href="#" className="hover:text-[var(--text-interactive)] transition-colors">Privacy</a>
                        </div>
                        <span className="text-[var(--text-muted)] opacity-60">© {currentYear} VEXURA Inc.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}