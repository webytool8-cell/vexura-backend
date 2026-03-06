function GeneratorSection({ user, onOpenAuth }) {
  return (
    <section id="generator" className="py-12 md:py-16 border-b border-[var(--border-dim)]" aria-labelledby="generator-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 id="generator-title" className="text-2xl md:text-3xl font-mono font-bold mb-3">Generate Your Vector</h2>
          <p className="text-[var(--text-muted)]">Enter a prompt and instantly create a scalable SVG asset.</p>
        </div>
        <div className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[12px] p-5 md:p-8 mx-auto max-w-[1000px]">
          <Generator
            user={user}
            onOpenAuth={onOpenAuth}
            onOpenUpgrade={() => {}}
            onCreditUse={() => {}}
          />
        </div>
      </div>
    </section>
  );
}
