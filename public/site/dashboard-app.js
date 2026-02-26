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

  const [stats, setStats] = React.useState({ totalItems: 0, freeItems: 0, premiumItems: 0, avgPrice: 0 });
  const [uploading, setUploading] = React.useState(false);
  const [uploadResults, setUploadResults] = React.useState([]);
  const [sessionSuccessCount, setSessionSuccessCount] = React.useState(0);

  const [assets, setAssets] = React.useState([]);
  const [assetsLoading, setAssetsLoading] = React.useState(false);
  const [assetSearch, setAssetSearch] = React.useState('');
  const [assetCategoryFilter, setAssetCategoryFilter] = React.useState('all');
  const [lastSyncAt, setLastSyncAt] = React.useState(null);

  const isOwner = firebaseUser?.email?.toLowerCase() === OWNER_EMAIL;

  React.useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser || !isOwner) {
      const t = setTimeout(() => { window.location.href = '/'; }, 1200);
      return () => clearTimeout(t);
    }
  }, [authLoading, firebaseUser, isOwner]);

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

  const mapDbAsset = (item) => {
    const category = (item?.marketplace?.category || 'icon').toLowerCase();
    const normalizedCategory = category.endsWith('s') ? category : `${category}s`;
    const price = Number(item?.marketplace?.price || 0);

    return {
      id: item?.id || item?.slug,
      slug: item?.slug,
      name: item?.vector?.name || item?.seo?.title || item?.slug || 'Untitled',
      category: normalizedCategory,
      price,
      isPremium: price > 0,
      views: Number(item?.marketplace?.views || 0),
      downloads: Number(item?.marketplace?.downloads || 0),
      createdAt: item?.marketplace?.createdAt || null,
      updatedAt: item?.marketplace?.updatedAt || null,
      tags: item?.marketplace?.tags || []
    };
  };

  const computeDerivedStats = (items) => {
    if (!items.length) return { totalItems: 0, freeItems: 0, premiumItems: 0, avgPrice: 0 };

    const freeItems = items.filter(i => !i.isPremium).length;
    const premiumItems = items.length - freeItems;
    const totalPremiumPrice = items.filter(i => i.isPremium).reduce((sum, i) => sum + i.price, 0);

    return {
      totalItems: items.length,
      freeItems,
      premiumItems,
      avgPrice: premiumItems > 0 ? (totalPremiumPrice / premiumItems) : 0
    };
  };

  const loadAssets = React.useCallback(async () => {
    setAssetsLoading(true);
    try {
      const res = await fetch('/api/marketplace/list?limit=500&offset=0');
      if (!res.ok) throw new Error('Failed to load assets');
      const data = await res.json();
      const mapped = (data.items || []).map(mapDbAsset);
      setAssets(mapped);
      setStats(computeDerivedStats(mapped));
      setLastSyncAt(new Date().toISOString());
    } catch (e) {
      console.warn('asset list unavailable', e);
      setAssets([]);
      setStats({ totalItems: 0, freeItems: 0, premiumItems: 0, avgPrice: 0 });
    } finally {
      setAssetsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOwner) loadAssets();
  }, [isOwner, loadAssets]);

  const handleGoogleLogin = async () => {
    try {
      await window.fireAuth.signInWithGoogle();
    } catch (e) {
      alert(`Login failed: ${e.message}`);
    }
  };

  const handleLogout = async () => {
    setFirebaseUser(null);
    try {
      if (window.fireAuth?.signOut) await window.fireAuth.signOut();
    } catch (e) {
      console.error(e);
    } finally {
      window.location.href = '/';
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
    loadAssets();
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

  const filteredAssets = React.useMemo(() => {
    const search = assetSearch.trim().toLowerCase();
    return assets.filter((a) => {
      const categoryMatch = assetCategoryFilter === 'all' ? true : a.category === assetCategoryFilter;
      if (!categoryMatch) return false;
      if (!search) return true;
      return (
        a.slug.toLowerCase().includes(search) ||
        a.name.toLowerCase().includes(search) ||
        a.tags.some(t => String(t).toLowerCase().includes(search))
      );
    });
  }, [assets, assetSearch, assetCategoryFilter]);

  const categories = React.useMemo(() => {
    const set = new Set(['all']);
    assets.forEach(a => set.add(a.category));
    return Array.from(set);
  }, [assets]);

  const topAssets = React.useMemo(() => {
    return [...assets]
      .sort((a, b) => (b.downloads + b.views) - (a.downloads + a.views))
      .slice(0, 5);
  }, [assets]);

  const exportCsv = () => {
    const header = ['slug', 'name', 'category', 'price', 'downloads', 'views', 'createdAt'];
    const rows = filteredAssets.map((a) => [
      a.slug,
      a.name,
      a.category,
      a.price,
      a.downloads,
      a.views,
      a.createdAt || ''
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marketplace-assets-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={firebaseUser} onOpenAuth={handleGoogleLogin} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
          <div className="panel p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[var(--accent)] text-xs font-mono uppercase mb-2">Owner Console</div>
                <h1 className="text-2xl md:text-3xl font-mono font-bold">Marketplace Operations Dashboard</h1>
                <p className="text-[var(--text-dim)] text-sm mt-2">Upload assets, monitor marketplace health, inspect database records, and run routine admin operations from one place.</p>
              </div>
              {!firebaseUser ? (
                <button onClick={handleGoogleLogin} className="btn btn-primary">Sign in with Google</button>
              ) : (
                <div className="text-xs font-mono text-[var(--text-dim)]">
                  Last sync: <span className="text-[var(--text-main)]">{lastSyncAt ? new Date(lastSyncAt).toLocaleString() : '—'}</span>
                </div>
              )}
            </div>
          </div>

          {authLoading ? (
            <div className="panel p-8 text-center text-[var(--text-dim)] font-mono text-sm">AUTHENTICATING...</div>
          ) : !firebaseUser ? (
            <div className="panel p-8 text-center">
              <div className="text-sm font-mono text-[var(--text-main)] mb-2">Sign in required</div>
              <div className="text-xs text-[var(--text-dim)]">Use your owner Google account to access dashboard upload tools. Redirecting...</div>
            </div>
          ) : !isOwner ? (
            <div className="panel p-8 border-red-500/40">
              <div className="text-red-400 font-mono text-sm mb-2">Access denied</div>
              <div className="text-xs text-[var(--text-dim)]">Signed in as <span className="text-[var(--text-main)]">{firebaseUser.email}</span>. Only <span className="text-[var(--text-main)]">{OWNER_EMAIL}</span> can access this page. Redirecting...</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="panel p-4">
                  <div className="text-[10px] text-[var(--text-dim)] font-mono uppercase">Total Assets</div>
                  <div className="text-2xl font-mono font-bold mt-2">{stats.totalItems}</div>
                </div>
                <div className="panel p-4">
                  <div className="text-[10px] text-[var(--text-dim)] font-mono uppercase">Free Assets</div>
                  <div className="text-2xl font-mono font-bold mt-2">{stats.freeItems}</div>
                </div>
                <div className="panel p-4">
                  <div className="text-[10px] text-[var(--text-dim)] font-mono uppercase">Premium Assets</div>
                  <div className="text-2xl font-mono font-bold mt-2">{stats.premiumItems}</div>
                </div>
                <div className="panel p-4">
                  <div className="text-[10px] text-[var(--text-dim)] font-mono uppercase">Avg Premium Price</div>
                  <div className="text-2xl font-mono font-bold mt-2">${stats.avgPrice.toFixed(2)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="panel p-6 lg:col-span-2">
                  <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <h2 className="font-mono font-bold text-sm uppercase">Asset Database View</h2>
                    <div className="flex gap-2">
                      <button onClick={loadAssets} className="btn btn-secondary text-xs" disabled={assetsLoading}>{assetsLoading ? 'Refreshing...' : 'Refresh'}</button>
                      <button onClick={exportCsv} className="btn btn-secondary text-xs">Export CSV</button>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4 flex-wrap">
                    <input
                      type="text"
                      value={assetSearch}
                      onChange={(e) => setAssetSearch(e.target.value)}
                      placeholder="Search slug, name, or tag..."
                      className="flex-1 min-w-[240px] bg-[var(--bg-surface)] border border-[var(--border-dim)] text-sm px-3 py-2 rounded-[2px] font-mono text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                    />
                    <select
                      value={assetCategoryFilter}
                      onChange={(e) => setAssetCategoryFilter(e.target.value)}
                      className="bg-[var(--bg-surface)] border border-[var(--border-dim)] text-sm px-3 py-2 rounded-[2px] font-mono text-[var(--text-main)]"
                    >
                      {categories.map((cat) => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <div className="max-h-[420px] overflow-auto border border-[var(--border-dim)] rounded-[2px]">
                    <table className="w-full text-xs font-mono">
                      <thead className="bg-[var(--bg-surface)] sticky top-0">
                        <tr className="text-left text-[var(--text-dim)]">
                          <th className="px-3 py-2">Slug</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2">Price</th>
                          <th className="px-3 py-2">D/L</th>
                          <th className="px-3 py-2">Views</th>
                          <th className="px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssets.length === 0 ? (
                          <tr><td colSpan={6} className="px-3 py-6 text-center text-[var(--text-dim)]">No assets match current filters.</td></tr>
                        ) : (
                          filteredAssets.map((a) => (
                            <tr key={a.id} className="border-t border-[var(--border-dim)] hover:bg-[var(--bg-surface)]/40">
                              <td className="px-3 py-2 max-w-[220px] truncate" title={a.slug}>{a.slug}</td>
                              <td className="px-3 py-2">{a.category}</td>
                              <td className="px-3 py-2">{a.isPremium ? `$${a.price}` : 'Free'}</td>
                              <td className="px-3 py-2">{a.downloads}</td>
                              <td className="px-3 py-2">{a.views}</td>
                              <td className="px-3 py-2">
                                <div className="flex gap-2">
                                  <a href={`/asset?id=${a.slug}`} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">View</a>
                                  <a href={`/api/marketplace/${a.slug}`} target="_blank" rel="noreferrer" className="text-[var(--text-muted)] hover:underline">Open</a>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="panel p-6">
                    <h2 className="font-mono font-bold text-sm mb-4 uppercase">Analytics Snapshot</h2>
                    <div className="space-y-3 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-dim)]">Session uploads</span>
                        <span>{sessionSuccessCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-dim)]">Filtered result size</span>
                        <span>{filteredAssets.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-dim)]">Uploader status</span>
                        <span className={uploading ? 'text-yellow-400' : 'text-green-400'}>{uploading ? 'PROCESSING' : 'READY'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="panel p-6">
                    <h2 className="font-mono font-bold text-sm mb-4 uppercase">Top Performing Assets</h2>
                    {topAssets.length === 0 ? (
                      <div className="text-xs text-[var(--text-dim)]">No marketplace data available.</div>
                    ) : (
                      <div className="space-y-2">
                        {topAssets.map((a, idx) => (
                          <div key={a.id} className="text-xs font-mono border border-[var(--border-dim)] rounded-[2px] p-2 bg-[var(--bg-surface)]/40">
                            <div className="flex items-center justify-between gap-2">
                              <div className="truncate">#{idx + 1} {a.slug}</div>
                              <div className="text-[var(--text-dim)]">{a.downloads + a.views}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="panel p-6">
                    <h2 className="font-mono font-bold text-sm mb-3 uppercase">Quick Actions</h2>
                    <div className="space-y-2">
                      <a href="/marketplace" target="_blank" rel="noreferrer" className="btn btn-secondary w-full text-xs">Open Marketplace</a>
                      <a href="/tool" target="_blank" rel="noreferrer" className="btn btn-secondary w-full text-xs">Open Generator Tool</a>
                      <a href="/dashboard" className="btn btn-secondary w-full text-xs">Reload Dashboard</a>
                    </div>
                  </div>
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
