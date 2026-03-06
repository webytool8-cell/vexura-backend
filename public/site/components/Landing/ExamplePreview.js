function ExamplePreview() {
  const cards = [
    { title: 'Finance Dashboard Icon', alt: 'Finance icon preview' },
    { title: 'Health App Logo Mark', alt: 'Health logo preview' },
    { title: 'Developer Tool Symbol', alt: 'Developer symbol preview' },
    { title: 'Travel Navigation Set', alt: 'Travel icon preview' },
    { title: 'Ecommerce Cart Badge', alt: 'Ecommerce icon preview' },
    { title: 'Analytics Glyph Pack', alt: 'Analytics icon preview' },
  ];

  return (
    <section className="py-12 md:py-16 border-b border-[var(--border-dim)]" aria-labelledby="example-preview-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="example-preview-title" className="text-2xl md:text-3xl font-mono font-bold text-center mb-8">Example Output Preview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <a key={card.title} href="/showcase" className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[12px] p-6 no-underline">
              <div className="h-32 bg-[var(--bg-body)] border border-[var(--border-dim)] rounded-[8px] flex items-center justify-center mb-4">
                <div className="icon-image w-10 h-10 text-[var(--text-dim)]" aria-hidden="true"></div>
              </div>
              <p className="text-sm text-center text-[var(--text-muted)]" aria-label={card.alt}>{card.title}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
