function ContactView() {
    return (
        <div className="min-h-[calc(100vh-64px)] bg-[var(--bg-body)] flex flex-col items-center justify-center p-4">
            <div className="max-w-xl w-full bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[2px] p-8 md:p-12 text-center relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-[0.05] blur-[50px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--accent)] opacity-[0.05] blur-[50px] pointer-events-none"></div>

                <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border-dim)]">
                    <div className="icon-mail w-8 h-8 text-[var(--accent)]"></div>
                </div>

                <h1 className="text-3xl font-mono font-bold text-[var(--text-main)] mb-4 uppercase tracking-tight">Get in Touch</h1>
                <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
                    Have questions about VEXURA Pro, enterprise support, or feature requests? We're here to help.
                </p>

                <div className="bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-[2px] p-6 mb-8">
                    <p className="text-xs font-mono text-[var(--text-dim)] uppercase mb-2">Support Email</p>
                    <a href="mailto:hello@VEXURA.ai" className="text-xl md:text-2xl font-bold text-[var(--text-main)] hover:text-[var(--accent)] transition-colors font-mono break-all">
                        hello@VEXURA.ai
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="p-4 border border-[var(--border-dim)] rounded-[2px] hover:border-[var(--border-mid)] transition-colors">
                        <div className="icon-message-circle w-5 h-5 text-[var(--text-dim)] mb-2"></div>
                        <h3 className="font-bold text-[var(--text-main)] text-sm mb-1">Feedback</h3>
                        <p className="text-xs text-[var(--text-dim)]">Help us improve the AI engine.</p>
                    </div>
                    <div className="p-4 border border-[var(--border-dim)] rounded-[2px] hover:border-[var(--border-mid)] transition-colors">
                        <div className="icon-shield w-5 h-5 text-[var(--text-dim)] mb-2"></div>
                        <h3 className="font-bold text-[var(--text-main)] text-sm mb-1">Enterprise</h3>
                        <p className="text-xs text-[var(--text-dim)]">Custom licenses & API access.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}