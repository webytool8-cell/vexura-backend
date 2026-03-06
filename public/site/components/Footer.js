function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-panel)] border-t border-[var(--border-dim)] py-12 mt-auto" aria-label="Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-sm text-[var(--text-dim)]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Logo className="w-5 h-5" />
              <span className="font-mono font-bold text-[var(--text-main)]">VEXURA</span>
            </div>
            <p className="text-[var(--text-dim)]">AI vector generation for designers and developers.</p>
          </div>

          <div className="flex flex-col gap-2">
            <a href="/" className="text-[var(--text-dim)] hover:text-[var(--text-muted)] no-underline">Generator</a>
            <a href="/showcase" className="text-[var(--text-dim)] hover:text-[var(--text-muted)] no-underline">Showcase</a>
            <a href="/docs" className="text-[var(--text-dim)] hover:text-[var(--text-muted)] no-underline">Docs</a>
          </div>

          <div className="flex flex-col gap-2">
            <a href="/privacy" className="text-[var(--text-dim)] hover:text-[var(--text-muted)] no-underline">Privacy Policy</a>
            <a href="/terms" className="text-[var(--text-dim)] hover:text-[var(--text-muted)] no-underline">Terms</a>
            <a href="mailto:hello@vexura.io" className="text-[var(--text-dim)] hover:text-[var(--text-muted)] no-underline">hello@vexura.io</a>
          </div>
        </div>
        <p className="mt-10 text-xs text-[var(--text-dim)]">© {currentYear} VEXURA</p>
      </div>
    </footer>
  );
}
