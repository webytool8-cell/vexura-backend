function Header({ user, onOpenAuth, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const avatars = [
    'bg-red-900', 'bg-orange-900', 'bg-amber-900', 'bg-green-900',
    'bg-emerald-900', 'bg-teal-900', 'bg-cyan-900', 'bg-sky-900',
    'bg-blue-900', 'bg-indigo-900', 'bg-violet-900', 'bg-purple-900',
    'bg-fuchsia-900', 'bg-pink-900', 'bg-rose-900', 'bg-slate-900'
  ];

  // ---- Normalize user shape (DB user vs Google user vs null) ----
  const profile = user?.objectData ? user.objectData : user;

  const safeUsername =
    profile?.username ||
    profile?.displayName ||
    (profile?.email ? profile.email.split('@')[0] : '') ||
    'Guest';

  const safeInitial = (safeUsername && safeUsername.length > 0)
    ? safeUsername[0].toUpperCase()
    : 'G';

  const rawAvatarIdx =
    profile?.avatar_idx ?? profile?.avatarIdx ?? user?.avatar_idx ?? user?.avatarIdx ?? 0;

  const safeAvatarIdx = Number.isInteger(rawAvatarIdx)
    ? rawAvatarIdx
    : parseInt(rawAvatarIdx, 10);

  const avatarClass = avatars[(Number.isFinite(safeAvatarIdx) ? safeAvatarIdx : 0)] || avatars[0];

  // ---- Routing / page flags ----
  const currentPath = window.location.pathname;
  const isTool = currentPath.includes('/tool');
  const isContact = currentPath.includes('/contact');

  // ---- Plan & Credits (safe defaults) ----
  const plan = user?.plan || profile?.plan || 'free';
  const credits =
    (user?.credits !== undefined ? user.credits : undefined) ??
    (profile?.credits !== undefined ? profile.credits : undefined) ??
    10;

  const handleUpgradeClick = () => {
    window.dispatchEvent(new CustomEvent('vexura:open-upgrade'));
    setIsMobileMenuOpen(false);
  };

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleProfileClick = () => {
    // Only navigate if we have a real username (not guest)
    if (!user) return;

    const usernameParam = encodeURIComponent(safeUsername);
    window.location.href = `/profile?user=${usernameParam}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-body)] border-b border-[var(--border-dim)] h-16">
      <div className="h-full px-6 flex items-center justify-between relative z-20 bg-[var(--bg-body)]">
        {/* Left: Logo */}
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2 group decoration-transparent">
            <Logo className="w-5 h-5 transition-all drop-shadow-[0_0_4px_rgba(204,255,0,0.3)] group-hover:drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]" />
            <span className="font-mono font-bold text-lg tracking-tight text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
              VEXURA
            </span>
          </a>
        </div>

        {/* Desktop Navigation (Centered) */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <a
            href="/tool"
            className={`px-6 h-12 text-xs font-mono font-bold transition-all inline-flex items-center border-b-[3px] ${
              isTool
                ? 'text-[var(--text-main)] border-[var(--accent)]'
                : 'text-[var(--text-dim)] border-transparent hover:text-[var(--text-main)] hover:bg-white/5'
            }`}
          >
            Generator
          </a>
          <a
            href="/marketplace"
            className={`px-6 h-12 text-xs font-mono font-bold transition-all inline-flex items-center border-b-[3px] ${
              currentPath.includes('marketplace')
                ? 'text-[var(--text-main)] border-[var(--accent)]'
                : 'text-[var(--text-dim)] border-transparent hover:text-[var(--text-main)] hover:bg-white/5'
            }`}
          >
            Marketplace
          </a>
        </nav>

        {/* Right: User Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-5">
          {user ? (
            <>
              {/* Plan Status */}
              {plan === 'pro' ? (
                <ProBadge />
              ) : (
                <CreditCounter credits={credits} onClick={handleUpgradeClick} />
              )}

              <div className="h-5 w-px bg-[var(--border-dim)]"></div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-[4px] border border-transparent hover:border-[var(--border-mid)] hover:bg-[var(--bg-surface)] transition-all group"
                >
                  <div className={`w-7 h-7 rounded-[2px] ${avatarClass} text-[var(--text-main)] flex items-center justify-center text-xs font-mono ring-1 ring-black/20 shadow-inner`}>
                    {safeInitial}
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)] group-hover:text-[var(--text-main)] font-medium">
                    {safeUsername}
                  </span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-8 h-8 flex items-center justify-center rounded-[4px] text-[var(--text-dim)] hover:text-red-400 hover:bg-[var(--bg-surface)] transition-all"
                  title="Sign Out"
                >
                  <div className="icon-log-out w-4 h-4"></div>
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn btn-secondary px-6 font-mono font-bold text-xs tracking-wide hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              [ SIGN_IN ]
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center text-[var(--text-main)] hover:text-[var(--accent)] active:scale-95 transition-all"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          <div className={isMobileMenuOpen ? "icon-x w-6 h-6" : "icon-menu w-6 h-6"}></div>
        </button>
      </div>

      {/* Mobile Navigation Menu (Overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-10 bg-[var(--bg-body)] flex flex-col p-6 animate-in slide-in-from-top-2 duration-200 md:hidden overflow-y-auto">
          <nav className="flex flex-col gap-2 mb-8 border-b border-[var(--border-dim)] pb-8">
            <a
              href="/tool"
              className={`p-4 text-base font-mono font-bold rounded-[4px] border transition-all flex items-center justify-between ${
                isTool
                  ? 'bg-[var(--bg-surface)] border-[var(--accent)] text-[var(--accent)]'
                  : 'border-[var(--border-dim)] text-[var(--text-muted)] bg-[var(--bg-panel)]'
              }`}
            >
              <span>GENERATOR TOOL</span>
              {isTool && <div className="icon-check w-4 h-4"></div>}
            </a>
          </nav>

          <div className="flex flex-col gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-4 p-4 bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[4px]">
                  <div className={`w-10 h-10 rounded-[2px] ${avatarClass} flex items-center justify-center text-lg font-mono text-white`}>
                    {safeInitial}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-[var(--text-main)] font-mono">{safeUsername}</div>
                    <div className="text-xs text-[var(--text-dim)] font-mono">{plan === 'pro' ? 'PRO PLAN' : 'FREE PLAN'}</div>
                  </div>
                  <button
                    onClick={() => { handleProfileClick(); setIsMobileMenuOpen(false); }}
                    className="p-2 hover:bg-[var(--bg-surface)] rounded-[2px] text-[var(--accent)]"
                  >
                    <div className="icon-user w-5 h-5"></div>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {plan === 'pro' ? (
                    <div className="col-span-2 flex justify-center py-4 bg-black/30 border border-[var(--accent)] rounded-[4px]">
                      <ProBadge />
                    </div>
                  ) : (
                    <button
                      onClick={handleUpgradeClick}
                      className="col-span-2 p-4 bg-[var(--bg-surface)] border border-[var(--accent)] text-[var(--accent)] font-mono font-bold text-sm rounded-[4px] flex items-center justify-center gap-2"
                    >
                      <div className="icon-zap w-4 h-4"></div>
                      UPGRADE ({credits} credits left)
                    </button>
                  )}
                </div>

                <button
                  onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                  className="mt-auto w-full py-4 border border-[var(--border-dim)] text-[var(--text-dim)] hover:text-red-400 hover:border-red-400/50 hover:bg-red-900/10 font-mono text-sm font-bold rounded-[4px] transition-all flex items-center justify-center gap-2"
                >
                  <div className="icon-log-out w-4 h-4"></div>
                  SIGN OUT
                </button>
              </>
            ) : (
              <button
                onClick={() => { onOpenAuth(); setIsMobileMenuOpen(false); }}
                className="w-full py-4 bg-[var(--accent)] text-black font-mono font-bold text-sm rounded-[4px] shadow-[0_0_15px_rgba(204,255,0,0.2)]"
              >
                SIGN IN / REGISTER
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
