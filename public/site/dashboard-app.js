class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error(error, info); }
  render() {
    if (this.state.hasError) return <div className="p-8 text-center text-red-400">Dashboard crashed.</div>;
    return this.props.children;
  }
}

function DashboardApp() {
  const OWNER_EMAIL = 'abdulmoe101@gmail.com';

  const [firebaseUser, setFirebaseUser] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [stats, setStats] = React.useState({ totalItems: 0 });
  const [uploading, setUploading] = React.useState(false);
  const [uploadResults, setUploadResults] = React.useState([]);
  const [sessionSuccessCount, setSessionSuccessCount] = React.useState(0);

  const isOwner = firebaseUser?.email?.toLowerCase() === OWNER_EMAIL;

  React.useEffect(() => {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      setAuthLoading(false);
      return;
    }

    const unsub = firebase.auth().onAuthStateChanged((user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });

    return () => unsub && unsub();
  }, []);

  const loadStats = React.useCallback(async () => {
    try {
      const res = await fetch('/api/marketplace/stats');
      if (!res.ok) return;
      const data = await res.json();
      setStats({ totalItems: data.totalItems || 0 });
    } catch (e) {
      console.warn('stats unavailable', e);
    }
  }, []);

  React.useEffect(() => {
    if (isOwner) loadStats();
  }, [isOwner, loadStats]);

  const handleGoogleLogin = async () => {
    try {
      await window.fireAuth.signInWithGoogle();
    } catch (e) {
      alert(`Login failed: ${e.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      if (window.fireAuth?.signOut) await window.fireAuth.signOut();
    } catch (e) {
      console.error(e);
    }
  };

  const parseVectorFromJson = (raw) => {
    if (raw?.vectorData && raw?.vectorData?.elements) return raw.vectorData;
    if (raw?.vector && raw?.vector?.elements) return raw.vector;
    if (raw?.elements) return raw;
    return null;
  };

  const processFiles = async (files) => {
    if (!files?.length) return;
    if (!isOwner) {
      alert('Owner access required.');
      return;
    }

    setUploading(true);
    const runResults = [];
    let successCount = 0;

    for (const file of files) {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const vectorData = parseVectorFromJson(parsed);

        if (!vectorData) {
          runResults.push({ file: file.name, success: false, error: 'Invalid vector JSON shape.' });
          continue;
        }

        const promptHint = vectorData.name || file.name.replace(/\.json$/i, '').replace(/[-_]/g, ' ');

        const res = await fetch('/api/marketplace/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vectorData, fileName: file.name, prompt: promptHint })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          runResults.push({ file: file.name, success: false, error: data.error || 'Upload failed' });
          continue;
        }

        successCount += 1;
        runResults.push({ file: file.name, success: true, slug: data.slug, score: data.score });
      } catch (e) {
        runResults.push({ file: file.name, success: false, error: e.message });
      }
    }

    setUploadResults(prev => [...runResults, ...prev].slice(0, 30));
    setSessionSuccessCount(prev => prev + successCount);
    setUploading(false);
    loadStats();
  };

  const onFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.name.toLowerCase().endsWith('.json'));
    processFiles(files);
  };

  const onDragOver = (e) => e.preventDefault();

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={firebaseUser} onOpenAuth={handleGoogleLogin} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
          <div className="panel p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[var(--accent)] text-xs font-mono uppercase mb-2">Owner Console</div>
                <h1 className="text-2xl md:text-3xl font-mono font-bold">Dashboard Upload Center</h1>
                <p className="text-[var(--text-dim)] text-sm mt-2">Manual JSON uploader for marketplace assets with automatic metadata enrichment.</p>
              </div>
              {!firebaseUser && (
                <button onClick={handleGoogleLogin} className="btn btn-primary">Sign in with Google</button>
              )}
            </div>
          </div>

          {authLoading ? (
            <div className="panel p-8 text-center text-[var(--text-dim)] font-mono text-sm">AUTHENTICATING...</div>
          ) : !firebaseUser ? (
            <div className="panel p-8 text-center">
              <div className="text-sm font-mono text-[var(--text-main)] mb-2">Sign in required</div>
              <div className="text-xs text-[var(--text-dim)]">Use your owner Google account to access dashboard upload tools.</div>
            </div>
          ) : !isOwner ? (
            <div className="panel p-8 border-red-500/40">
              <div className="text-red-400 font-mono text-sm mb-2">Access denied</div>
              <div className="text-xs text-[var(--text-dim)]">Signed in as <span className="text-[var(--text-main)]">{firebaseUser.email}</span>. Only <span className="text-[var(--text-main)]">{OWNER_EMAIL}</span> can access this page.</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="panel p-4">
                  <div className="text-[10px] text-[var(--text-dim)] font-mono uppercase">Marketplace Assets</div>
                  <div className="text-2xl font-mono font-bold mt-2">{stats.totalItems}</div>
                </div>
                <div className="panel p-4">
                  <div className="text-[10px] text-[var(--text-dim)] font-mono uppercase">Uploaded This Session</div>
                  <div className="text-2xl font-mono font-bold mt-2">{sessionSuccessCount}</div>
                </div>
                <div className="panel p-4">
                  <div className="text-[10px] text-[var(--text-dim)] font-mono uppercase">Uploader Status</div>
                  <div className={`text-sm font-mono mt-3 ${uploading ? 'text-yellow-400' : 'text-green-400'}`}>{uploading ? 'PROCESSING...' : 'READY'}</div>
                </div>
              </div>

              <div className="panel p-6">
                <h2 className="font-mono font-bold text-sm mb-3 uppercase">Upload JSON Assets</h2>
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  className="border-2 border-dashed border-[var(--border-mid)] rounded-[2px] p-8 text-center bg-[var(--bg-surface)]/30"
                >
                  <p className="font-mono text-sm mb-2">Drop .json files here</p>
                  <p className="text-xs text-[var(--text-dim)] mb-4">or choose files manually</p>
                  <label className="btn btn-secondary cursor-pointer inline-flex">
                    Choose JSON files
                    <input type="file" className="hidden" accept=".json,application/json" multiple onChange={onFileChange} disabled={uploading} />
                  </label>
                </div>
                <p className="text-[10px] text-[var(--text-dim)] mt-3">Each valid JSON is posted to <span className="font-mono">/api/marketplace/upload</span> and listed in marketplace with enriched metadata.</p>
              </div>

              <div className="panel p-6">
                <h2 className="font-mono font-bold text-sm mb-4 uppercase">Recent Upload Results</h2>
                {uploadResults.length === 0 ? (
                  <div className="text-xs text-[var(--text-dim)]">No uploads yet.</div>
                ) : (
                  <div className="space-y-2 max-h-[360px] overflow-auto pr-2">
                    {uploadResults.map((item, idx) => (
                      <div key={`${item.file}-${idx}`} className="flex items-center justify-between gap-3 text-xs font-mono border border-[var(--border-dim)] rounded-[2px] p-2 bg-[var(--bg-surface)]/40">
                        <div className="truncate">{item.file}</div>
                        {item.success ? (
                          <div className="text-green-400 shrink-0">OK • {item.slug}</div>
                        ) : (
                          <div className="text-red-400 shrink-0 max-w-[50%] truncate" title={item.error}>{item.error}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><DashboardApp /></ErrorBoundary>);
