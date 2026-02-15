function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = React.useState('login');
  const [identifier, setIdentifier] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [avatarIdx, setAvatarIdx] = React.useState(0);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showRedirectOption, setShowRedirectOption] = React.useState(false);

  if (!isOpen) return null;

  const avatars = [
    'bg-red-900','bg-orange-900','bg-amber-900','bg-green-900',
    'bg-emerald-900','bg-teal-900','bg-cyan-900','bg-sky-900',
    'bg-blue-900','bg-indigo-900','bg-violet-900','bg-purple-900',
    'bg-fuchsia-900','bg-pink-900','bg-rose-900','bg-slate-900'
  ];

  const buildUser = (googleUser) => {
    if (!googleUser) return null;
    const emailVal = googleUser.email || '';
    return {
      uid: googleUser.uid,
      email: emailVal,
      username:
        googleUser.displayName ||
        (emailVal ? emailVal.split('@')[0] : 'user'),
      displayName: googleUser.displayName || '',
      photoURL: googleUser.photoURL || '',
      provider: 'google'
    };
  };

  /* ---------------------------
     Redirect recovery on mount
  ----------------------------*/
  React.useEffect(() => {
    const checkRedirect = async () => {
      if (!window.fireAuth) return;
      const user = await window.fireAuth.checkRedirectResult();
      if (user) {
        const appUser = buildUser(user);
        if (appUser) {
          onLoginSuccess(appUser);
          onClose();
        }
      }
    };
    checkRedirect();
  }, []);

  /* ---------------------------
     Normal Login / Register
  ----------------------------*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!identifier.trim()) throw new Error('Username or Email is required');
        const user = await apiLogin(identifier);
        if (!user) throw new Error('Account not found. Please register.');
        onLoginSuccess(user);
        onClose();
      } else {
        if (!username.trim()) throw new Error('Username is required');
        if (!email.trim()) throw new Error('Email is required');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) throw new Error('Invalid email format');

        const newUser = await apiRegister(username, email, bio, avatarIdx);
        onLoginSuccess(newUser);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     Google Popup Login
  ----------------------------*/
  const handleGoogleLogin = async () => {
    setError('');
    setShowRedirectOption(false);
    setLoading(true);

    try {
      if (!window.fireAuth) throw new Error('Firebase not initialized');

      const googleUser = await window.fireAuth.signInWithGoogle();
      if (!googleUser) throw new Error('No user returned from Google');

      const user = buildUser(googleUser);
      if (!user) throw new Error('Invalid Google user object');

      onLoginSuccess(user);
      onClose();
    } catch (err) {
      console.error('Google Auth Error:', err);

      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled.');
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Popup blocked. Try redirect method.');
        setShowRedirectOption(true);
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('Unauthorized domain. Add vexura.io and www.vexura.io in Firebase.');
      } else {
        setError('Google Sign-In failed: ' + (err?.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     Google Redirect Fallback
  ----------------------------*/
  const handleGoogleRedirect = async () => {
    setError('');
    setLoading(true);
    try {
      if (!window.fireAuth) throw new Error('Firebase not initialized');
      await window.fireAuth.signInWithGoogleRedirect();
    } catch (err) {
      setError('Redirect failed: ' + (err?.message || 'Unknown error'));
      setLoading(false);
    }
  };

  /* ---------------------------
     UI
  ----------------------------*/
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="panel max-w-sm w-full shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>

        <div className="p-6 border-b border-[var(--border-dim)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider">
              {mode === 'login' ? 'System Access' : 'Create Identity'}
            </h2>
            <span className="text-[10px] text-[var(--text-muted)]">SECURE CONNECTION</span>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-6 space-y-6">

          {!showRedirectOption ? (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white text-black py-2.5 font-bold text-sm relative"
            >
              Continue with Google
              {loading && <div className="absolute inset-0 bg-white/50"></div>}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGoogleRedirect}
              disabled={loading}
              className="w-full border border-[var(--accent)] py-2.5 font-bold text-sm"
            >
              Sign In via Redirect
            </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-400 text-xs">{error}</div>}

            {mode === 'login' ? (
              <input
                type="text"
                className="input-field"
                placeholder="Username or Email"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
              />
            ) : (
              <>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
                <textarea
                  className="input-field"
                  placeholder="Bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                />
              </>
            )}

            <button type="submit" className="btn btn-primary w-full">
              {loading ? 'PROCESSING...' : mode === 'login' ? 'ACCESS SYSTEM' : 'CREATE PROFILE'}
            </button>
          </form>

          <div className="text-center text-xs pt-4 border-t border-[var(--border-dim)]">
            {mode === 'login' ? (
              <button onClick={() => { setMode('register'); setError(''); }}>
                REGISTER
              </button>
            ) : (
              <button onClick={() => { setMode('login'); setError(''); }}>
                LOGIN
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
