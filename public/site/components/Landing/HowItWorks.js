function HowItWorks() {
  const steps = [
    { icon: 'icon-file-text', title: 'Describe', desc: 'Enter a short prompt for the icon or vector you need.' },
    { icon: 'icon-sparkles', title: 'Generate', desc: 'Vexura creates structured SVG output in seconds.' },
    { icon: 'icon-download', title: 'Download SVG', desc: 'Export and use in products, docs, and design tools.' },
  ];

  return (
    <section className="py-12 md:py-16 border-b border-[var(--border-dim)]" aria-labelledby="how-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="how-title" className="text-2xl md:text-3xl font-mono font-bold text-[var(--text-main)] mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <article key={step.title} className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[12px] p-6">
              <div className={`${step.icon} w-6 h-6 text-[var(--text-main)] mb-4`}></div>
              <h3 className="text-[18px] font-semibold mb-2">{step.title}</h3>
              <p className="text-[14px] text-[var(--text-muted)]">{step.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
