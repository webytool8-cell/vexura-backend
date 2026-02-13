function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = React.useState('login'); // login | register

  // Form State
  const [identifier, setIdentifier] = React.useState(''); // Username or Email
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [avatarIdx, setAvatarIdx] = React.useState(0);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showRedirectOption, setShowRedirectOption] = React.useState(false);

  if (!isOpen) return null;

  const avatars = [
    'bg-red-900', 'bg-orange-900', 'bg-amber-900', 'bg-green-900',
    'bg-emerald-900', 'bg-teal-900', 'bg-cyan-900', 'bg-sky-900',
    'bg-blue-900', 'bg-indigo-900', 'bg-violet-900', 'bg-purple-900',
    'bg-fuchsia-900', 'bg-pink-900', 'bg-rose-900', 'bg-slate-900'
  ];

  const mapFirebaseUser = (fbUser) => ({
    uid: fbUser?.uid || '',
    email: fbUser?.email || '',
    username: fbUser?.displayName || (fbUser?.email ? fbUser.email.split('@')[0] : 'user'),
    displayName: fbUser?.displayName || '',
    photoURL: fbUser?.photoURL || '',
    provider: 'google'
  });

  const completeLogin = async (fbUser) => {
    // If you have a backend “upsert/login” hook, use it.
    // Otherwise, fall back to a minimal local user object.
    const safeUser = mapFirebaseUser(fbUser);

    if (typeof window.apiLoginWithGoogle === 'function') {
      // If you created a wrapper function, use it
      // (not required anymore, but supported)
      const backendUser = await window.apiLoginWithGoogle();
      return backendUser || safeUser;
    }

    // If you have an API function that maps Firebase user -> your DB user:
    if (typeof window.apiLoginWithGoogle === 'function') {
      // already handled above
      return safeUser;
    }

    // Preferred: call your existing backend mapping function if it exists
    if (typeof window.apiLoginWithGoogle === 'function') {
      // redundant guard (kept for safety)
      return safeUser;
    }

    // Your code previously called apiLoginWithGoogle(uid,email,displayName).
    // If that function exists globally, use it.
    if (typeof apiLoginWithGoogle === 'function') {
      const backendUser = await apiLoginWithGoogle(safeUser.uid, safeUser.email, safeUser.displayName);
      return backendUser || safeUser;
    }

    // Otherwise, just return Firebase-mapped user.
    return safeUser;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!identifier.trim()) throw new Error('Username or Email is required');

        const user = await apiLogin(identifier);
        if (user) {
          onLoginSuccess(user);
          onClose();
        } else {
          setError('Account not found. Please register.');
        }
      } else {
        // Register
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

  const handleGoogleLogin = async () => {
    setError('');
    setShowRedirectOption(false);
    setLoading(true);

    try {
      // Firebase compat SDK must be loaded (you already include it in HTML)
      if (!window.firebase || !window.firebase.auth) {
        throw new Error('Firebase SDK not loaded');
      }

      const auth = window.firebase.auth();
      const provider = new window.firebase.auth.GoogleAuthProvider();

      // Optional: ask for email + profile (usually default)
      provider.addScope('email');
      provider.addScope('profile');

      const result = await auth.signInWithPopup(provider);
      const fbUser = result?.user;

      if (!fbUser) throw new Error('Google Sign-In failed: no user returned');

      const user = await completeLogin(fbUser);

      onLoginSuccess(user);
      onClose();
    } catch (err) {
      console.error('Auth Error:', err);

      // Handle popup issues gracefully
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled.');
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Popup blocked by browser. Please allow popups or use the redirect method.');
        setShowRedirectOption(true);
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('Unauthorized domain. Add vexura.io + www.vexura.io in Firebase Authorized Domains.');
      } else {
        setError('Google Sign-In failed: ' + (err?.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirect = async () => {
    setError('');
    setLoading(true);

    try {
      if (!window.firebase || !window.firebase.auth) {
        throw new Error('Firebase SDK not loaded');
      }

      const auth = window.firebase.auth();
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      await auth.signInWithRedirect(provider);
      // Redirect happens; no further UI actions needed here.
    } catch (err) {
      console.error('Redirect Error:', err);
      setError('Redirect failed: ' + (err?.message || 'Unknown error'));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
      <div className="panel max-w-sm w-full shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-6 border-b border-[var(--border-dim)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">
              {mode === 'login' ? 'System Access' : 'Create Identity'}
            </h2>
            <span className="text-[10px] text-[var(--text-muted)]">SECURE CONNECTION</span>
          </div>
          <button onClick={onClose} className="text-[var(--text-dim)] hover:text-[var(--text-main)]">
            <div className="icon-x w-5 h-5"></div>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Google SSO Button */}
          {!showRedirectOption ? (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-black py-2.5 rounded-[2px] font-bold text-sm hover:bg-gray-100 transition-colors relative overflow-hidden group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
              {loading && <div className="absolute inset-0 bg-white/50 cursor-wait"></div>}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-red-400 font-bold text-center">Popup blocked. Try redirect method:</div>
              <button
                type="button"
                onClick={handleGoogleRedirect}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--accent)] py-2.5 rounded-[2px] font-bold text-sm hover:bg-[var(--accent)] hover:text-black transition-colors"
              >
                <div className="icon-arrow-right-circle w-4 h-4"></div>
                <span>Sign In via Redirect</span>
              </button>
            </div>
          )}

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[var(--border-dim)]"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] text-[var(--text-dim)] uppercase tracking-widest">Or continue with</span>
            <div className="flex-grow border-t border-[var(--border-dim)]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 border border-red-500/20 bg-red-500/5 text-red-400 text-xs flex items-center gap-2 rounded-[2px] animate-in slide-in-from-top-2">
                <div className="icon-circle-alert w-4 h-4 shrink-0"></div>
                {error}
              </div>
            )}

            {mode === 'login' ? (
              <div>
                <label className="label-text">IDENTIFIER</label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-[var(--text-dim)]">
                    <div className="icon-user w-4 h-4"></div>
                  </div>
                  <input
                    type="text"
                    className="input-field pl-10"
                    placeholder="Username or Email"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="label-text">EMAIL_ADDRESS</label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-[var(--text-dim)]">
                      <div className="icon-mail w-4 h-4"></div>
                    </div>
                    <input
                      type="email"
                      className="input-field pl-10"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="label-text">USERNAME</label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-[var(--text-dim)]">
                      <div className="icon-at-sign w-4 h-4"></div>
                    </div>
                    <input
                      type="text"
                      className="input-field pl-10"
                      placeholder="Choose a handle"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="label-text">BIO_DATA (OPTIONAL)</label>
                  <textarea
                    className="input-field min-h-[60px]"
                    placeholder="Brief description..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                  ></textarea>
                </div>

                <div>
                  <label className="label-text">AVATAR_SELECT</label>
                  <div className="grid grid-cols-8 gap-2">
                    {avatars.map((color, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarIdx(idx)}
                        className={`w-6 h-6 rounded-[1px] ${color} transition-all ${
                          avatarIdx === idx
                            ? 'ring-2 ring-[var(--accent)] scale-110 z-10'
                            : 'opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="btn btn-primary w-full py-3 font-bold shadow-[0_0_15px_rgba(204,255,0,0.1)] hover:shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    PROCESSING...
                  </span>
                ) : (
                  mode === 'login' ? 'ACCESS SYSTEM' : 'CREATE PROFILE'
                )}
              </button>
            </div>
          </form>

          <div className="text-center text-xs text-[var(--text-dim)] pt-4 border-t border-[var(--border-dim)]">
            {mode === 'login' ? (
              <p>
                NO CREDENTIALS?
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className="text-[var(--text-main)] hover:text-[var(--accent)] hover:underline ml-1 font-bold"
                >
                  REGISTER
                </button>
              </p>
            ) : (
              <p>
                EXISTING USER?
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-[var(--text-main)] hover:text-[var(--accent)] hover:underline ml-1 font-bold"
                >
                  LOGIN
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
