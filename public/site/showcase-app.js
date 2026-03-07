function ShowcaseApp() {
  const [user, setUser] = React.useState(null);
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem('vector_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const cards = Array.from({ length: 12 }).map((_, idx) => ({
    title: `Generated Asset ${idx + 1}`,
    desc: 'AI-generated icon and vector asset for product interfaces.',
    href: '/tool'
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onOpenAuth={() => setIsAuthOpen(true)} onLogout={() => setUser(null)} />
      <main className="flex-1">
        <section className="py-12 border-b border-[var(--border-dim)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-mono font-bold mb-4">Vector Showcase</h1>
            <p className="text-[var(--text-muted)]">Explore AI-generated icons, logos, and scalable graphics created with Vexura.</p>
          </div>
        </section>

        <section className="py-8 border-b border-[var(--border-dim)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3" aria-label="Filter controls">
              <button className="btn btn-secondary">All</button>
              <button className="btn btn-secondary">Icons</button>
              <button className="btn btn-secondary">Logos</button>
              <button className="btn btn-secondary">Illustrations</button>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {cards.map((card) => (
                <article key={card.title} className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[12px] p-6">
                  <div className="h-36 bg-[var(--bg-body)] border border-[var(--border-dim)] rounded-[8px] flex items-center justify-center mb-4">
                    <div className="icon-image w-10 h-10 text-[var(--text-dim)]" aria-hidden="true"></div>
                  </div>
                  <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
                  <p className="text-sm text-[var(--text-muted)] mb-4">{card.desc}</p>
                  <a href={card.href} className="btn btn-secondary inline-flex no-underline">View</a>
                </article>
              ))}
            </div>
            <div className="mt-10 text-center">
              <button className="btn btn-primary">Load More</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={setUser} />
    </div>
  );
}

const showcaseRoot = ReactDOM.createRoot(document.getElementById('root'));
showcaseRoot.render(<ShowcaseApp />);
