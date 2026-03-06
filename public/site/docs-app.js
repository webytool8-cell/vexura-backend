function DocsApp() {
  const [user, setUser] = React.useState(null);
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem('vector_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const sections = [
    { id: 'getting-started', title: 'Getting Started', body: 'Enter a prompt in the generator, choose your style, and run generation. Export the final SVG from the output panel.' },
    { id: 'generation', title: 'How Generation Works', body: 'Vexura parses your prompt, applies icon constraints, and returns scalable vector geometry suitable for editing.' },
    { id: 'svg-export', title: 'SVG Export Guide', body: 'Use exports in Figma, Adobe Illustrator, and web applications. SVG files are scalable and easy to integrate in codebases.' },
    { id: 'style-options', title: 'Style Options', body: 'Use style presets to control line weight, fill behavior, and geometric strictness for each generated output.' },
    { id: 'faq', title: 'FAQ', body: 'For best results use concise prompts, specify subject and style, then iterate with small prompt changes.' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onOpenAuth={() => setIsAuthOpen(true)} onLogout={() => setUser(null)} />
      <main className="flex-1">
        <section className="py-12 border-b border-[var(--border-dim)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-mono font-bold mb-4">Documentation</h1>
            <p className="text-[var(--text-muted)]">Product documentation for generating and exporting SVG assets with Vexura.</p>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
            <aside className="hidden lg:block" aria-label="Docs navigation">
              <nav className="sticky top-24 flex flex-col gap-3 text-sm">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="text-[var(--text-muted)] no-underline hover:text-[var(--text-main)]">{s.title}</a>
                ))}
              </nav>
            </aside>

            <article className="max-w-[800px] leading-[1.6]">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="mt-12 first:mt-0">
                  <h2 className="text-2xl font-mono font-bold mb-4">{section.title}</h2>
                  <p className="text-[var(--text-muted)]">{section.body}</p>
                  {section.id === 'svg-export' && (
                    <pre className="mt-4 bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[6px] p-4 overflow-x-auto"><code>{`<img src="/asset.svg" alt="Generated icon" />`}</code></pre>
                  )}
                </section>
              ))}
            </article>
          </div>
        </section>
      </main>
      <Footer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={setUser} />
    </div>
  );
}

const docsRoot = ReactDOM.createRoot(document.getElementById('root'));
docsRoot.render(<DocsApp />);
