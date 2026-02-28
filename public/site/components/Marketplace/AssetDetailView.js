function AssetDetailView({ user, onOpenAuth }) {
    const [asset, setAsset] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [downloading, setDownloading] = React.useState(false);
    const [downloadFormat, setDownloadFormat] = React.useState('svg');
    const [suggestions, setSuggestions] = React.useState([]);

    const normalizeCategory = (category) => {
        const c = (category || 'icons').toLowerCase();
        if (c.endsWith('s')) return c;
        if (c === 'icon') return 'icons';
        if (c === 'illustration') return 'illustrations';
        if (c === 'gradient') return 'gradients';
        if (c === 'shape') return 'shapes';
        if (c === 'pattern') return 'patterns';
        return c;
    };

    const escapeAttr = (value) => String(value).replace(/"/g, '&quot;');

    const vectorToSvg = (vector) => {
        if (!vector || !Array.isArray(vector.elements) || vector.elements.length === 0) {
            return '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="none" stroke="currentColor" stroke-width="8"/><path d="M90 310 L170 210 L230 260 L310 120" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }

        const width = vector.width || 400;
        const height = vector.height || 400;
        const elements = vector.elements.map((el) => {
            const attrs = Object.entries(el)
                .filter(([k, v]) => k !== 'type' && v !== undefined && v !== null)
                .map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}="${escapeAttr(v)}"`)
                .join(' ');
            return `<${el.type} ${attrs}></${el.type}>`;
        }).join('');

        return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${elements}</svg>`;
    };

    const mapDbAsset = (item) => {
        const price = item?.marketplace?.price || 0;
        const title = item?.seo?.title?.replace(/\s*-\s*Premium Vector Icon\s*\|\s*VEXURA/i, '') || item?.vector?.name || item?.slug || 'Untitled Asset';

        return {
            id: item.id || item.slug,
            title,
            slug: item.slug,
            category: normalizeCategory(item?.marketplace?.category),
            type: 'single',
            isPremium: price > 0,
            price,
            tags: item?.marketplace?.tags || [],
            description: item?.seo?.description || item?.prompt || 'Marketplace vector asset',
            svg: vectorToSvg(item.vector)
        };
    };

    const toRenderableAsset = (item) => {
        if (!item) return null;
        if (item.vector) return mapDbAsset(item);

        return {
            ...item,
            category: normalizeCategory(item?.marketplace?.category || item?.category),
            tags: item?.marketplace?.tags || item?.tags || [],
            description: item?.seo?.description || item?.prompt || item?.description || 'Marketplace vector asset',
            slug: item?.slug,
            type: item?.type || 'single',
            svg: item?.svg || item?.previewSvg || null
        };
    };

    const buildSuggestions = (currentAsset, pool) => {
        if (!currentAsset || !Array.isArray(pool)) return [];

        return pool
            .map(toRenderableAsset)
            .filter((candidate) => candidate && candidate.slug && candidate.slug !== currentAsset.slug && candidate.svg)
            .map((candidate) => {
                const tagOverlap = (candidate.tags || []).filter((t) => (currentAsset.tags || []).includes(t)).length;
                const categoryBoost = candidate.category === currentAsset.category ? 2 : 0;
                return { candidate, score: tagOverlap + categoryBoost };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)
            .map((entry) => entry.candidate);
    };

    React.useEffect(() => {
        let isMounted = true;

        const load = async () => {
            const params = new URLSearchParams(window.location.search);
            const slug = params.get('id');

            if (!slug) {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                const [detailRes, listRes] = await Promise.all([
                    fetch(`/api/marketplace/${encodeURIComponent(slug)}`),
                    fetch('/api/marketplace/list?limit=120&offset=0')
                ]);

                if (!detailRes.ok) throw new Error('Failed to load marketplace asset');
                const item = await detailRes.json();
                const mapped = mapDbAsset(item);

                if (isMounted) {
                    setAsset(mapped);
                }

                if (isMounted && listRes.ok) {
                    const listData = await listRes.json();
                    setSuggestions(buildSuggestions(mapped, listData.items || []));
                }
            } catch (e) {
                console.warn('Falling back to static asset lookup:', e);
                const found = window.getAssetBySlug ? window.getAssetBySlug(slug) : null;
                if (isMounted) {
                    setAsset(found || null);
                    setSuggestions(buildSuggestions(found, window.MarketplaceData || []));
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();
        return () => { isMounted = false; };
    }, []);

    const handleDownload = async () => {
        if (!asset) return;

        if (asset.type === 'collection') {
            await downloadCollection(downloadFormat);
        } else {
            await downloadSingle(downloadFormat);
        }
    };

    const svgToBlob = (svgMarkup, format) => new Promise((resolve, reject) => {
        if (format === 'svg') {
            resolve(new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }));
            return;
        }

        const img = new Image();
        const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 400;
                canvas.height = 400;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(svgUrl);
                    if (!blob) {
                        reject(new Error('Failed to encode image blob'));
                        return;
                    }
                    resolve(blob);
                }, mime, 0.92);
            } catch (err) {
                URL.revokeObjectURL(svgUrl);
                reject(err);
            }
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(svgUrl);
            reject(err);
        };

        img.src = svgUrl;
    });

    const triggerDownload = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    };

    const downloadSingle = async (format) => {
        const blob = await svgToBlob(asset.svg, format);
        triggerDownload(blob, `${asset.slug}.${format}`);
    };

    const downloadCollection = async (format) => {
        if (!window.JSZip) {
            alert("Compression library not loaded. Please refresh.");
            return;
        }

        setDownloading(true);
        try {
            const zip = new JSZip();
            const folder = zip.folder(asset.slug);

            for (let index = 0; index < asset.items.length; index++) {
                const item = asset.items[index];
                const filename = `${item.name || `item-${index}`}.${format}`;
                const blob = await svgToBlob(item.svg, format);
                folder.file(filename, blob);
            }

            const content = await zip.generateAsync({ type: "blob" });
            triggerDownload(content, `${asset.slug}-${format}-collection.zip`);

        } catch (e) {
            console.error("Zip Error:", e);
            alert("Failed to create ZIP file.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div></div>;

    if (!asset) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                <div className="icon-file-x w-12 h-12 text-[var(--text-dim)] mb-4"></div>
                <h1 className="text-xl font-mono font-bold mb-2">Asset Not Found</h1>
                <a href="/site/marketplace.html" className="btn btn-secondary">BACK TO MARKETPLACE</a>
            </div>
        );
    }

    const isCollection = asset.type === 'collection';
    const displaySvg = isCollection ? asset.previewSvg : asset.svg;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-8">
                <a href="/site/marketplace.html" className="text-[10px] font-mono text-[var(--text-dim)] hover:text-[var(--accent)] flex items-center gap-2 mb-4 uppercase">
                    <div className="icon-arrow-left w-3 h-3"></div>
                    Back to Marketplace
                </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Preview */}
                <div className="space-y-4">
                    <div className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[4px] p-12 flex items-center justify-center relative overflow-hidden group min-h-[400px]">
                        {/* Background Grid */}
                        <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                        
                        <div 
                            className="w-full max-w-md aspect-square text-[var(--text-main)] drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                            dangerouslySetInnerHTML={{ __html: displaySvg }}
                        ></div>
                    </div>

                    {/* Collection Mini-Grid */}
                    {isCollection && (
                         <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {asset.items.map((item, idx) => (
                                <div key={idx} className="aspect-square bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-[2px] p-2 flex items-center justify-center hover:border-[var(--text-muted)] transition-colors" title={item.name}>
                                    <div className="w-full h-full text-[var(--text-main)]" dangerouslySetInnerHTML={{ __html: item.svg }}></div>
                                </div>
                            ))}
                         </div>
                    )}
                </div>

                {/* Right: Info */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-mono font-bold uppercase bg-[var(--bg-surface)] border border-[var(--border-dim)] px-2 py-1 rounded-[2px] text-[var(--text-muted)]">
                            {asset.category}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase border border-[var(--border-dim)] text-[var(--text-dim)] px-2 py-1 rounded-[2px]">FREE</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-mono font-bold text-[var(--text-main)] mb-6 uppercase leading-tight">{asset.title}</h1>
                    
                    <p className="text-[var(--text-muted)] text-lg leading-relaxed mb-8 border-l-2 border-[var(--accent)] pl-4">
                        {asset.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                        {asset.tags.map(tag => (
                            <span key={tag} className="text-xs text-[var(--text-dim)] bg-[var(--bg-surface)] px-2 py-1 rounded-[2px] font-mono">#{tag}</span>
                        ))}
                    </div>

                    <div className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[2px] p-6 mb-8 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm font-mono text-[var(--text-muted)]">LICENSE TYPE</span>
                            <span className="text-sm font-bold text-[var(--text-main)]">COMMERCIAL / ROYALTY FREE</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-[var(--text-main)]">Free</span>
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono text-[var(--text-dim)] uppercase mb-2">Download format</label>
                                <select
                                    value={downloadFormat}
                                    onChange={(e) => setDownloadFormat(e.target.value)}
                                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-dim)] text-sm px-3 py-2 rounded-[2px] font-mono text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                                >
                                    <option value="svg">SVG</option>
                                    <option value="png">PNG</option>
                                    <option value="jpeg">JPEG</option>
                                    <option value="webp">WEBP</option>
                                </select>
                            </div>
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="btn btn-primary w-full py-4 text-base font-bold shadow-lg"
                            >
                                {downloading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
                                        PREPARING DOWNLOAD...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <div className="icon-download w-4 h-4"></div>
                                        {isCollection ? `DOWNLOAD ${downloadFormat.toUpperCase()} COLLECTION (ZIP)` : `DOWNLOAD ${downloadFormat.toUpperCase()}`}
                                    </span>
                                )}
                            </button>
                            {!user && <p className="text-center text-[10px] text-[var(--text-dim)]">Sign in to download files.</p>}
                            {isCollection && <p className="text-center text-[10px] text-[var(--text-dim)]">Includes {asset.items.length} individual {downloadFormat.toUpperCase()} files in ZIP</p>}
                        </div>
                    </div>

                    <div className="border border-[var(--border-dim)] bg-[var(--bg-surface)]/40 rounded-[2px] p-4">
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            Still searching for the exact style you need? <a href="/tool" className="text-[var(--accent)] font-mono font-bold hover:underline">Launch the VEXURA Tool</a> to generate custom vectors tailored to your project in seconds.
                        </p>
                    </div>
                </div>
            </div>

            {suggestions.length > 0 && (
                <div className="mt-14">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-mono font-bold uppercase">More Suggestions</h2>
                        <a href="/site/marketplace.html" className="text-[10px] font-mono text-[var(--text-dim)] hover:text-[var(--accent)] uppercase">Browse all</a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {suggestions.map((s) => (
                            <a key={s.slug} href={`/site/asset.html?id=${encodeURIComponent(s.slug)}`} className="group block border border-[var(--border-dim)] rounded-[2px] overflow-hidden bg-[var(--bg-panel)] hover:border-[var(--text-muted)] transition-colors">
                                <div className="aspect-square p-6 bg-[var(--bg-body)] flex items-center justify-center">
                                    <div className="w-full h-full text-[var(--text-main)] group-hover:scale-105 transition-transform" dangerouslySetInnerHTML={{ __html: s.svg }}></div>
                                </div>
                                <div className="p-3 border-t border-[var(--border-dim)]">
                                    <div className="text-xs font-mono font-bold uppercase truncate" title={s.title}>{s.title}</div>
                                    <div className="text-[10px] text-[var(--text-dim)] font-mono mt-1">{s.category} · FREE</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
