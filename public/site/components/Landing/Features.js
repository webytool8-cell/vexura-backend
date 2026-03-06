function Features() {
  const features = [
    'SVG Export Ready',
    'Clean Geometry',
    'Customizable Styles',
    'Developer Friendly',
    'Instant Generation',
    'High Resolution Output'
  ];

  return (
    <section className="py-12 md:py-16 border-b border-[var(--border-dim)]" aria-labelledby="features-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="features-title" className="text-2xl md:text-3xl font-mono font-bold text-center mb-8">Feature Grid</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((title) => (
            <article key={title} className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[12px] p-6">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-[var(--text-muted)]">Built to keep your vector workflow fast, clean, and production ready.</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
