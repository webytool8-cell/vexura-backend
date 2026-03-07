function Header({ user, onOpenAuth, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const currentPath = window.location.pathname;

  const navItems = [
    { label: 'Generator', href: '/' },
    { label: 'Showcase', href: '/showcase' },
    { label: 'Docs', href: '/docs' },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return currentPath === '/' || currentPath === '/tool';
    }
    return currentPath.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0D0F14] border-b border-[#232834] h-[72px]">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 no-underline">
          <Logo className="w-5 h-5 text-[var(--text-main)]" />
          <span className="font-mono font-bold text-sm text-white">VEXURA</span>
        </a>

        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="h-[72px] inline-flex items-center border-b-2 text-sm font-medium no-underline"
              style={{
                color: isActive(item.href) ? '#FFFFFF' : '#B8C0CC',
                borderBottomColor: isActive(item.href) ? '#00C6FF' : 'transparent'
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <button onClick={onOpenAuth} className="btn btn-secondary px-4 text-xs">Sign In</button>
          ) : (
            <button onClick={onLogout} className="btn btn-secondary px-4 text-xs">Sign Out</button>
          )}
          <a href="/tool" className="btn btn-primary px-5 text-xs no-underline">Generate</a>
        </div>

        <button
          className="md:hidden w-10 h-10 flex items-center justify-center text-white"
          aria-label="Toggle navigation menu"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
        >
          <div className={isMobileMenuOpen ? 'icon-x w-5 h-5' : 'icon-menu w-5 h-5'}></div>
        </button>
      </div>

      {isMobileMenuOpen && (
        <nav className="md:hidden bg-[#0D0F14] border-t border-[#232834] px-4 py-4 flex flex-col gap-2" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-2 py-3 border-l-2 text-sm no-underline"
              style={{
                color: isActive(item.href) ? '#FFFFFF' : '#B8C0CC',
                borderLeftColor: isActive(item.href) ? '#00C6FF' : 'transparent'
              }}
            >
              {item.label}
            </a>
          ))}
          <a href="/tool" className="btn btn-primary mt-2 no-underline">Generate</a>
        </nav>
      )}
    </header>
  );
}
