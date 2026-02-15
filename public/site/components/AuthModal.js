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

  const buildUserFromFirebase = (googleUser) => {
    if (!googleUser) return null;
    const emailVal = googleUser.email || '';
    const uname =
      googleUser.displayName ||
      (emailVal ? emailVal.split('@')[0] : 'user');

    return {
      // consistent fields across app
      uid: googleUser.uid,
      email: emailVal,
      username: uname,
      displayName: googleUser.displayName || uname,
      photoURL: googleUser.photoURL || '',
      provider: 'google',
      avatar_idx: 0,
      plan: 'free',
      credits: 10,
    };
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
      if (!window.fireAuth) throw new Error('Firebase not initialized');

      const googleUser = await window.fireAuth.signInWithGoogle();
      if (!googleUser) throw new Error('Google Sign-In failed: no user returned');

      const user = buildUserFromFirebase(googleUser);
      if (!user) throw new Error('Google Sign-In failed: invalid user object');

      onLoginSuccess(user);
      onClose();
    } catch (err) {
      console.error('Google Auth Error:', err);

      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled.');
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Popup blocked. Use redirect method.');
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

  const handleGoogleRedirect = async () => {
    setError('');
    setLoading(true);

    try {
      if (!window.fireAuth) throw new Error('Firebase not initialized');
      await window.fireAuth.signInWithGoogleRedirect();
      // page redirects away; no further action here
    } catch (err) {
      console.error('Redirect Error:', err);
      setError('Redirect failed: ' + (err?.message || 'Unknown error'));
      setLoading(false);
    }
  };

  // Manual redirect recovery button (no hooks; safe in your stack)
  const handleCompleteRedirect = async () => {
    setError('');
    setLoading(true);

    try {
      if (!window.fireAuth) throw new Error('Firebase not initialized');

      const googleUser = await window.fireAuth.checkRedirectResult();
      if (!googleUser) throw new Error('No redirect sign-in found.');

      const user = buildUserFromFirebase(googleUser);
      if (!user) throw new Error('Redirect sign-in failed: invalid user.');

      onLoginSuccess(user);
      onClose();
    } catch (err) {
      console.error('Redirect Recovery Error:', err);
      setError(err.message || 'Redirect recovery failed');
    } finally {
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
          {/* Google SSO */}
          {!showRedirectOption ? (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-black py-2.5 rounded-[2px] font-bold text-sm hover:bg-gray-100 transition-colors relative overflow-hidden"
            >
              <span>Continue with Google</span>
              {loading && <div className="absolute inset-0 bg-white/50 cursor-wait"></div>}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-red-400 font-bold text-center">
                Popup blocked. Use redirect:
              </div>
              <button
                type="button"
                onClick={handleGoogleRedirect}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--accent)] py-2.5 rounded-[2px] font-bold text-sm hover:bg-[var(--accent)] hover:text-black transition-colors"
              >
                <span>Sign In via Redirect</span>
              </button>

              {/* Manual complete button (optional but helpful) */}
              <button
                type="button"
                onClick={handleCompleteRedirect}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[var(--bg-panel)] text-[var(--text-main)] border border-[var(--border-dim)] py-2.5 rounded-[2px] font-bold text-xs hover:bg-[var(--bg-surface)] transition-colors"
              >
                Complete Redirect Sign-In
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
              <div className="p-3 border border-red-500/20 bg-red-500/5 text-red-400 text-xs flex items-center gap-2 rounded-[2px]">
                <div className="icon-circle-alert w-4 h-4 shrink-0"></div>
                {error}
              </div>
            )}

            {mode === 'login' ? (
              <div>
                <label className="label-text">IDENTIFIER</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Username or Email"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  autoFocus
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="label-text">EMAIL_ADDRESS</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label-text">USERNAME</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Choose a handle"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label-text">BIO_DATA (OPTIONAL)</label>
                  <textarea
                    className="input-field min-h-[60px]"
                    placeholder="Brief description..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                  />
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
                          avatarIdx === idx ? 'ring-2 ring-[var(--accent)] scale-110 z-10' : 'opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full py-3 font-bold" disabled={loading}>
              {loading ? 'PROCESSING...' : (mode === 'login' ? 'ACCESS SYSTEM' : 'CREATE PROFILE')}
            </button>
          </form>

          <div className="text-center text-xs text-[var(--text-dim)] pt-4 border-t border-[var(--border-dim)]">
            {mode === 'login' ? (
              <p>
                NO CREDENTIALS?
                <button type="button" onClick={() => { setMode('register'); setError(''); }} className="text-[var(--text-main)] hover:text-[var(--accent)] hover:underline ml-1 font-bold">
                  REGISTER
                </button>
              </p>
            ) : (
              <p>
                EXISTING USER?
                <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-[var(--text-main)] hover:text-[var(--accent)] hover:underline ml-1 font-bold">
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
